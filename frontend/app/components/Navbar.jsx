'use client'
import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight, Phone, X, Menu } from 'lucide-react';
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
    const [zipNav, setZipNav] = useState('');
    
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

    // Fixed dropdown handling with improved event management
    const handleDropdownEnter = (slug) => {
        if (dropdownTimeoutRef.current) {
            clearTimeout(dropdownTimeoutRef.current);
        }
        setDropdownOpen(true);
        setActiveDropdown(slug);
    };

    const handleDropdownLeave = () => {
        dropdownTimeoutRef.current = setTimeout(() => {
            setDropdownOpen(false);
            setActiveDropdown(null);
        }, 200);
    };

    const toggleDropdownClick = (slug) => {
        if (dropdownOpen && activeDropdown === slug) {
            setDropdownOpen(false);
            setActiveDropdown(null);
        } else {
            handleDropdownEnter(slug);
        }
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
                        
                        {/* Left: Brand, Phone CTA and mobile toggle */}
                        <div className="flex min-w-0 items-center space-x-4">
                            <SmartLink href="/" className={"text-lg font-medium text-white"}>
                              {logoUrl ? (
                                <SmartImage src={logoUrl} alt={brand} style={{ height: `${logoHeight}px` }} className="w-auto" />
                              ) : (
                                <span>{brand}</span>
                              )}
                            </SmartLink>
                            {phone && (
                                <SmartLink
                                  href={`tel:${phone.replace(/\s+/g,'')}`}
                                  className="hidden lg:inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-blue-500/20"
                                >
                                  <Phone className="w-4 h-4 mr-2 transition-transform duration-300 hover:scale-110" />
                                  <span className="hidden xl:inline">{phone}</span>
                                  <span className="xl:hidden">Call Now</span>
                                </SmartLink>
                            )}
                            
                            {/* Mobile toggle moved to right side */}
                        </div>

                        {/* Right: Navigation Links or ZIP form on scroll */}
                        <div className="hidden md:flex ml-auto items-center">
                          {scrolled ? (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                const clean = (zipNav || '').replace(/\D/g, '').slice(0, 5);
                                if (clean.length === 5) {
                                  if (typeof window !== 'undefined') {
                                    window.location.href = `/quotes?zip=${encodeURIComponent(clean)}`;
                                  }
                                }
                              }}
                              className="flex items-center gap-2"
                            >
                              <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z"/>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22s8-7.333 8-13a8 8 0 10-16 0c0 5.667 8 13 8 13z"/>
                                </svg>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={5}
                                  value={zipNav}
                                  onChange={(e) => setZipNav(e.target.value.replace(/\D/g, '').slice(0,5))}
                                  placeholder="ZIP"
                                  className="pl-9 pr-3 py-1.5 w-28 text-xs italic rounded-md border border-white/20 bg-white/10 text-white placeholder-white/70 focus:outline-none"
                                />
                              </div>
                              <button type="submit" className="btn-blue px-3 py-1.5 text-xs rounded-md">
                                Get Quotes
                              </button>
                            </form>
                          ) : (
                            <ul className="flex items-center gap-1 justify-end text-right">
                              {pagesData.map((p) => (
                                <li
                                  key={p.slug}
                                  className="relative flex-shrink-0"
                                  onMouseEnter={() => (p.has_dropdown || p.dropdownItems.length > 0) && handleDropdownEnter(p.slug)}
                                  onMouseLeave={handleDropdownLeave}
                                >
                                  {(p.has_dropdown || p.dropdownItems.length > 0) ? (
                                    <button
                                      onClick={() => toggleDropdownClick(p.slug)}
                                      className="nav-link inline-flex items-center gap-1 text-xs italic whitespace-nowrap py-1.5 px-2 text-gray-200 transition-all duration-300 hover:text-white hover:border-b-2 hover:border-blue-400 !bg-transparent border-0 cursor-pointer"
                                    >
                                      <span>{p.displayName || p.name}</span>
                                      <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${dropdownOpen && activeDropdown === p.slug ? 'rotate-180' : ''}`} />
                                    </button>
                                  ) : (
                                    <SmartLink
                                      href={`/${p.slug}`}
                                      className="nav-link inline-flex items-center text-xs italic whitespace-nowrap py-1.5 px-2 text-gray-200 transition-all duration-300 hover:text-white hover:border-b-2 hover:border-blue-400 no-underline"
                                    >
                                      <span>{p.displayName || p.name}</span>
                                    </SmartLink>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Mobile right: ZIP compact form (on scroll) + toggle */}
                        <div className="flex md:hidden items-center ml-auto gap-2">
                          {scrolled && (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                const clean = (zipNav || '').replace(/\D/g, '').slice(0, 5);
                                if (clean.length === 5 && typeof window !== 'undefined') {
                                  window.location.href = `/quotes?zip=${encodeURIComponent(clean)}`;
                                }
                              }}
                              className="flex items-center gap-2"
                            >
                              <div className="relative">
                                <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z"/>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22s8-7.333 8-13a8 8 0 10-16 0c0 5.667 8 13 8 13z"/>
                                </svg>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={5}
                                  value={zipNav}
                                  onChange={(e) => setZipNav(e.target.value.replace(/\D/g, '').slice(0,5))}
                                  placeholder="ZIP"
                                  className="pl-7 pr-2 py-1 w-24 text-xs italic rounded-md border border-white/30 bg-white/10 text-white placeholder-white/70 focus:outline-none"
                                />
                              </div>
                              <button type="submit" className="btn-blue px-2 py-1 text-xs rounded-md">Go</button>
                            </form>
                          )}
                          <button
                            onClick={toggleMobileMenu}
                            className="relative text-white p-3"
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
                        
                        {/* Right: (moved brand to left; keep empty to align links right) */}
                        <div className="hidden" />

                    </div>
                </div>

                {dropdownOpen && activeDropdown && (
                    <div
                        className="absolute left-0 right-0 bg-white shadow-xl border-b-2 border-blue-500 z-50"
                        style={{ top: '100%' }}
                        onMouseEnter={() => handleDropdownEnter(activeDropdown)}
                        onMouseLeave={handleDropdownLeave}
                    >
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                            {(() => {
                                const currentPage = pagesData.find(p => p.slug === activeDropdown);
                                if (!currentPage || !currentPage.dropdownItems || currentPage.dropdownItems.length === 0) return null;
                                const items = currentPage.dropdownItems.slice(0, 24);
                                const cols = 4;
                                const perCol = 6;
                                const groups = Array.from({ length: cols }, (_, i) => items.slice(i * perCol, i * perCol + perCol)).filter(g => g.length > 0);
                                return (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {groups.map((group, gi) => (
                                            <div key={`col-${gi}`} className="border border-gray-200 rounded-lg p-4 bg-white">
                                                <ul className="space-y-2">
                                                    {group.map((item, index) => (
                                                        <li key={`${activeDropdown}-${gi}-${index}`}>
                                                            <SmartLink
                                                                href={`/articles/${item.slug}`}
                                                                className="flex items-center justify-between text-sm text-gray-800 hover:text-blue-700 hover:bg-gray-50 px-3 py-2 rounded-md transition-colors"
                                                                onClick={handleMobileLinkClick}
                                                            >
                                                                <span className="truncate">{item.name}</span>
                                                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                                            </SmartLink>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                            <div className="mt-6 text-center border-t border-gray-200 pt-6">
                                <SmartLink
                                    href="/articles"
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                    onClick={handleMobileLinkClick}
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </SmartLink>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Enhanced Mobile Menu Overlay with GSAP Animation */}
            {isMobileMenuOpen && (
                <div ref={mobileMenuRef} className="md:hidden fixed inset-0 bg-slate-900 text-white z-40 overflow-y-auto">
                    {/* Mobile Menu Header */}
                    <div className="flex justify-between items-center h-16 px-4 border-b border-slate-700 sticky top-0 bg-slate-900 text-white z-50">
                        <SmartLink
                            href="/"
                            onClick={handleMobileLinkClick}
                            className="font-medium text-white text-xl tracking-tight flex items-center space-x-2"
                        >
                            {logoUrl ? (
                                <SmartImage src={logoUrl} alt={brand} style={{ height: `${logoHeight}px` }} className="w-auto" />
                            ) : (
                                <span className="transition-colors duration-300">{brand}</span>
                            )}
                        </SmartLink>
                        <button
                            onClick={toggleMobileMenu}
                            className="text-white p-3"
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
                            className="flex justify-between items-center w-full py-4 text-lg font-normal text-white transition-colors duration-200 px-3 bg-transparent hover:bg-white/10"
                        >
                            <span className="transition-colors duration-300">{p.name}</span>
                            <ChevronDown className={`w-5 h-5 transition-all duration-300 ${mobileOpenDropdown === p.slug ? 'rotate-180' : ''}`} />
                        </button>
                        {mobileOpenDropdown === p.slug ? (
                          <ul className="pl-2 pb-4 space-y-3 grid grid-cols-1 gap-2">
                              {p.dropdownItems?.map((item, itemIndex) => (
                                  <li key={itemIndex} className="w-full">
                                      <SmartLink
                                          href={`/articles/${item.slug}`}
                                          className="block w-full py-3 px-4 text-base text-white transition-colors duration-200"
                                          onClick={handleMobileLinkClick}
                                          style={{ animationDelay: `${itemIndex * 100}ms` }}
                                      >
                                          <div className="flex items-center justify-between">
                                              <span className="font-normal transition-colors duration-200">{item.name}</span>
                                          </div>
                                      </SmartLink>
                                  </li>
                              ))}
                          </ul>
                        ) : null}
                    </div>
                ) : (
                    <SmartLink
                        href={`/${p.slug}`}
                        className="block py-4 text-lg font-normal text-white transition-colors duration-200 px-3 bg-transparent hover:bg-white/10 rounded-lg"
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
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <h3 className="text-lg font-bold text-white mb-4 text-center flex items-center justify-center">
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
            className="group block py-4 text-lg font-normal text-white hover:text-blue-200 transition-all duration-300 rounded-xl hover:bg-white/10 px-3 transform hover:scale-102"
            onClick={handleMobileLinkClick}
        >
            <div className="flex items-center">
                <svg className="w-5 h-5 mr-3 transition-colors duration-300 group-hover:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="group flex items-center justify-center w-full text-white border-2 border-white/30 px-4 py-4 rounded-xl text-lg font-bold hover:bg-white/10 transition-all duration-300 transform hover:scale-105 relative overflow-hidden backdrop-blur-sm"
                onClick={handleMobileLinkClick}
            >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Phone className="w-5 h-5 mr-3 relative z-10 transition-transform duration-300 group-hover:scale-110" />
                <span className="relative z-10 transition-colors duration-300 group-hover:text-white/90">Call Us: {phone}</span>
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
            className="absolute top-4 right-4 w-10 h-10 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors z-10 text-blue-600"
            aria-label="Close form"
        >
            <X className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </X>
        </button>
        
        {/* Modal Content */}
        <div className="p-8">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-6 shadow-lg">
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
