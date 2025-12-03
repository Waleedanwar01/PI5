"use client";
import React, { useState } from "react";

export default function LandingHero() {
  const [zip, setZip] = useState("");
  const [error, setError] = useState("");

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
      className="relative overflow-hidden min-h-[70vh] flex items-center"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, rgba(var(--brand-blue-rgb), 0.92) 0%, rgba(var(--brand-blue-rgb), 0.6) 45%, rgba(0,0,0,0) 88%), url(/images/road.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center bottom",
      }}
    >

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-3">
            Free Car Insurance Comparison
          </h1>
          {/* Decorative underline */}
          <div className="flex justify-center">
            <span className="block w-14 h-0.5 bg-white/70 rounded"></span>
          </div>
          <p className="mt-4 max-w-3xl mx-auto text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 italic px-4">
            Compare quotes from the top car insurance companies and save!
          </p>

          {/* ZIP form */}
          <form
            onSubmit={handleSubmit}
            className="mt-8 mx-auto max-w-md sm:max-w-lg flex flex-col sm:flex-row items-stretch rounded-xl overflow-hidden shadow-xl mx-4"
          >
            <div className="relative flex-1">
              {/* location icon */}
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22s8-7.333 8-13a8 8 0 10-16 0c0 5.667 8 13 8 13z"/>
              </svg>
              <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
              placeholder="ZIP Code"
              className="w-full pl-10 pr-4 py-3 sm:py-4 text-gray-900 placeholder-gray-500 bg-white focus:outline-none text-left text-sm sm:text-base"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold uppercase tracking-wide text-sm sm:text-base"
            >
              GET QUOTES
            </button>
          </form>

          {error && (
            <p className="mt-3 text-sm text-red-200 mx-4">{error}</p>
          )}

          <div className="mt-4 text-white/80 text-xs sm:text-sm px-4 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11V7a4 4 0 018 0v4" />
              <rect width="16" height="10" x="4" y="11" rx="2" ry="2" />
            </svg>
            Secured with SHA-256 Encryption
          </div>

          {/* As Seen In row */}
          <div className="mt-10">
            <p className="text-white/80 text-xs sm:text-sm mb-4">As Seen In:</p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 opacity-90">
              {['abc','CBS','CNN','FOX News','NBC','USA TODAY','CNBC','YAHOO!'].map((name) => (
                <span key={name} className="text-white/90 text-sm sm:text-base font-semibold tracking-wide">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}