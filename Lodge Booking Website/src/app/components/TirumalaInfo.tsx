import { Clock, Info, Heart, Calendar } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export default function TirumalaInfo() {
  return (
    <div className="bg-gradient-to-b from-amber-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl mb-6 text-center">Sri Venkateswara Temple, Tirumala</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div>
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1741004437852-b5364488b628?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxUaXJ1bWFsYSUyMFRpcnVwYXRpJTIwdGVtcGxlfGVufDF8fHx8MTc3NzI2OTI0Mnww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Tirumala Temple Aerial View"
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />
          </div>

          <div className="space-y-4">
            <p className="text-gray-700">
              The Sri Venkateswara Temple is a landmark Vaishnavite temple situated in the hill town
              of Tirumala at Tirupati. It is one of the most visited pilgrimage centers in the world,
              with an estimated 50,000 to 100,000 pilgrims visiting daily.
            </p>

            <p className="text-gray-700">
              The presiding deity, Lord Venkateswara, is also known by other names such as
              Balaji, Govinda, and Srinivasa. The temple is believed to have been built over
              several centuries, with contributions from various dynasties.
            </p>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-amber-600">
              <h3 className="text-xl mb-3 flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500" />
                Spiritual Significance
              </h3>
              <p className="text-gray-700">
                It is believed that Lord Venkateswara appeared here to save mankind from
                the trials and troubles of Kali Yuga. Hence, the place has also got the name
                Kaliyuga Vaikuntam.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-8 h-8 text-amber-600" />
              <h3 className="text-xl">Darshan Timings</h3>
            </div>
            <div className="space-y-2 text-gray-700">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span>Suprabhatham</span>
                <span>3:00 AM - 3:30 AM</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span>General Darshan</span>
                <span>4:00 AM - 1:00 AM (next day)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span>Special Darshan</span>
                <span>Tickets available (₹300)</span>
              </div>
              <div className="flex justify-between py-2">
                <span>VIP Break</span>
                <span>1:00 PM - 3:00 PM</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Info className="w-8 h-8 text-amber-600" />
              <h3 className="text-xl">Important Information</h3>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-1">•</span>
                <span>Dress code: Traditional attire recommended. Shorts and sleeveless not allowed.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-1">•</span>
                <span>Electronic devices, cameras, and mobile phones not allowed inside temple.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-1">•</span>
                <span>Book tickets online for special darshan to avoid long queues.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-1">•</span>
                <span>Free meals (Annaprasadam) available for devotees.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-10 h-10" />
            <h3 className="text-2xl">Annual Festivals</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-lg mb-2">Brahmotsavam</h4>
              <p className="text-amber-100 text-sm">
                Annual festival celebrated for nine days in September with grand processions and rituals
              </p>
            </div>
            <div>
              <h4 className="text-lg mb-2">Vaikunta Ekadasi</h4>
              <p className="text-amber-100 text-sm">
                Most important festival when the Vaikunta Dwaram (gate to heaven) is opened
              </p>
            </div>
            <div>
              <h4 className="text-lg mb-2">Rathasapthami</h4>
              <p className="text-amber-100 text-sm">
                Celebrated in February with chariot processions and special rituals
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
