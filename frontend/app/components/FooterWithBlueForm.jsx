"use client";

import React, { useEffect, useState, useRef } from "react";
import { Twitter, Youtube, Facebook, Instagram, Linkedin, Globe, Shield } from "lucide-react";
import SmartLink from './SmartLink.jsx';
import SmartImage from './SmartImage.jsx';
import SkeletonLoader from './SkeletonLoader.jsx';

// Helper functions (resolveHref and FooterCopyright) remain the same.

const FooterWithBlueForm = () => {
    const [brandName, setBrandName] = useState("Car Insurance Comparison");
    const [logoUrl, setLogoUrl] = useState(null);
    const [logoHeight, setLogoHeight] = useState(null);
    const [disclaimer, setDisclaimer] = useState("");
    const [footerText, setFooterText] = useState("We are a free online resource for anyone interested in learning more about auto insurance. Our goal is to be an objective, third-party resource for everything auto insurance related.");
    const [address, setAddress] = useState("");
    const [addressSource, setAddressSource] = useState(""); // Track where address came from
    const [submitMessage, setSubmitMessage] = useState('');
    
    // Company and Legal links fetched dynamically from backend
    const [companyLinks, setCompanyLinks] = useState([]);
    const [legalLinks, setLegalLinks] = useState([]);
    const [socialLinks, setSocialLinks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Pick icon based on URL hostname
    const iconFor = (url) => {
        try {
            const u = new URL(url);
            const h = (u.hostname || '').toLowerCase();
            if (h.includes('facebook')) return Facebook;
            if (h.includes('twitter') || h.includes('x.com')) return Twitter;
            if (h.includes('instagram')) return Instagram;
            if (h.includes('youtube')) return Youtube;
            if (h.includes('linkedin')) return Linkedin;
        } catch (e) {}
        return Globe;
    };

    // Cache helpers
    const loadCache = (key) => {
        if (typeof window === 'undefined') return null;
        try {
            const item = localStorage.getItem(key);
            if (!item) return null;
            const parsed = JSON.parse(item);
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

    // Fetch all data
    useEffect(() => {
        // Hardcoded logo
        setLogoUrl('/logos/Auto-Insure-Savings-Logo.svg');

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

        const versioned = (u, v) => {
            const url = String(u || '').trim();
            if (!url) return null;
            const sep = url.includes('?') ? '&' : '?';
            return v ? `${url}${sep}v=${encodeURIComponent(v)}` : url;
        };

        const updateSiteConfig = (data) => {
            const bn = (data.brand_name || data.site_name || '').trim();
            if (bn) setBrandName(bn);
            // Dynamic logo from site config
            // if (data.logo_url) setLogoUrl(versioned(getMediaUrl(data.logo_url), data.updated_at));
            if (data.logo_height) setLogoHeight(data.logo_height);

            const aboutTxt = (data.footer_about_text || '').trim();
            if (aboutTxt) setFooterText(aboutTxt);

            const dsc = (data.footer_disclaimer || data.disclaimer || data.disclaimer_text || '').trim();
            if (dsc) setDisclaimer(dsc);
            const addr = (data.address || '').trim();
            if (addr) setAddress(addr);

            // Build social links
            let linksFromAdmin = [];
            const arr = Array.isArray(data.social_links) ? data.social_links : [];
            arr.forEach((u) => {
                const href = String(u || '').trim();
                if (href) linksFromAdmin.push(href);
            });
            ['facebook_url','twitter_url','instagram_url','linkedin_url','youtube_url'].forEach((fname) => {
                const href = String(data[fname] || '').trim();
                if (href) linksFromAdmin.push(href);
            });
            linksFromAdmin = Array.from(new Set(linksFromAdmin));
            setSocialLinks(linksFromAdmin);
        };

        const updateAddress = (data) => {
            if (data.address) {
                setAddress(data.address);
                setAddressSource(data.source || '');
            }
        };

        const updateMenu = (data) => {
            const company = Array.isArray(data.company) ? data.company : [];
            const legal = Array.isArray(data.legal) ? data.legal : [];
            setCompanyLinks(company);
            setLegalLinks(legal);
        };

        // Load from cache first
        const cachedConfig = loadCache('footer_site_config');
        if (cachedConfig) updateSiteConfig(cachedConfig);

        const cachedAddress = loadCache('footer_address');
        if (cachedAddress) updateAddress(cachedAddress);

        const cachedMenu = loadCache('footer_menu');
        if (cachedMenu) updateMenu(cachedMenu);

        // If we have everything cached, don't show loading skeleton (but still fetch updates)
        if (cachedConfig && (cachedAddress || cachedConfig.address) && cachedMenu) {
            setIsLoading(false);
        } else {
            setIsLoading(true);
        }

        const p1 = fetchWithRetry('/api/site-config/', { cache: 'no-store' })
            .then(r => r.json())
            .then(data => {
                updateSiteConfig(data);
                saveCache('footer_site_config', data);
            })
            .catch(() => {});

        const p2 = fetchWithRetry('/api/footer-address/', { cache: 'no-store' })
            .then(r => r.json())
            .then(data => {
                updateAddress(data);
                saveCache('footer_address', data);
            })
            .catch(() => {});

        const p3 = fetchWithRetry('/api/menu/footer/', { cache: 'no-store' })
            .then(r => r.json())
            .then(data => {
                updateMenu(data);
                saveCache('footer_menu', data);
            })
            .catch(() => {});

        // Parallelize all requests and update state as they finish, but only turn off loading when all are done (or if cache was hit)
        Promise.allSettled([p1, p2, p3]).finally(() => {
             setIsLoading(false);
        });
    }, []);

    

    return (
        <footer className="bg-slate-950 text-slate-300 font-sans border-t border-slate-900 relative">
            {/* Top Border Gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-blue-500 to-orange-500 opacity-70"></div>

            {/* 1. CTA / ZIP Form Section - Clean & Modern */}
            <div className="bg-slate-900/80 py-20 px-4 relative overflow-hidden backdrop-blur-md">
                {/* Subtle background pattern/gradient */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-transparent pointer-events-none opacity-40"></div>
                
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h3 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">
                        Compare Auto Insurance Rates
                    </h3>
                    <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Join thousands of drivers who have saved money. Enter your ZIP code to see your personalized quotes.
                    </p>
                    
                    <form action="/quotes" method="GET" className="max-w-lg mx-auto mb-10">
                        <div className="flex flex-col sm:flex-row shadow-2xl rounded-xl overflow-hidden transition-all duration-300 hover:shadow-orange-500/20 ring-1 ring-white/10 focus-within:ring-orange-500/50">
                            <div className="relative flex-grow group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <svg className="h-6 w-6 text-slate-500 group-focus-within:text-orange-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    name="zip"
                                    placeholder="Enter ZIP Code"
                                    pattern="[0-9]*"
                                    maxLength={5}
                                    className="w-full pl-14 pr-4 py-5 text-slate-900 bg-white border-none outline-none text-lg placeholder:text-slate-400 font-medium"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-5 px-10 whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-2 text-lg active:scale-95"
                            >
                                Get Quotes
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </div>
                    </form>

                    <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        <span>Secure & Encrypted</span>
                    </div>
                </div>
            </div>

            {/* 2. Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16 mb-20">
                    
                    {/* Brand Column (Left) */}
                    <div className="lg:col-span-5 flex flex-col items-start">
                        <SmartLink href="/" className="inline-block mb-8">
                             <img 
                                src="/logos/logo.svg" 
                                alt={brandName} 
                                style={{ height: logoHeight ? `${logoHeight}px` : '36px' }} 
                                className="w-auto object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity" 
                            />
                        </SmartLink>
                        
                        {isLoading ? (
                             <div className="space-y-4 w-full max-w-sm">
                                <SkeletonLoader className="h-4 w-full bg-slate-800 rounded" />
                                <SkeletonLoader className="h-4 w-3/4 bg-slate-800 rounded" />
                            </div>
                        ) : (
                            <p className="text-slate-400 leading-loose mb-10 max-w-md text-sm">
                                {footerText}
                            </p>
                        )}

                        {/* Social Links */}
                        <div className="flex items-center gap-3">
                            {socialLinks.map((url, idx) => {
                                const Icon = iconFor(url);
                                return (
                                    <a 
                                        key={idx} 
                                        href={url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="bg-slate-900 hover:bg-orange-600 text-slate-400 hover:text-white p-3 rounded-xl transition-all duration-300 ring-1 ring-slate-800 hover:ring-orange-500"
                                        aria-label="Social Link"
                                    >
                                        <Icon className="w-5 h-5" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Links Columns (Right) */}
                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-12 lg:pl-12">
                        {/* Company Links */}
                        <div>
                            <h4 className="text-white font-bold text-lg mb-8 tracking-tight">Company</h4>
                            {isLoading ? (
                                <div className="space-y-4">
                                    <SkeletonLoader className="h-4 w-24 bg-slate-800 rounded" />
                                    <SkeletonLoader className="h-4 w-32 bg-slate-800 rounded" />
                                    <SkeletonLoader className="h-4 w-20 bg-slate-800 rounded" />
                                </div>
                            ) : (
                                <ul className="space-y-4">
                                    {companyLinks.map((item, idx) => (
                                        <li key={idx}>
                                            <SmartLink
                                                href={resolveHref(item)}
                                                className="text-slate-400 hover:text-orange-500 transition-colors duration-200 text-sm flex items-center gap-3 group"
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-orange-500 transition-colors"></span>
                                                {item.name}
                                            </SmartLink>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Legal / Resources Links */}
                        <div>
                            <h4 className="text-white font-bold text-lg mb-8 tracking-tight">Legal & Resources</h4>
                            {isLoading ? (
                                <div className="space-y-4">
                                    <SkeletonLoader className="h-4 w-24 bg-slate-800 rounded" />
                                    <SkeletonLoader className="h-4 w-32 bg-slate-800 rounded" />
                                </div>
                            ) : (
                                <ul className="space-y-4">
                                    {legalLinks.map((item, idx) => (
                                        <li key={idx}>
                                            <SmartLink
                                                href={resolveHref(item)}
                                                className="text-slate-400 hover:text-orange-500 transition-colors duration-200 text-sm flex items-center gap-3 group"
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-orange-500 transition-colors"></span>
                                                {item.name}
                                            </SmartLink>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar: Copyright & Address */}
                <div className="border-t border-slate-900 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-500">
                    <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                        <span>&copy; {new Date().getFullYear()} {brandName}. All rights reserved.</span>
                    </div>
                    
                    {address && (
                        <div className="flex items-center gap-2 text-center md:text-right">
                            <span className="hidden md:inline text-slate-800">|</span>
                            <span>{address}</span>
                        </div>
                    )}
                </div>

                {/* Disclaimer Text */}
                {disclaimer && (
                    <div className="mt-10 pt-8 border-t border-slate-900/50 text-xs text-slate-600 text-justify leading-relaxed opacity-60 hover:opacity-100 transition-opacity">
                        {disclaimer}
                    </div>
                )}
            </div>
        </footer>
    );
};

export default FooterWithBlueForm;

function resolveHref(item) {
    if (item.href) return item.href;
    // Handle both page_slug (old) and slug (new API)
    const slug = item.page_slug || item.slug;
    if (slug) {
        const anchor = item.anchor_id ? `#${String(item.anchor_id)}` : "";
        return `/${encodeURIComponent(String(slug))}${anchor}`;
    }
    return "#";
}

function FooterCopyright({ brandName }) {
    const [copyright, setCopyright] = React.useState("");
    React.useEffect(() => {
        fetch('/api/site-config/', { cache: 'no-store' })
            .then(r => r.json())
            .then(data => {
                const txt = (data.copyright_text || '').trim();
                if (txt) {
                    setCopyright(txt);
                } else {
                    const year = new Date().getFullYear();
                    setCopyright(`Copyright © ${year} ${brandName}`);
                }
            })
            .catch(() => {
                const year = new Date().getFullYear();
                setCopyright(`Copyright © ${year} ${brandName}`);
            });
    }, [brandName]);
    return (
        <p className="text-gray-400 font-medium text-xs sm:text-sm">{copyright}</p>
    );
}

// Force push trigger
