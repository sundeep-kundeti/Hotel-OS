'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getHmsSession, HMSSession, hmsFetch, clearHmsSession } from '@/lib/hmsApi';
import { Building2, CalendarRange, Sparkles, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function HMSHomePage() {
  const router = useRouter();
  const [session, setSession] = useState<HMSSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifySession() {
      const sess = getHmsSession();
      if (!sess) {
        router.push('/hms/login');
        return;
      }
      
      // Ping edge function to verify token is still valid
      try {
        const res = await hmsFetch('/hms-auth');
        if (!res.ok) {
          router.push('/hms/login');
          return;
        }
        setSession(sess);
      } catch {
        router.push('/hms/login');
      } finally {
        setLoading(false);
      }
    }
    verifySession();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        
        {/* Header */}
        <section className="rounded-[2rem] bg-slate-900 p-6 text-white shadow-xl md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Welcome, {session.name}</h1>
              <p className="text-sm text-slate-300 mt-1 capitalize">{session.role.toLowerCase()} Portal</p>
            </div>
          </div>
          <button 
            onClick={() => {
              clearHmsSession();
              router.push('/hms/login');
            }}
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 transition-colors"
          >
            Sign Out
          </button>
        </section>

        {/* Modules Grid */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Select Module</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {(session.role === 'OWNER' || session.role === 'MANAGER') && (
              <Link href="/hms/reception" className="group block h-full">
                <div className="h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
                  <div className="mb-4 inline-flex rounded-2xl bg-blue-50 p-3 group-hover:bg-blue-100 transition-colors">
                    <CalendarRange className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Reception Desk</h3>
                  <p className="mt-2 text-sm text-slate-500">Live room grid, check-ins, check-outs, and new bookings.</p>
                </div>
              </Link>
            )}

            {(session.role === 'OWNER' || session.role === 'HOUSEKEEPING') && (
              <Link href="/hms/housekeeping" className="group block h-full">
                <div className="h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
                  <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 p-3 group-hover:bg-emerald-100 transition-colors">
                    <Sparkles className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Housekeeping</h3>
                  <p className="mt-2 text-sm text-slate-500">Cleaning queue, room status updates, and damage reports.</p>
                </div>
              </Link>
            )}

            {session.role === 'OWNER' && (
              <Link href="/hms/owner" className="group block h-full">
                <div className="h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
                  <div className="mb-4 inline-flex rounded-2xl bg-purple-50 p-3 group-hover:bg-purple-100 transition-colors">
                    <LayoutDashboard className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Owner Dashboard</h3>
                  <p className="mt-2 text-sm text-slate-500">Audit logs, exceptions, revenue, and daily snapshot.</p>
                </div>
              </Link>
            )}

          </div>
        </section>

      </div>
    </div>
  );
}
