'use client';

import React, { useEffect, useRef } from 'react';
import { MapPin, FileText, Banknote } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function HowItWorks() {
  const carRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const car = carRef.current;
    
    if (car) {
      // Animate from left (-300px) to right side (parking)
      gsap.fromTo(car, 
        { x: -300 }, 
        { 
          x: () => {
            const width = window.innerWidth;
            const isMobile = width < 768;
            // Ensure car stays within screen bounds
            // Mobile car width ~128px, Desktop ~192px
            const safeLimit = width - (isMobile ? 140 : 220); 
            const preferred = width * 0.8;
            return Math.min(preferred, safeLimit);
          }, 
          duration: 5, 
          ease: "power2.out", // Slow down as it "parks"
          repeat: 0, // Run once
          delay: 0.5,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%", // Start when section enters view
            toggleActions: "restart none none reset", // Restart on enter, reset on leave back
            invalidateOnRefresh: true // Recalculate values on resize
          }
        }
      );
    }
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const steps = [
    {
      id: 1,
      title: "Enter ZIP Code",
      icon: <MapPin className="w-10 h-10 text-white" strokeWidth={1.5} />,
      color: "bg-[#548CA8]" // Custom muted teal/blue
    },
    {
      id: 2,
      title: "Vehicle Details",
      icon: <FileText className="w-10 h-10 text-white" strokeWidth={1.5} />,
      color: "bg-[#548CA8]"
    },
    {
      id: 3,
      title: "Compare and Save!",
      icon: <Banknote className="w-10 h-10 text-white" strokeWidth={1.5} />,
      color: "bg-[#548CA8]"
    }
  ];

  return (
    <section ref={containerRef} className="relative py-20 overflow-hidden bg-slate-50">
       {/* Curvy Background Top (SVG Wave) - Optional, but "curvy bg" requested */}
       <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180">
          <svg className="relative block w-[calc(100%+1.3px)] h-[50px] md:h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-white"></path>
          </svg>
       </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-8 relative z-10 mt-10">
        
        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center text-center group">
              {/* Circle Icon */}
              <div className={`w-24 h-24 rounded-full ${step.color} flex items-center justify-center mb-6 shadow-xl transform transition-transform duration-300 hover:scale-110`}>
                {step.icon}
              </div>
              
              {/* Step Label */}
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 border-b-2 border-slate-200 pb-1">
                STEP {step.id}
              </h3>
              
              {/* Title */}
              <h4 className="text-2xl font-medium text-slate-600">
                {step.title}
              </h4>
            </div>
          ))}
        </div>

        {/* Call to Action Text */}
        <div className="text-center mb-16 relative z-10">
          <h2 className="text-xl md:text-3xl font-normal text-slate-700 leading-relaxed">
            Stop overpaying for coverage – <span className="hidden md:inline"> </span>
            <span 
              onClick={handleScrollToTop}
              className="border-b-2 border-[#548CA8] pb-0.5 text-slate-800 font-medium cursor-pointer hover:text-[#548CA8] transition-colors"
            >
              enter your ZIP code to COMPARE and SAVE!
            </span>
          </h2>
        </div>

      </div>

      {/* Animated Car Container */}
      <div className="absolute bottom-0 w-full h-24 pointer-events-none overflow-hidden">
        {/* Curvy Bottom Background (White Wave) */}
         <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10">
            <svg className="relative block w-[calc(100%+1.3px)] h-[60px] md:h-[120px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" className="fill-white opacity-80"></path>
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-white opacity-40 transform translate-y-full"></path>
            </svg>
         </div>

        {/* Car SVG */}
        <div 
          ref={carRef} 
          className="absolute bottom-2 md:bottom-6 left-0 w-32 md:w-48 text-slate-500 z-20"
          style={{ willChange: 'transform' }}
        >
          {/* Simple Clean Car Vector */}
          <svg viewBox="0 0 512 250" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
              <g transform="scale(1,1)">
                  {/* Body */}
                  <path d="M460,130 C460,130 430,70 360,70 L180,70 C130,70 100,100 80,130 L40,130 C20,130 10,140 10,160 L10,190 C10,200 20,210 30,210 L60,210" fill="none" stroke="#475569" strokeWidth="12" strokeLinecap="round"/>
                  <path d="M460,130 L490,130 C500,130 510,140 510,160 L510,190 C510,200 500,210 490,210 L450,210" fill="none" stroke="#475569" strokeWidth="12" strokeLinecap="round"/>
                  <path d="M60,210 L140,210" fill="none" stroke="#475569" strokeWidth="12"/>
                  <path d="M220,210 L370,210" fill="none" stroke="#475569" strokeWidth="12"/>
                  
                  {/* Windows */}
                  <path d="M185,85 L350,85 C390,85 410,120 415,130 L130,130 C135,115 155,85 185,85 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="6"/>
                  
                  {/* Wheels */}
                  <circle cx="100" cy="210" r="40" fill="#334155" stroke="#1e293b" strokeWidth="8"/>
                  <circle cx="100" cy="210" r="15" fill="#94a3b8"/>
                  
                  <circle cx="410" cy="210" r="40" fill="#334155" stroke="#1e293b" strokeWidth="8"/>
                  <circle cx="410" cy="210" r="15" fill="#94a3b8"/>
                  
                  {/* Lights */}
                  <path d="M490,145 L500,145 C505,145 508,150 508,155 L508,165 C508,170 505,175 500,175 L490,175" fill="#f59e0b" />
                  <path d="M20,145 L30,145 C35,145 38,150 38,155 L38,165 C38,170 35,175 30,175 L20,175" fill="#ef4444" />
              </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
