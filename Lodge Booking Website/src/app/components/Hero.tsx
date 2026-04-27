import { ImageWithFallback } from './figma/ImageWithFallback';

interface HeroProps {
  onBookNow: () => void;
}

export default function Hero({ onBookNow }: HeroProps) {
  return (
    <div className="relative h-[600px] overflow-hidden">
      <ImageWithFallback
        src="https://images.unsplash.com/photo-1705723116788-d11fa6e3f415?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxUaXJ1bWFsYSUyMFRpcnVwYXRpJTIwdGVtcGxlfGVufDF8fHx8MTc3NzI2OTI0Mnww&ixlib=rb-4.1.0&q=80&w=1080"
        alt="Tirumala Temple"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />

      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="text-white max-w-2xl">
          <h2 className="text-5xl mb-4">Welcome to Srinivasa Residency</h2>
          <p className="text-xl mb-8 text-gray-200">
            by Srimuni Hotels - Budget-friendly accommodation for pilgrims. Clean, comfortable rooms
            in the heart of Tirupati, your gateway to the sacred Tirumala hills.
          </p>
          <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg p-4 mb-8 inline-block">
            <p className="text-lg">Starting from <span className="text-3xl font-bold text-amber-300">₹900</span> per night</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={onBookNow}
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg transition-colors"
            >
              Book Your Stay
            </button>
            <button
              onClick={() => document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-3 rounded-lg border border-white/30 transition-colors"
            >
              View Rooms
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
