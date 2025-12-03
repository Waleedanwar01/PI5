import React from "react";
import Image from "next/image";

const logos = [
  { src: "/next.svg", alt: "Next.js" },
  { src: "/vercel.svg", alt: "Vercel" },
  { label: "Forbes" },
  { src: "/globe.svg", alt: "Globe" },
  { src: "/window.svg", alt: "Window" },
];

export default function FeaturedIn() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-center text-sm font-semibold text-gray-600 tracking-wider">Featured In</h2>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 items-center">
          {logos.map((logo, idx) => (
            <div key={logo.alt || logo.label || idx} className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-4">
              {logo.src ? (
                <Image src={logo.src} alt={logo.alt || "Logo"} width={100} height={32} className="object-contain" />
              ) : (
                <span className="text-base font-semibold text-gray-800">{logo.label}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}