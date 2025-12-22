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
        <div className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
          
          {/* ZIP Input */}
          <div className="relative flex-1 group">
            <div className="absolute inset-0 bg-white rounded-none shadow-sm transition-shadow duration-300 group-hover:shadow-md"></div>
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
            <input
              type="text"
              name="zip"
              value={zip}
              inputMode="numeric"
              onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder="Enter ZIP Code"
              maxLength={5}
              required
              disabled={isLoading}
              className="relative w-full pl-12 pr-4 py-3 text-base rounded-none border border-slate-200 bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all duration-300 h-[60px]"
            />
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || zip.length !== 5}
            className={`relative px-8 py-3 rounded-none text-base font-bold text-white bg-sky-600 hover:bg-sky-700 border-0 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none uppercase tracking-wide h-[60px] flex items-center justify-center whitespace-nowrap shadow-md ${isLoading ? 'cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Loading...</span>
              </div>
            ) : (
              <>
                GET QUOTES <span className="ml-2">→</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
