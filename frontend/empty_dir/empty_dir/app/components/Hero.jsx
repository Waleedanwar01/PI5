"use client";

import React from "react";
// Use native <img> to avoid Next Image private-IP restrictions in dev

const HeroSection = () => {
  const [tagline, setTagline] = React.useState("");
  const [heroTitle, setHeroTitle] = React.useState("");
  const [heroImage, setHeroImage] = React.useState(null);
  React.useEffect(() => {
    Promise.all([
      fetch('/api/site-config/', { cache: 'no-store' }).then(r => r.json()).catch(() => ({})),
      fetch('/api/homepage/', { cache: 'no-store' }).then(r => r.json()).catch(() => ({})),
    ]).then(([cfg, home]) => {
      setTagline(cfg.tagline || "");
      setHeroTitle((cfg.hero_title || '').trim());
      const meta = home?.meta || {};
      setHeroImage(meta.hero_image || null);
    }).catch(() => {});
  }, []);
  return (
    <section className="relative w-full bg-gradient-to-br from-gray-50 via-white to-orange-50/20 py-16 md:py-24">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column - Content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
                {heroTitle ? (
                  heroTitle
                ) : (
                  <>Auto insurance made <span className="text-orange-600">clear.</span></>
                )}
              </h1>
              {tagline && (
                <p className="text-xl sm:text-2xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  {tagline}
                </p>
              )}
            </div>

            {/* Form Section */}
            <div className="max-w-md mx-auto lg:mx-0">
              <form
                className="flex flex-col sm:flex-row gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const zipInput = form.querySelector('input[name="zip"]');
                  const zip = String(zipInput?.value || '').replace(/\D/g, '').slice(0, 5);
                  if (zip.length === 5) {
                    window.location.href = `/quotes?zip=${encodeURIComponent(zip)}`;
                  }
                }}
              >
                <div className="flex-1">
                  <input
                    type="text"
                    name="zip"
                    placeholder="Enter ZIP Code"
                    className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-200/50 focus:outline-none transition-all duration-200 bg-white shadow-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-lg whitespace-nowrap"
                >
                  Get Quotes
                </button>
              </form>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center lg:justify-start gap-3 text-gray-600">
              <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 11c0-1.105.895-2 2-2s2 .895 2 2v1h-4v-1zM6 11V9a6 6 0 1112 0v2m-1 10H7a2 2 0 01-2-2V11h14v8a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-sm font-medium text-green-700">256-bit SSL Encrypted</span>
              </div>
            </div>
          </div>

          {/* Right Column - Hero Image */}
          <div className="relative">
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-blue-400/10 rounded-2xl"></div>
              <img
                src={heroImage || "/images/seeded-hero.png"}
                alt="Auto Insurance Hero"
                className="relative w-full h-auto object-cover rounded-xl"
                loading="eager"
              />
            </div>
            
            {/* Floating stats cards */}
            <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
              <div className="text-2xl font-bold text-orange-600">98%</div>
              <div className="text-sm text-gray-600">Customer Satisfaction</div>
            </div>
            
            <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
              <div className="text-2xl font-bold text-blue-600">2min</div>
              <div className="text-sm text-gray-600">Average Quote Time</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;