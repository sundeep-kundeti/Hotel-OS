'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getHmsSession, hmsFetch, HMSSession } from '../../../../lib/hmsApi';
import Link from 'next/link';
import { ArrowLeft, LayoutDashboard, ShieldAlert, Activity, RefreshCw } from 'lucide-react';

export default function OwnerDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<HMSSession | null>(null);
  
  const [snapshot, setSnapshot] = useState<any>(null);
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const sess = getHmsSession();
    if (!sess || sess.role !== 'OWNER') {
      router.push('/hms/login');
      return;
    }
    setSession(sess);
    fetchData();
  }, [router]);

  async function fetchData() {
    setLoading(true);
    try {
      const [snapRes, excRes, auditRes] = await Promise.all([
        hmsFetch('/hms-owner/snapshot'),
        hmsFetch('/hms-owner/exceptions'),
        hmsFetch('/hms-owner/audit-logs')
      ]);

      if (snapRes.ok) setSnapshot((await snapRes.json()).snapshot);
      if (excRes.ok) setExceptions((await excRes.json()).exceptions || []);
      if (auditRes.ok) setAuditLogs((await auditRes.json()).audit_logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const handleResolveException = async (id: string) => {
    const note = prompt('Enter resolution note (optional):');
    if (note === null) return; // cancelled

    try {
      const res = await hmsFetch(`/hms-owner/exceptions/${id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ resolution_note: note }),
      });
      if (!res.ok) {
        alert('Failed to resolve exception');
        return;
      }
      // Refresh exceptions
      const excRes = await hmsFetch('/hms-owner/exceptions');
      if (excRes.ok) setExceptions((await excRes.json()).exceptions || []);
      
      // Update snapshot open exceptions count
      setSnapshot((s: any) => ({ ...s, openExceptions: Math.max(0, s.openExceptions - 1) }));
    } catch {
      alert('Network error');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 pb-24">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <Link href="/hms" className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <LayoutDashboard className="w-6 h-6 text-purple-600" /> Owner Dashboard
              </h1>
              <p className="text-sm text-slate-500 mt-1">Daily Snapshot & Exception Monitoring</p>
            </div>
          </div>
          <button 
            onClick={handleRefresh}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium text-sm border border-slate-200"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {/* Today's Snapshot */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4 px-2">Today's Snapshot</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <StatCard title="Total Bookings" value={snapshot?.bookingsToday} color="blue" />
            <StatCard title="Check-Ins" value={snapshot?.checkinsToday} color="emerald" />
            <StatCard title="Check-Outs" value={snapshot?.guestCheckoutsToday} color="indigo" />
            <StatCard title="Manual Checkouts" value={snapshot?.manualCheckoutsToday} color="rose" alert={snapshot?.manualCheckoutsToday > 0} />
            <StatCard title="Rewards Active" value={snapshot?.rewardsActivated} color="amber" />
            <StatCard title="Open Exceptions" value={snapshot?.openExceptions} color="rose" alert={snapshot?.openExceptions > 0} />
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Exceptions Table */}
          <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
            <div className="flex items-center gap-2 mb-6">
              <ShieldAlert className="w-6 h-6 text-rose-500" />
              <h2 className="text-xl font-bold text-slate-900">System Exceptions</h2>
            </div>
            
            <div className="overflow-y-auto flex-1 pr-2 space-y-3">
              {exceptions.length === 0 ? (
                <div className="text-center py-12 text-slate-400">No exceptions logged.</div>
              ) : (
                exceptions.map(exc => (
                  <div key={exc.id} className={`p-4 rounded-2xl border ${exc.status === 'Open' ? 'bg-rose-50/50 border-rose-100' : 'bg-slate-50 border-slate-200 opacity-70'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2 items-center">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                          exc.risk_level === 'HIGH' ? 'bg-rose-100 text-rose-700' : 
                          exc.risk_level === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {exc.risk_level}
                        </span>
                        <span className="text-sm font-semibold text-slate-900">{exc.exception_type}</span>
                      </div>
                      <span className="text-xs text-slate-500">{new Date(exc.created_at).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</span>
                    </div>
                    <p className="text-sm text-slate-700 mb-3">{exc.description}</p>
                    
                    {exc.status === 'Open' ? (
                      <button 
                        onClick={() => handleResolveException(exc.id)}
                        className="text-xs bg-white border border-rose-200 text-rose-600 px-4 py-1.5 rounded-lg hover:bg-rose-50 font-medium transition-colors"
                      >
                        Mark as Resolved
                      </button>
                    ) : (
                      <div className="text-xs text-slate-500 bg-white/50 p-2 rounded-lg border border-slate-100">
                        Resolved by {exc.resolved_by_user?.name} 
                        {exc.resolution_note && <span> • Note: {exc.resolution_note}</span>}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Audit Logs Table */}
          <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-6 h-6 text-slate-500" />
              <h2 className="text-xl font-bold text-slate-900">Recent Audit Logs</h2>
            </div>
            
            <div className="overflow-y-auto flex-1 pr-2">
              {auditLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-400">No audit logs found.</div>
              ) : (
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  {auditLogs.map(log => (
                    <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <div className={`w-3 h-3 rounded-full ${log.risk_level === 'HIGH' ? 'bg-rose-500' : 'bg-slate-400'}`} />
                      </div>
                      
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 text-sm">{log.action}</span>
                          <span className="text-[10px] text-slate-500">{new Date(log.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit'})}</span>
                        </div>
                        <div className="text-xs text-slate-600 mb-1">
                          Entity: <span className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">{log.entity}</span>
                        </div>
                        {log.old_value && log.new_value && (
                          <div className="text-xs text-slate-500 bg-white p-2 rounded-xl border border-slate-100 mt-2">
                            <span className="line-through text-slate-400">{log.old_value}</span> → <span className="font-medium text-slate-700">{log.new_value}</span>
                          </div>
                        )}
                        <div className="text-[11px] text-slate-400 mt-2 text-right">
                          by {log.changed_by?.name} ({log.changed_by_role})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color, alert }: { title: string, value: number, color: string, alert?: boolean }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-100 text-blue-900',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-900',
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-900',
    rose: 'bg-rose-50 border-rose-100 text-rose-900',
    amber: 'bg-amber-50 border-amber-100 text-amber-900',
  };
  
  return (
    <div className={`rounded-2xl p-4 border ${colors[color]} relative overflow-hidden`}>
      {alert && (
        <div className="absolute top-0 right-0 w-12 h-12 bg-rose-500/20 rounded-full blur-xl -mr-4 -mt-4 animate-pulse" />
      )}
      <p className="text-xs font-semibold opacity-70 mb-1 uppercase tracking-wider">{title}</p>
      <p className="text-3xl font-bold">{value !== undefined ? value : '-'}</p>
    </div>
  );
}
