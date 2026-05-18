'use client';

import { useState, useRef } from 'react';
import { normalizePhoneNumber, normalizeVehicleNumber, formatVehicleNumber, validateIndianVehicle, validateIndianPhone } from '../utils/normalize';

type SearchBarProps = {
  onSearch: (type: 'phone' | 'vehicle', value: string) => void;
  loading?: boolean;
};

export default function SearchBar({ onSearch, loading = false }: SearchBarProps) {
  const [mode, setMode] = useState<'vehicle' | 'phone'>('vehicle');
  const [rawInput, setRawInput] = useState('');
  const [displayInput, setDisplayInput] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleModeSwitch(newMode: 'vehicle' | 'phone') {
    setMode(newMode);
    setRawInput('');
    setDisplayInput('');
    setError('');
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setRawInput(val);
    setError('');

    if (mode === 'vehicle') {
      const normalized = normalizeVehicleNumber(val);
      setDisplayInput(normalized); // show uppercase as-you-type
    } else {
      setDisplayInput(val);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!rawInput.trim()) {
      setError(`Please enter a ${mode === 'vehicle' ? 'vehicle number' : 'phone number'}`);
      return;
    }

    if (mode === 'phone') {
      const normalized = normalizePhoneNumber(rawInput);
      if (!validateIndianPhone(normalized)) {
        setError('Enter a valid 10-digit Indian mobile number');
        return;
      }
      onSearch('phone', normalized);
    } else {
      const normalized = normalizeVehicleNumber(rawInput);
      if (!validateIndianVehicle(normalized)) {
        setError('Enter a valid Indian vehicle number (e.g. KA03AB1234)');
        return;
      }
      onSearch('vehicle', normalized);
    }
  }

  return (
    <form onSubmit={handleSearch} className="space-y-3">
      {/* Mode toggle */}
      <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
        {(['vehicle', 'phone'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => handleModeSwitch(m)}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 ${
              mode === m
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>{m === 'vehicle' ? '🚗' : '📱'}</span>
            <span>{m === 'vehicle' ? 'Vehicle Number' : 'Phone Number'}</span>
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          id="search-input"
          type={mode === 'phone' ? 'tel' : 'text'}
          inputMode={mode === 'phone' ? 'numeric' : 'text'}
          value={displayInput}
          onChange={handleInputChange}
          placeholder={mode === 'vehicle' ? 'KA03AB1234' : '9876543210'}
          autoComplete="off"
          className={`w-full rounded-xl border-2 px-4 py-3.5 text-base font-mono tracking-wide transition-colors focus:outline-none focus:ring-0 ${
            error
              ? 'border-red-400 bg-red-50 focus:border-red-500'
              : 'border-slate-200 bg-white focus:border-blue-500'
          }`}
        />
        {mode === 'vehicle' && displayInput && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
            {formatVehicleNumber(displayInput)}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1.5">
          <span>⚠️</span> {error}
        </p>
      )}

      <button
        id="search-btn"
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-3.5 text-base font-semibold text-white shadow-sm transition-all hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Searching…
          </span>
        ) : (
          '🔍 Search'
        )}
      </button>
    </form>
  );
}
