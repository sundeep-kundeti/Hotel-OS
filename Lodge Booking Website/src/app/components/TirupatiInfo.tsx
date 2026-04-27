import { MapPin, Utensils, ShoppingBag, Train, Plane, Bus } from 'lucide-react';

export default function TirupatiInfo() {
  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl mb-6 text-center">About Tirupati</h2>
        <p className="text-gray-700 text-center max-w-3xl mx-auto mb-12">
          Tirupati is a major pilgrimage city in Andhra Pradesh, famous for the Sri Venkateswara Temple
          on the Tirumala hills. The city combines spiritual significance with modern amenities,
          making it a unique destination for devotees from around the world.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-lg border border-amber-100">
            <MapPin className="w-12 h-12 text-amber-600 mb-4" />
            <h3 className="text-xl mb-2">Places to Visit</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Sri Venkateswara Temple (Tirumala)</li>
              <li>• ISKCON Temple</li>
              <li>• Kapila Theertham</li>
              <li>• Sri Govindarajaswami Temple</li>
              <li>• Talakona Waterfalls (nearby)</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-lg border border-amber-100">
            <Utensils className="w-12 h-12 text-amber-600 mb-4" />
            <h3 className="text-xl mb-2">Local Cuisine</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Tirupati Laddu (Prasadam)</li>
              <li>• Pongal & Pulihora</li>
              <li>• Dosa & Idli varieties</li>
              <li>• Andhra-style Thali</li>
              <li>• Sweet Pongal</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-lg border border-amber-100">
            <ShoppingBag className="w-12 h-12 text-amber-600 mb-4" />
            <h3 className="text-xl mb-2">Shopping</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Religious items & idols</li>
              <li>• Silk sarees</li>
              <li>• Handicrafts</li>
              <li>• Sandalwood products</li>
              <li>• Local spices</li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg p-8">
          <h3 className="text-2xl mb-6 text-center">How to Reach Tirupati</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Plane className="w-10 h-10 mx-auto mb-3" />
              <h4 className="text-lg mb-2">By Air</h4>
              <p className="text-amber-100 text-sm">
                Tirupati Airport (15 km from city)<br />
                Connected to major cities
              </p>
            </div>
            <div className="text-center">
              <Train className="w-10 h-10 mx-auto mb-3" />
              <h4 className="text-lg mb-2">By Train</h4>
              <p className="text-amber-100 text-sm">
                Tirupati Railway Station<br />
                Well connected across India
              </p>
            </div>
            <div className="text-center">
              <Bus className="w-10 h-10 mx-auto mb-3" />
              <h4 className="text-lg mb-2">By Road</h4>
              <p className="text-amber-100 text-sm">
                Regular bus services from<br />
                Chennai, Bangalore, Hyderabad
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
