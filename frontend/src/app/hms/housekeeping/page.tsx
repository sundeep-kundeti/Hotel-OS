'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getHmsSession, hmsFetch, HMSSession } from '../../../../lib/hmsApi';
import Link from 'next/link';
import { ArrowLeft, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function HousekeepingDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<HMSSession | null>(null);
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Completion form state
  const [completingRoom, setCompletingRoom] = useState<any>(null);
  const [damageFound, setDamageFound] = useState(false);
  const [lostItemFound, setLostItemFound] = useState(false);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    const sess = getHmsSession();
    if (!sess || !['OWNER', 'HOUSEKEEPING'].includes(sess.role)) {
      router.push('/hms/login');
      return;
    }
    setSession(sess);
    fetchQueue();
  }, [router]);

  async function fetchQueue() {
    setLoading(true);
    try {
      const res = await hmsFetch('/hms-housekeeping/queue');
      if (res.ok) {
        const { queue } = await res.json();
        setQueue(queue || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleStartCleaning = async (roomId: string, bookingId: string | undefined) => {
    setProcessingId(roomId);
    try {
      const res = await hmsFetch('/hms-housekeeping/start', {
        method: 'POST',
        body: JSON.stringify({ room_id: roomId, booking_id: bookingId }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to start cleaning');
        return;
      }
      fetchQueue();
    } catch {
      alert('Network error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCompleteCleaning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingRoom) return;
    
    setProcessingId(completingRoom.id);
    try {
      const res = await hmsFetch('/hms-housekeeping/complete', {
        method: 'POST',
        body: JSON.stringify({
          room_id: completingRoom.id,
          booking_id: completingRoom.last_booking?.id,
          damage_found: damageFound,
          lost_item_found: lostItemFound,
          remarks,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to complete cleaning');
        return;
      }
      setCompletingRoom(null);
      fetchQueue();
      // Reset form
      setDamageFound(false);
      setLostItemFound(false);
      setRemarks('');
    } catch {
      alert('Network error');
    } finally {
      setProcessingId(null);
    }
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
      <div className="mx-auto max-w-3xl space-y-6">
        
        <div className="flex items-center gap-4">
          <Link href="/hms" className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Cleaning Queue</h1>
            <p className="text-sm text-slate-500 mt-1">Rooms pending housekeeping</p>
          </div>
        </div>

        {queue.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-200 shadow-sm">
            <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">All Caught Up!</h2>
            <p className="text-slate-500">There are no rooms pending checkout or currently being cleaned.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {queue.map(room => (
              <div key={room.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold text-slate-900">Room {room.room_number}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                      ${room.status === 'Cleaning' ? 'bg-purple-100 text-purple-700' : 'bg-rose-100 text-rose-700'}
                    `}>
                      {room.status}
                    </span>
                  </div>
                  {room.last_booking && (
                    <div className="text-sm text-slate-500">
                      Last stay: {room.last_booking.guest_name}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  {room.status === 'Checkout Pending' && (
                    <button
                      onClick={() => handleStartCleaning(room.id, room.last_booking?.id)}
                      disabled={processingId === room.id}
                      className="w-full md:w-auto px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold text-sm shadow-md shadow-purple-600/20 hover:bg-purple-700 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {processingId === room.id ? 'Starting...' : 'Start Cleaning'}
                    </button>
                  )}
                  {room.status === 'Cleaning' && (
                     <button
                      onClick={() => setCompletingRoom(room)}
                      disabled={processingId === room.id}
                      className="w-full md:w-auto px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Finish Cleaning
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Complete Cleaning Modal */}
      {completingRoom && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Complete Cleaning</h2>
            <p className="text-slate-500 text-sm mb-6">Room {completingRoom.room_number}</p>

            <form onSubmit={handleCompleteCleaning} className="space-y-6">
              
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50/50 border border-rose-100 cursor-pointer hover:bg-rose-50 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={damageFound}
                    onChange={(e) => setDamageFound(e.target.checked)}
                    className="w-5 h-5 rounded border-rose-300 text-rose-600 focus:ring-rose-600"
                  />
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                    <span className="font-semibold text-rose-900 text-sm">Report Damage</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50/50 border border-amber-100 cursor-pointer hover:bg-amber-50 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={lostItemFound}
                    onChange={(e) => setLostItemFound(e.target.checked)}
                    className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-600"
                  />
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <span className="font-semibold text-amber-900 text-sm">Lost & Found Item</span>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Remarks</label>
                <textarea 
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-500 focus:outline-none"
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Describe damage, lost items, or general condition..."
                  required={damageFound || lostItemFound}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setCompletingRoom(null)}
                  className="w-full rounded-xl bg-slate-100 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={processingId === completingRoom.id}
                  className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {processingId === completingRoom.id ? 'Saving...' : 'Mark Vacant Clean'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
