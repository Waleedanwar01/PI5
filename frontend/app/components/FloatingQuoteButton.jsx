'use client';
import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { X, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import ZipForm from './ZipForm.jsx';

export default function FloatingQuoteButton() {
    const [showZipModal, setShowZipModal] = useState(false);
    const [isMobileExpanded, setIsMobileExpanded] = useState(false);
    const btnRef = useRef(null);
    const sparkleRef = useRef(null);
    const mobileBtnRef = useRef(null);
    const mobileSparkleRef = useRef(null);
    const pulseRef = useRef(null);

    // Simple GSAP animation for subtle floating effect
    useEffect(() => {
        const btn = btnRef.current;
        if (!btn || showZipModal) return;

        const tl = gsap.timeline({ repeat: -1, yoyo: true });
        tl.to(btn, { 
            y: -5,
            duration: 2, 
            ease: 'power2.inOut' 
        });

        return () => {
            tl.kill();
        };
    }, [showZipModal]);

    return (
        <>
            {/* Desktop Side Tab - Elegant & Non-intrusive */}
            <div className="fixed left-0 top-1/2 transform -translate-y-1/2 z-50 hidden lg:block">
                <button
                    onClick={() => setShowZipModal(true)}
                    className="group bg-gradient-to-b from-sky-600 to-blue-700 text-white py-6 px-3 rounded-none shadow-xl hover:shadow-2xl hover:from-sky-500 hover:to-blue-600 transition-all duration-300 flex flex-col items-center gap-3 border-y border-r border-white/20 backdrop-blur-sm"
                >
                    <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-md">
                        <Shield className="w-4 h-4 text-white" fill="currentColor" fillOpacity={0.2} />
                    </div>
                    <div style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }} className="font-bold text-xs tracking-widest uppercase py-2">
                        Get Quote
                    </div>
                </button>
            </div>

            {/* Mobile Floating Drawer - Side Attached */}
            <div 
                className={`fixed right-0 bottom-32 z-50 lg:hidden flex items-center transition-transform duration-300 ease-in-out ${isMobileExpanded ? 'translate-x-0' : 'translate-x-[calc(100%-3rem)]'}`}
            >
                {/* Toggle Handle */}
                <button
                    onClick={() => setIsMobileExpanded(!isMobileExpanded)}
                    className="bg-blue-600 hover:bg-blue-700 text-white w-12 h-12 flex items-center justify-center rounded-l-xl shadow-lg border-l border-y border-white/20 relative z-20"
                    aria-label={isMobileExpanded ? "Collapse quote button" : "Expand quote button"}
                >
                    {isMobileExpanded ? (
                        <ChevronRight className="w-6 h-6" />
                    ) : (
                        <div className="relative">
                            <ChevronLeft className="w-6 h-6 animate-pulse" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                        </div>
                    )}
                </button>

                {/* Main Button Content */}
                <button
                    onClick={() => setShowZipModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white h-12 px-5 flex items-center gap-2 shadow-lg border-y border-white/20 hover:from-blue-700 hover:to-blue-800 transition-colors"
                >
                    <Shield className="w-5 h-5" fill="currentColor" fillOpacity={0.2} />
                    <span className="font-bold text-sm whitespace-nowrap">Get Quote</span>
                </button>
            </div>

            {/* Enhanced Responsive ZIP Modal */}
            {showZipModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Enhanced backdrop with blur */}
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={() => setShowZipModal(false)}
                    ></div>
                    
                    {/* Simple Modal Content */}
                    <div className="relative bg-slate-900 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-800">
                        {/* Simple Close Button */}
                        <button
                            onClick={() => setShowZipModal(false)}
                            className="absolute top-4 right-4 w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center transition-colors z-10 text-slate-300"
                            aria-label="Close form"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        
                        {/* Simple Modal Content */}
                        <div className="p-8">
                            <div className="text-center mb-6">
                                {/* Simple icon */}
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-600 rounded-none mb-4 shadow-lg">
                                    <Shield className="w-8 h-8 text-white" />
                                </div>
                                
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    Get Your Free Insurance Quote
                                </h2>
                                <p className="text-slate-400">Compare rates from top insurers in your area</p>
                            </div>
                            
                            <ZipForm />
                            
                            {/* Simple Trust indicators */}
                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-500">Secure • Fast • No Obligation</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
