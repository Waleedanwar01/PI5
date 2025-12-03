"use client";

import React from "react";

const CarsRunningSection = () => {
  // Different types of cars/vehicles
  const vehicles = [
    { type: "🚗", name: "Sedan", speed: "50mph" },
    { type: "🚙", name: "SUV", speed: "45mph" },
    { type: "🏎️", name: "Sports Car", speed: "80mph" },
    { type: "🚐", name: "Minivan", speed: "40mph" },
    { type: "🚕", name: "Taxi", speed: "55mph" },
    { type: "🚜", name: "Truck", speed: "35mph" },
    { type: "🚓", name: "Police Car", speed: "70mph" },
    { type: "🚑", name: "Ambulance", speed: "60mph" },
    { type: "🚌", name: "Bus", speed: "45mph" },
    { type: "🚒", name: "Fire Truck", speed: "65mph" },
  ];

  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden py-16 md:py-20">
      {/* Ocean Wave SVG - Top Wave */}
      <svg 
        className="absolute top-0 left-0 w-full h-16 md:h-20" 
        viewBox="0 0 1200 120" 
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M0,0 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,0 L0,0 Z" 
          fill="url(#waveGradientTop)"
          className="drop-shadow-sm"
        />
        <defs>
          <linearGradient id="waveGradientTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E40AF" />
            <stop offset="50%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Ocean Wave SVG - Bottom Wave */}
      <svg 
        className="absolute bottom-0 left-0 w-full h-16 md:h-20" 
        viewBox="0 0 1200 120" 
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transform: 'rotate(180deg)' }}
      >
        <path 
          d="M0,0 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,0 L0,0 Z" 
          fill="url(#waveGradientBottom)"
          className="drop-shadow-sm"
        />
        <defs>
          <linearGradient id="waveGradientBottom" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>
        </defs>
      </svg>

      {/* Background Animation Waves */}
      <div className="absolute inset-0 opacity-10">
        <svg 
          className="absolute top-8 left-0 w-full h-12 animate-pulse" 
          viewBox="0 0 1200 80" 
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M0,40 Q200,0 400,40 T800,40 T1200,40 L1200,80 L0,80 Z" 
            fill="white"
            className="animate-pulse"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
            🏁 Every Car Needs Protection
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            From sedans to sports cars, every vehicle on the road deserves the right insurance coverage. 
            Compare rates and find the perfect plan for your ride!
          </p>
        </div>

        {/* Cars Running Animation */}
        <div className="relative h-32 md:h-40 mb-12 overflow-hidden">
          {/* Road */}
          <div className="absolute bottom-0 left-0 w-full h-8 bg-gray-800 rounded-lg">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex space-x-4">
                {/* Road markings */}
                {[...Array(20)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-8 h-1 bg-yellow-400 rounded"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Moving Vehicles */}
          <div className="absolute top-0 left-0 w-full h-full">
            {vehicles.map((vehicle, index) => (
              <div
                key={index}
                className={`absolute top-4 md:top-6 text-2xl md:text-3xl vehicle-float car-animation-${index % 3}`}
                style={{
                  left: '-60px',
                  animationDelay: `${index * 1.5}s`,
                }}
              >
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 md:p-3 shadow-lg">
                  <span className="block">{vehicle.type}</span>
                  <div className="text-xs text-blue-100 mt-1 text-center">
                    {vehicle.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-12">
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="text-2xl md:text-3xl font-bold text-yellow-300">50+</div>
            <div className="text-sm md:text-base text-blue-100">Insurance Companies</div>
          </div>
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="text-2xl md:text-3xl font-bold text-green-300">$500</div>
            <div className="text-sm md:text-base text-blue-100">Average Monthly Savings</div>
          </div>
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="text-2xl md:text-3xl font-bold text-blue-300">2min</div>
            <div className="text-sm md:text-base text-blue-100">Quick Quote Process</div>
          </div>
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="text-2xl md:text-3xl font-bold text-purple-300">24/7</div>
            <div className="text-sm md:text-base text-blue-100">Customer Support</div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 text-blue-200 mb-6">
            <span className="text-xl">🚗</span>
            <span className="font-medium">All Vehicles Covered</span>
            <span className="w-1 h-1 bg-blue-300 rounded-full"></span>
            <span className="text-xl">🛡️</span>
            <span className="font-medium">Full Protection</span>
            <span className="w-1 h-1 bg-blue-300 rounded-full"></span>
            <span className="text-xl">💰</span>
            <span className="font-medium">Maximum Savings</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarsRunningSection;