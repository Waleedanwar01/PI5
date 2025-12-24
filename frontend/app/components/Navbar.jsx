'use client'
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronRight, Phone, X, Menu } from 'lucide-react';
import SmartLink from './SmartLink.jsx';
import SmartImage from './SmartImage.jsx';
import SkeletonLoader from './SkeletonLoader.jsx';
import { gsap } from 'gsap';

export default function Navbar() {
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [mobileOpenDropdown, setMobileOpenDropdown] = useState(null);
    
    // GSAP refs for animations
    const hamburgerRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const overlayRef = useRef(null);
    const [phone, setPhone] = useState('');
    const [brand, setBrand] = useState('Car Insurance Comparison');
    const [logoUrl, setLogoUrl] = useState(null);
    const [logoHeight, setLogoHeight] = useState(32);
    const [siteConfig, setSiteConfig] = useState(null);
    const navbarRef = useRef(null);
    const dropdownTimeoutRef = useRef(null);
    const [scrolled, setScrolled] = useState(false);
    const [zip, setZip] = useState("");
    const [isFetching, setIsFetching] = useState(false);
    
    // Dynamic data from database
    const [pagesData, setPagesData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Cache helpers
    const loadCache = (key) => {
        if (typeof window === 'undefined') return null;
        try {
            const item = localStorage.getItem(key);
            if (!item) return null;
            const parsed = JSON.parse(item);
            // Optional: Check expiry (e.g. 1 hour)
            if (Date.now() - parsed.timestamp > 3600000) return null;
            return parsed.data;
        } catch (e) {
            return null;
        }
    };

    const saveCache = (key, data) => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(key, JSON.stringify({
                data,
                timestamp: Date.now()
            }));
        } catch (e) {}
    };

    // Fetch site configuration data
    useEffect(() => {
        const versioned = (u, v) => {
            const url = String(u || '').trim();
            if (!url) return null;
            const sep = url.includes('?') ? '&' : '?';
            return v ? `${url}${sep}v=${encodeURIComponent(v)}` : url;
        };

        const fetchWithRetry = async (url, options = {}, retries = 2) => {
            for (let attempt = 0; attempt <= retries; attempt++) {
                try {
                    const res = await fetch(url, options);
                    if (res.ok) return res;
                } catch {}
                await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
            }
            return fetch(url, options).catch(() => ({ ok: false }));
        };

        const updateSiteConfig = (data) => {
            setSiteConfig(data);
            if (data.phone_number) setPhone(data.phone_number);
            if (data.brand_name) setBrand(data.brand_name);
            // Hardcoded logo - ignoring admin logo_url
            // if (data.logo_url) setLogoUrl(versioned(getMediaUrl(data.logo_url), data.updated_at));
            if (data.logo_height_px) setLogoHeight(data.logo_height_px);
        };

        // Always set hardcoded logo
        setLogoUrl('/logos/Auto-Insure-Savings-Logo.svg');

        // Try cache first
        const cachedConfig = loadCache('navbar_site_config');
        if (cachedConfig) {
            updateSiteConfig(cachedConfig);
        }

        const fetchSiteConfig = async () => {
            try {
                if (!cachedConfig) setIsFetching(true);
                const response = await fetchWithRetry('/api/site-config/', { cache: 'no-store' }, 2);
                if (response.ok) {
                    const data = await response.json();
                    updateSiteConfig(data);
                    saveCache('navbar_site_config', data);
                }
            } catch (error) {
                console.error('Error fetching site config:', error);
            } finally {
                setIsFetching(false);
            }
        };

        fetchSiteConfig();
    }, []);

    // Fetch dynamic categories from database
    useEffect(() => {
        // Try cache first
        const cachedPages = loadCache('navbar_pages_data');
        if (cachedPages && cachedPages.length > 0) {
            setPagesData(cachedPages);
            setLoading(false);
        }

        const fetchPagesData = async () => {
            try {
                if (!cachedPages) {
                    setLoading(true);
                    setIsFetching(true);
                }
                
                const response = await fetchWithRetry('/api/pages-with-categories/?include_blogs=0', { cache: 'no-store' }, 2);
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

                    // Sort pages: known categories first, then others
                    const filtered = rawPages
                      .sort((a, b) => {
                        const getOrder = (slug) => {
                             const key = Object.keys(orderMap).find(k => slug.includes(k));
                             return key !== undefined ? orderMap[key] : 999;
                        };
                        return getOrder(a.slug) - getOrder(b.slug);
                      });

                    // Fallback: enforce display labels
                    const displayName = (p) => {
                      if (p.slug.includes('companies')) return 'Companies';
                      if (p.slug.includes('state')) return 'States';
                      if (p.slug.includes('vehicle')) return 'Vehicles';
                      if (p.slug.includes('shopping')) return 'Shopping';
                      if (p.slug.includes('resources')) return 'Resources';
                      return p.name || '';
                    };

                    const pages = filtered.map(p => ({ ...p, displayName: displayName(p) }));
                    
                    if (pages.length > 0) {
                        setPagesData(pages);
                        saveCache('navbar_pages_data', pages);
                    }
                } else {
                    // Only clear if we don't have cache
                    if (!cachedPages) setPagesData([]);
                }
            } catch (error) {
                // Only clear if we don't have cache
                if (!cachedPages) setPagesData([]);
            } finally {
                setLoading(false);
                setIsFetching(false);
            }
        };

        fetchPagesData();
    }, []);

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
    // Refactored to remove IIFE for better build stability
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (isMobileMenuOpen) {
                // Open
                gsap.to(hamburgerRef.current, { duration: 0.3, ease: "power2.out", rotation: 180, scale: 1.1 });
                
                // Overlay
                if (overlayRef.current) {
                    gsap.set(overlayRef.current, { display: 'block', opacity: 0 });
                    gsap.to(overlayRef.current, { opacity: 1, duration: 0.3 });
                }

                // Menu
                if (mobileMenuRef.current) {
                    gsap.set(mobileMenuRef.current, { display: 'block' });
                    gsap.fromTo(mobileMenuRef.current, 
                        { x: "100%" },
                        { x: "0%", duration: 0.4, ease: "power3.out" }
                    );
                }
            } else {
                // Close
                gsap.to(hamburgerRef.current, { duration: 0.3, ease: "power2.out", rotation: 0, scale: 1 });
                
                // Overlay
                if (overlayRef.current) {
                    gsap.to(overlayRef.current, { 
                        opacity: 0, 
                        duration: 0.3, 
                        onComplete: () => gsap.set(overlayRef.current, { display: 'none' }) 
                    });
                }

                // Menu
                if (mobileMenuRef.current) {
                    gsap.to(mobileMenuRef.current, { 
                        x: "100%", 
                        duration: 0.4, 
                        ease: "power3.in", 
                        onComplete: () => gsap.set(mobileMenuRef.current, { display: 'none' })
                    });
                }
            }
        });
        
        return () => ctx.revert();
    }, [isMobileMenuOpen]);

    const handleMobileLinkClick = () => {
        setIsMobileMenuOpen(false);
        setDropdownOpen(false);
        setActiveDropdown(null);
        setMobileOpenDropdown(null);
    };

    const handleDropdownEnter = (slug) => {
        if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
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

    const handleZipSubmit = (e) => {
        e.preventDefault();
        const clean = zip.replace(/\D/g, "").slice(0, 5);
        if (clean.length === 5) {
            router.push(`/quotes?zip=${encodeURIComponent(clean)}`);
        }
    };

    const handleMobileDropdownToggle = (slug) => {
        setMobileOpenDropdown(mobileOpenDropdown === slug ? null : slug);
    };

    const renderDropdown = () => {
        if (!dropdownOpen || !activeDropdown) return null;
        const currentPage = pagesData.find(p => p.slug === activeDropdown);
        if (!currentPage || !currentPage.dropdownItems || currentPage.dropdownItems.length === 0) return null;

        return (
            <div
                className="absolute left-0 right-0 bg-white shadow-xl border-t border-slate-200 z-50"
                style={{ top: '100%' }}
                onMouseEnter={() => handleDropdownEnter(activeDropdown)}
                onMouseLeave={handleDropdownLeave}
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4 mb-6">
                        {currentPage.dropdownItems.slice(0, 20).map((item, index) => (
                            <SmartLink
                                key={index}
                                href={`/articles/${item.slug}`}
                                prefetch
                                className="group flex items-center text-sm text-slate-600 hover:text-sky-600 py-2 transition-colors"
                                onClick={handleMobileLinkClick}
                            >
                                <ChevronRight className="w-3 h-3 mr-2 text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-2 group-hover:translate-x-0" />
                                <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform">{item.name}</span>
                            </SmartLink>
                        ))}
                    </div>
                    <div className="border-t border-slate-100 pt-4 flex justify-end">
                        <SmartLink
                            href="/articles"
                            prefetch
                            className="inline-flex items-center text-sm font-semibold text-sky-600 hover:text-sky-700 transition-colors group"
                            onClick={handleMobileLinkClick}
                        >
                            View All Articles
                            <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                        </SmartLink>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            {isFetching && (
                <div className="fixed top-0 left-0 right-0 z-[1000]">
                    <div className="h-1 w-full bg-gradient-to-r from-sky-400 via-sky-600 to-sky-400 animate-pulse" />
                </div>
            )}
            <nav
            ref={navbarRef}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2 border-b border-slate-200' : 'bg-white shadow-sm py-4'}`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    
                    {/* Left: Logo/Brand */}
                    <div className="flex items-center flex-shrink-0">
                        <SmartLink href="/" className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            {/* Hardcoded Logo - using standard img tag for stability */}
                            <img 
                                src="/logos/Auto-Insure-Savings-Logo.svg" 
                                alt={brand} 
                                style={{ height: `${logoHeight}px` }} 
                                className="w-auto object-contain"
                                fetchPriority="high"
                            />
                        </SmartLink>
                    </div>

                    {/* Center: Navigation Links OR ZIP Form */}
                    <div className="hidden lg:flex flex-1 justify-end px-8">
                        {scrolled ? (
                             <form onSubmit={handleZipSubmit} className="flex items-center gap-2 animate-fadeIn">
                                <div className="relative">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={5}
                                        value={zip}
                                        onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                                        placeholder="Enter ZIP Code"
                                        className="w-48 pl-4 pr-4 py-2 text-slate-900 bg-slate-50 border border-slate-300 rounded-none focus:outline-none focus:border-sky-500 text-sm font-medium transition-colors"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-6 rounded-none text-sm uppercase tracking-wide transition-all shadow-md hover:shadow-lg"
                                >
                                    Get Quotes
                                </button>
                             </form>
                        ) : (
                            <ul className="flex items-center gap-8">
                                {loading ? (
                                    // Skeleton for Links
                                    Array(5).fill(0).map((_, i) => (
                                        <li key={i} className="h-16 flex items-center">
                                            <SkeletonLoader className="h-4 w-24" />
                                        </li>
                                    ))
                                ) : (
                                    pagesData.map((p) => (
                                    <li
                                        key={p.slug}
                                        className="relative group h-16 flex items-center"
                                        onMouseEnter={() => (p.has_dropdown || p.dropdownItems.length > 0) && handleDropdownEnter(p.slug)}
                                        onMouseLeave={handleDropdownLeave}
                                    >
                                        <button 
                                            onClick={() => (p.has_dropdown || p.dropdownItems.length > 0) ? toggleDropdownClick(p.slug) : null}
                                            className={`inline-flex items-center text-base font-medium transition-colors duration-200 focus:outline-none ${
                                                dropdownOpen && activeDropdown === p.slug 
                                                ? 'text-sky-600' 
                                                : 'text-slate-600 hover:text-sky-600'
                                            }`}
                                        >
                                            {p.has_dropdown || p.dropdownItems.length > 0 ? (
                                                 <>
                                                    <span>{p.displayName || p.name}</span>
                                                    <ChevronDown 
                                                        className={`ml-1 w-4 h-4 transition-transform duration-200 ${
                                                            dropdownOpen && activeDropdown === p.slug ? 'rotate-180 text-sky-600' : 'text-slate-400 group-hover:text-sky-600'
                                                        }`} 
                                                    />
                                                 </>
                                            ) : (
                                                 <SmartLink href={`/${p.slug}`} prefetch>
                                                    <span>{p.displayName || p.name}</span>
                                                 </SmartLink>
                                            )}
                                        </button>
                                        
                                        {/* Animated bottom border */}
                                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                                    </li>
                                ))
                                )}
                            </ul>
                        )}
                    </div>

                    {/* Right: Phone CTA */}
                    <div className="flex items-center gap-4">
                        {phone && (
                            <SmartLink
                                href={`tel:${phone.replace(/\s+/g,'')}`}
                                className="hidden md:inline-flex items-center justify-center px-6 py-2.5 border-2 border-sky-600 text-sky-600 font-bold rounded-none hover:bg-sky-600 hover:text-white transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-sky-900/10 uppercase tracking-wide"
                            >
                                <Phone className="w-4 h-4 mr-2" />
                                <span>{phone}</span>
                            </SmartLink>
                        )}
                        
                        {/* Hamburger Icon for Mobile */}
                        <div className="flex lg:hidden">
                            <button
                                onClick={toggleMobileMenu}
                                className="text-slate-600 hover:text-sky-600 p-2 transition-colors"
                                aria-label="Toggle menu"
                            >
                                <div ref={hamburgerRef} className="w-6 h-6 flex items-center justify-center">
                                    {isMobileMenuOpen ? <X /> : <Menu />}
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dropdown Menu */}
            {renderDropdown()}
            
            {/* Mobile Menu Overlay */}
            <div 
                ref={overlayRef}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden hidden backdrop-blur-sm"
                onClick={toggleMobileMenu}
            ></div>

            {/* Mobile Menu Drawer */}
            <div 
                ref={mobileMenuRef}
                className="fixed inset-y-0 right-0 w-full max-w-sm bg-white z-[60] lg:hidden flex flex-col shadow-2xl border-l border-slate-200"
            >
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between px-6 h-16 border-b border-slate-100 flex-shrink-0">
                    {/* Logo in Drawer */}
                    <div className="flex items-center">
                        <SmartLink href="/" className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2" onClick={handleMobileLinkClick}>
                            <img 
                                src="/logos/logo.svg" 
                                alt={brand} 
                                style={{ '--mobile-h': '24px' }} 
                                className="w-auto object-contain h-[var(--mobile-h)]" 
                                fetchPriority="high"
                            />
                        </SmartLink>
                    </div>

                    {/* Close Button in Drawer */}
                    <button
                        onClick={toggleMobileMenu}
                        className="text-slate-500 hover:text-slate-900 p-2 transition-colors rounded-full hover:bg-slate-100"
                        aria-label="Close menu"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Menu Items */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <ul className="space-y-2">
                    <li className="border-b border-slate-100">
                        <SmartLink 
                            href="/" 
                            className="block py-4 text-lg font-bold text-slate-900 hover:text-sky-600" 
                            onClick={handleMobileLinkClick}
                        >
                            Home
                        </SmartLink>
                    </li>
                    {loading && Array(5).fill(0).map((_, i) => (
                         <li key={i} className="border-b border-slate-100 py-4">
                             <SkeletonLoader className="h-6 w-3/4 mb-2" />
                             <SkeletonLoader className="h-4 w-1/2" />
                         </li>
                    ))}
                    {!loading && pagesData.map((p) => (
                        <li key={p.slug} className="border-b border-slate-100 last:border-0">
                             <div className="flex flex-col">
                                 {(p.has_dropdown || (p.dropdownItems && p.dropdownItems.length > 0)) ? (
                                    <>
                                        <button 
                                            onClick={() => handleMobileDropdownToggle(p.slug)}
                                            className="flex justify-between items-center w-full py-4 text-lg font-bold text-slate-900 hover:text-sky-600"
                                        >
                                            {p.displayName || p.name}
                                            <ChevronDown className={`w-5 h-5 transition-transform ${mobileOpenDropdown === p.slug ? 'rotate-180 text-sky-600' : 'text-slate-400'}`} />
                                        </button>
                                        
                                        {/* Mobile Dropdown Items */}
                                        <div className={`pl-4 overflow-hidden transition-all duration-300 ${mobileOpenDropdown === p.slug ? 'max-h-screen opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
                                            <div className="grid grid-cols-1 gap-2 border-l-2 border-slate-200 pl-4">
                                                {(p.dropdownItems || []).slice(0, 8).map((item, idx) => (
                                                    <SmartLink
                                                        key={idx}
                                                        href={`/articles/${item.slug}`}
                                                        prefetch
                                                        className="block py-2 text-sm text-slate-600 hover:text-sky-600"
                                                        onClick={handleMobileLinkClick}
                                                    >
                                                        {item.name}
                                                    </SmartLink>
                                                ))}
                                                {(p.dropdownItems || []).length > 8 && (
                                                    <SmartLink 
                                                        href={`/${p.slug}`}
                                                        prefetch
                                                        className="block py-2 text-sm font-semibold text-sky-600"
                                                        onClick={handleMobileLinkClick}
                                                    >
                                                        View All {p.displayName || p.name}
                                                    </SmartLink>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                 ) : (
                                    <SmartLink 
                                        href={`/${p.slug}`} 
                                        prefetch
                                        className="block py-4 text-lg font-bold text-slate-900 hover:text-sky-600" 
                                        onClick={handleMobileLinkClick}
                                    >
                                        {p.displayName || p.name}
                                    </SmartLink>
                                 )}
                             </div>
                        </li>
                    ))}
                    </ul>
                </div>
                 
                 {/* Mobile Phone CTA */}
                 {phone && (
                    <div className="px-6 pb-8 mt-auto">
                        <SmartLink
                            href={`tel:${phone.replace(/\s+/g,'')}`}
                            className="flex items-center justify-center w-full px-6 py-4 border-2 border-sky-500 bg-sky-500/10 text-sky-400 font-bold rounded-none hover:bg-sky-500/20 transition-colors"
                        >
                            <Phone className="w-5 h-5 mr-2" />
                            <span>Call {phone}</span>
                        </SmartLink>
                    </div>
                 )}
            </div>
            </nav>
        </>
    );
}
// Force rebuild for syntax check
