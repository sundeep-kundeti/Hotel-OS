'use client';
import React, { useState } from 'react';
import { Users, Wifi, Wind, Droplet, Tv, Coffee } from 'lucide-react';

export interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  amenities: string[];
  image: string;
  available: boolean;
}

interface RoomCardProps {
  room: Room;
  onBook: (room: Room) => void;
}

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  WiFi: Wifi,
  AC: Wind,
  'Hot Water': Droplet,
  TV: Tv,
  Refrigerator: Coffee,
  Towels: Droplet,
};

export default function RoomCard({ room, onBook }: RoomCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100 hover:border-amber-200 hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <div className={`absolute inset-0 bg-slate-200 animate-pulse ${imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity`} />
        <img
          src={room.image}
          alt={room.name}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Price Badge */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg">
          <div className="text-xl font-black text-amber-600">₹{room.price}+</div>
          <div className="text-[10px] text-slate-500 font-semibold uppercase text-center">
            {room.name.includes('Fresh Up') ? 'per use' : room.name.includes('Short Stay') ? 'per stay' : 'per night'}
          </div>
        </div>

        {/* Availability Badge */}
        {!room.available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <span className="bg-red-500 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg">
              Currently Unavailable
            </span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{room.name}</h3>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Users className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">Up to {room.capacity} guests</span>
            </div>
          </div>
        </div>

        <p className="text-slate-500 text-sm leading-relaxed mb-4">{room.description}</p>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-5">
          {room.amenities.map((amenity) => {
            const Icon = amenityIcons[amenity];
            return (
              <div
                key={amenity}
                className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg text-xs text-slate-600 font-medium border border-slate-100"
              >
                {Icon && <Icon className="w-3.5 h-3.5 text-amber-500" />}
                <span>{amenity}</span>
              </div>
            );
          })}
        </div>

        {/* Book Button */}
        <button
          onClick={() => onBook(room)}
          disabled={!room.available}
          className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
            room.available
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md shadow-amber-200/50 hover:shadow-lg active:scale-[0.98]'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {room.available ? 'Book Now' : 'Not Available'}
        </button>
      </div>
    </div>
  );
}
