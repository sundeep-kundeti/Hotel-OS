'use client';

import { useEffect, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { hmsFetchPublic } from '../../../lib/hmsApi';
import { Building2, Sparkles, LogOut, CheckCircle2 } from 'lucide-react';

export default function GuestCheckoutPage({ params }: { params: Promise<{ booking_code: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const resolvedParams = use(params);
  const bookingCode = resolvedParams.booking_code;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [confirmVacated, setConfirmVacated] = useState(false);
  const [guestPhone, setGuestPhone] = useState('');
  const [rating, setRating] = useState<number | ''>('');
  const [feedback, setFeedback] = useState('');
  
  const [processing, setProcessing] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  useEffect(() => {
    async function loadBooking() {
      if (!token) {
        setError('Invalid checkout link. Missing token.');
        setLoading(false);
        return;
      }
      try {
        const res = await hmsFetchPublic(`/hms-guest/checkout/${bookingCode}?token=${token}`);
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

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmVacated) {
      alert('Please confirm you have vacated the room.');
      return;
    }
    if (!guestPhone || guestPhone.length < 10) {
      alert('Please enter your 10-digit registered phone number.');
      return;
    }
    
    setProcessing(true);
    try {
      const res = await hmsFetchPublic(`/hms-guest/checkout/${bookingCode}`, {
        method: 'POST',
        body: JSON.stringify({
          token,
          confirm_vacated: confirmVacated,
          guest_phone: guestPhone,
          rating: rating === '' ? null : Number(rating),
          feedback
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to complete checkout');
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
          <h2 className="text-xl font-bold text-slate-900 mb-2">Checkout Error</h2>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (successData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-xl text-center">
          <div className="mx-auto w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Checkout Complete!</h2>
          <p className="text-slate-500 mb-8 px-4 text-sm">
            Thank you for staying with Hotel Sri Satya Sai. We hope to see you again soon.
          </p>

          {successData.reward ? (
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-6 mb-6 text-left border border-indigo-100 shadow-sm relative overflow-hidden">
              {/* decorative */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-4 relative">
                <div className="bg-indigo-100 p-2 rounded-xl">
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-indigo-950">Reward Unlocked</h3>
                  <p className="text-xs text-indigo-800">Your coupon is now active!</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-4 text-center border border-indigo-100 shadow-sm relative">
                <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Coupon Code</div>
                <div className="font-mono font-bold text-indigo-700 text-2xl tracking-widest">{successData.reward.coupon_code}</div>
              </div>
              
              <p className="text-center text-xs text-indigo-600/80 mt-4 font-medium">
                Show this code on your next direct booking to claim ₹{successData.reward.coupon_value} off.
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-3xl p-6 mb-6 text-center border border-slate-200">
              <h3 className="font-bold text-slate-700 mb-2">Reward Pending</h3>
              <p className="text-sm text-slate-500">
                Your checkout is complete, but your payment is not yet confirmed in our system. Your coupon will be activated once the front desk confirms payment.
              </p>
            </div>
          )}
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leaving the room?</h1>
          <p className="text-slate-500 text-sm mt-2 px-4">
            Complete your checkout now to activate your next-stay discount reward.
          </p>
        </div>

        {/* Room Box */}
        <div className="bg-slate-900 rounded-[2rem] p-6 shadow-xl mb-6 flex items-center justify-between text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div>
            <div className="text-slate-400 text-sm font-medium mb-1">Checking out of</div>
            <div className="text-3xl font-bold">Room {booking.room_number}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
            <LogOut className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Confirmation Form */}
        <form onSubmit={handleCheckout} className="space-y-6">
          
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 space-y-6">
            
            {/* Phone Verification */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Verify Phone Number</label>
              <p className="text-xs text-slate-500 mb-3">Please enter the 10-digit number used during booking.</p>
              <input 
                type="tel"
                required
                maxLength={10}
                placeholder="e.g. 9876543210"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-500 text-lg tracking-wide"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
              />
            </div>

            <hr className="border-slate-100" />

            {/* Confirmation Checkbox */}
            <label className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 cursor-pointer border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="pt-0.5">
                <input 
                  type="checkbox" 
                  checked={confirmVacated}
                  onChange={(e) => setConfirmVacated(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                />
              </div>
              <span className="text-sm font-medium text-slate-700 leading-snug">
                I confirm that I have vacated the room and returned/left the key as instructed.
              </span>
            </label>

            <hr className="border-slate-100" />

            {/* Optional Feedback */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">How was your stay? (Optional)</label>
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <button 
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${rating >= star ? 'bg-amber-100 text-amber-500 scale-110' : 'bg-slate-50 text-slate-300 hover:bg-slate-100'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea 
                rows={2}
                placeholder="Any feedback for us?"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-slate-400"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>

          </div>

          <button
            type="submit"
            disabled={processing || !confirmVacated || guestPhone.length < 10}
            className="w-full rounded-2xl bg-indigo-600 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {processing ? 'Processing...' : (
              <>
                Check Out & Activate Reward <Sparkles className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
