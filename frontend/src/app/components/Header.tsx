'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Menu, X, Building2 } from 'lucide-react';

interface HeaderProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

export default function Header({ activeSection, onNavigate }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'rooms', label: 'Rooms' },
    { id: 'discounts', label: 'Offers' },
    { id: 'tirupati', label: 'About Tirupati' },
    { id: 'tirumala', label: 'Tirumala Temple' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-[0_2px_24px_rgba(0,0,0,0.08)] py-2'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2.5 group">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
              scrolled 
                ? 'bg-gradient-to-tr from-amber-600 to-amber-500 text-white shadow-md' 
                : 'bg-white/15 backdrop-blur-sm text-white border border-white/20'
            }`}>
              <Building2 size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className={`text-lg font-black tracking-tight leading-tight transition-colors duration-300 ${
                scrolled ? 'text-slate-900' : 'text-white'
              }`}>
                Srinivasa Residency
              </h1>
              <p className={`text-[10px] font-semibold uppercase tracking-wider transition-colors duration-300 ${
                scrolled ? 'text-amber-600' : 'text-amber-300'
              }`}>
                by Srimuni Hotels
              </p>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  activeSection === item.id
                    ? scrolled
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-200'
                      : 'bg-white/20 text-white backdrop-blur-sm'
                    : scrolled
                      ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Phone & CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <a href="tel:+917416686677" className={`flex items-center gap-1.5 text-sm font-semibold transition-colors duration-300 ${
              scrolled ? 'text-slate-600 hover:text-amber-600' : 'text-white/80 hover:text-white'
            }`}>
              <Phone className="w-4 h-4" />
              <span>+91 7416686677</span>
            </a>
            <Link
              href="/login"
              className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-amber-200/50 hover:shadow-lg hover:-translate-y-0.5"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              scrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/10'
            }`}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-white/10 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col gap-1 mt-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
                  className={`px-4 py-3 rounded-lg text-sm font-semibold text-left transition-all ${
                    activeSection === item.id
                      ? 'bg-amber-600 text-white'
                      : scrolled
                        ? 'text-slate-700 hover:bg-slate-100'
                        : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <Link
                href="/login"
                className="mt-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-3 rounded-xl text-sm font-bold text-center transition-all"
                onClick={() => setMobileOpen(false)}
              >
                Book Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
