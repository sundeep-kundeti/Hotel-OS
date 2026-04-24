'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ChevronRight, User, Mail, Calendar, MapPin, Building2, Phone, ShieldCheck, Clock, Gift, Headset, Lock } from 'lucide-react';

export default function SrimuniSignupPage() {
  const getMaxDob = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getToday = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const router = useRouter();
  const [showWhatsAppForm, setShowWhatsAppForm] = useState(false);
  const [waData, setWaData] = useState({ date: getToday(), time: '08:00', duration: '1 Hour', pax: '1 Guest' });
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
               <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                 {showWhatsAppForm ? 'WhatsApp Booking' : 'Get started'}
               </h2>
               <p className="text-slate-500 text-sm mt-2 font-medium">
                 {showWhatsAppForm ? 'Enter your travel details to instantly book via WhatsApp.' : 'Choose how you want to book your stay at Srimuni Hotels'}
               </p>
           </div>

            <div className="p-8">
              {/* Main Landing Choices */}
              {showWhatsAppForm ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                   <button type="button" onClick={() => setShowWhatsAppForm(false)} className="text-sm font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 -mt-2 mb-2 transition-colors">
                     <ChevronRight size={14} className="rotate-180" /> Back
                   </button>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Date</label>
                        <input type="date" value={waData.date} min={getToday()} onChange={e => setWaData({...waData, date: e.target.value})} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#25D366] text-slate-800 font-semibold text-sm" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Time</label>
                        <input type="time" value={waData.time} onChange={e => setWaData({...waData, time: e.target.value})} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#25D366] text-slate-800 font-semibold text-sm" />
                      </div>
                      <div>
                         <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Duration</label>
                         <select value={waData.duration} onChange={e => setWaData({...waData, duration: e.target.value})} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#25D366] text-slate-800 font-semibold text-sm">
                            <option>1 Hour</option>
                            <option>2 Hours</option>
                            <option>3 Hours</option>
                         </select>
                      </div>
                      <div>
                         <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Guests</label>
                         <select value={waData.pax} onChange={e => setWaData({...waData, pax: e.target.value})} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#25D366] text-slate-800 font-semibold text-sm">
                            <option>1 Guest</option>
                            <option>2 Guests</option>
                         </select>
                      </div>
                   </div>

                   <a
                     href={`https://wa.me/917075170769?text=${encodeURIComponent(`Hi Srimuni Hotels, I want to book a Fresh Up Room.\nDate: ${waData.date}\nTime: ${waData.time}\nDuration: ${waData.duration}\nPax: ${waData.pax}\nPayment: Pay at Hotel`)}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 text-base font-bold text-white shadow-md transition hover:bg-[#1ebe5d]"
                   >
                     Send Booking to WhatsApp
                     <span className="text-xl">›</span>
                   </a>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Primary Actions & Explanations Combined */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    
                    {/* Left: Mobile Login */}
                    <div className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => router.push('/login')}
                        className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 text-base font-bold text-white shadow-md transition hover:bg-slate-800"
                      >
                        Continue with Mobile
                        <span className="text-xl">›</span>
                      </button>
                      <div className="mt-3 text-center px-2">
                        <p className="text-xs font-bold text-slate-600">Website Booking</p>
                        <p className="mt-0.5 text-[11px] text-slate-400 font-medium leading-tight">Save your profile & book faster next time</p>
                      </div>
                    </div>

                    {/* Right: WhatsApp */}
                    <div className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => setShowWhatsAppForm(true)}
                        className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 text-base font-bold text-white shadow-md transition hover:bg-[#1ebe5d]"
                      >
                        Book on WhatsApp
                        <span className="text-xl">›</span>
                      </button>
                      <div className="mt-3 text-center px-2">
                        <p className="text-xs font-bold text-emerald-600">WhatsApp Booking</p>
                        <p className="mt-0.5 text-[11px] text-emerald-500 font-medium leading-tight">Fastest checkout without login</p>
                      </div>
                    </div>

                  </div>

                  <div className="relative flex items-center justify-center mt-6 mb-4">
                     <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                     <div className="relative bg-white px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">OR</div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGuestContinue}
                    className="h-14 w-full rounded-2xl border-2 border-slate-200 bg-white text-base font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Continue as Guest
                  </button>
                </div>
              )}
           </div>

           {/* Footer Trust Section */}
           <div className="bg-slate-50 border-t border-slate-100 p-6 text-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <a href={`https://wa.me/917075170769?text=${encodeURIComponent('Hi Srimuni Hotels, I need help with booking.')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-emerald-700 font-bold py-3 rounded-xl transition-all border border-[#25D366]/20 text-sm">
                     <Headset size={16} /> Need Help?
                  </a>
                  <a href="https://maps.app.goo.gl/f6xzBbryMTRZBQ6v8" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-3 rounded-xl transition-all border border-blue-200 text-sm">
                     <MapPin size={16} /> Get Directions
                  </a>
              </div>
              <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                By accelerating your login, you agree to our Terms of Protocol and acknowledge our secure Privacy Policy. Your details guarantee direct-booking advantages.
              </p>
           </div>
        </div>
      </div>
    
    </div>
  );
}
