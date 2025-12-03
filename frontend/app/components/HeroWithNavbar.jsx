"use client";
import React, { useState, useEffect, useRef } from "react";
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight, Phone, X, Menu } from 'lucide-react';
import SmartLink from './SmartLink.jsx';
import SmartImage from './SmartImage.jsx';
import ZipForm from './ZipForm.jsx';
import { getMediaUrl } from '../lib/config.js';
import { gsap } from 'gsap';

export default function HeroWithNavbar() {
  const [zip, setZip] = useState("");
  const [error, setError] = useState("");
  
  // Navbar state
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

  // Animated elements data
  const floatingElements = [
    { emoji: "🛡️", delay: "0s", position: "top-20 left-10" },
    { emoji: "💰", delay: "2s", position: "top-32 right-16" },
    { emoji: "⚡", delay: "4s", position: "top-40 left-1/4" },
    { emoji: "🏆", delay: "1s", position: "top-24 right-1/3" },
    { emoji: "🚗", delay: "3s", position: "top-48 left-3/4" },
    { emoji: "🔒", delay: "5s", position: "top-16 right-20" },
  ];

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

          // Desired tabs and order
          const orderMap = {
            companies: 0,
            state: 1,
            vehicle: 2,
            shopping: 3,
            resources: 4,
          };

          // Filter to only the desired set and sort
          const filtered = rawPages
            .filter(p => Object.keys(orderMap).some(k => p.slug.includes(k)))
            .sort((a, b) => {
              const ao = Object.keys(orderMap).find(k => a.slug.includes(k));
              const bo = Object.keys(orderMap).find(k => b.slug.includes(k));
              return (orderMap[ao] ?? 999) - (orderMap[bo] ?? 999);
            });

          // Fallback: enforce display labels
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

  // Fixed dropdown handling
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = zip.replace(/\D/g, "").slice(0, 5);
    if (clean.length === 5) {
      setError("");
      if (typeof window !== "undefined") {
        window.location.href = `/quotes?zip=${encodeURIComponent(clean)}`;
      }
    } else {
      setError("Please enter a valid 5-digit ZIP Code.");
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* NAVBAR INTEGRATED INTO HERO */}
      <nav
        ref={navbarRef}
        className="relative z-50 text-white shadow-sm"
        style={{ backgroundColor: 'rgba(30, 58, 138, 0.8)', backdropFilter: 'blur(10px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Logo/Brand */}
            <div className="flex items-center">
              <SmartLink href="/" className="text-xl font-medium text-white">
                {logoUrl ? (
                  <SmartImage src={logoUrl} alt={brand} style={{ height: `${logoHeight}px` }} className="w-auto" />
                ) : (
                  <span>{brand}</span>
                )}
              </SmartLink>
            </div>

            {/* Center: Navigation Links */}
            <div className="hidden md:flex ml-auto items-center">
              <ul className="flex items-center gap-1 justify-end text-right">
                {pagesData.map((p) => (
                  <li
                    key={p.slug}
                    className="relative flex-shrink-0"
                    onMouseEnter={() => (p.has_dropdown || p.dropdownItems.length > 0) && handleDropdownEnter(p.slug)}
                    onMouseLeave={handleDropdownLeave}
                  >
                    {(p.has_dropdown || p.dropdownItems.length > 0) ? (
                      <button onClick={() => toggleDropdownClick(p.slug)} className="nav-link inline-flex items-center gap-1 text-xs italic whitespace-nowrap py-1.5 px-2 text-white transition-all duration-300 hover:text-white hover:border-b-2 hover:border-blue-400 !bg-transparent border-0">
                        <span>{p.displayName || p.name}</span>
                        <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${dropdownOpen && activeDropdown === p.slug ? 'rotate-180' : ''}`} />
                      </button>
                    ) : (
                      <SmartLink
                        href={`/${p.slug}`}
                        className="nav-link inline-flex items-center text-xs italic whitespace-nowrap py-1.5 px-2 text-white transition-all duration-300 hover:text-white hover:border-b-2 hover:border-blue-400"
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
                  className="hidden lg:inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-blue-500/20"
                >
                  <Phone className="w-4 h-4 mr-2 transition-transform duration-300 hover:scale-110" />
                  <span className="hidden xl:inline">{phone}</span>
                  <span className="xl:hidden">Call Now</span>
                </SmartLink>
              )}
              
              {/* Hamburger Icon for Mobile */}
              <div className="flex md:hidden">
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
            </div>
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
                  View All Articles
                  <ChevronRight className="w-4 h-4" />
                </SmartLink>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* HERO CONTENT */}
      <div className="flex-1 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-white/90 text-sm font-medium">Trusted by 2M+ drivers</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-yellow-400 to-blue-500 bg-clip-text text-transparent">
                Save Big
              </span>
              <br />
              <span className="text-white">on Car Insurance</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl lg:text-2xl text-blue-100 mb-8 leading-relaxed max-w-2xl">
              Compare quotes from <span className="text-yellow-400 font-semibold">50+ top insurers</span> and find your perfect coverage in minutes.
            </p>

            {/* Key Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              {[
                { icon: "⚡", text: "2-minute quotes" },
                { icon: "💰", text: "Average $500+ savings" },
                { icon: "🛡️", text: "Compare 50+ insurers" }
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-white/90">
                  <span className="text-xl">{benefit.icon}</span>
                  <span className="font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* ZIP Code Form */}
            <form onSubmit={handleSubmit} className="max-w-lg mx-auto lg:mx-0">
              <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-2 shadow-2xl border border-white/20">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative flex-1">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22s8-7.333 8-13a8 8 0 10-16 0c0 5.667 8 13 8 13z"/>
                    </svg>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={5}
                      value={zip}
                      onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                      placeholder="Enter your ZIP code"
                      className="w-full pl-12 pr-4 py-4 text-gray-900 placeholder-gray-500 bg-transparent focus:outline-none text-left text-base font-medium"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl mt-2 sm:mt-0"
                  >
                    🚀 Get Quotes
                  </button>
                </div>
              </div>
              {error && (
                <p className="mt-3 text-sm text-red-300 bg-red-500/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-red-400/30">
                  {error}
                </p>
              )}
            </form>

            {/* Security Badge */}
            <div className="mt-6 flex items-center justify-center lg:justify-start gap-3 text-white/80">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-sm">Secured with SHA-256 encryption</span>
            </div>
          </div>

          {/* Right Content - Visual Elements */}
          <div className="relative lg:block hidden">
            {/* Central Insurance Icon */}
            <div className="relative mx-auto w-80 h-80">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute inset-4 bg-gradient-to-r from-yellow-400 to-blue-500 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
              
              {/* Main shield icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-8xl animate-bounce">🛡️</div>
              </div>

              {/* Floating elements around shield */}
              {floatingElements.map((element, index) => (
                <div
                  key={index}
                  className={`absolute ${element.position} text-3xl animate-float`}
                  style={{
                    animationDelay: element.delay,
                    animationDuration: '4s',
                  }}
                >
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 border border-white/30">
                    {element.emoji}
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Cards */}
            <div className="absolute -bottom-8 -left-8 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-yellow-400">$500+</div>
              <div className="text-white/80 text-sm">Average Savings</div>
            </div>

            <div className="absolute -top-8 -right-8 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-green-400">2min</div>
              <div className="text-white/80 text-sm">Quick Quote</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Menu Overlay */}
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
                <div className='border-b border-slate-700 mb-6 animate-in slide-in-from-left duration-500'>
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
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowZipModal(false)}></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowZipModal(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors z-10 text-blue-600"
              aria-label="Close form"
            >
              <X className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </X>
            </button>
            
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

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>

      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/10 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        {/* Animated waves at bottom */}
        <div className="absolute bottom-0 left-0 w-full h-32 overflow-hidden">
          <svg 
            className="absolute bottom-0 w-full h-full" 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none"
          >
            <path 
              d="M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z" 
              fill="url(#heroWaveGradient)"
              className="animate-pulse"
            />
            <defs>
              <linearGradient id="heroWaveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
                <stop offset="50%" stopColor="rgba(99, 102, 241, 0.2)" />
                <stop offset="100%" stopColor="rgba(139, 92, 246, 0.1)" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </section>
  );
}
