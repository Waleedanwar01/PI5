"use client";
import React, { useState } from 'react';
import { MapPin, ArrowRight, Shield, CheckCircle, Zap, Star, TrendingUp } from 'lucide-react';

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
    <div className="relative">
      {/* Enhanced Form Container with Modern Design */}
      <div className="relative rounded-3xl border-2 border-blue-200 bg-gradient-to-br from-white via-blue-50/20 to-blue-100/10 shadow-2xl p-6 sm:p-8 text-center overflow-hidden backdrop-blur-sm">
        
        {/* Enhanced Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-400/30 to-transparent rounded-full transform translate-x-20 -translate-y-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-300/30 to-transparent rounded-full transform -translate-x-16 translate-y-16 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-0 w-24 h-24 bg-gradient-to-r from-blue-300/20 to-transparent rounded-full transform -translate-x-12"></div>
        
        {/* Modern Header Section */}
        <div className="relative z-10 mb-8">
          {/* Enhanced Icon with Multiple Effects */}
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full animate-ping opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full animate-pulse opacity-60"></div>
            <div className="relative w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20">
              <Shield className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
            <div className="absolute -top-1 -right-1">
              <Star className="w-6 h-6 text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          </div>
          
          {/* Enhanced Title */}
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tight leading-tight">
            {heading}
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            Join <span className="font-bold text-blue-600">500,000+</span> drivers saving money on auto insurance
          </p>
        </div>
        
        {/* Enhanced Form */}
        <form noValidate onSubmit={handleSubmit} className="mx-auto relative z-10">
          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            
            {/* Enhanced ZIP Input */}
            <div className="relative flex-1">
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-500 z-10 transition-colors group-focus-within:text-blue-600" />
                <input
                  type="text"
                  name="zip"
                  value={zip}
                  inputMode="numeric"
                  aria-invalid={!!error}
                  onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  placeholder="Enter your ZIP code"
                  maxLength={5}
                  required
                  disabled={isLoading}
                  className={`w-full pl-12 pr-4 py-4 text-lg font-semibold rounded-2xl border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-200/50 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:bg-white'} ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200/50' : 'border-blue-200 focus:border-blue-500 hover:border-blue-300'}`}
                />
                
                {/* Input glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 to-blue-600/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-xl"></div>
              </div>
            </div>
            
            {/* Enhanced Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`relative px-8 py-4 rounded-2xl text-lg font-bold text-white shadow-2xl transition-all duration-300 transform border-2 group overflow-hidden ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-2xl active:scale-95'} bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 border-blue-500 hover:border-blue-600`}
            >
              {/* Button background animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <span className="relative flex items-center justify-center gap-3">
                {isLoading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Getting Quotes...</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Get FREE Quotes</span>
                    <span className="sm:hidden">Get Quotes</span>
                    <div className="relative">
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                      <Zap className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </>
                )}
              </span>
              
              {/* Button shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </button>
          </div>
        </form>
        
        {/* Enhanced Status Message */}
        <div className="mt-6 min-h-[2rem] relative z-10">
          {error ? (
            <div className="flex items-center justify-center gap-3 p-3 bg-red-50 border border-red-200 rounded-2xl">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 p-3 bg-green-50 border border-green-200 rounded-2xl">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <span className="text-green-700 font-medium">Secured with 256-bit SSL Encryption</span>
            </div>
          )}
        </div>
        
        {/* Enhanced Trust Indicators */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
          <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 shadow-sm">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-800 text-sm">100% Trusted</div>
              <div className="text-blue-600 text-xs">By 500K+ Users</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 shadow-sm">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="text-center">
              <div className="font-bold text-green-800 text-sm">Save 40%</div>
              <div className="text-green-600 text-xs">Average Savings</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200 shadow-sm">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="text-center">
              <div className="font-bold text-purple-800 text-sm">Instant</div>
              <div className="text-purple-600 text-xs">2-Min Results</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}