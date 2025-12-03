"use client";
import React, { useEffect, useState } from "react";
import SectionRenderer from "./SectionRenderer.jsx";

export default function HeroWithForm() {
  const [submitted, setSubmitted] = useState(false);
  const [heroImage, setHeroImage] = useState(null);
  const [heroVideoUrl, setHeroVideoUrl] = useState(null);
  const [heroVideoType, setHeroVideoType] = useState(null); // 'embed' | 'file'
  const [c1Up, setC1Up] = useState(true);
  const [c2Up, setC2Up] = useState(false);
  const [featuredSections, setFeaturedSections] = useState([]);
  const [guideSections, setGuideSections] = useState([]);

  // Extract guide links from rich_text HTML (li > a)
  const extractGuideLinks = (html) => {
    if (typeof html !== 'string' || !html) return [];
    const links = [];
    // Simple regex to find <li><a href="...">Text</a></li>
    const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let liMatch;
    while ((liMatch = liRegex.exec(html)) !== null) {
      const liContent = liMatch[1] || '';
      const aRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i;
      const aMatch = aRegex.exec(liContent);
      if (aMatch) {
        const href = aMatch[1];
        const text = aMatch[2].replace(/<[^>]+>/g, '').trim();
        if (href && text) {
          links.push({ href, text });
        }
      }
    }
    return links;
  };

  useEffect(() => {
    // Fetch hero image and any admin-provided video from homepage API
    fetch('/api/homepage/', { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => {
        const meta = json?.meta || {};
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';
        // Fix hero image path to include API base URL
        let heroImagePath = meta.hero_image || null;
        if (heroImagePath && heroImagePath.startsWith('/media/')) {
          heroImagePath = `${API_BASE.replace(/\/$/, '')}${heroImagePath}`;
        }
        setHeroImage(heroImagePath);

        // Try to locate a video or embed in sections
        const sections = Array.isArray(json?.sections) ? json.sections : [];
        const collectedFeatured = [];
        const collectedGuides = [];
        let embed = null;
        let file = null;
        const rewrite = (url) => {
          if (typeof url !== 'string' || !url) return url;
          if (url.startsWith('/media/')) return `${API_BASE?.replace(/\/$/, '')}${url}`;
          return url;
        };

        for (const s of sections) {
          const type = String(s?.type || '').toLowerCase();
          const titleLc = String(s?.title || '').toLowerCase();
          // Skip Featured In and Insurance Guides sections - don't collect them
          if (type === 'featured' || titleLc.includes('featured in') || 
              titleLc.includes('insurance guide') || titleLc.includes('insurance guides')) {
            continue; // Skip these sections completely
          }
          // Direct embed section
          if (!embed && type === 'embed' && s.url) {
            embed = s.url;
          }
          // Video section (file or embed url)
          if (!file && type === 'video' && s.video_url) {
            const raw = String(s.video_url || '');
            const isFile = /(\.mp4|\.webm|\.ogg)(\?.*)?$/i.test(raw) || raw.startsWith('/media/');
            if (isFile) file = rewrite(raw);
            else if (!embed) embed = raw;
          }
          // Editor blocks with embed
          if (!embed && s.editor_blocks) {
            const blocks = Array.isArray(s.editor_blocks?.blocks) ? s.editor_blocks.blocks : (Array.isArray(s.editor_blocks) ? s.editor_blocks : []);
            for (const b of blocks) {
              const bt = b?.type || b?.block_type || '';
              if (String(bt).toLowerCase() === 'embed') {
                const d = b?.data || b?.value || {};
                embed = d.embed || d.source || d.url || null;
                if (embed) break;
              }
            }
          }
          if (embed && file) break;
        }

        // Deduplicate by resolved id (id | anchor_id | slugified title)
        const getId = (s) => {
          const raw = s?.id || s?.anchor_id || s?.title || '';
          return String(raw).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
        };
        const uniq = (arr) => {
          const seen = new Set();
          const out = [];
          for (const item of arr) {
            const k = getId(item) || Math.random().toString(36).slice(2);
            if (seen.has(k)) continue;
            seen.add(k);
            out.push(item);
          }
          return out;
        };
        setFeaturedSections(uniq(collectedFeatured));
        setGuideSections(uniq(collectedGuides));

        if (embed) {
          setHeroVideoUrl(embed);
          setHeroVideoType('embed');
        } else if (file) {
          setHeroVideoUrl(file);
          setHeroVideoType('file');
        } else {
          setHeroVideoUrl(null);
          setHeroVideoType(null);
        }
      })
      .catch(() => {});
  }, []);

  // Simple floating motion for overlay cards without external libs
  useEffect(() => {
    const id = setInterval(() => {
      setC1Up((prev) => !prev);
      setC2Up((prev) => !prev);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const zipInput = form.querySelector('input[name="zip"]');
    const zip = String(zipInput?.value || '').replace(/\D/g, '').slice(0, 5);
    if (zip.length === 5) {
      window.location.href = `/quotes?zip=${encodeURIComponent(zip)}`;
    } else {
      setSubmitted(true);
    }
  }

  return (
    <section id="hero" className="bg-white scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
          Auto insurance made clear.
        </h1>
        <p className="mt-4 text-xl text-gray-700">Save Money by Comparing Insurance Quotes</p>
        <p className="mt-2 text-lg text-gray-600">Compare Free Insurance Quotes Instantly</p>

        {/* ZIP form */}
        <form onSubmit={handleSubmit} className="mt-8 w-full max-w-xl mx-auto flex flex-col sm:flex-row items-stretch gap-3 bg-white p-3 rounded-xl shadow-sm border border-gray-200">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 0c-4.418 0-8 2.239-8 5v2h16v-2c0-2.761-3.582-5-8-5z" />
              </svg>
            </span>
            <input
              type="text"
              name="zip"
              required
              inputMode="numeric"
              pattern="[0-9]{5}"
              placeholder="ZIP Code"
              className="pl-10 pr-4 py-3 rounded-md border border-gray-300 focus:border-orange-600 focus:ring-orange-600 text-base sm:text-lg w-full sm:w-56 md:w-64"
            />
          </div>
          <button type="submit" className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-orange-600 px-6 py-3 text-white hover:bg-orange-700 text-base sm:text-lg font-semibold">
            GET QUOTES →
          </button>
        </form>

        <p className="mt-3 text-xs text-gray-600 flex items-center justify-center gap-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0-1.105.895-2 2-2s2 .895 2 2v1h-4v-1zM6 11V9a6 6 0 1112 0v2m-1 10H7a2 2 0 01-2-2V11h14v8a2 2 0 01-2 2z" />
          </svg>
          Secured with SHA-256 Encryption
        </p>

        {/* Illustration / hero image from admin with motion cards overlay */}
        <div className="mt-10 relative max-w-5xl mx-auto">
          <img
            src={heroImage || "/images/seeded-hero.png"}
            alt="Hero"
            className="w-full h-auto object-cover rounded-xl"
            loading="eager"
          />
          {/* Motion cards overlay */}
          <div
            className="absolute left-2 top-2 sm:left-6 sm:-top-8 bg-white/90 backdrop-blur rounded-xl border border-gray-200 shadow-md p-2 sm:p-4 z-10"
            style={{ transform: `translateY(${c1Up ? -6 : 6}px)`, transition: 'transform 1500ms ease-in-out' }}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-7 w-7 sm:h-10 sm:w-10 rounded-lg bg-orange-100" />
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-900">98% Satisfaction</p>
                <p className="text-[10px] sm:text-xs text-gray-600">Customer happiness score</p>
              </div>
            </div>
          </div>
          <div
            className="absolute right-2 bottom-2 sm:right-6 sm:bottom-auto sm:-top-12 bg-white/90 backdrop-blur rounded-xl border border-gray-200 shadow-md p-2 sm:p-4 z-10"
            style={{ transform: `translateY(${c2Up ? -6 : 6}px)`, transition: 'transform 1500ms ease-in-out' }}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-7 w-7 sm:h-10 sm:w-10 rounded-lg bg-blue-100" />
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-900">2 min Quote</p>
                <p className="text-[10px] sm:text-xs text-gray-600">Average quote time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Featured In and Insurance Guides (from Admin) shown above video */}
        {featuredSections.length ? (
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-8">
            <SectionRenderer sections={featuredSections} centerText />
          </div>
        ) : null}
        {guideSections.length ? (
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-2">
            {(() => {
              // Try custom card rendering for guide sections if they contain link lists
              let anyLinks = false;
              const rendered = guideSections.map((s, i) => {
                const fg = s?.text_color ? { color: s.text_color } : {};
                const links = extractGuideLinks(s?.body || '');
                if (links.length) anyLinks = true;
                return (
                  <section key={(s.id || s.anchor_id || `guide-${i}`).toString()} className="py-4">
                    <header className="text-center mb-4">
                      {s.title ? (
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight" style={fg}>{s.title}</h2>
                      ) : null}
                      {s.subtitle ? (
                        <p className="mt-1 text-sm md:text-base text-gray-600">{s.subtitle}</p>
                      ) : null}
                    </header>
                    {links.length ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {links.map((ln, idx) => (
                          <a href={ln.href} key={`ln-${idx}`} className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition">
                            <div className="flex items-start gap-3">
                              <div className="h-9 w-9 rounded-lg bg-orange-100 flex-shrink-0 group-hover:bg-orange-200" />
                              <div>
                                <h3 className="text-base md:text-lg font-semibold text-gray-900 group-hover:text-orange-700" style={fg}>{ln.text}</h3>
                                {/* Optional description could be pulled from admin later */}
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </section>
                );
              });
              // If none of the guide sections provided link lists, fallback to generic renderer
              return anyLinks ? rendered : (<SectionRenderer sections={guideSections} />);
            })()}
          </div>
        ) : null}

        {/* Admin-inserted video below hero image (responsive) */}
        {heroVideoUrl && heroVideoType === 'embed' ? (
          <div className="mt-6 aspect-video max-w-3xl md:max-w-2xl mx-auto rounded-lg overflow-hidden border border-gray-200 shadow-sm">
            <iframe
              src={heroVideoUrl}
              title="Featured Video"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : null}

        {heroVideoUrl && heroVideoType === 'file' ? (
          <div className="mt-6 max-w-3xl md:max-w-2xl mx-auto">
            <video src={heroVideoUrl} controls playsInline className="w-full rounded-lg border border-gray-200 shadow-sm" />
          </div>
        ) : null}

        {submitted && (
          <p className="mt-4 text-sm text-green-700">Thanks! We’ll be in touch shortly.</p>
        )}
      </div>
    </section>
  );
}