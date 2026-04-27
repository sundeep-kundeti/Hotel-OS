import { Percent, Users, Briefcase, GraduationCap, Shield, Cross, Scale, Heart } from 'lucide-react';

export default function DiscountsSection() {
  return (
    <div className="bg-gradient-to-b from-white to-amber-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full mb-4">
            <Percent className="w-5 h-5" />
            <span className="font-semibold">Special Discounts Available</span>
          </div>
          <h2 className="text-4xl mb-4">Exclusive Offers</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We value your service and dedication. Enjoy special discounts on your stay.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg">Police Personnel</h3>
            </div>
            <p className="text-gray-600 text-sm mb-2">Special discount for police officers and their families</p>
            <p className="text-blue-600 font-semibold">Exclusive Rates</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <Cross className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg">Medical Staff</h3>
            </div>
            <p className="text-gray-600 text-sm mb-2">Discount for doctors, nurses, and healthcare workers</p>
            <p className="text-red-600 font-semibold">Exclusive Rates</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg">Armed Forces</h3>
            </div>
            <p className="text-gray-600 text-sm mb-2">Special rates for Army, Navy, and Air Force personnel</p>
            <p className="text-green-600 font-semibold">Exclusive Rates</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Scale className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg">Legal Professionals</h3>
            </div>
            <p className="text-gray-600 text-sm mb-2">Discount for lawyers, judges, and legal staff</p>
            <p className="text-purple-600 font-semibold">Exclusive Rates</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-8 rounded-lg shadow-lg">
            <Users className="w-12 h-12 mb-4" />
            <h3 className="text-2xl mb-3">Group Bookings</h3>
            <p className="text-amber-100 mb-4">
              Special discounted rates for group bookings. Perfect for families, friends, or tour groups.
            </p>
            <p className="text-sm">Contact us for bulk booking rates</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 rounded-lg shadow-lg">
            <Briefcase className="w-12 h-12 mb-4" />
            <h3 className="text-2xl mb-3">Corporate Discount</h3>
            <p className="text-blue-100 mb-4">
              Exclusive corporate rates for business travelers and company bookings.
            </p>
            <p className="text-sm">MOU available for regular bookings</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-8 rounded-lg shadow-lg">
            <GraduationCap className="w-12 h-12 mb-4" />
            <h3 className="text-2xl mb-3">Student Discount</h3>
            <p className="text-green-100 mb-4">
              Special rates for students with valid ID. Educational tours welcome.
            </p>
            <p className="text-sm">Valid student ID required</p>
          </div>
        </div>

        <div className="mt-10 text-center bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-700 mb-4">
            <strong>Note:</strong> Valid government ID or proof of eligibility required at check-in for discount claims.
            Discounts cannot be combined with other offers.
          </p>
          <a
            href="tel:+917416686677"
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg transition-colors"
          >
            Call for Discount Rates
          </a>
        </div>
      </div>
    </div>
  );
}
