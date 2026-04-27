import { MapPin, Phone, Mail } from 'lucide-react';

interface HeaderProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

export default function Header({ activeSection, onNavigate }: HeaderProps) {
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'rooms', label: 'Rooms' },
    { id: 'tirupati', label: 'About Tirupati' },
    { id: 'tirumala', label: 'Tirumala Temple' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-8 h-8 text-amber-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Srinivasa Residency</h1>
              <p className="text-xs text-gray-600">by Srimuni Hotels</p>
            </div>
          </div>

          <nav className="hidden md:flex gap-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3 py-2 rounded-md transition-colors ${
                  activeSection === item.id
                    ? 'bg-amber-600 text-white'
                    : 'text-gray-700 hover:bg-amber-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              <span>+91 7416686677</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
