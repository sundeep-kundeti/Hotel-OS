'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from './components/Header';
import Hero from './components/Hero';
import RoomCard from './components/RoomCard';
import type { Room } from './components/RoomCard';
import BookingModal from './components/BookingModal';
import type { BookingData } from './components/BookingModal';
import DiscountsSection from './components/DiscountsSection';
import TirupatiInfo from './components/TirupatiInfo';
import TirumalaInfo from './components/TirumalaInfo';
import Footer from './components/Footer';
import { Phone, MapPin, Headset, CheckCircle2 } from 'lucide-react';

export const rooms: Room[] = [
  {
    id: '1',
    name: 'Non-AC Room',
    description: 'Clean and comfortable budget room with essential amenities. Perfect for pilgrims seeking economical accommodation.',
    price: 900,
    capacity: 2,
    amenities: ['WiFi', 'TV', 'Hot Water'],
    image: 'https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    available: true,
  },
  {
    id: '2',
    name: 'AC Room',
    description: 'Comfortable air-conditioned room with modern amenities for a pleasant stay.',
    price: 1500,
    capacity: 2,
    amenities: ['WiFi', 'AC', 'TV', 'Hot Water'],
    image: 'https://images.unsplash.com/photo-1731336478850-6bce7235e320?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    available: true,
  },
  {
    id: '3',
    name: 'Deluxe AC Room',
    description: 'Spacious deluxe room with premium AC and enhanced comfort. Ideal for families and longer stays.',
    price: 1800,
    capacity: 3,
    amenities: ['WiFi', 'AC', 'TV', 'Hot Water', 'Refrigerator'],
    image: 'https://images.unsplash.com/photo-1776763255122-3d35e32aee64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    available: true,
  },
  {
    id: '4',
    name: 'Fresh Up',
    description: 'Quick refresh facility for a few hours. Ideal for freshening up before or after temple visit.',
    price: 200,
    capacity: 2,
    amenities: ['Hot Water', 'Towels'],
    image: 'https://images.unsplash.com/photo-1666813721996-42956e40788e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    available: true,
  },
  {
    id: '5',
    name: 'Short Stay',
    description: 'Half-day accommodation for short visits. Check-in for 6-12 hours duration.',
    price: 600,
    capacity: 2,
    amenities: ['WiFi', 'TV', 'Hot Water'],
    image: 'https://images.unsplash.com/photo-1776763255197-495b343d5a33?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    available: true,
  },
];

export default function HomePage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('home');
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'rooms', 'discounts', 'tirupati', 'tirumala', 'contact'];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom > 120) {
            setActiveSection(id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleConfirmBooking = (booking: BookingData) => {
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header activeSection={activeSection} onNavigate={scrollToSection} />

      {/* Booking Confirmation Toast */}
      {showConfirmation && (
        <div className="fixed top-24 right-4 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-right-4 duration-300 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5" />
          <div>
            <p className="font-bold">Booking Confirmed!</p>
            <p className="text-sm text-emerald-100">We&apos;ll send you a confirmation shortly.</p>
          </div>
        </div>
      )}

      <main>
        {/* Hero */}
        <section id="home">
          <Hero onBookNow={() => router.push('/login')} onViewRooms={() => scrollToSection('rooms')} />
        </section>

        {/* Rooms */}
        <section id="rooms" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                Our Rooms &amp; Rates
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium">
                Budget-friendly accommodation options for pilgrims and travelers.
                Clean, comfortable rooms at affordable prices.
              </p>
            </div>

            {/* Price Range Banner */}
            <div className="mb-10 bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200/50 p-5 rounded-2xl max-w-4xl mx-auto text-center">
              <p className="text-slate-700">
                <strong>Price Range:</strong> Non-AC ₹900-1100 | AC ₹1500-1800 | Deluxe AC ₹1800+ | Fresh Up ₹200-600 | Short Stay ₹600-900
              </p>
            </div>

            {/* Room Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 mb-10">
              {rooms.map((room) => (
                <RoomCard key={room.id} room={room} onBook={(room) => router.push(`/login?roomId=${room.id}`)} />
              ))}
            </div>

            {/* Group Bookings CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 rounded-2xl text-center text-white shadow-xl">
              <h3 className="text-2xl font-bold mb-3">Group Bookings Available</h3>
              <p className="text-blue-100 mb-5 max-w-lg mx-auto">
                Planning a group pilgrimage? We offer special discounted rates for group bookings.
                Contact us for customized packages.
              </p>
              <a
                href="tel:+917416686677"
                className="inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-3.5 rounded-xl font-bold transition-all hover:bg-blue-50 shadow-md hover:-translate-y-0.5"
              >
                <Phone className="w-4 h-4" />
                Enquire for Group Rates
              </a>
            </div>
          </div>
        </section>

        {/* Discounts */}
        <DiscountsSection />

        {/* Tirupati Info */}
        <section id="tirupati">
          <TirupatiInfo />
        </section>

        {/* Tirumala Info */}
        <section id="tirumala">
          <TirumalaInfo />
        </section>

        {/* Contact */}
        <section id="contact" className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-10 text-center">
              Get in Touch
            </h2>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-8 rounded-2xl border border-amber-200/30">
              <p className="text-center text-slate-600 mb-8 text-lg font-medium max-w-lg mx-auto">
                Have questions about your stay or need assistance? We&apos;re here to help make your
                pilgrimage comfortable and memorable.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:+917416686677"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md shadow-amber-200/50 hover:-translate-y-0.5"
                >
                  <Phone className="w-4 h-4" />
                  Call Us Now
                </a>
                <a
                  href={`https://wa.me/917416686677?text=${encodeURIComponent('Hi Srinivasa Residency, I need help with booking.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md hover:-translate-y-0.5"
                >
                  <Headset className="w-4 h-4" />
                  WhatsApp Us
                </a>
                <a
                  href="https://maps.app.goo.gl/f6xzBbryMTRZBQ6v8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 px-8 py-3.5 rounded-xl font-bold transition-all hover:-translate-y-0.5"
                >
                  <MapPin className="w-4 h-4" />
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Map */}
        <section className="bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center">Explore the Neighborhood</h2>
            <p className="text-slate-500 mb-8 font-medium text-center">Discover nearby temples, transit hubs, and restaurants around Srinivasa Residency.</p>
            <div className="w-full h-[500px] md:h-[600px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-100 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                  <MapPin className="text-slate-300 mb-2" size={32} />
                  <p className="text-slate-400 font-medium text-sm">Loading Google Maps...</p>
                </div>
              </div>
              <iframe
                src="https://storage.googleapis.com/maps-solutions-1wlfz6x2r9/neighborhood-discovery/029a/neighborhood-discovery.html"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                className="relative z-10"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
