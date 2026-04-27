'use client';
import React, { useState, useEffect } from 'react';
import { Star, MapPin, Shield, Clock } from 'lucide-react';

interface HeroProps {
  onBookNow: () => void;
  onViewRooms: () => void;
}

export default function Hero({ onBookNow, onViewRooms }: HeroProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = 'https://images.unsplash.com/photo-1705723116788-d11fa6e3f415?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920';
    img.onload = () => setImageLoaded(true);
  }, []);

  return (
    <div className="relative min-h-[100vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <img
          src="https://images.unsplash.com/photo-1705723116788-d11fa6e3f415?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920"
          alt="Tirumala Temple"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-400 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-600 rounded-full blur-[96px] animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-500/20 backdrop-blur-sm border border-amber-400/30 text-amber-200 px-4 py-2 rounded-full mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-semibold">Trusted by 10,000+ pilgrims from across India</span>
          </div>

          {/* Heading */}
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 bg-clip-text text-transparent">
              Srinivasa Residency
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-slate-200/90 leading-relaxed mb-8 max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300 font-medium">
            Budget-friendly accommodation for pilgrims. Clean, comfortable rooms in the heart of Tirupati — your gateway to the sacred Tirumala hills.
          </p>

          {/* Price Badge */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 mb-10 inline-flex items-baseline gap-3 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-500">
            <span className="text-white/80 text-lg font-medium">Starting from</span>
            <span className="text-5xl font-black bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent">₹200</span>
            <span className="text-white/60 text-base font-medium">/ fresh up</span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-700">
            <button
              onClick={onBookNow}
              className="group bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Book Your Stay
              <span className="group-hover:translate-x-1 transition-transform text-xl">→</span>
            </button>
            <button
              onClick={onViewRooms}
              className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-8 py-4 rounded-xl text-lg font-bold border border-white/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              View Rooms & Rates
            </button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center gap-6 mt-12 animate-in fade-in duration-1000 delay-1000">
            <div className="flex items-center gap-2 text-white/70 text-sm font-medium">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Near Railway Station, Tirupati</span>
            </div>
            <div className="flex items-center gap-2 text-white/70 text-sm font-medium">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Safe & Secure</span>
            </div>
            <div className="flex items-center gap-2 text-white/70 text-sm font-medium">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>24/7 Front Desk</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-white/50 text-xs font-semibold uppercase tracking-widest">Scroll</span>
        <div className="w-5 h-8 border-2 border-white/30 rounded-full flex justify-center pt-1">
          <div className="w-1 h-2 bg-white/50 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
