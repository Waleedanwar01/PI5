import React from "react";
import HeroWithNavbar from "./components/HeroWithNavbar.jsx";
import HowItWorks from "./components/HowItWorks.jsx";
import WhyChooseSection from "./components/WhyChooseSection.jsx";
// FeaturedIn removed per request
import SectionRenderer, { RichHTML } from "./components/SectionRenderer.jsx";
import ClientHomepage from "./ClientHomepage.jsx";

export const dynamic = 'force-dynamic';

// Ensure this page is static at the server level; all dynamic
// content loads in client components without blocking route rendering.

export async function generateMetadata() {
  try {
    // Try to fetch homepage data first
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000';
    const homepageUrl = `${base}/api/homepage/`;
    const response = await fetch(homepageUrl, { cache: 'no-store' });
    
    if (response.ok) {
      const data = await response.json();
      if (data?.meta?.meta_title) {
        return {
          title: data.meta.meta_title,
          description: data.meta.meta_description || '',
        };
      }
    }
  } catch (error) {
    console.error('Error fetching homepage metadata:', error);
  }
  
  try {
    // Fallback to site config
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000';
    const siteConfigUrl = `${base}/api/site-config/`;
    const response = await fetch(siteConfigUrl, { cache: 'no-store' });
    
    if (response.ok) {
      const data = await response.json();
      return {
        title: data?.brand_name || "Car Insurance Comparison",
        description: data?.tagline || "Compare car insurance rates",
      };
    }
  } catch (error) {
    console.error('Error fetching site config metadata:', error);
  }
  
  // Final fallback
  return {
    title: "Car Insurance Comparison",
    description: "Compare car insurance rates and find the best coverage for you",
  };
}

export default async function HomePage() {
  // Fetch homepage data server-side
  let sections = [];
  let homepageContent = "";
  let meta = {};
  let pressLogos = [];

  try {
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000';
    const res = await fetch(`${base}/api/homepage/`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      sections = data.sections || [];
      homepageContent = data.meta?.content || "";
      meta = data.meta || {};
      pressLogos = data.press_logos || [];
    }
  } catch (error) {
    console.error("Error fetching homepage sections:", error);
  }

  // Filter out unwanted sections
  const contentSections = sections.filter(section => {
    const titleLc = String(section.title || '').toLowerCase();
    const subtitleLc = String(section.subtitle || '').toLowerCase();
    
    // Remove Why Choose Us, Featured In, and Insurance Guides
    return !titleLc.includes('featured in') && 
           !titleLc.includes('insurance guides') &&
           !titleLc.includes('why choose us') &&
           !subtitleLc.includes('transparent, accurate, and easy to compare') &&
           !subtitleLc.includes('get up to speed quickly');
  });

  return (
    <main className="min-h-screen bg-white text-slate-600">
      {/* Hero with Integrated Navbar */}
      <HeroWithNavbar initialPressLogos={pressLogos} />

      {/* How It Works Section (Static, responsive, animated car) */}
      <HowItWorks />

      {/* CKEditor (DB-driven) content rendered Server-Side */}
      {homepageContent && (
        <div className="mx-auto max-w-7xl px-8 sm:px-12 lg:px-16 py-8">
            <div className="prose prose-sm md:prose-base max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-sky-600 hover:prose-a:text-sky-700 prose-img:rounded-xl prose-img:shadow-lg leading-snug">
              <RichHTML html={homepageContent} />
            </div>
        </div>
      )}

      {/* Dynamic Sections */}
      {contentSections.length ? (
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-8 py-12 sm:py-16">
          <SectionRenderer sections={contentSections} mediaBase={process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000'} />
        </div>
      ) : null}

      {/* Articles at the bottom - Client Component */}
      <div className="pb-16">
        <ClientHomepage initialMeta={meta} />
      </div>
    </main>
  );
}