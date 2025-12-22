"use client";
import React, { useState, useEffect } from "react";

export default function LandingHero() {
  const [zip, setZip] = useState("");
  const [error, setError] = useState("");

  // Animated cars data
  const cars = [
    { emoji: "🚗", name: "Sedan", color: "bg-blue-500" },
    { emoji: "🚙", name: "SUV", color: "bg-green-500" },
    { emoji: "🏎️", name: "Sports", color: "bg-red-500" },
    { emoji: "🚐", name: "Minivan", color: "bg-purple-500" },
    { emoji: "🚕", name: "Taxi", color: "bg-yellow-500" },
    { emoji: "🚓", name: "Police", color: "bg-indigo-500" },
    { emoji: "🚑", name: "Ambulance", color: "bg-pink-500" },
    { emoji: "🚒", name: "Fire", color: "bg-orange-500" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = zip.replace(/\D/g, "").slice(0, 5);
    if (clean.length === 5) {
      setError("");
      if (typeof window !== "undefined") {
        window.location.href = `/quotes?zip=${encodeURIComponent(clean)}`;
      }
    } else {
      setError("Please enter a valid 5-digit ZIP Code.");
    }
  };

  return (
    <section
      className="relative overflow-hidden min-h-[80vh] flex items-center"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, rgba(30, 64, 175, 0.95) 0%, rgba(59, 130, 246, 0.8) 40%, rgba(0,0,0,0.3) 85%), url(/images/road.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center bottom",
      }}
    >

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating bubbles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-4 h-4 bg-white/10 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Moving Cars Section */}
      <div className="absolute bottom-0 left-0 w-full h-24 md:h-32 overflow-hidden">
        {/* Road */}
        <div className="absolute bottom-0 left-0 w-full h-6 md:h-8 bg-gray-900/80 backdrop-blur-sm">
          {/* Road markings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex space-x-6 md:space-x-8">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="w-6 md:w-8 h-1 bg-yellow-400 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Moving Cars */}
        <div className="absolute top-0 left-0 w-full h-full">
          {cars.map((car, index) => (
            <div
              key={index}
              className={`absolute top-2 md:top-3 ${car.color} rounded-lg p-2 md:p-3 shadow-lg animate-car-move car-animation-${index % 3}`}
              style={{
                left: '-80px',
                animationDelay: `${index * 2}s`,
                animationDuration: `${8 + Math.random() * 4}s`,
              }}
            >
              <div className="text-xl md:text-2xl mb-1">{car.emoji}</div>
              <div className="text-xs text-white font-semibold text-center">
                {car.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-3">
            🚗 Free Car Insurance Comparison
          </h1>
          {/* Decorative underline with glow */}
          <div className="flex justify-center mb-4">
            <span className="block w-16 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg shadow-yellow-400/50"></span>
          </div>
          <p className="mt-4 max-w-3xl mx-auto text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 font-medium px-4">
            Compare quotes from the top car insurance companies and save big! 🛡️💰
          </p>

          {/* Enhanced ZIP form with glow effect */}
          <form
            onSubmit={handleSubmit}
            className="mt-10 mx-auto max-w-md sm:max-w-lg flex flex-col sm:flex-row items-stretch rounded-2xl overflow-hidden shadow-2xl mx-4 bg-white/95 backdrop-blur-sm border border-white/20"
          >
            <div className="relative flex-1">
              {/* location icon */}
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22s8-7.333 8-13a8 8 0 10-16 0c0 5.667 8 13 8 13z"/>
              </svg>
              <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
              placeholder="Enter your ZIP Code"
              className="w-full pl-12 pr-4 py-4 sm:py-5 text-gray-900 placeholder-gray-500 bg-transparent focus:outline-none text-left text-base sm:text-lg font-medium"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold uppercase tracking-wide text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              🚀 GET QUOTES
            </button>
          </form>

          {error && (
            <p className="mt-4 text-sm text-red-300 mx-4 bg-red-500/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-red-400/30">{error}</p>
          )}

          <div className="mt-6 text-white/90 text-sm sm:text-base px-4 flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm rounded-full py-2 px-6 mx-auto w-fit">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-medium">Secured with SHA-256 Encryption</span>
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          </div>

          {/* Enhanced As Seen In row */}
          <div className="mt-12">
            <p className="text-white/90 text-sm sm:text-base mb-6 font-medium">🏆 Trusted by Leading Publications:</p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 opacity-95">
              {[
                { name: 'ABC', icon: '📺' },
                { name: 'CBS', icon: '📺' },
                { name: 'CNN', icon: '📡' },
                { name: 'FOX News', icon: '📺' },
                { name: 'NBC', icon: '📺' },
                { name: 'USA TODAY', icon: '📰' },
                { name: 'CNBC', icon: '📊' },
                { name: 'YAHOO!', icon: '🌐' }
              ].map((media) => (
                <div key={media.name} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 hover:bg-white/20 transition-all duration-300">
                  <span className="text-lg">{media.icon}</span>
                  <span className="text-white/95 text-sm sm:text-base font-semibold">
                    {media.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { number: '50+', label: 'Insurance Companies', icon: '🏢' },
              { number: '$500', label: 'Average Savings', icon: '💰' },
              { number: '2min', label: 'Quick Quote', icon: '⚡' },
              { number: '24/7', label: 'Support', icon: '🛟' }
            ].map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/20 transition-all duration-300">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-xl sm:text-2xl font-bold text-yellow-300">{stat.number}</div>
                <div className="text-xs sm:text-sm text-white/90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}