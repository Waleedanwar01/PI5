'use client'
import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronDown, Phone, X, Menu } from 'lucide-react';
import SmartLink from './SmartLink.jsx';
import SmartImage from './SmartImage.jsx';
import ZipForm from './ZipForm.jsx';
import { getMediaUrl } from '../lib/config.js';
import { gsap } from 'gsap';

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [mobileOpenDropdown, setMobileOpenDropdown] = useState(null);
    
    // GSAP refs for animations
    const hamburgerRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const [phone, setPhone] = useState('');
    const [brand, setBrand] = useState('Car Insurance Comparison');
    const [logoUrl, setLogoUrl] = useState(null);
    const [logoHeight, setLogoHeight] = useState(32);
    const [siteConfig, setSiteConfig] = useState(null);
    const navbarRef = useRef(null);
    const dropdownTimeoutRef = useRef(null);
    const [scrolled, setScrolled] = useState(false);
    
    // Zip form modal state
    const [showZipModal, setShowZipModal] = useState(false);
    
    // Dynamic data from database
    const [pagesData, setPagesData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch site configuration data
    useEffect(() => {
        const versioned = (u, v) => {
            const url = String(u || '').trim();
            if (!url) return null;
            const sep = url.includes('?') ? '&' : '?';
            return v ? `${url}${sep}v=${encodeURIComponent(v)}` : url;
        };
        const fetchSiteConfig = async () => {
            try {
                const response = await fetch('/api/site-config/', { cache: 'no-store' });
                if (response.ok) {
                    const data = await response.json();
                    setSiteConfig(data);
                    
                    // Update component state with site config data
                    if (data.phone_number) setPhone(data.phone_number);
                    if (data.brand_name) setBrand(data.brand_name);
                    if (data.logo_url) setLogoUrl(versioned(getMediaUrl(data.logo_url), data.updated_at));
                    if (data.logo_height_px) setLogoHeight(data.logo_height_px);
                }
            } catch (error) {
                console.error('Error fetching site config:', error);
            }
        };

        fetchSiteConfig();
    }, []);

    // Fetch dynamic categories from database
    useEffect(() => {
        const fetchPagesData = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/pages-with-categories/?include_blogs=0', { cache: 'no-store' });
                if (response.ok) {
                    const data = await response.json();
                    // Transform ALL pages data from database
                    // Transform pages and then strictly map to the desired header tabs in exact order
                    const rawPages = (data.pages || [])
                      .map(page => ({
                        slug: String(page.slug || '').toLowerCase(),
                        name: page.name,
                        has_dropdown: !!page.has_dropdown,
                        dropdownItems: (page.categories || []).map(category => ({
                          name: category.name,
                          slug: category.slug,
                          blogs: []
                        }))
                      }));

                    // Desired tabs and order as per screenshot
                    const orderMap = {
                      companies: 0,
                      state: 1,
                      vehicle: 2,
                      shopping: 3,
                      resources: 4,
                    };

                    // Filter to only the desired set and sort to match the screenshot
                    const filtered = rawPages
                      .filter(p => Object.keys(orderMap).some(k => p.slug.includes(k)))
                      .sort((a, b) => {
                        const ao = Object.keys(orderMap).find(k => a.slug.includes(k));
                        const bo = Object.keys(orderMap).find(k => b.slug.includes(k));
                        return (orderMap[ao] ?? 999) - (orderMap[bo] ?? 999);
                      });

                    // Fallback: if backend names differ, enforce display labels to match screenshot
                    const displayName = (p) => {
                      if (p.slug.includes('companies')) return 'Companies';
                      if (p.slug.includes('state')) return 'Rates by State';
                      if (p.slug.includes('vehicle')) return 'Rates by Vehicle';
                      if (p.slug.includes('shopping')) return 'Shopping';
                      if (p.slug.includes('resources')) return 'Resources';
                      return p.name || '';
                    };

                    const pages = filtered.map(p => ({ ...p, displayName: displayName(p) }));
                    setPagesData(pages);
                } else {
                    console.error('Failed to fetch pages data:', response.status);
                    setPagesData([]);
                }
            } catch (error) {
                console.error('Error fetching pages data:', error);
                setPagesData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPagesData();
    }, []);

    const pathname = usePathname();

    // Scroll effect for navbar
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 10;
            setScrolled(isScrolled);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check initial position
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Toggle mobile menu with GSAP animations
    const toggleMobileMenu = () => {
        const newState = !isMobileMenuOpen;
        setIsMobileMenuOpen(newState);
        
        if (newState) {
            // Animate hamburger to X
            gsap.to(hamburgerRef.current, {
                duration: 0.3,
                ease: "power2.out",
                rotation: 180,
                scale: 1.1
            });
            
            // Animate mobile menu slide in
            gsap.fromTo(mobileMenuRef.current, 
                { 
                    x: "100%", 
                    opacity: 0,
                    scale: 0.9
                },
                {
                    x: "0%",
                    opacity: 1,
                    scale: 1,
                    duration: 0.4,
                    ease: "power3.out"
                }
            );
        } else {
            // Animate hamburger back to menu
            gsap.to(hamburgerRef.current, {
                duration: 0.3,
                ease: "power2.out",
                rotation: 0,
                scale: 1
            });
            
            // Animate mobile menu slide out
            gsap.to(mobileMenuRef.current, {
                x: "100%",
                opacity: 0,
                scale: 0.9,
                duration: 0.4,
                ease: "power3.in",
                onComplete: () => {
                    setIsMobileMenuOpen(false);
                }
            });
        }
    };

    // Close mobile menu when clicking a link
    const handleMobileLinkClick = () => {
        setIsMobileMenuOpen(false);
        setDropdownOpen(false);
        setActiveDropdown(null);
        setMobileOpenDropdown(null);
    };

    // GSAP dropdown handling with smooth animations
    const handleDropdownEnter = (slug) => {
        if (dropdownTimeoutRef.current) {
            clearTimeout(dropdownTimeoutRef.current);
        }
        setDropdownOpen(true);
        setActiveDropdown(slug);
        
        // Animate dropdown with GSAP
        const dropdownElement = document.querySelector('.dropdown-menu');
        if (dropdownElement) {
            gsap.fromTo(dropdownElement, 
                {
                    height: 0,
                    opacity: 0,
                    y: -20
                },
                {
                    height: "auto",
                    opacity: 1,
                    y: 0,
                    duration: 0.3,
                    ease: "power3.out"
                }
            );
        }
    };

    const handleDropdownLeave = () => {
        dropdownTimeoutRef.current = setTimeout(() => {
            setDropdownOpen(false);
            setActiveDropdown(null);
            
            // Animate dropdown close with GSAP
            const dropdownElement = document.querySelector('.dropdown-menu');
            if (dropdownElement) {
                gsap.to(dropdownElement, {
                    height: 0,
                    opacity: 0,
                    y: -20,
                    duration: 0.2,
                    ease: "power3.in"
                });
            }
        }, 100);
    };

    // Mobile dropdown toggle handler
    const handleMobileDropdownToggle = (slug) => {
        setMobileOpenDropdown(mobileOpenDropdown === slug ? null : slug);
    };

    // Render navbar regardless of loading; links populate progressively

    return (
        <>
            {/* Main Navbar: simplified styling to match screenshot */}
            <nav
                ref={navbarRef}
                className={'fixed top-0 left-0 right-0 z-50 text-white shadow-sm'}
                style={{ backgroundColor: 'var(--brand-blue)' }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        
                        {/* Left: Logo/Brand (simple) */}
                        <div className="flex items-center">
                          <SmartLink href="/" className={"text-xl font-bold text-white"}>
                            {logoUrl ? (
                              <SmartImage src={logoUrl} alt={brand} style={{ height: `${logoHeight}px` }} className="w-auto" />
                            ) : (
                              <span>{brand}</span>
                            )}
                          </SmartLink>
                        </div>

                        {/* Center: Navigation Links */}
                        <div className="hidden md:flex ml-auto">
                            <ul className="flex items-center gap-1">
                                {pagesData.map((p) => (
                                    <li
                                        key={p.slug}
                                        className="relative flex-shrink-0"
                                        onMouseEnter={() => (p.has_dropdown || p.dropdownItems.length > 0) && handleDropdownEnter(p.slug)}
                                        onMouseLeave={handleDropdownLeave}
                                    >
                                        {(p.has_dropdown || p.dropdownItems.length > 0) ? (
                                          <button className="nav-link inline-flex items-center gap-1 text-sm font-semibold whitespace-nowrap py-2 px-3 text-white transition-all duration-300 hover:text-white hover:border-b-2 hover:border-orange-500">
                                            <span>{p.displayName || p.name}</span>
                                            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${dropdownOpen && activeDropdown === p.slug ? 'rotate-180' : ''}`} />
                                          </button>
                                        ) : (
                                          <SmartLink
                                            href={`/${p.slug}`}
                                            className="nav-link inline-flex items-center text-sm font-semibold whitespace-nowrap py-2 px-3 text-white transition-all duration-300 hover:text-white hover:border-b-2 hover:border-orange-500"
                                          >
                                            <span>{p.displayName || p.name}</span>
                                          </SmartLink>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* Right: Phone CTA and mobile toggle */}
                        <div className="flex min-w-0 justify-end items-center space-x-4 ml-4">
                            {phone && (
                                <SmartLink
                                  href={`tel:${phone.replace(/\s+/g,'')}`}
                                  className="hidden lg:inline-flex items-center bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-orange-500/20"
                                >
                                  <Phone className="w-4 h-4 mr-2 transition-transform duration-300 hover:scale-110" />
                                  <span className="hidden xl:inline">{phone}</span>
                                  <span className="xl:hidden">Call Now</span>
                                </SmartLink>
                            )}
                            
                            {/* Hamburger Icon for Mobile with GSAP animations */}
                            <div className="flex md:hidden">
                                <button
                                    onClick={toggleMobileMenu}
                                    className="relative text-white p-3 rounded hover:bg-white/10"
                                    aria-expanded={isMobileMenuOpen}
                                    aria-controls="mobile-menu"
                                >
                                    <div ref={hamburgerRef} className="relative w-6 h-6 flex items-center justify-center">
                                        {isMobileMenuOpen ? (
                                            <X className="w-6 h-6" aria-label="Close menu" />
                                        ) : (
                                            <div className="space-y-1.5">
                                                <div className="w-5 h-0.5 bg-current"></div>
                                                <div className="w-4 h-0.5 bg-current"></div>
                                                <div className="w-5 h-0.5 bg-current"></div>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Dropdown Menu with GSAP Animation */}
                <div 
                    className={`dropdown-menu absolute left-0 right-0 bg-white shadow-lg border-b-2 border-orange-500 z-50 transition-all duration-300 overflow-hidden ${
                        dropdownOpen && activeDropdown ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                    style={{ top: '100%' }}
                    onMouseEnter={() => handleDropdownEnter(activeDropdown)}
                    onMouseLeave={handleDropdownLeave}
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {(() => {
                                const currentPage = pagesData.find(p => p.slug === activeDropdown);
                                if (!currentPage || !currentPage.dropdownItems || currentPage.dropdownItems.length === 0) return null;
                                
                                return currentPage.dropdownItems.slice(0, 25).map((item, index) => (
                                    <SmartLink
                                        key={`${activeDropdown}-${index}`}
                                        href={`/articles/${item.slug}`}
                                        className="block text-sm text-gray-700 hover:text-orange-600 hover:border-b-2 hover:border-orange-400 px-3 py-2 transition-all duration-200"
                                        onClick={handleMobileLinkClick}
                                    >
                                        {item.name}
                                    </SmartLink>
                                ));
                            })()}
                        </div>
                        
                        {/* View All Button */}
                        <div className="mt-4 text-center border-t border-gray-200 pt-4">
                            <SmartLink
                                href="/articles"
                                className="inline-flex items-center px-6 py-2 bg-orange-600 text-white font-semibold rounded hover:bg-orange-700 transition-colors duration-200"
                                onClick={handleMobileLinkClick}
                            >
                                View All Articles
                            </SmartLink>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Enhanced Mobile Menu Overlay with GSAP Animation */}
            {isMobileMenuOpen && (
                <div ref={mobileMenuRef} className="md:hidden fixed inset-0 bg-white z-40 overflow-y-auto">
                    {/* Mobile Menu Header */}
                    <div className="flex justify-between items-center h-16 px-4 border-b border-gray-200 sticky top-0 bg-white z-50">
                        <SmartLink
                            href="/"
                            onClick={handleMobileLinkClick}
                            className="font-bold text-gray-900 text-xl tracking-tight flex items-center space-x-2"
                        >
                            {logoUrl ? (
                                <SmartImage src={logoUrl} alt={brand} style={{ height: `${logoHeight}px` }} className="w-auto" />
                            ) : (
                                <span className="transition-colors duration-300">{brand}</span>
                            )}
                        </SmartLink>
                        <button
                            onClick={toggleMobileMenu}
                            className="text-gray-500 p-3 rounded"
                            aria-label="Close mobile menu"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
<ul className="space-y-1 p-4 animate-in fade-in duration-500">
    {pagesData.map((p, index) => (
        <li key={p.slug} style={{ animationDelay: `${index * 100}ms` }}>
            <div className='border-b border-gray-200 mb-6 animate-in slide-in-from-left duration-500'>
                {(p.has_dropdown || p.dropdownItems.length > 0) ? (
                    <div className="group">
                        <button
                            onClick={() => handleMobileDropdownToggle(p.slug)}
                            className="flex justify-between items-center w-full py-4 text-lg font-bold text-gray-800 hover:text-gray-700 transition-colors duration-200 rounded-xl px-3 hover:border-b hover:border-gray-300"
                        >
                            <span className="transition-colors duration-300">{p.name}</span>
                            <ChevronDown className={`w-5 h-5 transition-all duration-300 ${mobileOpenDropdown === p.slug ? 'rotate-180 text-gray-700' : ''}`} />
                        </button>
                        <div className={`mobile-dropdown ${mobileOpenDropdown === p.slug ? 'open' : ''}`}>
                            <ul className="pl-2 pb-4 space-y-3 grid grid-cols-1 gap-2">
                                {p.dropdownItems?.map((item, itemIndex) => (
                                    <li key={itemIndex} className="w-full">
                                        <SmartLink
                                            href={`/articles/${item.slug}`}
                                            className="block w-full py-3 px-4 text-base text-gray-700 hover:text-gray-800 rounded-xl transition-colors duration-200 border border-gray-100 hover:border-gray-300 hover:border-b"
                                            onClick={handleMobileLinkClick}
                                            style={{ animationDelay: `${itemIndex * 100}ms` }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold transition-colors duration-200">{item.name}</span>
                                            </div>
                                        </SmartLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <SmartLink
                        href={`/${p.slug}`}
                        className="block py-4 text-lg font-semibold text-gray-800 hover:text-gray-700 transition-colors duration-200 rounded-xl px-3 nav-hover hover:border-b hover:border-gray-300"
                        onClick={handleMobileLinkClick}
                    >
                        <span className="relative z-10 transition-colors duration-200">{p.name}</span>
                    </SmartLink>
                )}
            </div>
        </li>
    ))}
    
    {/* Enhanced Action Items */}
    <li className="pt-6 animate-in slide-in-from-bottom duration-500" style={{ animationDelay: '300ms' }}>
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-6 border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <h3 className="text-lg font-bold text-orange-800 mb-4 text-center flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Get Your Free Quote
            </h3>
            <ZipForm />
        </div>
    </li>
    
    <li className="pt-4 animate-in slide-in-from-left duration-500" style={{ animationDelay: '400ms' }}>
        <SmartLink
            href="/contact"
            className="group block py-4 text-lg font-semibold text-gray-800 hover:text-orange-700 transition-all duration-300 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100/50 px-3 transform hover:scale-102"
            onClick={handleMobileLinkClick}
        >
            <div className="flex items-center">
                <svg className="w-5 h-5 mr-3 transition-colors duration-300 group-hover:text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="transition-colors duration-300">Contact</span>
            </div>
        </SmartLink>
    </li>

    {phone && (
        <li className="pt-4 animate-in slide-in-from-right duration-500" style={{ animationDelay: '500ms' }}>
            <SmartLink
                href={`tel:${phone.replace(/\s+/g,'')}`}
                className="group flex items-center justify-center w-full text-orange-700 border-2 border-orange-700 px-4 py-4 rounded-xl text-lg font-bold hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 transition-all duration-300 transform hover:scale-105 relative overflow-hidden"
                onClick={handleMobileLinkClick}
            >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600/0 via-orange-600/10 to-orange-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Phone className="w-5 h-5 mr-3 relative z-10 transition-transform duration-300 group-hover:scale-110" />
                <span className="relative z-10 transition-colors duration-300 group-hover:text-orange-800">Call Us: {phone}</span>
            </SmartLink>
        </li>
    )}
</ul>
</div>
)}

{/* Responsive ZIP Modal */}
{showZipModal && (
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Backdrop */}
    <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setShowZipModal(false)}
    ></div>
    
    {/* Modal Content */}
    <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
            onClick={() => setShowZipModal(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-orange-100 hover:bg-orange-200 rounded-full flex items-center justify-center transition-colors z-10 text-orange-600"
            aria-label="Close form"
        >
            <X className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </X>
        </button>
        
        {/* Modal Content */}
        <div className="p-8">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mb-6 shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Get Your Free Insurance Quote</h2>
                <p className="text-lg text-gray-600">Compare rates from top insurers in your area</p>
            </div>
            
            <ZipForm />
            
            {/* Enhanced Trust indicators */}
            <div className="mt-8 flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-full border border-green-200">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="font-semibold text-green-800">100% Secure</span>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-full border border-blue-200">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span className="font-semibold text-blue-800">Save 40%</span>
                </div>
                <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-full border border-purple-200">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="font-semibold text-purple-800">Instant Results</span>
                </div>
            </div>
        </div>
    </div>
</div>
)}
</>
);
}