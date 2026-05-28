'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getHmsSession, hmsFetch } from '@/lib/hmsApi';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const defaultForm = {
  room_id: '',
  guest_name: '',
  guest_phone: '',
  amount: '',
  amount_collected: '',
  payment_mode: 'Cash',
  payment_status: 'Pending',
  source: 'Walk-in',
  checkin_expected: new Date().toISOString(),
  checkout_expected: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  id_type: '',
  id_last4: '',
  remarks: '',
};

export default function NewBookingPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  useEffect(() => {
    const sess = getHmsSession();
    if (!sess || !['OWNER', 'MANAGER'].includes(sess.role)) {
      router.push('/hms/login');
      return;
    }
    
    async function fetchRooms() {
      try {
        const res = await hmsFetch('/hms-rooms');
        if (res.ok) {
          const { rooms } = await res.json();
          setRooms(rooms || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, [router]);

  const vacantRooms = useMemo(() => rooms.filter(r => r.status === 'Vacant Clean'), [rooms]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.room_id || !form.guest_name || !form.guest_phone || !form.amount || !form.checkin_expected || !form.checkout_expected) {
      setError('Please fill in all required fields.');
      return;
    }

    if (new Date(form.checkout_expected) <= new Date(form.checkin_expected)) {
      setError('Check-out must be after check-in.');
      return;
    }

    setProcessing(true);
    try {
      const res = await hmsFetch('/hms-bookings', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to create booking');
        return;
      }

      setSuccessData(data);
    } catch (err) {
      setError('Network error');
    } finally {
      setProcessing(false);
    }
  };

  const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (successData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8">
        <div className="bg-white max-w-lg w-full rounded-3xl p-8 shadow-xl text-center">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking Created</h2>
          <p className="text-slate-500 mb-6">Room {successData.booking.room_number} is now Pending Check-In.</p>

          <div className="bg-slate-50 rounded-2xl p-4 mb-8 text-left border border-slate-100">
            <div className="text-sm text-slate-500 mb-1">Booking ID</div>
            <div className="font-mono font-bold text-slate-900 text-lg mb-4">{successData.booking.booking_code}</div>
            
            <div className="text-sm text-slate-500 mb-1">Guest</div>
            <div className="font-semibold text-slate-900 mb-4">{successData.booking.guest_name} ({successData.booking.guest_phone})</div>

            <div className="text-sm text-slate-500 mb-1">Next Step</div>
            <div className="text-sm text-slate-700">Guest must complete digital check-in to activate the room and unlock their reward coupon.</div>
          </div>

          <a 
            href={successData.whatsapp_link}
            target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center justify-center bg-[#25D366] text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-green-500/20 hover:bg-[#1ebd59] transition-colors mb-3"
          >
            Send Check-in Link via WhatsApp
          </a>

          <Link href="/hms/reception" className="block w-full text-center text-sm font-medium text-slate-500 hover:text-slate-800 py-2">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        
        <div className="flex items-center gap-4">
          <Link href="/hms/reception" className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">New Booking</h1>
            <p className="text-sm text-slate-500 mt-1">Create a walk-in or advance booking</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200">
          
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Assign Room <span className="text-rose-500">*</span></label>
                <select 
                  required
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-500 bg-white"
                  value={form.room_id}
                  onChange={(e) => {
                    const roomId = e.target.value;
                    const room = rooms.find(r => r.id === roomId);
                    setForm(prev => ({ 
                      ...prev, 
                      room_id: roomId,
                      amount: room ? room.base_rate.toString() : prev.amount
                    }));
                  }}
                >
                  <option value="">Select Vacant Clean Room</option>
                  {vacantRooms.map(r => (
                    <option key={r.id} value={r.id}>Room {r.room_number} - {r.room_type} (₹{r.base_rate})</option>
                  ))}
                </select>
                {vacantRooms.length === 0 && <p className="text-xs text-rose-500 mt-2">No vacant clean rooms available. Check housekeeping queue.</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Booking Source</label>
                <select 
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-500 bg-white"
                  value={form.source}
                  onChange={(e) => setForm(prev => ({ ...prev, source: e.target.value }))}
                >
                  <option value="Walk-in">Walk-in</option>
                  <option value="Phone">Phone</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Website">Website</option>
                  <option value="OTA">OTA (MakeMyTrip, Agoda, etc)</option>
                  <option value="Broker">Broker</option>
                  <option value="Repeat Guest">Repeat Guest</option>
                </select>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Guest Name <span className="text-rose-500">*</span></label>
                <input 
                  required
                  type="text"
                  placeholder="Full Name"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-500"
                  value={form.guest_name}
                  onChange={(e) => setForm(prev => ({ ...prev, guest_name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Guest Phone <span className="text-rose-500">*</span></label>
                <input 
                  required
                  type="tel"
                  placeholder="10-digit mobile number"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-500"
                  value={form.guest_phone}
                  onChange={(e) => setForm(prev => ({ ...prev, guest_phone: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Expected Check-in <span className="text-rose-500">*</span></label>
                <DatePicker
                  selected={new Date(form.checkin_expected)}
                  onChange={(date: Date | null) => date && setForm(prev => ({ ...prev, checkin_expected: date.toISOString() }))}
                  showTimeSelect
                  timeFormat="h:mm aa"
                  timeIntervals={15}
                  dateFormat="MMM d, yyyy h:mm aa"
                  wrapperClassName="w-full"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Expected Check-out <span className="text-rose-500">*</span></label>
                <DatePicker
                  selected={new Date(form.checkout_expected)}
                  onChange={(date: Date | null) => date && setForm(prev => ({ ...prev, checkout_expected: date.toISOString() }))}
                  showTimeSelect
                  timeFormat="h:mm aa"
                  timeIntervals={15}
                  dateFormat="MMM d, yyyy h:mm aa"
                  minDate={new Date(form.checkin_expected)}
                  wrapperClassName="w-full"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-500"
                />
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Total Amount <span className="text-rose-500">*</span></label>
                <input 
                  required
                  type="number"
                  placeholder="0"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-500"
                  value={form.amount}
                  onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Amount Collected</label>
                <input 
                  type="number"
                  placeholder="0"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-500"
                  value={form.amount_collected}
                  onChange={(e) => setForm(prev => ({ ...prev, amount_collected: e.target.value }))}
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Mode</label>
                <select 
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-500 bg-white"
                  value={form.payment_mode}
                  onChange={(e) => setForm(prev => ({ ...prev, payment_mode: e.target.value }))}
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Online">Online</option>
                  <option value="OTA">OTA Pre-paid</option>
                  <option value="Credit">Credit</option>
                </select>
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                <select 
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-500 bg-white"
                  value={form.payment_status}
                  onChange={(e) => setForm(prev => ({ ...prev, payment_status: e.target.value }))}
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">ID Proof Type (Optional)</label>
                <select 
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-500 bg-white"
                  value={form.id_type}
                  onChange={(e) => setForm(prev => ({ ...prev, id_type: e.target.value }))}
                >
                  <option value="">None</option>
                  <option value="Aadhaar">Aadhaar</option>
                  <option value="PAN">PAN Card</option>
                  <option value="Passport">Passport</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Voter ID">Voter ID</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">ID Last 4 Digits</label>
                <input 
                  type="text"
                  maxLength={4}
                  placeholder="e.g. 1234"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-500"
                  value={form.id_last4}
                  onChange={(e) => setForm(prev => ({ ...prev, id_last4: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Remarks</label>
              <textarea 
                rows={2}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-500"
                value={form.remarks}
                onChange={(e) => setForm(prev => ({ ...prev, remarks: e.target.value }))}
                placeholder="Special requests, corporate booking details, etc."
              />
            </div>

            <button
              type="submit"
              disabled={processing || vacantRooms.length === 0}
              className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 mt-6"
            >
              {processing ? 'Creating Booking...' : 'Create Booking'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
