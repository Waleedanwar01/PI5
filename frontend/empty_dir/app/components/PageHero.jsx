"use client";

import React from "react";
import SmartImage from './SmartImage.jsx';

export default function PageHero({ title, subtitle, imageUrl, variant = "dark" }) {
  const isDark = variant === "dark";
  return (
    <section id="hero" className={`relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-gray-900 via-black to-gray-900' : 'bg-white'} `}>
      {isDark ? (
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 40%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.06), transparent 40%)',
          }}
        />
      ) : null}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center flex flex-col items-center">
        <h1 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {title || "About"}
        </h1>
        {subtitle ? (
          <p className={`text-lg md:text-xl mb-8 max-w-3xl ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {subtitle}
          </p>
        ) : null}
        {imageUrl ? (
          <div className="mt-2">
            <SmartImage
              src={imageUrl}
              alt={title || "Hero"}
              className="rounded-full object-cover w-[200px] h-[200px] mx-auto ring-2 ring-white/40"
              priority
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}