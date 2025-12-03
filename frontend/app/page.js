import React from "react";
import HeroWithNavbar from "./components/HeroWithNavbar.jsx";
import WhyChooseSection from "./components/WhyChooseSection.jsx";
// FeaturedIn removed per request
import SectionRenderer from "./components/SectionRenderer.jsx";
import ClientHomepage from "./ClientHomepage.jsx";

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
      if (data?.meta_title) {
        return {
          title: data.meta_title,
          description: data.meta_description || '',
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

export default function HomePage() {
  // Render without server-side data to avoid route-level loading issues
  const sections = [];
  const lowerType = (t) => String(t || '').toLowerCase();
  const baseContentSections = sections.filter((s) => 
    lowerType(s.type) !== 'featured' && 
    !['video','embed'].includes(lowerType(s.type)) &&
    String(s.title || '').toLowerCase() !== 'featured in' &&
    !String(s.title || '').toLowerCase().includes('insurance guide')
  );

  // Remove specific homepage sections per your request
  const UNWANTED_PHRASES = [
    'Featured In',
    'Why Choose Us',
    'insurance guides',
    'coverage basics',
    'rate factors',
    'savings tips',
    'Embedded Video',
    'Video Embed',
    'Featured Video',
    'Sample iframe via Editor Blocks',
    'Get up to speed quickly.',
    'transparent, accurate, and easy to compare.',
    'we make shopping for auto insurance simpler.'
  ].map((s) => s.toLowerCase());

  const removeUnwantedHomepageContent = (secs) => {
    return (Array.isArray(secs) ? secs : []).filter((s) => {
      const blob = [
        s.title,
        s.subtitle,
        s.body,
        s.col1_rich,
        s.col2_rich,
        s.col3_rich,
        s.col4_rich,
        s.col5_rich,
      ]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase())
        .join(' ');
      return !UNWANTED_PHRASES.some((ph) => blob.includes(ph));
    });
  };

  const contentSections = removeUnwantedHomepageContent(baseContentSections);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero with Integrated Navbar */}
      <HeroWithNavbar />

      {/* Why Choose Us Section */}
      <WhyChooseSection />

      {/* Removed Featured In and videos below per request */}

      {/* CKEditor (DB-driven) content sections */}
      {contentSections.length ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <SectionRenderer sections={contentSections} />
        </div>
      ) : null}

      {/* Articles at the bottom */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <ClientHomepage />
      </div>
    </main>
  );
}