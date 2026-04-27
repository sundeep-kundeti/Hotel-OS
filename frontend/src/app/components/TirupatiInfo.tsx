'use client';
import React from 'react';
import { MapPin, Utensils, ShoppingBag, Train, Plane, Bus } from 'lucide-react';

export default function TirupatiInfo() {
  return (
    <div className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">About Tirupati</h2>
          <p className="text-slate-500 max-w-3xl mx-auto text-lg font-medium leading-relaxed">
            Tirupati is a major pilgrimage city in Andhra Pradesh, famous for the Sri Venkateswara Temple
            on the Tirumala hills, combining spiritual significance with modern amenities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          <div className="bg-gradient-to-br from-amber-50 to-white p-7 rounded-2xl border border-amber-100/60 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-5 transition-transform group-hover:scale-110">
              <MapPin className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Places to Visit</h3>
            <ul className="space-y-2.5 text-slate-600 text-sm">
              <li>• Sri Venkateswara Temple (Tirumala)</li>
              <li>• ISKCON Temple</li>
              <li>• Kapila Theertham</li>
              <li>• Sri Govindarajaswami Temple</li>
              <li>• Talakona Waterfalls (nearby)</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-white p-7 rounded-2xl border border-amber-100/60 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-5 transition-transform group-hover:scale-110">
              <Utensils className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Local Cuisine</h3>
            <ul className="space-y-2.5 text-slate-600 text-sm">
              <li>• Tirupati Laddu (Prasadam)</li>
              <li>• Pongal &amp; Pulihora</li>
              <li>• Dosa &amp; Idli varieties</li>
              <li>• Andhra-style Thali</li>
              <li>• Sweet Pongal</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-white p-7 rounded-2xl border border-amber-100/60 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-5 transition-transform group-hover:scale-110">
              <ShoppingBag className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Shopping</h3>
            <ul className="space-y-2.5 text-slate-600 text-sm">
              <li>• Religious items &amp; idols</li>
              <li>• Silk sarees</li>
              <li>• Handicrafts</li>
              <li>• Sandalwood products</li>
              <li>• Local spices</li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-2xl p-8 md:p-10 shadow-xl">
          <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center">How to Reach Tirupati</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-white/25 transition-transform">
                <Plane className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold mb-2">By Air</h4>
              <p className="text-amber-100 text-sm">Tirupati Airport (15 km from city)<br/>Connected to major cities</p>
            </div>
            <div className="text-center group">
              <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-white/25 transition-transform">
                <Train className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold mb-2">By Train</h4>
              <p className="text-amber-100 text-sm">Tirupati Railway Station<br/>Well connected across India</p>
            </div>
            <div className="text-center group">
              <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-white/25 transition-transform">
                <Bus className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold mb-2">By Road</h4>
              <p className="text-amber-100 text-sm">Regular bus services from<br/>Chennai, Bangalore, Hyderabad</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
