'use client';

import { FollowupLog } from '../types/travelPartner.types';
import StatusBadge from './StatusBadge';
import { formatDateTime, formatDate } from '../utils/normalize';

type FollowupLogListProps = {
  followups: FollowupLog[];
  loading?: boolean;
};

const METHOD_ICONS: Record<string, string> = {
  'Call': '📞',
  'WhatsApp': '💬',
  'Direct Visit': '🚶',
};

export default function FollowupLogList({ followups, loading }: FollowupLogListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (followups.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400">
        <div className="text-4xl mb-2">📋</div>
        <p className="text-sm">No follow-up logs yet</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-200" />

      <div className="space-y-4">
        {followups.map((f) => (
          <div key={f.id} className="flex gap-3 pl-2">
            {/* Dot */}
            <div className="relative z-10 w-5 h-5 rounded-full bg-white border-2 border-violet-400 shrink-0 mt-1 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-violet-500" />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 px-3 py-2.5 flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  {f.contact_method && (
                    <span className="text-sm font-medium text-slate-700">
                      {METHOD_ICONS[f.contact_method] || ''} {f.contact_method}
                    </span>
                  )}
                  {f.response_status && <StatusBadge status={f.response_status} />}
                </div>
                <p className="text-xs text-slate-400">{formatDateTime(f.created_at)}</p>
              </div>
              {f.notes && <p className="text-sm text-slate-600 mt-1.5">{f.notes}</p>}
              {f.next_followup_at && (
                <p className="text-xs text-violet-600 mt-1.5 font-medium">
                  🗓️ Next follow-up: {formatDate(f.next_followup_at)}
                </p>
              )}
              {f.entered_by && (
                <p className="text-xs text-slate-400 mt-1">by {f.entered_by}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
