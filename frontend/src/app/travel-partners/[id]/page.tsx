'use client';

export const dynamic = 'force-static';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { tpFetch } from '../../../lib/tpApi';
import { TravelPartner, CommissionEntry, FollowupLog, PartnerSummary } from '../../../features/travel-partners/types/travelPartner.types';
import StatusBadge from '../../../features/travel-partners/components/StatusBadge';
import CommissionHistoryTable from '../../../features/travel-partners/components/CommissionHistoryTable';
import FollowupLogList from '../../../features/travel-partners/components/FollowupLogList';
import CommissionForm from '../../../features/travel-partners/components/CommissionForm';
import FollowupForm from '../../../features/travel-partners/components/FollowupForm';
import { formatVehicleNumber, formatDate, formatCurrency } from '../../../features/travel-partners/utils/normalize';
import { partnerStatusValues } from '../../../features/travel-partners/schemas/travelPartner.schemas';

type Tab = 'commissions' | 'followups';

export default function PartnerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [id, setId] = useState<string | null>(null);
  const [partner, setPartner] = useState<TravelPartner | null>(null);
  const [summary, setSummary] = useState<PartnerSummary | null>(null);
  const [commissions, setCommissions] = useState<CommissionEntry[]>([]);
  const [followups, setFollowups] = useState<FollowupLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('commissions');
  const [tabLoading, setTabLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<'commission' | 'followup' | 'edit' | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // Resolve params
  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  // Check for action param (from "Add Commission Now" on new partner)
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'commission') setActiveModal('commission');
  }, [searchParams]);

  const fetchProfile = useCallback(async (partnerId: string) => {
    const res = await tpFetch(`/tp-partner/${partnerId}`);
    const data = await res.json();
    if (res.ok) {
      setPartner(data.partner);
      setSummary(data.summary);
      setEditStatus(data.partner.partner_status);
    }
  }, []);

  const fetchCommissions = useCallback(async (partnerId: string) => {
    setTabLoading(true);
    const res = await tpFetch(`/tp-commissions/${partnerId}`);
    const data = await res.json();
    if (res.ok) setCommissions(data.commissions);
    setTabLoading(false);
  }, []);

  const fetchFollowups = useCallback(async (partnerId: string) => {
    setTabLoading(true);
    const res = await tpFetch(`/tp-followups/${partnerId}`);
    const data = await res.json();
    if (res.ok) setFollowups(data.followups);
    setTabLoading(false);
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([fetchProfile(id), fetchCommissions(id)]).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    if (tab === 'commissions') fetchCommissions(id);
    else fetchFollowups(id);
  }, [tab, id]);

  async function handleStatusUpdate() {
    if (!id || !editStatus) return;
    setEditSaving(true);
    await tpFetch(`/tp-partner/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ partner_status: editStatus }),
    });
    await fetchProfile(id);
    setActiveModal(null);
    setEditSaving(false);
  }

  if (loading || !partner) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            id="back-btn"
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            ←
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-slate-900 text-base truncate">
              {partner.driver_name || 'Unnamed Driver'}
            </h1>
            <p className="text-xs text-slate-400 font-mono">{formatVehicleNumber(partner.vehicle_number)}</p>
          </div>
          <StatusBadge status={partner.partner_status} />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 space-y-5">

        {/* Summary cards */}
        {summary && (
          <div className="grid grid-cols-2 gap-3">
            <SummaryCard label="Total Commission" value={formatCurrency(summary.total_commission)} color="blue" />
            <SummaryCard label="Paid" value={formatCurrency(summary.total_paid)} color="green" />
            <SummaryCard label="Pending" value={formatCurrency(summary.total_pending)} color="amber" highlight={summary.total_pending > 0} />
            <SummaryCard label="Total Bookings" value={`${summary.total_bookings} entries`} color="violet" />
          </div>
        )}

        {/* Partner details card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Partner Details</h2>
            <button
              id="edit-status-btn"
              onClick={() => setActiveModal('edit')}
              className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
            >
              Edit Status
            </button>
          </div>
          <div className="px-4 py-3 grid grid-cols-2 gap-y-3 text-sm">
            <DetailRow label="Phone" value={partner.phone_number} />
            <DetailRow label="Vehicle" value={formatVehicleNumber(partner.vehicle_number)} mono />
            {partner.vehicle_make && <DetailRow label="Vehicle Make" value={partner.vehicle_make} />}
            <DetailRow label="Lead Source" value={partner.lead_source} />
            <DetailRow label="Active" value={partner.is_active ? 'Yes ✅' : 'No ❌'} />
            {partner.last_contacted_at && (
              <DetailRow label="Last Contacted" value={formatDate(partner.last_contacted_at)} />
            )}
            {partner.created_by && <DetailRow label="Added By" value={partner.created_by} />}
            <DetailRow label="Added On" value={formatDate(partner.created_at)} />
          </div>
          {partner.notes && (
            <div className="px-4 pb-3">
              <span className="text-xs text-slate-400 block mb-1">Notes</span>
              <p className="text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">{partner.notes}</p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            id="add-commission-btn"
            onClick={() => setActiveModal('commission')}
            className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 active:scale-[0.98] transition-all"
          >
            💰 Add Commission
          </button>
          <button
            id="add-followup-btn"
            onClick={() => { setActiveModal('followup'); if (tab !== 'followups') setTab('followups'); }}
            className="flex-1 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 active:scale-[0.98] transition-all"
          >
            📝 Add Follow-up
          </button>
        </div>

        {/* Tabs */}
        <div>
          <div className="flex rounded-xl bg-slate-100 p-1 gap-1 mb-4">
            {(['commissions', 'followups'] as const).map((t) => (
              <button
                key={t}
                id={`tab-${t}`}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                {t === 'commissions' ? '💰 Commissions' : '📝 Follow-ups'}
              </button>
            ))}
          </div>

          {tab === 'commissions' && (
            <CommissionHistoryTable commissions={commissions} loading={tabLoading} />
          )}
          {tab === 'followups' && (
            <FollowupLogList followups={followups} loading={tabLoading} />
          )}
        </div>
      </main>

      {/* Commission Modal */}
      {activeModal === 'commission' && id && (
        <BottomSheet onClose={() => setActiveModal(null)}>
          <CommissionForm
            partnerId={id}
            partnerName={partner.driver_name || undefined}
            onSuccess={() => { setActiveModal(null); fetchCommissions(id); fetchProfile(id); }}
            onCancel={() => setActiveModal(null)}
          />
        </BottomSheet>
      )}

      {/* Follow-up Modal */}
      {activeModal === 'followup' && id && (
        <BottomSheet onClose={() => setActiveModal(null)}>
          <FollowupForm
            partnerId={id}
            partnerName={partner.driver_name || undefined}
            onSuccess={() => { setActiveModal(null); fetchFollowups(id); fetchProfile(id); }}
            onCancel={() => setActiveModal(null)}
          />
        </BottomSheet>
      )}

      {/* Edit Status Modal */}
      {activeModal === 'edit' && (
        <BottomSheet onClose={() => setActiveModal(null)}>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="font-bold text-slate-900">Update Partner Status</h2>
            </div>
            <div className="px-4 py-4 space-y-4">
              <div>
                <label htmlFor="edit-status-select" className="block text-xs font-medium text-slate-600 mb-2">
                  Partner Status
                </label>
                <select
                  id="edit-status-select"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none bg-white"
                >
                  {partnerStatusValues.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveModal(null)}
                  className="flex-1 rounded-xl border-2 border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  id="save-status-btn"
                  onClick={handleStatusUpdate}
                  disabled={editSaving}
                  className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-all disabled:opacity-60"
                >
                  {editSaving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </BottomSheet>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function SummaryCard({ label, value, color, highlight }: {
  label: string; value: string; color: string; highlight?: boolean;
}) {
  const colors: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-teal-500',
    amber: 'from-amber-500 to-orange-500',
    violet: 'from-violet-500 to-purple-500',
  };
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors[color]} p-3.5 text-white shadow-sm`}>
      <p className="text-xs text-white/80">{label}</p>
      <p className="text-lg font-bold mt-0.5 tracking-tight">{value}</p>
      <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-white/10" />
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <span className="text-slate-400 text-xs block">{label}</span>
      <span className={`font-medium text-slate-800 text-sm ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

function BottomSheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-auto bg-slate-50 rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-6">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>
        <div className="px-4 pb-8 pt-2">{children}</div>
      </div>
    </div>
  );
}
