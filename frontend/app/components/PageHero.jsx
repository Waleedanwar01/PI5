"use client";

import React from "react";
import SmartImage from './SmartImage.jsx';

export default function PageHero({ title, subtitle, imageUrl, variant = "dark", align = "center" }) {
  const isDark = variant === "dark";
  const isLeft = align === "left";
  
  return (
    <section id="hero" className={`relative overflow-hidden min-h-[400px] flex items-center ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
      {/* Background Image Layer */}
      {imageUrl && (
        <div className="absolute inset-0 z-0">
          <SmartImage 
            src={imageUrl} 
            alt="Hero Background" 
            fill
            priority
            className="object-cover"
          />
          {/* Modern Gradient Overlay */}
          <div className={`absolute inset-0 ${
            isLeft 
              ? 'bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/40' 
              : 'bg-slate-900/70'
            } backdrop-blur-[1px]`} 
          />
        </div>
      )}

      {/* Fallback Pattern if no image */}
      {isDark && !imageUrl && (
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black" />
      )}
      
      <div className={`relative z-10 w-full max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 py-20 md:py-28 flex flex-col ${isLeft ? 'items-start text-left' : 'items-center text-center'}`}>
        <h1 className={`text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-4xl leading-tight ${isDark || imageUrl ? 'text-white drop-shadow-sm' : 'text-gray-900'}`}>
          {title || "About"}
        </h1>
        {subtitle ? (
          <p className={`text-lg md:text-xl mb-8 max-w-3xl leading-relaxed font-medium ${isDark || imageUrl ? 'text-slate-200 drop-shadow-sm' : 'text-gray-600'}`}>
            {subtitle}
          </p>
        ) : null}
        
        {/* Decorative line */}
        <div className={`h-1 w-24 rounded-full ${isDark || imageUrl ? 'bg-blue-600' : 'bg-blue-600'} mt-4`} />
      </div>
    </section>
  );
}