import React from "react";
import Image from "next/image";
import SmartImage from "./SmartImage.jsx";

export default function FeaturedIn({ logos }) {
  if (!logos || logos.length === 0) return null;

  return (
    <section className="bg-white border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-8">
          Featured In
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          {logos.map((logo, idx) => (
            <div key={idx} className="flex items-center justify-center h-12 w-32 relative">
              {logo.image ? (
                <SmartImage 
                    src={logo.image} 
                    alt={logo.name || "Press Logo"} 
                    className="object-contain max-h-10 max-w-full"
                    width={120}
                    height={40}
                />
              ) : (
                <span className="text-lg font-bold text-gray-400">{logo.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
