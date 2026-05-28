'use client';

import { useEffect, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { hmsFetchPublic } from '@/lib/hmsApi';
import { Building2, CheckCircle2, Gift } from 'lucide-react';

export default function GuestCheckinPage({ params }: { params: Promise<{ booking_code: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const resolvedParams = use(params);
  const bookingCode = resolvedParams.booking_code;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [confirmCheckedIn, setConfirmCheckedIn] = useState(false);
  const [idConfirmed, setIdConfirmed] = useState(false);
  const [termsConfirmed, setTermsConfirmed] = useState(false);
  
  const [processing, setProcessing] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  useEffect(() => {
    async function loadBooking() {
      if (!token) {
        setError('Invalid check-in link. Missing token.');
        setLoading(false);
        return;
      }
      try {
        const res = await hmsFetchPublic(`/hms-guest/checkin/${bookingCode}?token=${token}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to load booking');
        } else {
          setBooking(data);
        }
      } catch {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    loadBooking();
  }, [bookingCode, token]);

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmCheckedIn || !idConfirmed || !termsConfirmed) {
      alert('Please confirm all checkboxes to proceed.');
      return;
    }
    setProcessing(true);
    try {
      const res = await hmsFetchPublic(`/hms-guest/checkin/${bookingCode}`, {
        method: 'POST',
        body: JSON.stringify({
          token,
          confirm_checked_in: confirmCheckedIn,
          id_confirmed: idConfirmed,
          terms_confirmed: termsConfirmed
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to complete check-in');
        return;
      }
      setSuccessData(data);
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-xl text-center border border-rose-100">
          <div className="mx-auto w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4 text-2xl">⚠️</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Link Expired or Invalid</h2>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (successData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl text-center">
          <div className="mx-auto w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Check-in Completed!</h2>
          <p className="text-slate-500 mb-8 px-4">
            Welcome to Hotel Sri Satya Sai. We hope you have a wonderful stay.
          </p>

          <div className="bg-blue-50 rounded-2xl p-6 mb-6 text-left border border-blue-100">
            <div className="flex items-center gap-3 mb-3">
              <Gift className="w-6 h-6 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-lg">Reward Created</h3>
            </div>
            <p className="text-sm text-slate-600">
              Your ₹100 next-stay reward has been generated as <strong>inactive</strong>.
            </p>
            <div className="mt-4 text-xs font-semibold text-blue-800 bg-blue-100/50 p-3 rounded-xl border border-blue-200">
              IMPORTANT: Complete your digital checkout before leaving the room to activate your discount coupon!
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 py-8">
      <div className="max-w-md mx-auto">
        
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl mb-4">
            <Building2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hotel Sri Satya Sai</h1>
          <p className="text-slate-500 text-sm mt-1">Digital Guest Check-In</p>
        </div>

        {/* Stay Details */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Your Stay Details</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500 text-sm">Guest</span>
              <span className="font-semibold text-slate-900">{booking.guest_name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500 text-sm">Booking ID</span>
              <span className="font-semibold text-slate-900">{booking.booking_code}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500 text-sm">Room</span>
              <span className="font-bold text-slate-900 text-lg bg-slate-100 px-3 py-1 rounded-lg">{booking.room_number}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500 text-sm">Check-out</span>
              <span className="font-semibold text-slate-900">
                {new Date(booking.checkout_expected).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Confirmation Form */}
        <form onSubmit={handleCheckin} className="space-y-6">
          
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 mb-2">Guest Confirmations</h3>
            
            <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
              <div className="pt-0.5">
                <input 
                  type="checkbox" 
                  checked={confirmCheckedIn}
                  onChange={(e) => setConfirmCheckedIn(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                />
              </div>
              <span className="text-sm text-slate-700 leading-snug">
                I confirm that I have arrived and checked into the assigned room.
              </span>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
              <div className="pt-0.5">
                <input 
                  type="checkbox" 
                  checked={idConfirmed}
                  onChange={(e) => setIdConfirmed(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                />
              </div>
              <span className="text-sm text-slate-700 leading-snug">
                I confirm that my valid ID details were provided at reception.
              </span>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
              <div className="pt-0.5">
                <input 
                  type="checkbox" 
                  checked={termsConfirmed}
                  onChange={(e) => setTermsConfirmed(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                />
              </div>
              <span className="text-sm text-slate-700 leading-snug">
                I agree to the hotel stay rules and policies.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={processing || !confirmCheckedIn || !idConfirmed || !termsConfirmed}
            className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-bold text-white shadow-xl shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none"
          >
            {processing ? 'Processing...' : 'Complete Check-In & Claim Reward'}
          </button>
        </form>

      </div>
    </div>
  );
}
