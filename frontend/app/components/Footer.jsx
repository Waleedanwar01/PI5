"use client";

import React, { useEffect, useState, useRef } from "react";
import gsap from 'gsap';
import { Twitter, Youtube, Facebook, Instagram, Linkedin, Globe, Shield, Star } from "lucide-react";
import SmartLink from './SmartLink.jsx';
import SmartImage from './SmartImage.jsx';
import { getMediaUrl } from '../lib/config.js';

// Helper functions (resolveHref and FooterCopyright) remain the same.

const Footer = () => {
    const [brandName, setBrandName] = useState("Car Insurance Comparison");
    const [logoUrl, setLogoUrl] = useState(null);
    const [logoHeight, setLogoHeight] = useState(null);
    const [disclaimer, setDisclaimer] = useState("");
    const [footerText, setFooterText] = useState("We are a free online resource for anyone interested in learning more about auto insurance. Our goal is to be an objective, third-party resource for everything auto insurance related.");
    const [address, setAddress] = useState("");
    const [addressSource, setAddressSource] = useState(""); // Track where address came from
    // Company and Legal links fetched dynamically from backend
    const [companyLinks, setCompanyLinks] = useState([]);
    const [legalLinks, setLegalLinks] = useState([]);
    const [socialLinks, setSocialLinks] = useState([]);

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

    // Fetch site config: brand, logo, disclaimer, address, social links
    useEffect(() => {
        const versioned = (u, v) => {
            const url = String(u || '').trim();
            if (!url) return null;
            const sep = url.includes('?') ? '&' : '?';
            return v ? `${url}${sep}v=${encodeURIComponent(v)}` : url;
        };
        fetch('/api/site-config/', { cache: 'no-store' })
            .then(r => r.json())
            .then(data => {
                const bn = (data.brand_name || data.site_name || '').trim();
                if (bn) setBrandName(bn);
                if (data.logo_url) setLogoUrl(versioned(getMediaUrl(data.logo_url), data.updated_at));
                if (data.logo_height) setLogoHeight(data.logo_height);

                const dsc = (data.footer_disclaimer || data.disclaimer || data.disclaimer_text || '').trim();
                if (dsc) setDisclaimer(dsc);
                const addr = (data.address || '').trim();
                if (addr) setAddress(addr);

                // Build social links from API: supports array of URLs and per-field URLs
                let linksFromAdmin = [];
                const arr = Array.isArray(data.social_links) ? data.social_links : [];
                arr.forEach((u) => {
                    const href = String(u || '').trim();
                    if (href) linksFromAdmin.push(href);
                });
                // Also pick from individual fields if present
                ['facebook_url','twitter_url','instagram_url','linkedin_url','youtube_url'].forEach((fname) => {
                    const href = String(data[fname] || '').trim();
                    if (href) linksFromAdmin.push(href);
                });
                // De-duplicate
                linksFromAdmin = Array.from(new Set(linksFromAdmin));
                setSocialLinks(linksFromAdmin);
            })
            .catch(() => {
                // Silent fail: keep defaults and show no social icons if unavailable
                setSocialLinks([]);
            });
    }, []);

    // Fetch footer address from articles dynamically
    useEffect(() => {
        fetch('/api/footer-address/', { cache: 'no-store' })
            .then(r => r.json())
            .then(data => {
                if (data.address) {
                    setAddress(data.address);
                    setAddressSource(data.source || '');
                }
            })
            .catch(() => {
                // Silent fail: keep existing address or default
            });
    }, []);

    // Fetch footer links (Company, Legal) from admin
    useEffect(() => {
        fetch('/api/menu/footer/', { cache: 'no-store' })
            .then(r => r.json())
            .then(data => {
                const company = Array.isArray(data.company) ? data.company : [];
                const legal = Array.isArray(data.legal) ? data.legal : [];
                setCompanyLinks(company);
                setLegalLinks(legal);
            })
            .catch(() => {
                // Ignore menu errors in UI
            });
    }, []);
    // Removed Company/Legal toggle states and bars per request

    // *****************************************************************
    // ******************** DESIGN MODIFICATION HERE *******************
    // ** 1. Removed rounded-t-3xl from footer.                       **
    // ** 2. Added a Wave DIV with clip-path at the top.              **
    // ** 3. Used negative margin (-mt-10) on the FORM SECTION.       **
    // *****************************************************************
    return (
        <footer className="bg-black text-gray-300 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Top panel: logo + description like the screenshot */}
                <div className="bg-[#111] border border-neutral-800 p-6 md:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex items-center gap-4">
                            {logoUrl ? (
                                <SmartImage src={logoUrl} alt={brandName} style={logoHeight ? { height: `${logoHeight}px` } : undefined} className="w-auto" />
                            ) : null}
                            <h2 className="text-white text-xl font-semibold">{brandName}</h2>
                        </div>
                        <p className="text-sm text-gray-300 max-w-3xl">
                            {footerText}
                        </p>
                    </div>

                    {/* Company + Legal sections */}
                    {(companyLinks?.length > 0 || legalLinks?.length > 0) && (
                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                            {companyLinks?.length > 0 && (
                                <div>
                                    <h3 className="text-white font-semibold mb-3">Company</h3>
                                    <div className="flex flex-col gap-2">
                                        <SmartLink
                                            href="/guide"
                                            className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                                        >
                                            Read Our Main Guide
                                        </SmartLink>
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
                    {socialLinks && socialLinks.length > 0 ? (
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
                <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        {logoUrl ? (
                            <SmartImage src={logoUrl} alt={brandName} style={logoHeight ? { height: `${logoHeight}px` } : undefined} className="w-auto" />
                        ) : null}
                        <FooterCopyright brandName={brandName} />
                    </div>
                    {legalLinks?.length > 0 && (
                        <div className="flex items-center gap-4 text-xs">
                            {legalLinks.map((item, idx) => (
                                <SmartLink
                                    key={`legal-inline-${idx}`}
                                    href={resolveHref(item)}
                                    className="text-gray-300 hover:text-white"
                                >
                                    {item.name}
                                </SmartLink>
                            ))}
                        </div>
                    )}
                </div>

                <p className="mt-4 pt-4 border-t border-neutral-800 text-[10px] sm:text-xs leading-relaxed text-gray-400">
                    {disclaimer || (
                        "Disclaimer: CarInsuranceComparison.com strives to present the most up-to-date and comprehensive information on saving money on car insurance possible. This information may be different than what you see when you visit an insurance provider, insurance agency, or insurance company website. All insurance rates, products, and services are presented without warranty and guarantee. When evaluating rates, please verify directly with your insurance company or agent. Quotes and offers are not binding, nor a guarantee of coverage."
                    )}
                </p>

                {address ? (
                    <div className="w-full mt-2">
                        <p className="text-xs text-gray-500">{address}</p>
                    </div>
                ) : null}
            </div>
        </footer>
    );
};

export default Footer;

function resolveHref(item) {
    if (item.href) return item.href;
    if (item.page_slug) {
        const anchor = item.anchor_id ? `#${String(item.anchor_id)}` : "";
        return `/${encodeURIComponent(String(item.page_slug || ''))}${anchor}`;
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
