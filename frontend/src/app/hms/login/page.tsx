'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';
import { saveHmsSession } from '@/lib/hmsApi';

export default function HMSLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please enter your username and password.');
      return;
    }

    setLoading(true);
    try {
      // NOTE: We rely on hmsFetchPublic to not attach session since we are logging in,
      // but actually we can just use normal fetch here since we don't have a session yet.
      const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1' : '';
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

      const res = await fetch(`${baseUrl}/hms-auth`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`
        },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid credentials');
        return;
      }

      // Store token in localStorage so getHmsSession() works cross-origin
      if (data.token) saveHmsSession(data.token);

      // Redirect to the integrated HMS home page where user can pick the module
      const params = new URLSearchParams(window.location.search);
      const from = params.get('from') || '/hms';
      router.push(from);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl mb-4">
            <Building2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hotel OS</h1>
          <p className="text-slate-500 text-sm mt-1">Staff Portal Login</p>
        </div>

        {/* Login card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl shadow-slate-200/50">
          <h2 className="text-slate-900 font-semibold text-lg mb-5">Sign In</h2>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 animate-in slide-in-from-top-2">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-username" className="block text-xs font-medium text-slate-500 mb-1.5">
                Username
              </label>
              <input
                id="login-username"
                ref={usernameRef}
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                placeholder="manager"
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all text-sm"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-medium text-slate-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 pr-12 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white shadow-md shadow-slate-900/10 hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-60 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                'Sign In →'
              )}
            </button>
          </form>

          <p className="text-center text-slate-400 text-xs mt-6">
            Authorized personnel only.<br />
            For access, contact the administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
