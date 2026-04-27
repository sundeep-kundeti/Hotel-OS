import { useState } from 'react';
import { X, Calendar, User, Phone, Mail } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  price: number;
}

interface BookingModalProps {
  room: Room | null;
  onClose: () => void;
  onConfirm: (booking: BookingData) => void;
}

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

export default function BookingModal({ room, onClose, onConfirm }: BookingModalProps) {
  const [formData, setFormData] = useState({
    guestName: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
  });

  if (!room) return null;

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl">Book {room.name}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm mb-2 text-gray-700">
                <User className="w-4 h-4 inline mr-1" />
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.guestName}
                onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">
                <Mail className="w-4 h-4 inline mr-1" />
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">
                Number of Guests *
              </label>
              <input
                type="number"
                required
                min="1"
                max="4"
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">
                <Calendar className="w-4 h-4 inline mr-1" />
                Check-in Date *
              </label>
              <input
                type="date"
                required
                value={formData.checkIn}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">
                <Calendar className="w-4 h-4 inline mr-1" />
                Check-out Date *
              </label>
              <input
                type="date"
                required
                value={formData.checkOut}
                min={formData.checkIn || new Date().toISOString().split('T')[0]}
                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {nights > 0 && (
            <div className="bg-amber-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">₹{room.price} × {nights} night{nights > 1 ? 's' : ''}</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className="border-t border-amber-200 pt-2 mt-2 flex justify-between">
                <span className="text-lg">Total</span>
                <span className="text-2xl text-amber-600">₹{totalPrice}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={nights === 0}
              className="flex-1 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
