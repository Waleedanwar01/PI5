"use client";

import React from 'react';
import SmartImage from './SmartImage';

export default function PressBox({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50 border-t border-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">In the Press</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <a 
              key={item.id} 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center group h-full"
            >
              {item.logo && (
                <div className="relative h-16 w-48 mb-6 grayscale group-hover:grayscale-0 transition-all duration-300">
                  <SmartImage
                    src={item.logo}
                    alt={item.title}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              
              <div className="flex-1 flex flex-col justify-between w-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                
                {item.date && (
                  <time className="text-sm text-gray-500 mt-auto block">
                    {new Date(item.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
