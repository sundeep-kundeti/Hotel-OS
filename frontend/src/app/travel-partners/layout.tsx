import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Travel Partner Tracker | Srimuni Hotels',
  description: 'Internal tool to track travel partners, commissions, and follow-ups for Srimuni Hotels.',
  robots: 'noindex, nofollow',
};

export default function TravelPartnersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {children}
    </div>
  );
}
