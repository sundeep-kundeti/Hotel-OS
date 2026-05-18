'use client';

import { PartnerStatus, CommissionStatus, ResponseStatus } from '../types/travelPartner.types';

type StatusBadgeProps = {
  status: string;
  size?: 'sm' | 'md';
};

const PARTNER_STATUS_COLORS: Record<string, string> = {
  'Lead Only': 'bg-slate-100 text-slate-600 border-slate-200',
  'Not Contacted': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Contacted': 'bg-blue-50 text-blue-700 border-blue-200',
  'Interested': 'bg-purple-50 text-purple-700 border-purple-200',
  'Active Partner': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Not Interested': 'bg-red-50 text-red-600 border-red-200',
  'Blocked': 'bg-gray-100 text-gray-500 border-gray-200',
  // Commission statuses
  'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
  'Paid': 'bg-green-50 text-green-700 border-green-200',
  'Cancelled': 'bg-red-50 text-red-600 border-red-200',
  'Disputed': 'bg-orange-50 text-orange-700 border-orange-200',
  // Response statuses
  'No Response': 'bg-gray-100 text-gray-500 border-gray-200',
};

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const colorClass = PARTNER_STATUS_COLORS[status] || 'bg-gray-100 text-gray-500 border-gray-200';
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${colorClass} ${sizeClass}`}
    >
      {status}
    </span>
  );
}
