'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, LogIn, LogOut } from 'lucide-react';

export default function GlobalNavbar({ isAuthenticated }: { isAuthenticated: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.refresh();
      router.push('/login');
    } catch (err) {}
    setLoading(false);
  };

  return (
    <nav className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-slate-800 tracking-tight flex items-center gap-2">
           <img src="/logo.png" className="h-8 w-8 object-contain" alt="Logo" />
           <span className="hidden sm:inline">Srinivasa Residency</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <button 
              onClick={handleLogout} disabled={loading}
              className="px-3 sm:px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-lg text-[13px] sm:text-sm font-bold flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <LogOut size={16} /> <span className="hidden sm:inline">Log Out</span>
            </button>
          ) : (
            <>
              <Link href="/login" className="px-3 sm:px-4 py-2 text-slate-600 hover:text-slate-900 text-[13px] sm:text-sm font-bold flex items-center gap-2 transition-all">
                <LogIn size={16} /> <span className="hidden sm:inline">Log In</span>
              </Link>
              <Link href="/login" className="px-3 sm:px-4 py-2 bg-[#D4AF37] hover:bg-[#b5952f] text-white rounded-lg text-[13px] sm:text-sm font-bold shadow-sm flex items-center gap-2 transition-all active:scale-[0.98]">
                <UserPlus size={16} /> Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
