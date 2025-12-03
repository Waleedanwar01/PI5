'use client';
import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { X, Shield, Sparkles, TrendingUp } from 'lucide-react';
import ZipForm from './ZipForm.jsx';

export default function FloatingQuoteButton() {
    const [showZipModal, setShowZipModal] = useState(false);
    const btnRef = useRef(null);
    const sparkleRef = useRef(null);
    const mobileBtnRef = useRef(null);
    const mobileSparkleRef = useRef(null);
    const pulseRef = useRef(null);

    // Enhanced GSAP animations for attention
    useEffect(() => {
        const btns = [btnRef.current, mobileBtnRef.current].filter(Boolean);
        const sparkles = [sparkleRef.current, mobileSparkleRef.current].filter(Boolean);
        const pulseElements = [pulseRef.current].filter(Boolean);
        if (btns.length === 0 && sparkles.length === 0 && pulseElements.length === 0) return;

        const timelines = [];

        // Enhanced button animations with floating effect
        btns.forEach((el, index) => {
            const tl = gsap.timeline({ repeat: -1, yoyo: true });
            tl.to(el, { 
                x: index === 0 ? 10 : 0, 
                y: index === 0 ? 0 : -5,
                rotation: index === 0 ? 2 : 0,
                duration: 2, 
                ease: 'power2.inOut' 
            })
            .to(el, { 
                scale: 1.05, 
                duration: 1.5, 
                ease: 'power1.inOut' 
            }, 0);
            tl.paused(showZipModal);
            timelines.push(tl);
        });

        // Enhanced sparkle animations
        sparkles.forEach((sp, index) => {
            gsap.set(sp, { opacity: 0.0, scale: 0 });
            const sTl = gsap.timeline({ repeat: -1, delay: index * 0.5 });
            sTl
              .to(sp, { opacity: 1, scale: 1.2, duration: 0.3, ease: 'back.out(1.7)' })
              .to(sp, { 
                x: gsap.utils.random(-8, 8), 
                y: gsap.utils.random(-8, -2), 
                duration: 1, 
                ease: 'power2.inOut' 
              })
              .to(sp, { 
                opacity: 0, 
                scale: 0.3, 
                duration: 0.4, 
                ease: 'power2.in' 
              });
            sTl.paused(showZipModal);
            timelines.push(sTl);
        });

        // Pulse ring animation
        pulseElements.forEach((el) => {
            if (el) {
                const pulseTl = gsap.timeline({ repeat: -1 });
                pulseTl
                  .fromTo(el, 
                    { scale: 0.8, opacity: 0.7 },
                    { scale: 1.2, opacity: 0, duration: 2, ease: 'power2.out' }
                  );
                pulseTl.paused(showZipModal);
                timelines.push(pulseTl);
            }
        });

        return () => {
            timelines.forEach((t) => t.kill());
        };
    }, [showZipModal]);

    return (
        <>
            {/* Smaller and Better Designed Floating Quote Button - Desktop */}
            <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block">
                <div className="relative group">
                    {/* Pulsing background ring */}
                    <div 
                        ref={pulseRef}
                        className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-md opacity-50"
                    ></div>
                    
                    <button
                        onClick={() => setShowZipModal(true)}
                        ref={btnRef}
                        aria-label="Get insurance quote"
                        className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-red-600 text-white px-4 py-4 rounded-l-xl shadow-xl hover:from-orange-700 hover:via-orange-600 hover:to-red-700 transition-all duration-300 flex items-center gap-2 group transform hover:scale-105 ring-1 ring-white/30 border border-white/20 backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
                        style={{
                            writingMode: 'vertical-rl',
                            textOrientation: 'mixed',
                        }}
                    >
                        {/* Icon with smaller size */}
                        <div className="relative">
                            <Shield className="w-4 h-4 text-white drop-shadow-lg group-hover:rotate-12 transition-transform duration-300" />
                            <div className="absolute -top-1 -right-1">
                                <Sparkles className="w-2 h-2 text-yellow-300 animate-pulse" />
                            </div>
                        </div>
                        
                        {/* Text content */}
                        <div className="text-left">
                            <div className="font-bold text-xs tracking-wide drop-shadow-lg">QUOTE</div>
                        </div>
                        
                        {/* Smaller savings badge */}
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                            <div className="flex items-center gap-0.5">
                                <TrendingUp className="w-2 h-2" />
                                40%
                            </div>
                        </div>
                        
                        {/* Tooltip */}
                        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 whitespace-nowrap">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-0.5 w-0 h-0 border-r-3 border-r-gray-900 border-t-1.5 border-b-1.5 border-t-transparent border-b-transparent"></div>
                            Get instant quotes
                        </div>
                        
                        {/* Smaller sparkle effect */}
                        <div ref={sparkleRef} className="absolute -top-1 -right-1">
                            <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full shadow-[0_0_6px_rgba(255,255,0,0.8)]"></div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Smaller and Better Mobile Floating Quote Button */}
            <div className="fixed bottom-4 right-4 z-40 lg:hidden">
                <div className="relative group">
                    {/* Mobile pulse ring */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-md opacity-50 animate-ping"></div>
                    
                    <button
                        onClick={() => setShowZipModal(true)}
                        ref={mobileBtnRef}
                        aria-label="Get insurance quote"
                        className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-red-600 text-white px-4 py-4 rounded-full shadow-xl hover:from-orange-700 hover:via-orange-600 hover:to-red-700 transition-all duration-300 flex items-center gap-2 group hover:scale-105 ring-1 ring-white/30 border border-white/20 backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
                    >
                        {/* Smaller icon */}
                        <div className="relative">
                            <Shield className="w-5 h-5 text-white drop-shadow-lg group-hover:rotate-12 transition-transform duration-300" />
                            <div className="absolute -top-0.5 -right-0.5">
                                <Sparkles className="w-2.5 h-2.5 text-yellow-300 animate-pulse" />
                            </div>
                        </div>
                        
                        {/* Text content */}
                        <div className="text-left">
                            <div className="font-bold text-sm tracking-wide drop-shadow-lg">QUOTE</div>
                        </div>
                        
                        {/* Mobile savings badge */}
                        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
                            <div className="flex items-center gap-0.5">
                                <TrendingUp className="w-2 h-2" />
                            </div>
                        </div>
                        
                        {/* Mobile sparkle */}
                        <div ref={mobileSparkleRef} className="absolute -top-0.5 -right-0.5">
                            <div className="w-1 h-1 bg-yellow-300 rounded-full shadow-[0_0_4px_rgba(255,255,0,0.8)]"></div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Enhanced Responsive ZIP Modal */}
            {showZipModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Enhanced backdrop with blur */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        onClick={() => setShowZipModal(false)}
                    ></div>
                    
                    {/* Enhanced Modal Content */}
                    <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
                        {/* Close Button with enhanced styling */}
                        <button
                            onClick={() => setShowZipModal(false)}
                            className="absolute top-6 right-6 w-12 h-12 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-orange-100 hover:to-orange-200 rounded-full flex items-center justify-center transition-all duration-300 z-10 text-gray-600 hover:text-orange-600 shadow-lg hover:shadow-xl"
                            aria-label="Close form"
                        >
                            <X className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </X>
                        </button>
                        
                        {/* Enhanced Modal Content */}
                        <div className="p-8 md:p-10">
                            <div className="text-center mb-8">
                                {/* Enhanced icon with multiple gradients */}
                                <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-full mb-6 shadow-2xl">
                                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-full animate-pulse opacity-60"></div>
                                    <Shield className="w-12 h-12 text-white drop-shadow-lg relative z-10" />
                                    <div className="absolute -top-2 -right-2">
                                        <Sparkles className="w-6 h-6 text-yellow-300 animate-spin" style={{ animationDuration: '3s' }} />
                                    </div>
                                </div>
                                
                                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
                                    Get Your Free
                                    <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"> Insurance Quote</span>
                                </h2>
                                <p className="text-lg md:text-xl text-gray-600 max-w-md mx-auto">Compare rates from 50+ top insurers in your area</p>
                            </div>
                            
                            <ZipForm />
                            
                            {/* Enhanced Trust indicators */}
                            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 md:gap-6">
                                <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 rounded-2xl border border-green-200 shadow-sm">
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                        <Shield className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-green-800 text-sm">100% Secure</div>
                                        <div className="text-green-600 text-xs">SHA-256 Encryption</div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-2xl border border-blue-200 shadow-sm">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                        <TrendingUp className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-blue-800 text-sm">Save 40%</div>
                                        <div className="text-blue-600 text-xs">Average Savings</div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 rounded-2xl border border-purple-200 shadow-sm">
                                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-purple-800 text-sm">Instant Results</div>
                                        <div className="text-purple-600 text-xs">No Waiting</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}