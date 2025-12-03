"use client";
import React, { useState, useEffect } from "react";

export default function ModernHero() {
  const [zip, setZip] = useState("");
  const [error, setError] = useState("");

  // Animated elements data
  const floatingElements = [
    { emoji: "🛡️", delay: "0s", position: "top-20 left-10" },
    { emoji: "💰", delay: "2s", position: "top-32 right-16" },
    { emoji: "⚡", delay: "4s", position: "top-40 left-1/4" },
    { emoji: "🏆", delay: "1s", position: "top-24 right-1/3" },
    { emoji: "🚗", delay: "3s", position: "top-48 left-3/4" },
    { emoji: "🔒", delay: "5s", position: "top-16 right-20" },
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
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/10 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        {/* Animated waves at bottom */}
        <div className="absolute bottom-0 left-0 w-full h-32 overflow-hidden">
          <svg 
            className="absolute bottom-0 w-full h-full" 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none"
          >
            <path 
              d="M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z" 
              fill="url(#heroWaveGradient)"
              className="animate-pulse"
            />
            <defs>
              <linearGradient id="heroWaveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
                <stop offset="50%" stopColor="rgba(99, 102, 241, 0.2)" />
                <stop offset="100%" stopColor="rgba(139, 92, 246, 0.1)" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-white/90 text-sm font-medium">Trusted by 2M+ drivers</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Save Big
              </span>
              <br />
              <span className="text-white">on Car Insurance</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl lg:text-2xl text-blue-100 mb-8 leading-relaxed max-w-2xl">
              Compare quotes from <span className="text-yellow-400 font-semibold">50+ top insurers</span> and find your perfect coverage in minutes.
            </p>

            {/* Key Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              {[
                { icon: "⚡", text: "2-minute quotes" },
                { icon: "💰", text: "Average $500+ savings" },
                { icon: "🛡️", text: "Compare 50+ insurers" }
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-white/90">
                  <span className="text-xl">{benefit.icon}</span>
                  <span className="font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* ZIP Code Form */}
            <form onSubmit={handleSubmit} className="max-w-lg mx-auto lg:mx-0">
              <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-2 shadow-2xl border border-white/20">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative flex-1">
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
                      placeholder="Enter your ZIP code"
                      className="w-full pl-12 pr-4 py-4 text-gray-900 placeholder-gray-500 bg-transparent focus:outline-none text-left text-base font-medium"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-4 btn-blue bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl mt-2 sm:mt-0"
                  >
                    🚀 Get Quotes
                  </button>
                </div>
              </div>
              {error && (
                <p className="mt-3 text-sm text-red-300 bg-red-500/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-red-400/30">
                  {error}
                </p>
              )}
            </form>

            {/* Security Badge */}
            <div className="mt-6 flex items-center justify-center lg:justify-start gap-3 text-white/80">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-sm">Secured with SHA-256 encryption</span>
            </div>
          </div>

          {/* Right Content - Visual Elements */}
          <div className="relative lg:block hidden">
            {/* Central Insurance Icon */}
            <div className="relative mx-auto w-80 h-80">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute inset-4 bg-gradient-to-r from-blue-300 to-blue-500 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
              
              {/* Main shield icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-8xl animate-bounce">🛡️</div>
              </div>

              {/* Floating elements around shield */}
              {floatingElements.map((element, index) => (
                <div
                  key={index}
                  className={`absolute ${element.position} text-3xl animate-float`}
                  style={{
                    animationDelay: element.delay,
                    animationDuration: '4s',
                  }}
                >
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 border border-white/30">
                    {element.emoji}
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Cards */}
            <div className="absolute -bottom-8 -left-8 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-yellow-400">$500+</div>
              <div className="text-white/80 text-sm">Average Savings</div>
            </div>

            <div className="absolute -top-8 -right-8 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-green-400">2min</div>
              <div className="text-white/80 text-sm">Quick Quote</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
