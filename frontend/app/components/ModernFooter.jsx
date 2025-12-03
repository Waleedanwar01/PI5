"use client";
import React, { useEffect, useState } from "react";
import { Twitter, Youtube, Facebook, Instagram, Linkedin, Globe, Shield, Mail, Phone, MapPin } from "lucide-react";
import SmartLink from './SmartLink.jsx';
import SmartImage from './SmartImage.jsx';
import { getMediaUrl } from '../lib/config.js';
import { api } from './apiUtils.js';

const ModernFooter = () => {
    const [brandName, setBrandName] = useState("Car Insurance Comparison");
    const [logoUrl, setLogoUrl] = useState(null);
    const [logoHeight, setLogoHeight] = useState(null);
    const [disclaimer, setDisclaimer] = useState("");
    const [address, setAddress] = useState("");
    const [addressSource, setAddressSource] = useState(""); // Track where address came from
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

    // Fetch site config
    useEffect(() => {
        const loadSiteConfig = async () => {
            try {
                const data = await api.siteConfig();
                const bn = (data.brand_name || data.site_name || '').trim();
                if (bn) setBrandName(bn);
                if (data.logo_url) setLogoUrl(getMediaUrl(data.logo_url));
                if (data.logo_height) setLogoHeight(data.logo_height);
                const dsc = (data.footer_disclaimer || data.disclaimer || '').trim();
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
            } catch (error) {
                console.error('Error loading site config:', error);
                setSocialLinks([]);
            }
        };

        loadSiteConfig();
    }, []);

    // Fetch footer links
    useEffect(() => {
        const loadFooterMenu = async () => {
            try {
                const data = await api.footerMenu();
                const company = Array.isArray(data.company) ? data.company : [];
                const legal = Array.isArray(data.legal) ? data.legal : [];
                setCompanyLinks(company);
                setLegalLinks(legal);
            } catch (error) {
                console.error('Error loading footer menu:', error);
                setCompanyLinks([]);
                setLegalLinks([]);
            }
        };

        loadFooterMenu();
    }, []);

    // Fetch footer address from articles dynamically
    useEffect(() => {
        const loadFooterAddress = async () => {
            try {
                const data = await api.footerAddress();
                if (data.address) {
                    setAddress(data.address);
                    setAddressSource(data.source || '');
                }
            } catch (error) {
                console.error('Error loading footer address:', error);
                // Silent fail: keep existing address or default
            }
        };

        loadFooterAddress();
    }, []);

    const quickLinks = [
        { name: 'Get Quotes', href: '/quotes' },
        { name: 'Compare Rates', href: '/compare' },
        { name: 'Insurance Guide', href: '/guide' },
        { name: 'Contact Us', href: '/contact' }
    ];

    const services = [
        { name: 'Car Insurance', href: '/car-insurance' },
        { name: 'Motorcycle Insurance', href: '/motorcycle' },
        { name: 'RV Insurance', href: '/rv-insurance' },
        { name: 'Commercial Auto', href: '/commercial' }
    ];

    return (
        <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-orange-600/10 to-yellow-600/10 rounded-full blur-3xl"></div>
            </div>

            {/* Wave separator at top */}
            <div className="relative">
                <svg 
                    className="absolute top-0 left-0 w-full h-16" 
                    viewBox="0 0 1200 120" 
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path 
                        d="M0,120 C150,60 350,180 600,120 C850,60 1050,180 1200,120 L1200,0 L0,0 Z" 
                        fill="url(#footerWaveGradient)"
                    />
                    <defs>
                        <linearGradient id="footerWaveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#374151" />
                            <stop offset="50%" stopColor="#1f2937" />
                            <stop offset="100%" stopColor="#111827" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Brand Section */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-3 mb-6">
                            {logoUrl ? (
                                <SmartImage src={logoUrl} alt={brandName} style={logoHeight ? { height: `${logoHeight}px` } : undefined} className="w-auto" />
                            ) : (
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-white" />
                                </div>
                            )}
                            <h3 className="text-xl font-bold text-white">{brandName}</h3>
                        </div>
                        
                        <p className="text-gray-300 mb-6 leading-relaxed">
                            Your trusted partner in finding the best car insurance rates. We compare quotes from 50+ top insurers to save you money.
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-gray-400">
                                <Mail className="w-4 h-4" />
                                <span className="text-sm">support@carinsurance.com</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-400">
                                <Phone className="w-4 h-4" />
                                <span className="text-sm">1-800-INSURE</span>
                            </div>
                            {address ? (
                                <div className="flex items-start gap-3 text-gray-400">
                                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm leading-relaxed">{address}</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-gray-400">
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-sm">Available Nationwide</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-6">Quick Links</h4>
                        <div className="space-y-3">
                            {quickLinks.map((link, index) => (
                                <SmartLink
                                    key={index}
                                    href={link.href}
                                    className="block text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 transform"
                                >
                                    {link.name}
                                </SmartLink>
                            ))}
                        </div>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-6">Insurance Types</h4>
                        <div className="space-y-3">
                            {services.map((service, index) => (
                                <SmartLink
                                    key={index}
                                    href={service.href}
                                    className="block text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 transform"
                                >
                                    {service.name}
                                </SmartLink>
                            ))}
                        </div>
                    </div>

                    {/* Company & Legal */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-6">Company</h4>
                        <div className="space-y-3 mb-8">
                            {companyLinks.map((item, idx) => (
                                <SmartLink
                                    key={`company-${idx}`}
                                    href={resolveHref(item)}
                                    className="block text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 transform"
                                >
                                    {item.name}
                                </SmartLink>
                            ))}
                        </div>

                        {/* Social Links */}
                        {socialLinks && socialLinks.length > 0 && (
                            <div>
                                <h5 className="text-white font-medium mb-4">Follow Us</h5>
                                <div className="flex gap-3">
                                    {socialLinks.map((href, idx) => {
                                        const Icon = iconFor(href);
                                        return (
                                            <a
                                                key={`social-${idx}`}
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-10 h-10 bg-gray-700 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                                                aria-label="Social link"
                                            >
                                                <Icon className="w-5 h-5" />
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Newsletter Section */}
                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-12">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                        <div className="text-center lg:text-left">
                            <h4 className="text-xl font-bold text-white mb-2">Stay Updated</h4>
                            <p className="text-gray-300">Get the latest insurance tips and exclusive deals delivered to your inbox.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white/20 transition-all duration-200 flex-1 lg:w-64"
                            />
                            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Legal Links */}
                {legalLinks && legalLinks.length > 0 && (
                    <div className="border-t border-gray-700 pt-8 mb-8">
                        <div className="flex flex-wrap justify-center lg:justify-start gap-6">
                            {legalLinks.map((item, idx) => (
                                <SmartLink
                                    key={`legal-${idx}`}
                                    href={resolveHref(item)}
                                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                                >
                                    {item.name}
                                </SmartLink>
                            ))}
                        </div>
                    </div>
                )}

                {/* Bottom Bar */}
                <div className="border-t border-gray-700 pt-8">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <FooterCopyright brandName={brandName} />
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                                <Shield className="w-4 h-4" />
                                <span>Secure & Trusted</span>
                            </span>
                            <span>•</span>
                            <span>SHA-256 Encrypted</span>
                            <span>•</span>
                            <span>24/7 Support</span>
                        </div>
                    </div>
                </div>

                {/* Disclaimer */}
                {disclaimer && (
                    <div className="mt-6 pt-6 border-t border-gray-700">
                        <p className="text-xs text-gray-400 leading-relaxed">
                            {disclaimer}
                        </p>
                    </div>
                )}
            </div>
        </footer>
    );
};

export default ModernFooter;

function resolveHref(item) {
    if (item.href) return item.href;
    if (item.page_slug) {
        const anchor = item.anchor_id ? `#${String(item.anchor_id)}` : "";
        return `/${encodeURIComponent(String(item.page_slug || ''))}${anchor}`;
    }
    return "#";
}

function FooterCopyright({ brandName }) {
    const [copyright, setCopyright] = useState("");
    useEffect(() => {
        const loadCopyright = async () => {
            try {
                const data = await api.siteConfig();
                const txt = (data.copyright_text || '').trim();
                if (txt) {
                    setCopyright(txt);
                } else {
                    const year = new Date().getFullYear();
                    setCopyright(`© ${year} ${brandName}. All rights reserved.`);
                }
            } catch (error) {
                console.error('Error loading copyright:', error);
                const year = new Date().getFullYear();
                setCopyright(`© ${year} ${brandName}. All rights reserved.`);
            }
        };

        loadCopyright();
    }, [brandName]);
    return (
        <p className="text-gray-400 font-medium text-sm">{copyright}</p>
    );
}