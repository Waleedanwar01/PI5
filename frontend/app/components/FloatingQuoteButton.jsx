'use client';
import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { X, Shield } from 'lucide-react';
import ZipForm from './ZipForm.jsx';

export default function FloatingQuoteButton() {
    const [showZipModal, setShowZipModal] = useState(false);
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
            {/* Simple Floating Quote Button - Desktop */}
            <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block">
                <button
                    onClick={() => setShowZipModal(true)}
                    className="group bg-blue-600 text-white px-4 py-4 rounded-l-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    style={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                    }}
                >
                    <Shield className="w-4 h-4 animate-bounce group-hover:animate-spin" />
                    <div className="text-left">
                        <div className="font-bold text-xs">QUOTE</div>
                    </div>
                </button>
            </div>

            {/* Simple Mobile Floating Quote Button */}
            <div className="fixed bottom-4 right-4 z-40 lg:hidden">
                <button
                    onClick={() => setShowZipModal(true)}
                    className="group bg-blue-600 text-white px-4 py-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <Shield className="w-5 h-5 animate-bounce group-hover:animate-spin" />
                    <div className="text-left">
                        <div className="font-bold text-sm">QUOTE</div>
                    </div>
                </button>
            </div>

            {/* Enhanced Responsive ZIP Modal */}
            {showZipModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Enhanced backdrop with blur */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        onClick={() => setShowZipModal(false)}
                    ></div>
                    
                    {/* Simple Modal Content */}
                    <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
                        {/* Simple Close Button */}
                        <button
                            onClick={() => setShowZipModal(false)}
                            className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-10 text-gray-600"
                            aria-label="Close form"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        
                        {/* Simple Modal Content */}
                        <div className="p-8">
                            <div className="text-center mb-6">
                                {/* Simple icon */}
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
                                    <Shield className="w-8 h-8 text-white" />
                                </div>
                                
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Get Your Free Insurance Quote
                                </h2>
                                <p className="text-gray-600">Compare rates from top insurers in your area</p>
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
