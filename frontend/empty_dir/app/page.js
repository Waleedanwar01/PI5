import React from "react";
import LandingHero from "./components/LandingHero.jsx";
import CarsRunningSection from "./components/CarsRunningSection.jsx";
// FeaturedIn removed per request
import SectionRenderer from "./components/SectionRenderer.jsx";
import ClientHomepage from "./ClientHomepage.jsx";

// Ensure this page is static at the server level; all dynamic
// content loads in client components without blocking route rendering.

export async function generateMetadata() {
  // Use simple static metadata to avoid any network-induced suspense
  const title = "Home";
  const description = "Welcome";
  return {
    title,
    description,
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
      {/* Hero at top */}
      <LandingHero />

      {/* Cars Running Section with Ocean Wave Design */}
      <CarsRunningSection />

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