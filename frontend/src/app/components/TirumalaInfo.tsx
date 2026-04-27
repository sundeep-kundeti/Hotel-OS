'use client';
import React from 'react';
import { Clock, Info, Heart, Calendar } from 'lucide-react';

export default function TirumalaInfo() {
  return (
    <div className="bg-gradient-to-b from-amber-50/50 to-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-10 text-center">
          Sri Venkateswara Temple, Tirumala
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-14">
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1741004437852-b5364488b628?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
              alt="Tirumala Temple Aerial View"
              className="w-full h-96 object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>

          <div className="space-y-5 flex flex-col justify-center">
            <p className="text-slate-600 leading-relaxed">
              The Sri Venkateswara Temple is a landmark Vaishnavite temple situated in the hill town
              of Tirumala at Tirupati. It is one of the most visited pilgrimage centers in the world,
              with an estimated 50,000 to 100,000 pilgrims visiting daily.
            </p>
            <p className="text-slate-600 leading-relaxed">
              The presiding deity, Lord Venkateswara, is also known by other names such as
              Balaji, Govinda, and Srinivasa. The temple is believed to have been built over
              several centuries, with contributions from various dynasties.
            </p>
            <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-amber-500">
              <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Spiritual Significance
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                It is believed that Lord Venkateswara appeared here to save mankind from
                the trials and troubles of Kali Yuga. Hence, the place has also got the name
                Kaliyuga Vaikuntam.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-7 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Darshan Timings</h3>
            </div>
            <div className="space-y-0 text-sm">
              {[
                ['Suprabhatham', '3:00 AM - 3:30 AM'],
                ['General Darshan', '4:00 AM - 1:00 AM (next day)'],
                ['Special Darshan', 'Tickets available (₹300)'],
                ['VIP Break', '1:00 PM - 3:00 PM'],
              ].map(([label, time], i, arr) => (
                <div key={label} className={`flex justify-between py-3 text-slate-600 ${i < arr.length - 1 ? 'border-b border-slate-100' : ''}`}>
                  <span className="font-medium">{label}</span>
                  <span className="text-slate-500">{time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-7 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Info className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Important Information</h3>
            </div>
            <ul className="space-y-3 text-slate-600 text-sm">
              <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5 font-bold">•</span><span>Dress code: Traditional attire recommended. Shorts and sleeveless not allowed.</span></li>
              <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5 font-bold">•</span><span>Electronic devices, cameras, and mobile phones not allowed inside temple.</span></li>
              <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5 font-bold">•</span><span>Book tickets online for special darshan to avoid long queues.</span></li>
              <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5 font-bold">•</span><span>Free meals (Annaprasadam) available for devotees.</span></li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-2xl p-8 md:p-10 shadow-xl">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Calendar className="w-8 h-8" />
            <h3 className="text-2xl font-bold">Annual Festivals</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h4 className="text-lg font-bold mb-2">Brahmotsavam</h4>
              <p className="text-amber-100 text-sm">Annual festival celebrated for nine days in September with grand processions and rituals</p>
            </div>
            <div className="text-center">
              <h4 className="text-lg font-bold mb-2">Vaikunta Ekadasi</h4>
              <p className="text-amber-100 text-sm">Most important festival when the Vaikunta Dwaram (gate to heaven) is opened</p>
            </div>
            <div className="text-center">
              <h4 className="text-lg font-bold mb-2">Rathasapthami</h4>
              <p className="text-amber-100 text-sm">Celebrated in February with chariot processions and special rituals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
