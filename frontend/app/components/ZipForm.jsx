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
    <div>
      {/* Simple Form Container */}
      <div className="border border-gray-200 rounded-lg p-6">
        
        {/* Simple Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {heading}
          </h2>
          <p className="text-gray-600 text-sm">
            Get free quotes from top insurers
          </p>
        </div>
        
        {/* Simple Form */}
        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            
            {/* Simple ZIP Input */}
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="zip"
                value={zip}
                inputMode="numeric"
                aria-invalid={!!error}
                onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="Enter ZIP code"
                maxLength={5}
                required
                disabled={isLoading}
                className={`w-full pl-10 pr-4 py-3 text-base rounded-lg border transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${error ? 'border-red-300' : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`}
              />
            </div>
            
            {/* Simple Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-3 rounded-lg text-base font-bold text-white transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'} bg-blue-600`}
            >
              {isLoading ? 'Getting Quotes...' : 'Get Quotes'}
            </button>
          </div>
        </form>
        
        {/* Simple Status Message */}
        <div className="mt-4">
          {error ? (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          ) : (
            <div className="text-green-600 text-sm text-center">
              Secure & Free
            </div>
          )}
        </div>
      </div>
    </div>
  );
}