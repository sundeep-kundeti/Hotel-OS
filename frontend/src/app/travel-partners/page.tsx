'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TravelPartner } from '../../features/travel-partners/types/travelPartner.types';
import SearchBar from '../../features/travel-partners/components/SearchBar';
import DashboardStatCards from '../../features/travel-partners/components/DashboardStatCards';
import PartnerCard from '../../features/travel-partners/components/PartnerCard';
import AddPartnerForm from '../../features/travel-partners/components/AddPartnerForm';
import CommissionForm from '../../features/travel-partners/components/CommissionForm';
import FollowupForm from '../../features/travel-partners/components/FollowupForm';
import { normalizePhoneNumber, normalizeVehicleNumber } from '../../features/travel-partners/utils/normalize';

type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'found'; results: TravelPartner[]; searchType: 'phone' | 'vehicle'; searchValue: string }
  | { status: 'notfound'; searchType: 'phone' | 'vehicle'; searchValue: string }
  | { status: 'error'; message: string };

type Modal =
  | { type: 'commission'; partner: TravelPartner }
  | { type: 'followup'; partner: TravelPartner }
  | null;

export default function TravelPartnersPage() {
  const router = useRouter();
  const [searchState, setSearchState] = useState<SearchState>({ status: 'idle' });
  const [modal, setModal] = useState<Modal>(null);
  const [username, setUsername] = useState('');

  // Get logged-in username from cookie (display only)
  if (typeof window !== 'undefined' && !username) {
    const match = document.cookie.match(/tp_session=([^;]+)/);
    if (match) {
      try {
        const decoded = JSON.parse(atob(match[1]));
        setUsername(decoded.username || '');
      } catch {}
    }
  }

  const handleSearch = useCallback(async (type: 'phone' | 'vehicle', value: string) => {
    setSearchState({ status: 'loading' });
    try {
      const res = await fetch(`/api/travel-partners/search?type=${type}&value=${encodeURIComponent(value)}`);
      const data = await res.json();

      if (!res.ok) {
        // If tables don't exist yet, treat as not found so Add Partner form shows
        if (data.error?.includes('schema cache') || data.error?.includes('does not exist')) {
          setSearchState({ status: 'notfound', searchType: type, searchValue: value });
          return;
        }
        throw new Error(data.error);
      }

      if (data.found && data.results.length > 0) {
        setSearchState({ status: 'found', results: data.results, searchType: type, searchValue: value });
      } else {
        setSearchState({ status: 'notfound', searchType: type, searchValue: value });
      }
    } catch (err: any) {
      setSearchState({ status: 'error', message: err.message || 'Search failed. Please check database setup.' });
    }
  }, []);

  async function handleLogout() {
    await fetch('/api/travel-partners/auth/logout', { method: 'POST' });
    router.push('/travel-partners/login');
  }

  const searchLoading = searchState.status === 'loading';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-slate-900 text-base leading-tight">Travel Partner Tracker</h1>
            <p className="text-xs text-slate-400">Srimuni Hotels</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              id="reports-link"
              onClick={() => router.push('/travel-partners/reports')}
              className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
            >
              📊 Reports
            </button>
            <button
              id="logout-btn"
              onClick={handleLogout}
              title={username ? `Logged in as ${username}` : 'Logout'}
              className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200 transition-colors"
            >
              {username ? username.charAt(0).toUpperCase() : '👤'} Exit
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {/* Dashboard stat cards */}
        <DashboardStatCards />

        {/* Search section */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Search Partner</h2>
          <SearchBar onSearch={handleSearch} loading={searchLoading} />
        </section>

        {/* Results */}
        {searchState.status === 'loading' && (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin mr-3" />
            Searching…
          </div>
        )}

        {searchState.status === 'error' && (
          <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-4 text-sm text-red-700">
            ⚠️ {searchState.message}
          </div>
        )}

        {searchState.status === 'found' && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-900 text-sm">
                {searchState.results.length} Partner{searchState.results.length !== 1 ? 's' : ''} Found
              </h2>
              <button
                onClick={() => setSearchState({ status: 'idle' })}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            </div>
            <div className="space-y-3">
              {searchState.results.map((p) => (
                <PartnerCard
                  key={p.id}
                  partner={p}
                  onAddCommission={(partner) => setModal({ type: 'commission', partner })}
                  onAddFollowup={(partner) => setModal({ type: 'followup', partner })}
                />
              ))}
            </div>
          </section>
        )}

        {searchState.status === 'notfound' && (
          <section className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
              <span>🔍</span>
              <span>
                No partner found for{' '}
                <span className="font-semibold font-mono">
                  {searchState.searchType === 'vehicle'
                    ? searchState.searchValue
                    : searchState.searchValue}
                </span>
              </span>
            </div>
            <AddPartnerForm
              prefillPhone={searchState.searchType === 'phone' ? searchState.searchValue : undefined}
              prefillVehicle={searchState.searchType === 'vehicle' ? searchState.searchValue : undefined}
            />
          </section>
        )}
      </main>

      {/* Commission Modal */}
      {modal?.type === 'commission' && (
        <BottomSheet onClose={() => setModal(null)}>
          <CommissionForm
            partnerId={modal.partner.id}
            partnerName={modal.partner.driver_name || undefined}
            onSuccess={() => {
              setModal(null);
              // Refresh search results
              if (searchState.status === 'found') {
                handleSearch(searchState.searchType, searchState.searchValue);
              }
            }}
            onCancel={() => setModal(null)}
          />
        </BottomSheet>
      )}

      {/* Follow-up Modal */}
      {modal?.type === 'followup' && (
        <BottomSheet onClose={() => setModal(null)}>
          <FollowupForm
            partnerId={modal.partner.id}
            partnerName={modal.partner.driver_name || undefined}
            onSuccess={() => {
              setModal(null);
              if (searchState.status === 'found') {
                handleSearch(searchState.searchType, searchState.searchValue);
              }
            }}
            onCancel={() => setModal(null)}
          />
        </BottomSheet>
      )}
    </div>
  );
}

// ── Bottom Sheet Modal ─────────────────────────────────────────────────────
function BottomSheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="relative w-full max-w-lg mx-auto bg-slate-50 rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-6">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>
        <div className="px-4 pb-8 pt-2">
          {children}
        </div>
      </div>
    </div>
  );
}
