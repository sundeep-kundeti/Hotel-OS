'use client';
import React from 'react';
import { MapPin, Phone, Mail, Building2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-white">
                <Building2 size={18} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-white text-lg font-bold">Srinivasa Residency</h3>
                <p className="text-amber-500 text-[10px] font-semibold uppercase tracking-wider">by Srimuni Hotels</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-400 mb-5">
              Your comfort is our priority. Experience divine hospitality near the sacred Tirumala hills.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-base font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#home" className="hover:text-amber-400 transition-colors">Home</a></li>
              <li><a href="#rooms" className="hover:text-amber-400 transition-colors">Rooms & Rates</a></li>
              <li><a href="#discounts" className="hover:text-amber-400 transition-colors">Special Offers</a></li>
              <li><a href="#tirupati" className="hover:text-amber-400 transition-colors">About Tirupati</a></li>
              <li><a href="#contact" className="hover:text-amber-400 transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-base font-bold mb-4">Contact Us</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>G. Car Street, Near Railway Station<br />Tirupati, Andhra Pradesh - 517501</span>
              </div>
              <a href="tel:+917416686677" className="flex items-center gap-2.5 hover:text-amber-400 transition-colors">
                <Phone className="w-4 h-4 text-amber-500" />
                <span>+91 7416686677</span>
              </a>
              <a href="mailto:info@srinivasaresidency.com" className="flex items-center gap-2.5 hover:text-amber-400 transition-colors">
                <Mail className="w-4 h-4 text-amber-500" />
                <span>info@srinivasaresidency.com</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
          <p>&copy; 2026 Srinivasa Residency by Srimuni Hotels. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
