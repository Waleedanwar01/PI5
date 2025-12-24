"use client"
import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar.jsx';
import FooterWithBlueForm from './FooterWithBlueForm.jsx';
import BackToTop from './BackToTop.jsx';
import FloatingQuoteButton from './FloatingQuoteButton.jsx';
import { getMediaUrl } from '../lib/config.js';

export default function ClientLayout({ children }) {
  const pathname = usePathname();

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

  // Read site-config on mount and apply admin-configured orange accent
  React.useEffect(() => {
    let mounted = true;
    const versioned = (u, v) => {
      const url = String(u || '').trim();
      if (!url) return null;
      const sep = url.includes('?') ? '&' : '?';
      return v ? `${url}${sep}v=${encodeURIComponent(v)}` : url;
    };
    const hexToRgb = (hex) => {
      const m = hex.match(/^#([0-9a-fA-F]{6})$/);
      if (!m) return null;
      const int = parseInt(m[1], 16);
      return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
    };
    const mixWithWhite = (rgb, t) => {
      const toHex = (n) => n.toString(16).padStart(2, '0');
      const r = Math.round(rgb.r + (255 - rgb.r) * t);
      const g = Math.round(rgb.g + (255 - rgb.g) * t);
      const b = Math.round(rgb.b + (255 - rgb.b) * t);
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };
    const applyFavicon = (cfg) => {
      try {
        const rawIcon = cfg?.favicon_url || cfg?.logo_icon_url || cfg?.logo_url || null;
        const fav = versioned(getMediaUrl(rawIcon), cfg?.updated_at);
        if (!fav || !mounted) return;
        const ext = (rawIcon || '').split('.').pop()?.toLowerCase();
        const type = ext === 'png' ? 'image/png' : ext === 'svg' ? 'image/svg+xml' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/x-icon';
        const ensureLink = (rel, href, t) => {
          let link = document.querySelector(`link[rel="${rel}"]`);
          if (!link) {
            link = document.createElement('link');
            link.setAttribute('rel', rel);
            document.head.appendChild(link);
          }
          link.setAttribute('href', href);
          if (t) link.setAttribute('type', t);
        };
        ensureLink('icon', fav, type);
        ensureLink('shortcut icon', fav, type);
        ensureLink('apple-touch-icon', fav, type);
      } catch {}
    };

    const applyConfig = (cfg) => {
        // Apply favicon from admin config - DISABLED per user request for stability
        // applyFavicon(cfg);
        const orange = (cfg?.accent_orange_hex || '').trim();
        const orangeHover = (cfg?.accent_orange_hover_hex || '').trim();
        const gradFrom = (cfg?.accent_gradient_from_hex || '').trim() || orange;
        const gradTo = (cfg?.accent_gradient_to_hex || '').trim() || orangeHover || orange;
        if (mounted && orange && /^#([0-9a-fA-F]{6})$/.test(orange)) {
          document.documentElement.style.setProperty('--ai-orange-700', orange);
          const rgb = hexToRgb(orange);
          if (rgb) {
            // expose raw rgb for alpha utilities
            document.documentElement.style.setProperty('--ai-orange-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
            const o50 = mixWithWhite(rgb, 0.95);
            const o100 = mixWithWhite(rgb, 0.90);
            const o200 = mixWithWhite(rgb, 0.85);
            const o300 = mixWithWhite(rgb, 0.70);
            const o400 = mixWithWhite(rgb, 0.60);
            const o500 = mixWithWhite(rgb, 0.50);
            document.documentElement.style.setProperty('--ai-orange-50', o50);
            document.documentElement.style.setProperty('--ai-orange-100', o100);
            document.documentElement.style.setProperty('--ai-orange-200', o200);
            document.documentElement.style.setProperty('--ai-orange-300', o300);
            document.documentElement.style.setProperty('--ai-orange-400', o400);
            document.documentElement.style.setProperty('--ai-orange-500', o500);
          }
        }
        if (mounted && orangeHover && /^#([0-9a-fA-F]{6})$/.test(orangeHover)) {
          document.documentElement.style.setProperty('--ai-orange-hover', orangeHover);
          const rgbH = hexToRgb(orangeHover);
          if (rgbH) {
            document.documentElement.style.setProperty('--ai-orange-hover-rgb', `${rgbH.r}, ${rgbH.g}, ${rgbH.b}`);
          }
        }
        // Apply gradient endpoints (with fallbacks to accent colors)
        if (mounted && /^#([0-9a-fA-F]{6})$/.test(gradFrom)) {
          document.documentElement.style.setProperty('--ai-gradient-from', gradFrom);
          const rgbGF = hexToRgb(gradFrom);
          if (rgbGF) {
            document.documentElement.style.setProperty('--ai-gradient-from-rgb', `${rgbGF.r}, ${rgbGF.g}, ${rgbGF.b}`);
          }
        }
        if (mounted && /^#([0-9a-fA-F]{6})$/.test(gradTo)) {
          document.documentElement.style.setProperty('--ai-gradient-to', gradTo);
          const rgbGT = hexToRgb(gradTo);
          if (rgbGT) {
            document.documentElement.style.setProperty('--ai-gradient-to-rgb', `${rgbGT.r}, ${rgbGT.g}, ${rgbGT.b}`);
          }
        }
        // Theme controls: expose global CSS variables based on SiteConfig
        const btnRadius = Number(cfg?.buttons_radius_px ?? 8);
        const btnBorder = Number(cfg?.buttons_border_width_px ?? 1);
        const btnUpper = Boolean(cfg?.buttons_uppercase ?? false);
        const btnWeight = String(cfg?.buttons_font_weight ?? '').trim();
        const hWeight = String(cfg?.headings_font_weight ?? '').trim();
        const linkUnderline = Boolean(cfg?.links_underline ?? false);
        const linkWeight = String(cfg?.links_font_weight ?? '').trim();
        document.documentElement.style.setProperty('--btn-radius', `${isNaN(btnRadius) ? 8 : btnRadius}px`);
        document.documentElement.style.setProperty('--btn-border-width', `${isNaN(btnBorder) ? 1 : btnBorder}px`);
        document.documentElement.style.setProperty('--btn-text-transform', btnUpper ? 'uppercase' : 'none');
        if (btnWeight) document.documentElement.style.setProperty('--btn-font-weight', btnWeight);
        if (hWeight) document.documentElement.style.setProperty('--heading-weight', hWeight);
        document.documentElement.style.setProperty('--link-underline', linkUnderline ? 'underline' : 'none');
        if (linkWeight) document.documentElement.style.setProperty('--link-font-weight', linkWeight);
    };

    const applyAccent = async () => {
      try {
        // Try to get homepage data first for favicon, then fallback to site-config
        // OPTIMIZATION: Removed client-side homepage fetch for title to speed up loading.
        // Title is handled server-side in page.js.
        /*
        let cfg = {};
        try {
          const homepageRes = await fetch('/api/homepage/', { cache: 'no-store' });
          if (homepageRes.ok) {
            const homepageData = await homepageRes.json();
            if (homepageData.meta_title) {
              document.title = homepageData.meta_title;
            }
          }
        } catch (e) {
          // Fallback to site-config if homepage fails
        }
        */
        
        // Try cache first
        const cachedConfig = loadCache('client_layout_config');
        if (cachedConfig) {
            applyConfig(cachedConfig);
        }

        const res = await fetch('/api/site-config/', { cache: 'no-store' });
        if (!res.ok) return;
        cfg = await res.json();
        
        applyConfig(cfg);
        saveCache('client_layout_config', cfg);

      } catch {}
    };
    applyAccent();
    return () => { mounted = false; };
  }, []);
  return (
    <>
      <Navbar />
      <div className="h-20 sm:h-16 lg:h-16" aria-hidden="true"></div>
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">{children}</main>
        {/* Global spacer above footer for pleasant breathing room */}
        <div className="h-8 sm:h-10 lg:h-12" aria-hidden="true"></div>
        <FloatingQuoteButton />
        <BackToTop />
        <FooterWithBlueForm />
      </div>
    </>
  );
}
