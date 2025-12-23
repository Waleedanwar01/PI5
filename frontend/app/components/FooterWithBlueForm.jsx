"use client";

import React, { useEffect, useState, useRef } from "react";
import { Twitter, Youtube, Facebook, Instagram, Linkedin, Globe, Shield } from "lucide-react";
import SmartLink from './SmartLink.jsx';
import SmartImage from './SmartImage.jsx';
import SkeletonLoader from './SkeletonLoader.jsx';
import { getMediaUrl, getApiBase } from '../lib/config.js';

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
        const versioned = (u, v) => {
            const url = String(u || '').trim();
            if (!url) return null;
            const sep = url.includes('?') ? '&' : '?';
            return v ? `${url}${sep}v=${encodeURIComponent(v)}` : url;
        };

        const updateSiteConfig = (data) => {
            const bn = (data.brand_name || data.site_name || '').trim();
            if (bn) setBrandName(bn);
            if (data.logo_url) setLogoUrl(versioned(getMediaUrl(data.logo_url), data.updated_at));
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

        const p1 = fetch('/api/site-config/', { cache: 'no-store' })
            .then(r => r.json())
            .then(data => {
                updateSiteConfig(data);
                saveCache('footer_site_config', data);
            })
            .catch(() => {});

        const p2 = fetch('/api/footer-address/', { cache: 'no-store' })
            .then(r => r.json())
            .then(data => {
                updateAddress(data);
                saveCache('footer_address', data);
            })
            .catch(() => {});

        const p3 = fetch(`${getApiBase()}/api/menu/footer/`, { cache: 'no-store' })
            .then(r => r.json())
            .then(data => {
                updateMenu(data);
                saveCache('footer_menu', data);
            })
            .catch(() => {});

        Promise.all([p1, p2, p3]).finally(() => setIsLoading(false));
    }, []);

    

    return (
        <footer className="bg-black text-gray-300 font-sans">
            {/* Dark Form Section matching screenshot */}
            <div className="bg-[#1e293b] text-white py-12 border-t border-slate-800">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">
                        Free Auto Insurance Comparison
                    </h3>
                    <p className="text-base md:text-lg text-slate-300 mb-8">
                        Enter your ZIP code below to view companies that have cheap auto insurance rates.
                    </p>
                    
                    <form action="/quotes" method="GET" className="max-w-xl mx-auto mb-6">
                        <div className="flex flex-col sm:flex-row shadow-lg">
                            <div className="relative flex-grow">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    name="zip"
                                    placeholder="ZIP Code"
                                    pattern="[0-9]*"
                                    maxLength={5}
                                    className="w-full pl-10 pr-4 py-3 md:py-4 text-gray-900 bg-white border-none focus:ring-2 focus:ring-orange-500 outline-none h-12 md:h-14"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-[#f97316] hover:bg-[#ea580c] text-white font-bold py-3 md:py-4 px-8 whitespace-nowrap transition-colors flex items-center justify-center gap-2 h-12 md:h-14"
                            >
                                GET QUOTES
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </div>
                    </form>

                    <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                        <Shield className="w-4 h-4" />
                        <span>Secured with SHA-256 Encryption</span>
                    </div>

                    {/* Dotted decoration at the bottom */}
                    <div className="mt-8 mx-auto max-w-xs border-b-4 border-dotted border-black/40 h-1 w-full"></div>
                </div>
            </div>

            {/* Original Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Top panel: logo + description like the screenshot */}
            <div className="bg-[#111] border border-neutral-800 p-6 md:p-8">
                <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-12 text-left w-full lg:justify-start">
                    <div className="flex-shrink-0">
                        {isLoading ? (
                            <SkeletonLoader className="h-10 w-32 bg-neutral-800" />
                        ) : logoUrl ? (
                            <SmartImage src={logoUrl} alt={brandName} style={logoHeight ? { height: `${logoHeight}px` } : undefined} className="w-auto" />
                        ) : null}
                    </div>
                    <div className="flex-1 w-full">
                        {isLoading ? (
                            <div className="space-y-2">
                                <SkeletonLoader className="h-4 w-full max-w-lg bg-neutral-800" />
                                <SkeletonLoader className="h-4 w-3/4 max-w-md bg-neutral-800" />
                            </div>
                        ) : (
                            <p className="text-sm text-gray-300 leading-relaxed text-left">
                                {footerText}
                            </p>
                        )}
                    </div>
                </div>

                {/* Company + Legal sections */}
                    {isLoading ? (
                         <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div>
                                <SkeletonLoader className="h-6 w-24 mb-4 bg-neutral-800" />
                                <div className="space-y-3">
                                    <SkeletonLoader className="h-4 w-32 bg-neutral-800" />
                                    <SkeletonLoader className="h-4 w-40 bg-neutral-800" />
                                    <SkeletonLoader className="h-4 w-28 bg-neutral-800" />
                                </div>
                            </div>
                            <div>
                                <SkeletonLoader className="h-6 w-24 mb-4 bg-neutral-800" />
                                <div className="space-y-3">
                                    <SkeletonLoader className="h-4 w-32 bg-neutral-800" />
                                    <SkeletonLoader className="h-4 w-40 bg-neutral-800" />
                                    <SkeletonLoader className="h-4 w-28 bg-neutral-800" />
                                </div>
                            </div>
                         </div>
                    ) : (companyLinks?.length > 0 || legalLinks?.length > 0) && (
                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                            {companyLinks?.length > 0 && (
                                <div>
                                    <h3 className="text-white font-semibold mb-3">Company</h3>
                                    <div className="flex flex-col gap-2">
                                        {companyLinks.map((item, idx) => (
                                            <SmartLink
                                                key={`${String(item.page_slug || item.href || item.name || '')}-${idx}`}
                                                href={resolveHref(item)}
                                                className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                                            >
                                                {item.name}
                                            </SmartLink>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {legalLinks?.length > 0 && (
                                <div>
                                    <h3 className="text-white font-semibold mb-3">Legal</h3>
                                    <div className="flex flex-col gap-2">
                                        {legalLinks.map((item, idx) => (
                                            <SmartLink
                                                key={`${String(item.page_slug || item.href || item.name || '')}-${idx}`}
                                                href={resolveHref(item)}
                                                className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                                            >
                                                {item.name}
                                            </SmartLink>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Follow us row */}
                    {isLoading ? (
                        <div className="mt-8 flex items-center gap-3">
                            <SkeletonLoader className="h-4 w-24 bg-neutral-800" />
                            <div className="flex gap-2">
                                <SkeletonLoader variant="circular" className="h-9 w-9 bg-neutral-800" />
                                <SkeletonLoader variant="circular" className="h-9 w-9 bg-neutral-800" />
                                <SkeletonLoader variant="circular" className="h-9 w-9 bg-neutral-800" />
                            </div>
                        </div>
                    ) : socialLinks && socialLinks.length > 0 ? (
                        <div className="mt-8 flex items-center gap-3">
                            <span className="text-sm text-gray-400">Follow us on:</span>
                            {socialLinks.map((href, idx) => {
                                const Icon = iconFor(href);
                                return (
                                    <a
                                        key={`${href}-${idx}`}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-neutral-700 text-gray-300 hover:text-white hover:border-white/30 hover:bg-white/10 transition-colors"
                                        aria-label="Social link"
                                    >
                                        <Icon className="w-4.5 h-4.5" />
                                    </a>
                                );
                            })}
                        </div>
                    ) : null}
                </div>

                {/* Bottom bar: copyright + legal inline links */}
                <div className="mt-6 border-t border-neutral-800 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-2 whitespace-normal sm:whitespace-nowrap">
                        {isLoading ? (
                             <SkeletonLoader className="h-6 w-64 bg-neutral-800" />
                        ) : (
                            <>
                                {logoUrl ? (
                                    <SmartImage src={logoUrl} alt={brandName} style={logoHeight ? { height: `${logoHeight}px` } : undefined} className="w-auto h-6" />
                                ) : null}
                                <FooterCopyright brandName={brandName} />
                            </>
                        )}
                    </div>
                    {isLoading ? (
                        <div className="flex gap-4">
                            <SkeletonLoader className="h-4 w-20 bg-neutral-800" />
                            <SkeletonLoader className="h-4 w-20 bg-neutral-800" />
                        </div>
                    ) : legalLinks?.length > 0 && (
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                            {legalLinks.map((item, idx) => (
                                <SmartLink
                                    key={`legal-inline-${idx}`}
                                    href={resolveHref(item)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    {item.name}
                                </SmartLink>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-neutral-800 text-[10px] sm:text-xs leading-relaxed text-gray-400">
                    {isLoading ? (
                        <div className="space-y-1">
                            <SkeletonLoader className="h-3 w-full bg-neutral-800" />
                            <SkeletonLoader className="h-3 w-3/4 bg-neutral-800" />
                        </div>
                    ) : (
                        disclaimer || (
                        "Disclaimer: CarInsuranceComparison.com strives to present the most up-to-date and comprehensive information on saving money on car insurance possible. This information may be different than what you see when you visit an insurance provider, insurance agency, or insurance company website. All insurance rates, products, and services are presented without warranty and guarantee. When evaluating rates, please verify directly with your insurance company or agent. Quotes and offers are not binding, nor a guarantee of coverage."
                        )
                    )}
                </div>

                {isLoading ? (
                    <div className="mt-2">
                        <SkeletonLoader className="h-3 w-64 bg-neutral-800" />
                    </div>
                ) : address ? (
                    <div className="w-full mt-2">
                        <p className="text-xs text-gray-500">{address}</p>
                    </div>
                ) : null}
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
