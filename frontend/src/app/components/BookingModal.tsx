'use client';
import React, { useState } from 'react';
import { X, Calendar, User, Phone, Mail, Users } from 'lucide-react';
import type { Room } from './RoomCard';

export interface BookingData {
  roomId: string;
  roomName: string;
  guestName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
}

interface BookingModalProps {
  room: Room;
  onClose: () => void;
  onConfirm: (booking: BookingData) => void;
}

export default function BookingModal({ room, onClose, onConfirm }: BookingModalProps) {
  const [formData, setFormData] = useState({
    guestName: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
  });

  const today = new Date().toISOString().split('T')[0];

  const calculateNights = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const start = new Date(formData.checkIn);
    const end = new Date(formData.checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const nights = calculateNights();
  const totalPrice = nights * room.price;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      roomId: room.id,
      roomName: room.name,
      ...formData,
      totalPrice,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 py-5 flex justify-between items-center rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold">Book {room.name}</h2>
            <p className="text-amber-100 text-sm mt-0.5 font-medium">Starting from ₹{room.price}+</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                <User className="w-3.5 h-3.5" />
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.guestName}
                onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:bg-white text-slate-800 font-semibold transition-all"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                <Mail className="w-3.5 h-3.5" />
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:bg-white text-slate-800 font-semibold transition-all"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                <Phone className="w-3.5 h-3.5" />
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:bg-white text-slate-800 font-semibold transition-all"
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                <Users className="w-3.5 h-3.5" />
                Number of Guests *
              </label>
              <input
                type="number"
                required
                min="1"
                max="4"
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:bg-white text-slate-800 font-semibold transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                Check-in Date *
              </label>
              <input
                type="date"
                required
                value={formData.checkIn}
                min={today}
                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:bg-white text-slate-800 font-semibold transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                Check-out Date *
              </label>
              <input
                type="date"
                required
                value={formData.checkOut}
                min={formData.checkIn || today}
                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:bg-white text-slate-800 font-semibold transition-all"
              />
            </div>
          </div>

          {/* Price Summary */}
          {nights > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 p-5 rounded-xl mb-6 border border-amber-200/50">
              <div className="flex justify-between mb-2 text-slate-600">
                <span>₹{room.price} × {nights} night{nights > 1 ? 's' : ''}</span>
                <span className="font-semibold">₹{totalPrice}</span>
              </div>
              <div className="border-t border-amber-200 pt-3 mt-3 flex justify-between items-baseline">
                <span className="text-lg font-bold text-slate-800">Total Amount</span>
                <span className="text-3xl font-black text-amber-600">₹{totalPrice}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 border-2 border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={nights === 0}
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-bold transition-all shadow-md shadow-amber-200/50 disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
