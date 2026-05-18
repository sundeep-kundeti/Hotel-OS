'use client';

import { useEffect, useState } from 'react';
import { DashboardStats } from '../types/travelPartner.types';
import { formatCurrency } from '../utils/normalize';

const STAT_CONFIG = [
  {
    key: 'today_leads' as keyof DashboardStats,
    label: 'Today Leads',
    icon: '🚗',
    gradient: 'from-blue-500 to-blue-600',
    format: (v: number) => v.toString(),
  },
  {
    key: 'today_commissions' as keyof DashboardStats,
    label: 'Today Commissions',
    icon: '💰',
    gradient: 'from-violet-500 to-violet-600',
    format: (v: number) => v.toString(),
  },
  {
    key: 'pending_commission_amount' as keyof DashboardStats,
    label: 'Pending Commission',
    icon: '⏳',
    gradient: 'from-amber-500 to-orange-500',
    format: (v: number) => formatCurrency(v),
  },
  {
    key: 'active_partners' as keyof DashboardStats,
    label: 'Active Partners',
    icon: '✅',
    gradient: 'from-emerald-500 to-teal-500',
    format: (v: number) => v.toString(),
  },
];

export default function DashboardStatCards() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/travel-partners/stats')
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setStats(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {STAT_CONFIG.map((s) => (
        <div
          key={s.key}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.gradient} p-4 text-white shadow-sm`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-white/80 leading-tight">{s.label}</p>
              {loading ? (
                <div className="mt-1.5 h-7 w-16 bg-white/20 rounded animate-pulse" />
              ) : (
                <p className="mt-1 text-2xl font-bold tracking-tight">
                  {stats ? s.format(stats[s.key] as number) : '—'}
                </p>
              )}
            </div>
            <span className="text-2xl opacity-80">{s.icon}</span>
          </div>
          {/* Decorative circle */}
          <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-full bg-white/10" />
        </div>
      ))}
    </div>
  );
}
