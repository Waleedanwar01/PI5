"use client";
import React, { useState, useEffect } from "react";
import { ChevronRight, Phone, ShieldCheck, MapPin } from 'lucide-react';

export default function HeroWithNavbar({ initialPressLogos }) {
  const [zip, setZip] = useState("");
  const [error, setError] = useState("");
  
  const [phone, setPhone] = useState('(800) 219-3415');
  const [brand, setBrand] = useState('AutoInsureSavings');
  const [siteConfig, setSiteConfig] = useState(null);
  const [heroTitle, setHeroTitle] = useState(null);
  const [tagline, setTagline] = useState(null);
  
  // Cache helper
  const loadCache = (key) => {
    if (typeof window === 'undefined') return null;
    try {
        const item = localStorage.getItem(key);
        if (!item) return null;
        const parsed = JSON.parse(item);
        if (Date.now() - parsed.timestamp > 3600000) return null; // 1 hour
        return parsed.data;
    } catch (e) {
        return null;
    }
  };

  const saveCache = (key, data) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(key, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch (e) {}
  };

  // Fetch site configuration only (homepage data no longer needed for logos)
  useEffect(() => {
    const updateData = (data) => {
        setSiteConfig(data);
        if (data.phone_number) setPhone(data.phone_number);
        if (data.brand_name) setBrand(data.brand_name);
        if (data.hero_title) setHeroTitle(data.hero_title);
        if (data.tagline) setTagline(data.tagline);
    };

    // Try cache first
    const cached = loadCache('hero_site_config');
    if (cached) updateData(cached);

    const fetchData = async () => {
      try {
        const siteConfigRes = await fetch('/api/site-config/', { cache: 'no-store' });
        if (siteConfigRes.ok) {
          const data = await siteConfigRes.json();
          updateData(data);
          saveCache('hero_site_config', data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

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

  const bgImage = "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1920&auto=format&fit=crop"; 

  return (
    <section className="relative min-h-[calc(100vh-80px)] flex flex-col font-sans">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
            <img src={bgImage} alt="Background" className="w-full h-full object-cover" fetchPriority="high" />
            <div className="absolute inset-0 bg-white/90"></div>
        </div>

      {/* HERO CONTENT */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12 md:py-20">
        <div className="max-w-7xl mx-auto w-full">
            <div className="max-w-3xl pl-4 md:pl-8">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                    {heroTitle ? (
                        <span dangerouslySetInnerHTML={{ __html: heroTitle.replace(/\n/g, '<br/>') }} />
                    ) : (
                        <>
                            Cheap Car Insurance Rates by<br />
                            {brand === 'AutoInsureSavings' || brand === 'Car Insurance Comparison' ? 'AutoInsureSavings LLC' : brand}
                        </>
                    )}
                </h1>
                
                <p className="text-base md:text-lg text-slate-600 mb-6 max-w-2xl font-light leading-snug">
                    {tagline || "Looking to save on cheap auto insurance? Compare quotes from the top auto insurance companies and save up to $610."}
                </p>

                {/* ZIP Form */}
                <form onSubmit={handleSubmit} className="w-full max-w-lg mb-6">
                    <div className="flex flex-col sm:flex-row gap-0 shadow-xl rounded-none overflow-hidden">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <MapPin className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={5}
                                value={zip}
                                onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                                placeholder="ZIP Code"
                                className="block w-full pl-11 pr-4 py-3 text-slate-900 bg-white placeholder-slate-400 focus:outline-none text-base border-r-0 sm:border-r border-slate-200"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 text-base uppercase tracking-wide transition-colors flex items-center justify-center sm:w-auto w-full"
                        >
                            Get Quotes
                            <ChevronRight className="ml-2 w-5 h-5" />
                        </button>
                    </div>
                    {error && <p className="mt-2 text-red-500 text-sm font-medium">{error}</p>}
                </form>

                {/* Trust Badge */}
                <div className="flex items-center text-slate-500 gap-2 mb-8">
                     <ShieldCheck className="w-4 h-4" />
                     <span className="text-xs font-medium">Secured with SHA-256 Encryption</span>
                </div>
                
                {/* As Seen In - Static Hardcoded */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-4">
                    As seen in
                  </p>
                  <div className="flex flex-wrap items-center gap-6 md:gap-8 opacity-70">
                      <div className="relative h-8 md:h-10 w-auto">
                        <img 
                            src="/logos/as-seen.svg" 
                            alt="As Seen In" 
                            className="h-full w-auto object-contain transition-opacity hover:opacity-100"
                            style={{ filter: 'brightness(0)' }}
                        />
                      </div>
                  </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
}
