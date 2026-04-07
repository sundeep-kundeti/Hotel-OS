'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ChevronRight, User, Mail, Calendar, MapPin, Building2, Phone, ShieldCheck, Clock, Gift, Headset } from 'lucide-react';

export default function SrimuniSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [phone, setPhone] = useState('');
  const [profile, setProfile] = useState({
     fullName: '', email: '', dob: '', anniversary: '', city: '', promotionalConsent: true
  });
  const [targetRole, setTargetRole] = useState('');

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return setError('Please enter a valid 10-digit mobile number.');
    setLoading(true); setError('');

    try {
      const res = await fetch('/api/auth/login-direct', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication Failed');

      if (data.status === 'authenticated') {
         setTargetRole(data.role);
         setStep(3);
         setTimeout(() => {
            if (data.role === 'manager') router.push('/fresh-up/manager');
            else router.push('/fresh-up');
         }, 2000);
      } else if (data.status === 'new_user') {
         setStep(2);
      }
    } catch(err:any) { setError(err.message); } finally { setLoading(false); }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!profile.fullName) return setError('Full Name is required.');
     setLoading(true); setError('');

     try {
       const res = await fetch('/api/auth/register-guest', {
           method: 'POST', headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ phone, ...profile })
       });
       const data = await res.json();
       if (!res.ok) throw new Error(data.error || 'Registration Failed');

       setTargetRole('guest');
       setStep(3);
       setTimeout(() => router.push('/fresh-up'), 2000);
     } catch(err:any) { setError(err.message); } finally { setLoading(false); }
  }

  const handleGuestContinue = () => {
      router.push('/fresh-up'); // Bypassing login entirely to view public slots
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F9F9F8] font-sans antialiased text-slate-800">
      
      {/* LEFT: BRAND MARKETING PANEL */}
      <div className="w-full md:w-[45%] lg:w-[50%] bg-[#1A1D20] text-stone-100 flex flex-col p-8 md:p-12 lg:p-20 relative overflow-hidden">
         {/* Subtle Luxury Gradient Overlay */}
         <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-[#272B2E] via-[#1A1D20] to-[#121415] opacity-50 pointer-events-none z-0" />
         <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-br from-[#D4AF37]/10 to-transparent pointer-events-none z-0" />

         <div className="relative z-10 flex-1 flex flex-col">
            <div className="mb-16">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-sm bg-gradient-to-tr from-[#D4AF37] to-[#F3E5AB] flex items-center justify-center text-[#1A1D20]">
                     <Building2 size={20} strokeWidth={2.5} />
                  </div>
                  <span className="text-2xl font-black tracking-tight text-white">Srimuni Hotels</span>
               </div>
               <p className="mt-3 text-stone-400 font-medium tracking-wide text-sm uppercase">Comfortable stays. Faster booking. Direct hospitality.</p>
            </div>

            <div className="mb-12 max-w-lg">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
                   Stay better with<br/>Srimuni Hotels.
                </h1>
                <p className="text-stone-300 text-lg leading-relaxed mix-blend-screen opacity-90">
                   Create your guest account to enjoy faster bookings, easier repeat stays, and exclusive direct-guest offers designed entirely for Tirupati travelers.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto mb-12">
               <div className="bg-[#24282B]/60 backdrop-blur-md rounded-2xl p-5 border border-white/5 shadow-xl transition-transform hover:-translate-y-1">
                  <Clock className="text-[#D4AF37] mb-3" size={24} />
                  <h3 className="font-bold text-white mb-1">Faster repeat booking</h3>
                  <p className="text-sm text-stone-400">Save your details once and book quickly next time.</p>
               </div>
               <div className="bg-[#24282B]/60 backdrop-blur-md rounded-2xl p-5 border border-white/5 shadow-xl transition-transform hover:-translate-y-1">
                  <Gift className="text-[#D4AF37] mb-3" size={24} />
                  <h3 className="font-bold text-white mb-1">Special guest offers</h3>
                  <p className="text-sm text-stone-400">Get access to future promotional and seasonal offers.</p>
               </div>
               <div className="bg-[#24282B]/60 backdrop-blur-md rounded-2xl p-5 border border-white/5 shadow-xl transition-transform hover:-translate-y-1">
                  <ShieldCheck className="text-[#D4AF37] mb-3" size={24} />
                  <h3 className="font-bold text-white mb-1">Stay management</h3>
                  <p className="text-sm text-stone-400">Track reservations and simplify future check-ins.</p>
               </div>
               <div className="bg-[#24282B]/60 backdrop-blur-md rounded-2xl p-5 border border-white/5 shadow-xl transition-transform hover:-translate-y-1">
                  <MapPin className="text-[#D4AF37] mb-3" size={24} />
                  <h3 className="font-bold text-white mb-1">Tirupati-ready</h3>
                  <p className="text-sm text-stone-400">Built for the needs of spiritual and transit travel.</p>
               </div>
            </div>

            <div className="flex items-center gap-6 mt-auto border-t border-white/10 pt-8">
               <div className="flex items-center gap-2 text-stone-400 text-xs font-semibold">
                  <Headset size={16} /> Direct booking support
               </div>
               <div className="flex items-center gap-2 text-stone-400 text-xs font-semibold">
                  <ShieldCheck size={16} /> Secure profile
               </div>
            </div>
         </div>
      </div>

      {/* RIGHT: SIGNUP FLOW PANEL */}
      <div className="w-full md:w-[55%] lg:w-[50%] flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden transform transition-all">
           
           {/* Form Header */}
           <div className="bg-slate-50 border-b border-slate-100 p-8 text-center relative">
              {step === 1 && (
                 <>
                   <h2 className="text-2xl font-black text-slate-800 tracking-tight">Get started</h2>
                   <p className="text-slate-500 text-sm mt-2 font-medium">Enter your mobile number to access your account or build your guest profile.</p>
                 </>
              )}
              {step === 2 && (
                 <>
                   <h2 className="text-2xl font-black text-slate-800 tracking-tight">Complete your profile</h2>
                   <p className="text-slate-500 text-sm mt-2 font-medium">We securely linked <span className="font-bold text-slate-700">+91 {phone}</span>. Help us personalize your stay.</p>
                 </>
              )}
              {step === 3 && (
                 <>
                   <h2 className="text-2xl font-black text-emerald-600 tracking-tight">Welcome to Srimuni</h2>
                   <p className="text-slate-500 text-sm mt-2 font-medium">Your account is ready.</p>
                 </>
              )}

              {/* Progress Indicator */}
              {step !== 3 && (
                 <div className="absolute bottom-[-1px] left-0 h-[3px] bg-slate-200 w-full">
                    <div className="h-full bg-gradient-to-r from-[#D4AF37] to-[#b38f20] transition-all duration-500 ease-in-out" style={{ width: step === 1 ? '50%' : '100%' }} />
                 </div>
              )}
           </div>

           <div className="p-8">
             {error && (
               <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold mb-6 flex items-center justify-center border border-red-100">
                 {error}
               </div>
             )}

             {/* STEP 1: Phone */}
             {step === 1 && (
               <form onSubmit={handlePhoneSubmit} className="space-y-6">
                 <div>
                   <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wider">Mobile Number</label>
                   <div className="flex shadow-sm rounded-xl focus-within:ring-2 focus-within:ring-[#1A1D20] transition-all">
                     <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-slate-300 bg-slate-50 text-slate-500 font-black">
                       +91
                     </span>
                     <input 
                       type="tel" 
                       value={phone}
                       onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                       placeholder="Enter 10 digits"
                       className="flex-1 w-full px-4 py-3.5 rounded-r-xl border border-slate-300 focus:outline-none text-slate-800 font-bold text-lg"
                       disabled={loading}
                       autoFocus
                     />
                   </div>
                 </div>

                 <button
                   type="submit"
                   disabled={loading || phone.length !== 10}
                   className="w-full bg-[#1A1D20] hover:bg-[#2A2D30] text-white font-bold py-4 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-2"
                 >
                   {loading ? 'Authenticating...' : 'Continue Securely'}
                   {!loading && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                 </button>

                 <div className="relative flex items-center justify-center mt-6 mb-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                    <div className="relative bg-white px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Or</div>
                 </div>

                 <button type="button" onClick={handleGuestContinue} className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 font-bold py-3.5 rounded-xl transition-all active:scale-[0.98]">
                    Continue as Guest
                 </button>
               </form>
             )}

             {/* STEP 2: Profile */}
             {step === 2 && (
               <form onSubmit={handleProfileSubmit} className="space-y-4">
                 <div className="grid grid-cols-1 gap-4">
                    <div className="relative">
                      <div className="absolute left-4 top-3.5 text-slate-400"><User size={18} /></div>
                      <input type="text" placeholder="Full Name *" required value={profile.fullName} onChange={e => setProfile({...profile, fullName: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-xl border border-slate-200 focus:border-slate-300 focus:ring-2 focus:ring-[#1A1D20] focus:bg-white text-slate-800 font-semibold transition-all" />
                    </div>
                    <div className="relative">
                      <div className="absolute left-4 top-3.5 text-slate-400"><Mail size={18} /></div>
                      <input type="email" placeholder="Email Address (Optional)" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-xl border border-slate-200 focus:border-slate-300 focus:ring-2 focus:ring-[#1A1D20] focus:bg-white text-slate-800 font-semibold transition-all" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                          <label className="block text-[10px] font-bold text-slate-400 mb-1 ml-1 uppercase">Date of Birth</label>
                          <input type="date" value={profile.dob} onChange={e => setProfile({...profile, dob: e.target.value})} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#1A1D20] text-slate-800 font-semibold text-sm" />
                        </div>
                        <div className="relative">
                          <label className="block text-[10px] font-bold text-slate-400 mb-1 ml-1 uppercase">Anniversary</label>
                          <input type="date" value={profile.anniversary} onChange={e => setProfile({...profile, anniversary: e.target.value})} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#1A1D20] text-slate-800 font-semibold text-sm" />
                        </div>
                    </div>
                    <div className="relative mt-2">
                       <label className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                         <input type="checkbox" checked={profile.promotionalConsent} onChange={e => setProfile({...profile, promotionalConsent: e.target.checked})} className="mt-1 w-4 h-4 text-[#1A1D20] rounded focus:ring-[#1A1D20]" />
                         <span className="text-xs font-semibold text-slate-600 leading-relaxed">
                           I agree to receive future guest offers, faster check-in alerts, and direct hotel communication via WhatsApp.
                         </span>
                       </label>
                    </div>
                 </div>

                 <button
                   type="submit"
                   disabled={loading || !profile.fullName}
                   className="w-full mt-6 bg-[#D4AF37] hover:bg-[#b38f20] text-white font-black py-4 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                 >
                   {loading ? 'Creating Profile...' : 'Save & Enter Dashboard'}
                 </button>
               </form>
             )}

             {/* STEP 3: Success */}
             {step === 3 && (
               <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                     <CheckCircle2 className="text-emerald-500 w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">You're logged in!</h3>
                  <p className="text-slate-500 text-center text-sm font-medium mb-8">
                     Redirecting you to {targetRole === 'manager' ? 'the Manager Operations Panel' : 'the Reservation Engine'}...
                  </p>
                  
                  <div className="w-8 h-8 border-4 border-slate-200 border-t-[#1A1D20] rounded-full animate-spin" />
               </div>
             )}
           </div>

           {/* Footer Trust Section */}
           <div className="bg-slate-50 border-t border-slate-100 p-6 text-center">
              <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                By accelerating your login, you agree to our Terms of Protocol and acknowledge our secure Privacy Policy. Your details guarantee direct-booking advantages.
              </p>
           </div>
        </div>
      </div>
    
    </div>
  );
}
