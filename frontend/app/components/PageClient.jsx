"use client";

import React from 'react';
import PageHero from './PageHero.jsx';
import SectionRenderer from './SectionRenderer.jsx';
import HelpfulLinks from './HelpfulLinks.jsx';

export default function PageClient({ slug }) {
  const [data, setData] = React.useState({ sections: [], meta: {} });
  const [footerMenu, setFooterMenu] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(`/api/page/${encodeURIComponent(slug)}`, { cache: 'no-store', signal: controller.signal });
        clearTimeout(timer);
        if (res.ok) {
          const json = await res.json();
          if (!cancelled) setData(json || { sections: [], meta: {} });
        } else {
          if (!cancelled) setData({ sections: [], meta: {} });
        }
      } catch (_) {
        if (!cancelled) setData({ sections: [], meta: {} });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (slug) load();
    return () => { cancelled = true; };
  }, [slug]);

  // Dynamic page title update
  React.useEffect(() => {
    const metaTitle = (data?.meta?.title || slug || 'Page').trim();
    if (metaTitle) {
      document.title = metaTitle;
      
      // Update meta description if available
      const metaDescription = data?.meta?.description;
      if (metaDescription) {
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute('content', metaDescription);
        }
      }
    }
  }, [data?.meta?.title, data?.meta?.description, slug]);

  React.useEffect(() => {
    let cancelled = false;
    async function loadMenu() {
      try {
        const res = await fetch('/api/menu/footer/', { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) setFooterMenu(json);
      } catch {}
    }
    loadMenu();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse mb-8">
          <div className="h-8 bg-gray-200 rounded w-2/3 mb-3"></div>
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl"></div>
        <div className="mt-10 space-y-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </main>
    );
  }

  const sections = Array.isArray(data.sections) ? data.sections : [];
  const meta = data?.meta || {};
  const metaTitle = (meta.title || slug || 'Page').trim();
  const metaSubtitle = (meta.description || '').trim();
  const metaHeroImage = meta.hero_image || null;

  const slugLc = String(slug || '').toLowerCase();
  const companyLinks = Array.isArray(footerMenu?.company) ? footerMenu.company : [];
  const legalLinks = Array.isArray(footerMenu?.legal) ? footerMenu.legal : [];
  const helpfulLinks = [...companyLinks, ...legalLinks].filter((l) => String(l.page_slug || '').toLowerCase() !== slugLc);

  // Detect footer pages (company/legal) – show hero then content
  const allFooterSlugs = [...companyLinks, ...legalLinks].map((i) => String(i.page_slug || '').toLowerCase());
  const isFooterPage = allFooterSlugs.includes(slugLc);

  return (
    <>
      <PageHero title={metaTitle} subtitle={metaSubtitle} imageUrl={metaHeroImage} variant="dark" />
      <SectionRenderer sections={sections} />
      {isFooterPage ? <HelpfulLinks links={helpfulLinks} attachToFooter /> : null}
    </>
  );
}