import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-white text-lg mb-4">Srinivasa Residency</h3>
            <p className="text-sm mb-4">
              by Srimuni Hotels - Your comfort is our priority. Experience divine hospitality near the sacred Tirumala hills.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-amber-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-amber-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-amber-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-amber-500 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Room & Rates</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white text-lg mb-4">Contact Us</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>G. Car Street, Near Railway Station<br />Tirupati, Andhra Pradesh - 517501</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-amber-500" />
                <span>+91 7416686677</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-amber-500" />
                <span>info@srinivasaresidency.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center text-sm">
          <p>&copy; 2026 Srinivasa Residency by Srimuni Hotels. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
