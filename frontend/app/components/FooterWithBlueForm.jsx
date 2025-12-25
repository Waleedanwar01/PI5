"use client";

import React, { useEffect, useState, useRef } from "react";
import { Twitter, Youtube, Facebook, Instagram, Linkedin, Globe, Shield, Mail, Phone, MapPin, ChevronRight, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import SmartLink from './SmartLink.jsx';
import SmartImage from './SmartImage.jsx';
import SkeletonLoader from './SkeletonLoader.jsx';

// Helper functions
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

const FooterWithBlueForm = ({
    logo, // Unused, keeping for prop compatibility
    brandName: initialBrandName = "Auto Insure Savings",
}) => {
    const [brandName, setBrandName] = useState(initialBrandName);
    // Logo is hardcoded, but we keep state if we ever need to switch back or for consistency
    const [logoUrl, setLogoUrl] = useState('/assets/logo.svg'); 
    const [disclaimer, setDisclaimer] = useState("");
    const [footerText, setFooterText] = useState("We are a free online resource for anyone interested in learning more about auto insurance. Our goal is to be an objective, third-party resource for everything auto insurance related.");
    const [address, setAddress] = useState("");
    
    // Links state - defaulted to empty to respect "data from config" rule
    // We will try to load from cache/API. 
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
            if (Date.now() - parsed.timestamp > 3600000) return null; // 1 hour cache
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
        // Hardcoded logo path as requested
        setLogoUrl('/assets/logo.svg');

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
            const bn = (data.brand_name || data.site_name || '').trim();
            if (bn) setBrandName(bn);
            
            // Note: Logo is hardcoded per user request, ignoring data.logo_url
            
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
            }
        };

        const updateFooterMenu = (data) => {
            if (data.company && Array.isArray(data.company)) {
                setCompanyLinks(data.company);
            }
            if (data.legal && Array.isArray(data.legal)) {
                setLegalLinks(data.legal);
            }
        };

        // Load from cache first
        const cachedConfig = loadCache('footer_site_config');
        if (cachedConfig) updateSiteConfig(cachedConfig);

        const cachedAddress = loadCache('footer_address');
        if (cachedAddress) updateAddress(cachedAddress);

        const cachedMenu = loadCache('footer_menu');
        if (cachedMenu) updateFooterMenu(cachedMenu);

        // If we have minimal data, stop loading state
        if (cachedConfig && (cachedMenu || cachedAddress)) {
            setIsLoading(false);
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
                updateFooterMenu(data);
                saveCache('footer_menu', data);
            })
            .catch(() => {});

        Promise.allSettled([p1, p2, p3]).finally(() => {
             setIsLoading(false);
        });
    }, []);

    return (
        <footer className="bg-slate-950 text-slate-300 font-sans border-t border-slate-900 relative">
            {/* Top Border Gradient - Sleek and modern */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-80"></div>

            {/* 1. CTA / ZIP Form Section - Modernized */}
            <div className="relative py-24 px-4 overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl bg-blue-900/10 blur-[100px] rounded-full pointer-events-none"></div>
                
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-500/10 text-blue-400 text-sm font-semibold mb-6 border border-blue-500/20">
                        Fast & Free Quotes
                    </span>
                    <h3 className="text-4xl md:text-6xl font-bold mb-6 text-white tracking-tight leading-tight">
                        Compare Rates, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Save Money</span>
                    </h3>
                    <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Join thousands of smart drivers. Enter your ZIP code to unlock personalized savings in minutes.
                    </p>
                    
                    <form action="/quotes" method="GET" className="max-w-lg mx-auto mb-10">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-grow group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <MapPin className="h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    name="zip"
                                    placeholder="Enter ZIP Code"
                                    pattern="[0-9]*"
                                    maxLength={5}
                                    className="w-full pl-12 pr-4 py-4 rounded-xl text-slate-900 bg-white/95 border border-white/10 focus:bg-white outline-none text-lg placeholder:text-slate-400 font-medium shadow-lg shadow-black/5 focus:ring-4 focus:ring-blue-500/20 transition-all"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-xl whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-2 text-lg shadow-lg shadow-blue-900/20 hover:shadow-blue-600/30 hover:-translate-y-0.5"
                            >
                                Get Quotes
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </form>

                    <div className="flex items-center justify-center gap-6 text-sm font-medium text-slate-500">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-500" />
                            <span>SSL Secured</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-500" />
                            <span>No Spam</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Separator */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="border-t border-slate-800/60"></div>
            </div>

            {/* 2. Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16">
                    
                    {/* Brand Column (Left) */}
                    <div className="lg:col-span-5 flex flex-col items-start">
                        <SmartLink href="/" className="inline-block mb-8 group">
                             {/* Hardcoded Logo */}
                             <img 
                                src="/assets/logo.svg"
                                alt={brandName}
                                className="h-10 w-auto object-contain brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity" 
                            />
                        </SmartLink>
                        
                        {isLoading ? (
                             <div className="space-y-4 w-full max-w-sm">
                                <SkeletonLoader className="h-4 w-full bg-slate-900 rounded" />
                                <SkeletonLoader className="h-4 w-3/4 bg-slate-900 rounded" />
                            </div>
                        ) : (
                            <p className="text-slate-400 leading-relaxed mb-8 max-w-md text-sm">
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
                                        className="bg-slate-900 hover:bg-blue-600 text-slate-400 hover:text-white p-2.5 rounded-lg transition-all duration-300 ring-1 ring-slate-800 hover:ring-blue-500"
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
                            <h4 className="text-white font-semibold text-lg mb-6">Company</h4>
                            {isLoading && companyLinks.length === 0 ? (
                                <div className="space-y-4">
                                    <SkeletonLoader className="h-4 w-24 bg-slate-900 rounded" />
                                    <SkeletonLoader className="h-4 w-32 bg-slate-900 rounded" />
                                    <SkeletonLoader className="h-4 w-20 bg-slate-900 rounded" />
                                </div>
                            ) : (
                                <ul className="space-y-3">
                                    {companyLinks.map((item, idx) => (
                                        <li key={idx}>
                                            <SmartLink
                                                href={resolveHref(item)}
                                                className="text-slate-400 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center gap-2 group"
                                            >
                                                <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-blue-500 transition-colors" />
                                                {item.name}
                                            </SmartLink>
                                        </li>
                                    ))}
                                    {/* Fallback if no links */}
                                    {companyLinks.length === 0 && !isLoading && (
                                        <li className="text-slate-600 italic text-sm">Links not configured</li>
                                    )}
                                </ul>
                            )}
                        </div>

                        {/* Legal / Resources Links */}
                        <div>
                            <h4 className="text-white font-semibold text-lg mb-6">Legal & Resources</h4>
                            {isLoading && legalLinks.length === 0 ? (
                                <div className="space-y-4">
                                    <SkeletonLoader className="h-4 w-24 bg-slate-900 rounded" />
                                    <SkeletonLoader className="h-4 w-32 bg-slate-900 rounded" />
                                </div>
                            ) : (
                                <ul className="space-y-3">
                                    {legalLinks.map((item, idx) => (
                                        <li key={idx}>
                                            <SmartLink
                                                href={resolveHref(item)}
                                                className="text-slate-400 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center gap-2 group"
                                            >
                                                <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-blue-500 transition-colors" />
                                                {item.name}
                                            </SmartLink>
                                        </li>
                                    ))}
                                    {/* Fallback if no links */}
                                    {legalLinks.length === 0 && !isLoading && (
                                        <li className="text-slate-600 italic text-sm">Links not configured</li>
                                    )}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar: Copyright & Address */}
                <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-500">
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
                    <div className="mt-8 pt-6 border-t border-slate-900/50 text-xs text-slate-600 text-justify leading-relaxed opacity-60 hover:opacity-100 transition-opacity">
                        {disclaimer}
                    </div>
                )}
            </div>
        </footer>
    );
};

export default FooterWithBlueForm;
