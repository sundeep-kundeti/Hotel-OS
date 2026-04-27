import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import RoomCard from './components/RoomCard';
import BookingModal, { BookingData } from './components/BookingModal';
import DiscountsSection from './components/DiscountsSection';
import TirupatiInfo from './components/TirupatiInfo';
import TirumalaInfo from './components/TirumalaInfo';
import Footer from './components/Footer';

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

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const rooms: Room[] = [
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

  const handleBookRoom = (room: Room) => {
    setSelectedRoom(room);
  };

  const handleConfirmBooking = (booking: BookingData) => {
    setBookings([...bookings, booking]);
    setSelectedRoom(null);
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 5000);
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeSection={activeSection} onNavigate={scrollToSection} />

      {showConfirmation && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-slide-in">
          <p className="font-semibold">Booking Confirmed!</p>
          <p className="text-sm">We'll send you a confirmation email shortly.</p>
        </div>
      )}

      <main>
        <section id="home">
          <Hero onBookNow={() => scrollToSection('rooms')} />
        </section>

        <section id="rooms" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl mb-4">Our Rooms & Rates</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Budget-friendly accommodation options for pilgrims and travelers.
                Clean, comfortable rooms at affordable prices.
              </p>
            </div>

            <div className="mb-8 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg max-w-4xl mx-auto">
              <p className="text-gray-700 text-center">
                <strong>Price Range:</strong> Non-AC ₹900-1100 | AC ₹1500-1800 | Deluxe AC ₹1800+ | Fresh Up ₹200-600 | Short Stay ₹600-900
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {rooms.map((room) => (
                <RoomCard key={room.id} room={room} onBook={handleBookRoom} />
              ))}
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-lg text-center">
              <h3 className="text-2xl mb-3">Group Bookings Available</h3>
              <p className="text-gray-700 mb-4">
                Planning a group pilgrimage? We offer special discounted rates for group bookings.
                Contact us for customized packages and bulk booking offers.
              </p>
              <a
                href="tel:+917416686677"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors"
              >
                Enquire for Group Rates
              </a>
            </div>
          </div>
        </section>

        <DiscountsSection />

        <section id="tirupati">
          <TirupatiInfo />
        </section>

        <section id="tirumala">
          <TirumalaInfo />
        </section>

        <section id="contact" className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl mb-8 text-center">Get in Touch</h2>
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-8 rounded-lg">
              <p className="text-center text-gray-700 mb-6">
                Have questions about your stay or need assistance? We're here to help make your
                pilgrimage comfortable and memorable.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:+917416686677"
                  className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg text-center transition-colors"
                >
                  Call Us Now
                </a>
                <a
                  href="mailto:info@srinivasaresidency.com"
                  className="bg-white hover:bg-gray-50 text-amber-600 border-2 border-amber-600 px-8 py-3 rounded-lg text-center transition-colors"
                >
                  Send Email
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {selectedRoom && (
        <BookingModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onConfirm={handleConfirmBooking}
        />
      )}
    </div>
  );
}