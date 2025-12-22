"use client";
import React, { useState } from 'react';
import { MapPin } from 'lucide-react';

export default function ZipForm({ heading = 'Compare Quotes Now:' }) {
  const [zip, setZip] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const clean = zip.replace(/\D/g, '').slice(0, 5);
      if (clean.length === 5) {
        setError('');
        // Use Next.js router for better navigation
        if (typeof window !== 'undefined' && window.location) {
          window.location.href = `/quotes?zip=${encodeURIComponent(clean)}`;
        }
      } else {
        setError('Please enter a valid 5-digit ZIP Code.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form noValidate onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:bg-white sm:rounded-lg sm:shadow-lg sm:border sm:border-slate-200 sm:p-1">
        
        {/* Simple ZIP Input */}
        <div className="relative flex-grow group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors">
            <MapPin className="w-5 h-5" />
          </div>
          <input
            type="text"
            name="zip"
            value={zip}
            inputMode="numeric"
            aria-invalid={!!error}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
            placeholder="Enter ZIP Code"
            maxLength={5}
            required
            disabled={isLoading}
            className={`w-full h-14 pl-12 pr-4 bg-white sm:bg-transparent rounded-lg sm:rounded-none border sm:border-none border-slate-200 text-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 sm:focus:ring-0 ${isLoading ? 'opacity-50' : ''} shadow-sm sm:shadow-none`}
          />
        </div>
        
        {/* Simple Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`h-14 sm:h-auto px-8 py-3 rounded-lg sm:rounded-md text-base sm:text-lg font-bold text-white transition-all duration-200 shadow-md sm:shadow-none hover:shadow-lg active:scale-95 whitespace-nowrap ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700'}`}
        >
          {isLoading ? '...' : 'Get Quotes'}
        </button>
      </form>
      
      {/* Simple Status Message */}
      {error && (
        <div className="mt-2 text-red-500 text-sm text-center font-medium bg-red-50 py-1 px-3 rounded">
          {error}
        </div>
      )}
      {!error && (
        <p className="mt-2 text-center sm:text-left text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5 opacity-80">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Free & Secure
        </p>
      )}
    </div>
  );
}
