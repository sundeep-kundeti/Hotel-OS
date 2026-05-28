'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getHmsSession, hmsFetch, HMSSession } from '../../../../lib/hmsApi';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CalendarDays, Clock3, DoorClosed, IndianRupee, Plus, Search, Building2, UserRound, ArrowRight, ShieldAlert } from 'lucide-react';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

function formatDateTime(value: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true }).format(date);
}

export default function HMSReceptionDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<HMSSession | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [manualCheckoutBooking, setManualCheckoutBooking] = useState<string | null>(null);
  const [manualCheckoutReason, setManualCheckoutReason] = useState('Guest left in hurry');
  const [manualCheckoutRemarks, setManualCheckoutRemarks] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const sess = getHmsSession();
    if (!sess || !['OWNER', 'MANAGER'].includes(sess.role)) {
      router.push('/hms/login');
      return;
    }
    setSession(sess);
    fetchData();
  }, [router]);

  async function fetchData() {
    setLoading(true);
    try {
      const [roomsRes, bookingsRes] = await Promise.all([
        hmsFetch('/hms-rooms'),
        hmsFetch('/hms-bookings?filter=active')
      ]);

      if (roomsRes.ok) {
        const { rooms } = await roomsRes.json();
        setRooms(rooms || []);
      }
      if (bookingsRes.ok) {
        const { bookings } = await bookingsRes.json();
        setBookings(bookings || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleManualCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCheckoutBooking) return;
    setProcessing(true);
    try {
      const res = await hmsFetch(`/hms-manual-checkout/${manualCheckoutBooking}`, {
        method: 'POST',
        body: JSON.stringify({ reason: manualCheckoutReason, remarks: manualCheckoutRemarks }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to complete manual checkout');
        return;
      }
      alert('Manual checkout completed. Exception logged for owner review.');
      setManualCheckoutBooking(null);
      fetchData(); // refresh data
    } catch {
      alert('Network error');
    } finally {
      setProcessing(false);
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return [b.guest_name, b.booking_code, b.room_number, b.guest_phone].join(' ').toLowerCase().includes(q);
    });
  }, [bookings, search]);

  const vacantRooms = rooms.filter(r => r.status === 'Vacant Clean').length;
  const occupiedRooms = rooms.filter(r => r.status === 'Occupied').length;
  const totalCollection = bookings.reduce((sum, b) => sum + Number(b.amount_collected || 0), 0);

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header */}
        <section className="rounded-[2rem] bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white shadow-xl md:p-8 flex flex-col md:flex-row justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-slate-300 text-sm mb-2">
              <Link href="/hms" className="hover:text-white transition-colors">Hotel OS</Link>
              <span>/</span>
              <span>Reception</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Front Desk Dashboard</h1>
            <p className="mt-2 text-sm text-slate-300 max-w-xl">
              Live room status, active stays, and digital check-in/checkout links. Room statuses are automatically updated by guest actions and housekeeping.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-white/10 p-4 border border-white/5">
              <p className="text-xs text-slate-300">Total Rooms</p>
              <p className="text-2xl font-semibold mt-1">{rooms.length}</p>
            </div>
            <div className="rounded-2xl bg-emerald-500/10 p-4 border border-emerald-500/20">
              <p className="text-xs text-emerald-200">Vacant Clean</p>
              <p className="text-2xl font-semibold text-emerald-400 mt-1">{vacantRooms}</p>
            </div>
            <div className="rounded-2xl bg-amber-500/10 p-4 border border-amber-500/20">
              <p className="text-xs text-amber-200">Occupied</p>
              <p className="text-2xl font-semibold text-amber-400 mt-1">{occupiedRooms}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 border border-white/5">
              <p className="text-xs text-slate-300">Total Collected</p>
              <p className="text-xl font-semibold mt-1">{formatCurrency(totalCollection)}</p>
            </div>
          </div>
        </section>

        {/* Actions & Filters */}
        <section className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bookings by name, phone, room..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all"
            />
          </div>
          <Link href="/hms/reception/bookings/new" className="w-full md:w-auto">
            <button className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-medium hover:bg-slate-800 active:scale-95 transition-all shadow-lg shadow-slate-900/10">
              <Plus className="h-5 w-5" />
              New Walk-in Booking
            </button>
          </Link>
        </section>

        {/* Grid Layout: Rooms (Left 1/3) & Active Stays (Right 2/3) */}
        <section className="grid lg:grid-cols-3 gap-8 items-start">
          
          {/* Room Status Snapshot */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <DoorClosed className="h-5 w-5 text-slate-500" />
              <h2 className="text-xl font-semibold text-slate-900">Room Status</h2>
            </div>
            
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-2">
              {rooms.map(room => {
                let colorClass = 'bg-slate-100 text-slate-600 border-slate-200';
                if (room.status === 'Vacant Clean') colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                else if (room.status === 'Occupied') colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
                else if (room.status === 'Pending Check-In') colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
                else if (room.status === 'Checkout Pending') colorClass = 'bg-rose-50 text-rose-700 border-rose-200';
                else if (room.status === 'Cleaning') colorClass = 'bg-purple-50 text-purple-700 border-purple-200';
                else if (room.status === 'Blocked') colorClass = 'bg-slate-800 text-white border-slate-900';

                return (
                  <div key={room.id} className={`rounded-xl border flex items-center justify-center py-3 text-sm font-bold ${colorClass}`} title={room.status}>
                    {room.room_number}
                  </div>
                );
              })}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-400" /> Vacant Clean</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-400" /> Pending Check-in</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-400" /> Occupied</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-400" /> Checkout Pending</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-400" /> Cleaning</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-800" /> Blocked</div>
            </div>
          </div>

          {/* Active Bookings List */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 lg:col-span-2">
             <div className="flex items-center gap-3 mb-6">
              <Building2 className="h-5 w-5 text-slate-500" />
              <h2 className="text-xl font-semibold text-slate-900">Active Stays</h2>
            </div>

            <div className="space-y-4">
              {filteredBookings.length === 0 ? (
                <div className="text-center py-12 text-slate-400">No active stays found.</div>
              ) : (
                filteredBookings.map(booking => {
                  const checkinLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://srimunihotels.com'}/checkin/${booking.booking_code}?token=${booking.checkin_token}`;
                  const checkoutLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://srimunihotels.com'}/checkout/${booking.booking_code}?token=${booking.checkout_token}`;
                  
                  return (
                    <div key={booking.id} className="border border-slate-200 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-lg text-slate-900">Room {booking.room_number}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                            ${booking.booking_status === 'Checked In' ? 'bg-amber-100 text-amber-800' :
                              booking.booking_status === 'Pending Check-In' ? 'bg-blue-100 text-blue-800' :
                              booking.booking_status === 'Guest Checked Out' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-slate-100 text-slate-800'
                            }
                          `}>
                            {booking.booking_status}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600 mb-2 font-medium">{booking.guest_name} · {booking.guest_phone}</div>
                        <div className="text-xs text-slate-500 space-y-1">
                          <div><span className="text-slate-400">In:</span> {formatDateTime(booking.checkin_expected)}</div>
                          <div><span className="text-slate-400">Out:</span> {formatDateTime(booking.checkout_expected)}</div>
                          <div><span className="text-slate-400">Bal:</span> {formatCurrency(booking.amount_collected)} / {formatCurrency(booking.amount)} ({booking.payment_status})</div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 justify-end">
                        {booking.booking_status === 'Pending Check-In' && (
                          <a 
                            href={`https://wa.me/91${booking.guest_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Welcome to Hotel Sri Satya Sai!\n\nPlease complete your digital check-in to unlock your next-stay reward:\n\n${checkinLink}`)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="text-xs bg-[#25D366] text-white px-4 py-2 rounded-xl text-center font-semibold shadow-md shadow-green-500/20 hover:bg-[#1ebd59]"
                          >
                            Send Check-in Link
                          </a>
                        )}
                        {booking.booking_status === 'Checked In' && (
                          <>
                            <a 
                              href={`https://wa.me/91${booking.guest_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Dear Guest,\n\nPlease complete digital checkout before leaving Room ${booking.room_number} to activate your ₹100 next-stay discount:\n\n${checkoutLink}`)}`}
                              target="_blank" rel="noopener noreferrer"
                              className="text-xs bg-[#25D366] text-white px-4 py-2 rounded-xl text-center font-semibold shadow-md shadow-green-500/20 hover:bg-[#1ebd59]"
                            >
                              Send Checkout Link
                            </a>
                            <button
                              onClick={() => setManualCheckoutBooking(booking.booking_code)}
                              className="text-xs bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-center font-semibold hover:bg-rose-100"
                            >
                              Manual Checkout
                            </button>
                          </>
                        )}
                        {booking.booking_status === 'Guest Checked Out' && (
                          <span className="text-xs text-slate-400 text-center py-2 flex items-center justify-center gap-1">
                            <Clock3 className="w-3 h-3" /> Waiting for cleaning
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Manual Checkout Modal */}
      {manualCheckoutBooking && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <ShieldAlert className="w-6 h-6" />
              <h2 className="text-xl font-bold">Manual Checkout</h2>
            </div>
            
            <p className="text-sm text-slate-600 mb-6">
              Warning: Checking out manually bypasses the guest digital checkout and will <strong>not activate</strong> their reward coupon. This action will be logged as a <span className="font-semibold text-rose-600">HIGH RISK</span> exception for owner review.
            </p>

            <form onSubmit={handleManualCheckout} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason (Required)</label>
                <select 
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-500 focus:outline-none"
                  value={manualCheckoutReason}
                  onChange={(e) => setManualCheckoutReason(e.target.value)}
                  required
                >
                  <option value="Guest left in hurry">Guest left in hurry</option>
                  <option value="Guest phone not working">Guest phone not working</option>
                  <option value="Guest refused">Guest refused</option>
                  <option value="Staff entered manually">Staff entered manually</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks (Optional)</label>
                <textarea 
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-500 focus:outline-none"
                  rows={3}
                  value={manualCheckoutRemarks}
                  onChange={(e) => setManualCheckoutRemarks(e.target.value)}
                  placeholder="Provide additional details..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setManualCheckoutBooking(null)}
                  className="w-full rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={processing}
                  className="w-full rounded-xl bg-rose-600 py-3 text-sm font-semibold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {processing ? 'Processing...' : 'Confirm Checkout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
