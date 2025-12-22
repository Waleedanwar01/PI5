'use client';
import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export default function BackToTop() {
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollTop;
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            // Calculate progress 0-100
            const scroll = windowHeight > 0 ? (totalScroll / windowHeight) * 100 : 0;
            
            setProgress(scroll);
            setVisible(totalScroll > 120);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Calculate dash offset for SVG circle (circumference approx 100 for pathLength=100)
    // We use a viewBox of 36x36. 
    // Radius ~ 16. Circumference = 2*pi*16 ≈ 100.5. 
    // It's easier to use strokeDasharray="100, 100" and rely on percentage.
    const strokeDashoffset = 100 - progress;

    return (
        <div 
            className={`fixed bottom-6 right-6 z-40 transition-all duration-500 transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}`}
        >
            <button
                onClick={scrollToTop}
                className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-xl hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1 active:scale-95"
                aria-label="Back to top"
            >
                {/* Progress Ring SVG */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-1" viewBox="0 0 36 36">
                    {/* Track */}
                    <path
                        className="text-gray-100"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                    />
                    {/* Indicator */}
                    <path
                        className="text-blue-600 drop-shadow-sm transition-all duration-100 ease-out"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray="100, 100"
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                    />
                </svg>

                {/* Inner Content */}
                <div className="relative z-10 flex items-center justify-center">
                    <ChevronUp className="w-6 h-6 text-blue-600 group-hover:text-blue-700 transition-colors" strokeWidth={2.5} />
                </div>
                
                {/* Hover Ripple/Glow */}
                <div className="absolute inset-0 rounded-full bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0 scale-75 group-hover:scale-90"></div>
            </button>
        </div>
    );
}
