'use client';

import { useRouter } from 'next/navigation';
import { TravelPartner } from '../types/travelPartner.types';
import StatusBadge from './StatusBadge';
import { formatVehicleNumber, formatDate } from '../utils/normalize';

type PartnerCardProps = {
  partner: TravelPartner;
  totalCommission?: number;
  totalPending?: number;
  onAddCommission?: (partner: TravelPartner) => void;
  onAddFollowup?: (partner: TravelPartner) => void;
};

export default function PartnerCard({
  partner,
  totalCommission,
  totalPending,
  onAddCommission,
  onAddFollowup,
}: PartnerCardProps) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-bold text-slate-900 text-base truncate">
              {partner.driver_name || 'Unnamed Driver'}
            </p>
            <p className="text-sm text-slate-500 mt-0.5">{partner.vehicle_make || 'Vehicle details not added'}</p>
          </div>
          <StatusBadge status={partner.partner_status} />
        </div>
      </div>

      {/* Details grid */}
      <div className="px-4 py-3 grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
        <div>
          <span className="text-slate-400 text-xs block">Vehicle Number</span>
          <span className="font-mono font-semibold text-slate-800">
            {formatVehicleNumber(partner.vehicle_number)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 text-xs block">Phone</span>
          <span className="font-medium text-slate-800">{partner.phone_number}</span>
        </div>
        {totalCommission !== undefined && (
          <div>
            <span className="text-slate-400 text-xs block">Total Commission</span>
            <span className="font-semibold text-slate-800">₹{totalCommission.toLocaleString('en-IN')}</span>
          </div>
        )}
        {totalPending !== undefined && (
          <div>
            <span className="text-slate-400 text-xs block">Pending</span>
            <span className={`font-semibold ${totalPending > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
              ₹{totalPending.toLocaleString('en-IN')}
            </span>
          </div>
        )}
        <div className="col-span-2">
          <span className="text-slate-400 text-xs block">Lead Source</span>
          <span className="text-slate-700">{partner.lead_source}</span>
        </div>
        {partner.last_contacted_at && (
          <div className="col-span-2">
            <span className="text-slate-400 text-xs block">Last Contacted</span>
            <span className="text-slate-700">{formatDate(partner.last_contacted_at)}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          id={`select-partner-${partner.id}`}
          onClick={() => router.push(`/travel-partners/${partner.id}`)}
          className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 active:scale-[0.98] transition-all"
        >
          View Profile
        </button>
        <button
          id={`commission-${partner.id}`}
          onClick={() => onAddCommission?.(partner)}
          className="flex-1 rounded-xl bg-emerald-50 border border-emerald-200 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 active:scale-[0.98] transition-all"
        >
          + Commission
        </button>
        <button
          id={`followup-${partner.id}`}
          onClick={() => onAddFollowup?.(partner)}
          className="rounded-xl bg-violet-50 border border-violet-200 px-3 py-2.5 text-sm font-semibold text-violet-700 hover:bg-violet-100 active:scale-[0.98] transition-all"
        >
          📝
        </button>
      </div>
    </div>
  );
}
