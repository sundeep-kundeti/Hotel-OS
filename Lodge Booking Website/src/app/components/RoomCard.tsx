import { Users, Wifi, Coffee, Wind, Droplet, Tv } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Room {
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

export default function RoomCard({ room, onBook }: RoomCardProps) {
  const amenityIcons: Record<string, any> = {
    'WiFi': Wifi,
    'AC': Wind,
    'Breakfast': Coffee,
    'Hot Water': Droplet,
    'TV': Tv,
    'Refrigerator': Coffee,
    'Towels': Droplet,
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative h-64">
        <ImageWithFallback
          src={room.image}
          alt={room.name}
          className="w-full h-full object-cover"
        />
        {!room.available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-4 py-2 rounded-lg">Currently Unavailable</span>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl mb-1">{room.name}</h3>
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4" />
              <span className="text-sm">Up to {room.capacity} guests</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl text-amber-600">₹{room.price}+</div>
            <div className="text-sm text-gray-500">
              {room.name.includes('Fresh Up') ? 'per use' : room.name.includes('Short Stay') ? 'per stay' : 'per night'}
            </div>
          </div>
        </div>

        <p className="text-gray-600 mb-4 text-sm">{room.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {room.amenities.map((amenity) => {
            const Icon = amenityIcons[amenity];
            return (
              <div key={amenity} className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                {Icon && <Icon className="w-4 h-4" />}
                <span>{amenity}</span>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => onBook(room)}
          disabled={!room.available}
          className={`w-full py-3 rounded-lg transition-colors ${
            room.available
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {room.available ? 'Book Now' : 'Not Available'}
        </button>
      </div>
    </div>
  );
}
