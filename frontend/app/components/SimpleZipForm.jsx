"use client";
import React, { useState } from 'react';
import { MapPin } from 'lucide-react';

export default function SimpleZipForm() {
  const [zip, setZip] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const clean = zip.replace(/\D/g, '').slice(0, 5);
      if (clean.length === 5) {
        // Use Next.js router for better navigation
        if (typeof window !== 'undefined' && window.location) {
          window.location.href = `/quotes?zip=${encodeURIComponent(clean)}`;
        }
      }
    } catch (err) {
      console.error('Error submitting form:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <form noValidate onSubmit={handleSubmit} className="w-full">
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          
          {/* ZIP Input */}
          <div className="relative flex-1">
            <div className="relative group">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 z-10" />
              <input
                type="text"
                name="zip"
                value={zip}
                inputMode="numeric"
                onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="Enter ZIP code"
                maxLength={5}
                required
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 text-base rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-300"
              />
            </div>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || zip.length !== 5}
            className={`px-6 py-3 rounded-lg text-base font-semibold text-blue-800 bg-white border border-white/20 shadow-lg transition-all duration-300 hover:bg-blue-50 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${isLoading ? 'cursor-not-allowed' : 'hover:scale-105'}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-blue-800 border-t-transparent rounded-full"></div>
                <span>Loading...</span>
              </div>
            ) : (
              'Get Quotes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}