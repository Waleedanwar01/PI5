"use client";

import React from 'react';
import PageHero from './PageHero.jsx';
import SectionRenderer, { RichHTML } from './SectionRenderer.jsx';
import HelpfulLinks from './HelpfulLinks.jsx';
import TeamGrid from './TeamGrid.jsx';
import PressBox from './PressBox.jsx';
import { getMediaBase } from '../lib/config.js';

export default function PageClient({ slug }) {
  const [data, setData] = React.useState({ sections: [], team_members: [], press_items: [], meta: {} });
  const [footerMenu, setFooterMenu] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 15000);
        
        // Try fetching Page first
        let res = await fetch(`/api/page/${encodeURIComponent(slug)}`, { cache: 'no-store', signal: controller.signal });
        
        let found = false;
        if (res.ok) {
          const json = await res.json();
          // Check if we got a valid page (usually has sections or meta)
          if (json && (json.sections?.length > 0 || json.meta?.title)) {
             if (!cancelled) setData(json);
             found = true;
          }
        }
        
        // If not found, try fetching MainPage
        if (!found) {
            const resMain = await fetch(`/api/main-page/${encodeURIComponent(slug)}`, { cache: 'no-store', signal: controller.signal });
            if (resMain.ok) {
                const jsonMain = await resMain.json();
                if (jsonMain && jsonMain.page) {
                    // Map MainPage to Page structure
                    const mappedData = {
                        meta: {
                            title: jsonMain.page.name,
                            meta_title: jsonMain.page.meta_title,
                            meta_description: jsonMain.page.meta_description,
                            meta_keywords: jsonMain.page.meta_keywords,
                        },
                        sections: []
                    };
                    if (!cancelled) setData(mappedData);
                    found = true;
                }
            }
        }

        if (!found && !cancelled) setData({ sections: [], meta: {} });
        clearTimeout(timer);
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
    // Prioritize meta_title if available, then title, then slug
    const metaTitle = (data?.meta?.meta_title || data?.meta?.title || slug || 'Page').trim();
    if (metaTitle) {
      document.title = metaTitle;
      
      // Update meta description if available
      const metaDescription = data?.meta?.meta_description || data?.meta?.description;
      if (metaDescription) {
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute('content', metaDescription);
        }
        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) {
          ogDesc.setAttribute('content', metaDescription);
        }
      }

      // Update og:title
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', metaTitle);
      }
    }
  }, [data?.meta?.meta_title, data?.meta?.title, data?.meta?.meta_description, data?.meta?.description, slug]);

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

  const meta = data?.meta || {};
  let sections = Array.isArray(data.sections) ? [...data.sections] : [];

  // Filter out unwanted sections (What We Do, Our Services)
  sections = sections.filter(section => {
    const title = (section.title || '').toLowerCase();
    return title !== 'what we do' && title !== 'our services';
  });

  const displayTitle = (meta.title || slug || 'Page').trim();
  const metaSubtitle = (meta.description || '').trim();
  const metaHeroImage = meta.hero_image || null;

  const slugLc = String(slug || '').toLowerCase();
  const companyLinks = Array.isArray(footerMenu?.company) ? footerMenu.company : [];
  const legalLinks = Array.isArray(footerMenu?.legal) ? footerMenu.legal : [];
  // Fix: API returns 'slug', not 'page_slug'
  const helpfulLinks = [...companyLinks, ...legalLinks].filter((l) => String(l.slug || '').toLowerCase() !== slugLc);

  // Detect footer pages (company/legal) – show hero then content
  const allFooterSlugs = [...companyLinks, ...legalLinks].map((i) => String(i.slug || '').toLowerCase());
  const isFooterPage = allFooterSlugs.includes(slugLc);

  // Filter out redundant sections (e.g. sections that just repeat the title)
  const filteredSections = sections.filter(s => {
     const cleanBody = (s.body || '').replace(/<[^>]*>/g, '').replace(/\s+/g, '').toLowerCase();
     const cleanTitle = (s.title || '').replace(/\s+/g, '').toLowerCase();
     const cleanDisplay = (displayTitle || '').replace(/\s+/g, '').toLowerCase();
     const cleanTarget = 'privacypolicy';
     
     // If body is empty or just repeats the title/Privacy Policy, hide it
     if (!cleanBody || cleanBody === cleanTitle || cleanBody === cleanDisplay || cleanBody === cleanTarget) {
         return false;
     }
     
     return true;
  });

  // Fallback fake images for company/legal pages if no hero image is provided
  // Using reliable Unsplash Source placeholders
  const fakeImages = [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80', // Office
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80', // Building
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80', // Finance/Papers
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80', // Handshake
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80'  // Desk
  ];
  
  // Deterministic selection based on slug length to keep it consistent per page
  const fakeImage = fakeImages[slug.length % fakeImages.length];

  const finalHeroImage = metaHeroImage || fakeImage;

  // For Privacy Policy, hide the subtitle if it's redundant (same as title) or generic
  const displaySubtitle = slugLc === 'privacy-policy' ? null : metaSubtitle;

  return (
    <>
      <PageHero 
        title={displayTitle} 
        subtitle={displaySubtitle} 
        imageUrl={finalHeroImage} 
        variant="dark"
        align="left"
      />
      
      <div className="bg-white min-h-screen">
        {/* Main Content (Top) */}
        {meta.content && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="prose prose-lg max-w-none prose-indigo">
              <RichHTML html={meta.content} />
            </div>
          </section>
        )}

        {/* Existing Sections */}
        {filteredSections.length > 0 && (
          <div className="space-y-16 py-10">
            <SectionRenderer sections={filteredSections} cleanMode={isFooterPage} mediaBase={getMediaBase()} />
          </div>
        )}

        {/* Main Content (Bottom) */}
        {meta.content_bottom && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="prose prose-lg max-w-none prose-indigo">
              <RichHTML html={meta.content_bottom} />
            </div>
          </section>
        )}

        {/* 2. Team Members */}
        {data.team_members && data.team_members.length > 0 && (
          <TeamGrid members={data.team_members} />
        )}

        {/* 3. Press Box */}
        {data.press_items && data.press_items.length > 0 && (
            <PressBox items={data.press_items} />
        )}
      </div>
      
      {isFooterPage ? <HelpfulLinks links={helpfulLinks} attachToFooter /> : null}
    </>
  );
}