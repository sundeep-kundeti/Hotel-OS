'use client';

export const runtime = 'edge';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TravelPartner, CommissionEntry, ReportType } from '../../../features/travel-partners/types/travelPartner.types';
import StatusBadge from '../../../features/travel-partners/components/StatusBadge';
import { formatVehicleNumber, formatDateTime, formatCurrency } from '../../../features/travel-partners/utils/normalize';

const REPORT_TABS: { key: ReportType; label: string; icon: string }[] = [
  { key: 'today_leads', label: "Today's Leads", icon: '🚗' },
  { key: 'today_commissions', label: "Today's Commissions", icon: '💰' },
  { key: 'pending_commissions', label: 'Pending Commission', icon: '⏳' },
  { key: 'paid_commissions', label: 'Paid Commission', icon: '✅' },
  { key: 'active_partners', label: 'Active Partners', icon: '🤝' },
  { key: 'lead_only', label: 'Leads Only', icon: '📋' },
];

export default function ReportsPage() {
  const router = useRouter();
  const [activeReport, setActiveReport] = useState<ReportType>('today_leads');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const fetchReport = useCallback(async (type: ReportType) => {
    setLoading(true);
    setData([]);
    try {
      const res = await fetch(`/api/travel-partners/reports?type=${type}`);
      const json = await res.json();
      if (res.ok) setData(json.report || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReport(activeReport);
  }, [activeReport]);

  async function handleDownload() {
    setDownloading(true);
    try {
      // Map report type to export type
      const exportType = ['today_commissions', 'pending_commissions', 'paid_commissions'].includes(activeReport)
        ? activeReport
        : activeReport === 'today_leads'
        ? 'today_leads'
        : 'all_partners';

      const res = await fetch(`/api/travel-partners/export?type=${exportType}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.headers.get('Content-Disposition')?.match(/filename="([^"]+)"/)?.[1] || 'export.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
    setDownloading(false);
  }

  const isPartnerReport = ['today_leads', 'active_partners', 'lead_only'].includes(activeReport);
  const isCommissionReport = ['today_commissions', 'pending_commissions', 'paid_commissions'].includes(activeReport);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            id="reports-back-btn"
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            ←
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-slate-900 text-base">Reports</h1>
            <p className="text-xs text-slate-400">Travel Partner Analytics</p>
          </div>
          <button
            id="download-csv-btn"
            onClick={handleDownload}
            disabled={downloading || data.length === 0}
            className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full hover:bg-emerald-100 active:scale-95 transition-all disabled:opacity-40"
          >
            {downloading ? (
              <span className="w-3 h-3 border border-emerald-600/40 border-t-emerald-600 rounded-full animate-spin" />
            ) : (
              '⬇️'
            )}
            Download CSV
          </button>
        </div>
      </header>

      {/* Report type tabs — horizontal scroll */}
      <div className="bg-white border-b border-slate-200 sticky top-[60px] z-30">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
            {REPORT_TABS.map((t) => (
              <button
                key={t.key}
                id={`report-tab-${t.key}`}
                onClick={() => setActiveReport(t.key)}
                className={`shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all ${
                  activeReport === t.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-5">
        {/* Count + title */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900 text-sm">
            {REPORT_TABS.find((t) => t.key === activeReport)?.label}
          </h2>
          {!loading && (
            <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
              {data.length} record{data.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin mr-3" />
            Loading report…
          </div>
        )}

        {!loading && data.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-sm">No data for this report</p>
          </div>
        )}

        {/* Partner report rows */}
        {!loading && isPartnerReport && data.length > 0 && (
          <div className="space-y-3">
            {data.map((partner: TravelPartner) => (
              <div
                key={partner.id}
                className="bg-white rounded-xl border border-slate-200 px-4 py-3 cursor-pointer hover:border-blue-300 transition-colors"
                onClick={() => router.push(`/travel-partners/${partner.id}`)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">
                      {partner.driver_name || 'Unnamed Driver'}
                    </p>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">{formatVehicleNumber(partner.vehicle_number)}</p>
                    <p className="text-xs text-slate-400">{partner.phone_number} · {partner.lead_source}</p>
                  </div>
                  <StatusBadge status={partner.partner_status} />
                </div>
                <p className="text-xs text-slate-400 mt-1.5">{formatDateTime(partner.created_at)}</p>
              </div>
            ))}
          </div>
        )}

        {/* Commission report rows */}
        {!loading && isCommissionReport && data.length > 0 && (
          <>
            {/* Total pending summary */}
            {activeReport === 'pending_commissions' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-amber-800">Total Pending</span>
                <span className="text-lg font-bold text-amber-700">
                  {formatCurrency(data.reduce((s: number, r: any) => s + (r.commission_amount || 0), 0))}
                </span>
              </div>
            )}
            {activeReport === 'paid_commissions' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-emerald-800">Total Paid</span>
                <span className="text-lg font-bold text-emerald-700">
                  {formatCurrency(data.reduce((s: number, r: any) => s + (r.commission_amount || 0), 0))}
                </span>
              </div>
            )}

            <div className="space-y-3">
              {data.map((entry: any) => (
                <div
                  key={entry.id}
                  className="bg-white rounded-xl border border-slate-200 px-4 py-3 cursor-pointer hover:border-emerald-300 transition-colors"
                  onClick={() => entry.partner_id && router.push(`/travel-partners/${entry.partner_id}`)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 text-sm">
                        ₹{entry.commission_amount?.toLocaleString('en-IN')}
                        {entry.booking_amount > 0 && (
                          <span className="text-slate-400 font-normal text-xs ml-1">
                            (Booking: ₹{entry.booking_amount?.toLocaleString('en-IN')})
                          </span>
                        )}
                      </p>
                      {entry.travel_partners && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {entry.travel_partners.driver_name || 'Unknown driver'} ·{' '}
                          {formatVehicleNumber(entry.travel_partners.vehicle_number)}
                        </p>
                      )}
                      {entry.customer_name && (
                        <p className="text-xs text-slate-400">
                          Guest: {entry.customer_name}
                          {entry.room_number && ` · Room ${entry.room_number}`}
                        </p>
                      )}
                    </div>
                    <StatusBadge status={entry.commission_status} />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-xs text-slate-400">{formatDateTime(entry.created_at)}</p>
                    {entry.entered_by && (
                      <p className="text-xs text-slate-400">by {entry.entered_by}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
