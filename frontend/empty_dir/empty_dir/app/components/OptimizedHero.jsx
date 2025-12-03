"use client";
import React, { useEffect, useState, useRef } from "react";
import SectionRenderer from "./SectionRenderer.jsx";

export default function OptimizedHero() {
  const [submitted, setSubmitted] = useState(false);
  const [heroImage, setHeroImage] = useState(null);
  const [heroImageLoading, setHeroImageLoading] = useState(true);
  const [heroImageError, setHeroImageError] = useState(false);
  const [heroVideoUrl, setHeroVideoUrl] = useState(null);
  const [heroVideoType, setHeroVideoType] = useState(null);
  const [heroVideoLoading, setHeroVideoLoading] = useState(false);
  const [c1Up, setC1Up] = useState(true);
  const [c2Up, setC2Up] = useState(false);
  const [featuredSections, setFeaturedSections] = useState([]);
  const [guideSections, setGuideSections] = useState([]);
  const [allVideos, setAllVideos] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const heroImageRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && heroImageRef.current) {
            const img = heroImageRef.current;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (heroImageRef.current) {
      observer.observe(heroImageRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Extract guide links from rich_text HTML (li > a)
  const extractGuideLinks = (html) => {
    if (typeof html !== 'string' || !html) return [];
    const links = [];
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

  // Smart image loading with error handling
  const handleImageLoad = () => {
    setHeroImageLoading(false);
    setHeroImageError(false);
  };

  const handleImageError = () => {
    setHeroImageLoading(false);
    setHeroImageError(true);
    setHeroImage('/images/seeded-hero.png'); // Fallback image
  };

  // Get responsive image URLs
  const getResponsiveImageUrl = (baseUrl, width) => {
    if (!baseUrl) return null;
    // For now, return the same URL. In production, you'd have multiple sizes
    return baseUrl;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch('/api/homepage/', { 
          cache: 'no-store',
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error('Failed to fetch homepage data');

        const json = await response.json();
        const meta = json?.meta || {};
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';
        
        // Process hero image - ensure it's properly displayed
        let heroImagePath = meta.hero_image || json?.hero_image || null;
        console.log('Hero image from API:', heroImagePath);
        if (heroImagePath && heroImagePath.startsWith('/media/')) {
          heroImagePath = `${API_BASE.replace(/\/$/, '')}${heroImagePath}`;
        }
        console.log('Final hero image path:', heroImagePath);
        setHeroImage(heroImagePath);

        // Process video data from admin sections
        const sections = Array.isArray(json?.sections) ? json.sections : [];
        const collectedFeatured = [];
        const collectedGuides = [];
        let allVideos = []; // Collect all videos from sections

        const rewrite = (url) => {
          if (typeof url !== 'string' || !url) return url;
          if (url.startsWith('/media/')) return `${API_BASE?.replace(/\/$/, '')}${url}`;
          return url;
        };

        console.log('Processing sections:', sections.length);

        for (const s of sections) {
          const type = String(s?.type || '').toLowerCase();
          const titleLc = String(s?.title || '').toLowerCase();
          
          console.log(`Section: ${s.title}, Type: ${type}`);
          
          // Collect featured sections (but don't skip them for videos)
          if (type === 'featured' || titleLc.includes('featured in')) {
            collectedFeatured.push(s);
            continue; // Don't process video in featured sections
          }
          
          // Collect guide sections 
          if (titleLc.includes('insurance guide') || titleLc.includes('insurance guides')) {
            collectedGuides.push(s);
            continue; // Don't process video in guide sections
          }
          
          // Look for videos in all other sections
          if (type === 'video' && s.video_url) {
            const raw = String(s.video_url || '');
            const isFile = /(\.mp4|\.webm|\.ogg)(\?.*)?$/i.test(raw) || raw.startsWith('/media/');
            let videoUrl = isFile ? rewrite(raw) : raw;
            allVideos.push({
              url: videoUrl,
              type: isFile ? 'file' : 'embed',
              title: s.title || 'Video',
              section: s
            });
          }
          
          // Look for embed content
          if (type === 'embed' && s.url) {
            allVideos.push({
              url: s.url,
              type: 'embed', 
              title: s.title || 'Embedded Video',
              section: s
            });
          }
          
          // Look for videos in editor blocks
          if (s.editor_blocks) {
            const blocks = Array.isArray(s.editor_blocks?.blocks) ? s.editor_blocks.blocks : 
                          (Array.isArray(s.editor_blocks) ? s.editor_blocks : []);
            for (const b of blocks) {
              const bt = b?.type || b?.block_type || '';
              if (String(bt).toLowerCase() === 'embed') {
                const d = b?.data || b?.value || {};
                const embedUrl = d.embed || d.source || d.url || null;
                if (embedUrl) {
                  allVideos.push({
                    url: embedUrl,
                    type: 'embed',
                    title: s.title || 'Embedded Video',
                    section: s
                  });
                }
              }
            }
          }
        }

        // Also get videos from VideoPlacement (admin video placements)
        const videoPlacementsFromApi = Array.isArray(json?.videos) ? json.videos : [];
        console.log('Video placements from API:', videoPlacementsFromApi.length);
        
        for (const vp of videoPlacementsFromApi) {
          if (vp.video_url) {
            const raw = String(vp.video_url || '');
            const isFile = /(\.mp4|\.webm|\.ogg)(\?.*)?$/i.test(raw) || raw.startsWith('/media/') || raw.startsWith('http');
            let videoUrl = raw;
            // Rewrite local media URLs
            if (raw.startsWith('/media/')) {
              videoUrl = rewrite(raw);
            }
            allVideos.push({
              url: videoUrl,
              type: isFile && !raw.includes('youtube') && !raw.includes('vimeo') ? 'file' : 'embed',
              title: vp.title || 'Video',
              section: vp
            });
          }
        }

        console.log('Found videos:', allVideos.length, allVideos);

        // Deduplicate sections
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

        // Set featured and guide sections
        setFeaturedSections(uniq(collectedFeatured));
        setGuideSections(uniq(collectedGuides));

        // Set the first available video as hero video
        if (allVideos.length > 0) {
          const firstVideo = allVideos[0];
          setHeroVideoUrl(firstVideo.url);
          setHeroVideoType(firstVideo.type);
          console.log('Setting hero video:', firstVideo);
        } else {
          console.log('No videos found in sections');
        }

      } catch (error) {
        console.error('Error fetching homepage data:', error);
        setHeroImageError(true);
        setHeroImage('/images/seeded-hero.png');
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, []);

  // Enhanced floating animation
  useEffect(() => {
    const id = setInterval(() => {
      setC1Up((prev) => !prev);
      setC2Up((prev) => !prev);
    }, 3000); // Slower, more elegant animation
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

  // Loading skeleton component
  const HeroSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-16 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
      <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
      <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto mb-8"></div>
      <div className="h-12 bg-gray-200 rounded max-w-xl mx-auto mb-4"></div>
      <div className="h-64 bg-gray-200 rounded-xl"></div>
    </div>
  );

  if (dataLoading) {
    return (
      <section id="hero" className="bg-white scroll-mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <HeroSkeleton />
        </div>
      </section>
    );
  }

  return (
    <section id="hero" className="bg-white scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
          Auto insurance made clear.
        </h1>
        <p className="mt-4 text-xl text-gray-700">Save Money by Comparing Insurance Quotes</p>
        <p className="mt-2 text-lg text-gray-600">Compare Free Insurance Quotes Instantly</p>

        {/* Optimized ZIP form */}
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
              className="pl-10 pr-4 py-3 rounded-md border border-gray-300 focus:border-orange-600 focus:ring-orange-600 text-base sm:text-lg w-full sm:w-56 md:w-64 transition-all duration-200"
            />
          </div>
          <button 
            type="submit" 
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-orange-600 px-6 py-3 text-white hover:bg-orange-700 text-base sm:text-lg font-semibold transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            GET QUOTES →
          </button>
        </form>

        <p className="mt-3 text-xs text-gray-600 flex items-center justify-center gap-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0-1.105.895-2 2-2s2 .895 2 2v1h-4v-1zM6 11V9a6 6 0 1112 0v2m-1 10H7a2 2 0 01-2-2V11h14v8a2 2 0 01-2 2z" />
          </svg>
          Secured with SHA-256 Encryption
        </p>

        {/* Optimized hero image with progressive loading */}
        <div className="mt-10 relative max-w-5xl mx-auto">
          <div className="relative bg-white rounded-2xl shadow-2xl p-4 sm:p-8 transform hover:scale-[1.02] transition-transform duration-300">
            {/* Loading placeholder */}
            {heroImageLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-2xl z-10"></div>
            )}
            
            {/* Error fallback indicator */}
            {heroImageError && (
              <div className="absolute top-4 right-4 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs z-20">
                Image unavailable
              </div>
            )}
            
            <img
              ref={heroImageRef}
              data-src={heroImage || '/images/seeded-hero.png'}
              src={heroImage ? heroImage : '/images/seeded-hero.png'}
              alt="Hero"
              className={`w-full h-auto object-cover rounded-xl transition-opacity duration-500 ${
                heroImageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              loading="lazy"
              onLoad={handleImageLoad}
              onError={handleImageError}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
              style={{
                contentVisibility: 'auto',
                containIntrinsicSize: '400px 300px'
              }}
            />
            
            {/* Enhanced gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/5 to-blue-400/5 rounded-2xl pointer-events-none"></div>
          </div>

          {/* Enhanced motion cards with better animations */}
          <div
            className="absolute left-2 top-2 sm:left-6 sm:-top-8 bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg p-3 sm:p-4 z-10 transition-all duration-500 hover:shadow-xl"
            style={{ 
              transform: `translateY(${c1Up ? -8 : 4}px)`,
              animation: c1Up ? 'floatUp 3s ease-in-out infinite' : 'floatDown 3s ease-in-out infinite'
            }}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-900">98% Satisfaction</p>
                <p className="text-[10px] sm:text-xs text-gray-600">Customer happiness score</p>
              </div>
            </div>
          </div>
          
          <div
            className="absolute right-2 bottom-2 sm:right-6 sm:bottom-auto sm:-top-12 bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg p-3 sm:p-4 z-10 transition-all duration-500 hover:shadow-xl"
            style={{ 
              transform: `translateY(${c2Up ? -8 : 4}px)`,
              animation: c2Up ? 'floatUp 3s ease-in-out infinite' : 'floatDown 3s ease-in-out infinite'
            }}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-900">2 min Quote</p>
                <p className="text-[10px] sm:text-xs text-gray-600">Average quote time</p>
              </div>
            </div>
          </div>
        </div>



        {/* Display all videos from admin sections - Enhanced Design */}
        {allVideos && allVideos.length > 0 && (
          <div className="mt-16 mb-12">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Featured Videos</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Learn more about auto insurance with our expert video guides</p>
            </div>
            <div className="max-w-5xl mx-auto grid gap-8 md:gap-10">
              {allVideos.map((video, index) => (
                <div key={index} className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
                  {video.title && (
                    <div className="bg-gradient-to-r from-orange-50 to-blue-50 px-6 sm:px-8 py-4 sm:py-5 border-b-2 border-gray-200">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <svg className="w-6 h-6 text-orange-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{video.title}</span>
                      </h3>
                    </div>
                  )}
                  <div className="p-6 sm:p-8">
                    {video.type === 'embed' ? (
                      <div className="aspect-video rounded-xl overflow-hidden border-2 border-gray-300 shadow-lg">
                        <iframe
                          src={video.url}
                          title={video.title || 'Video'}
                          className="w-full h-full"
                          loading="lazy"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <video 
                        src={video.url} 
                        controls 
                        playsInline 
                        className="w-full rounded-xl shadow-lg border-2 border-gray-300"
                        preload="metadata"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Also show the first video in hero if available */}
        {heroVideoUrl && allVideos.length === 0 && (
          <div className="mt-6 max-w-3xl md:max-w-2xl mx-auto">
            {heroVideoType === 'embed' ? (
              <div className="aspect-video rounded-lg overflow-hidden border border-gray-200 shadow-sm relative">
                <iframe
                  src={heroVideoUrl}
                  title="Featured Video"
                  className="w-full h-full"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : heroVideoType === 'file' ? (
              <video 
                src={heroVideoUrl} 
                controls 
                playsInline 
                className="w-full rounded-lg border border-gray-200 shadow-sm"
                preload="metadata"
                poster="/images/video-poster.jpg"
              />
            ) : null}
          </div>
        )}

        {submitted && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Thanks! We'll be in touch shortly.
            </p>
          </div>
        )}
      </div>

      {/* Enhanced CSS animations */}
      <style jsx>{`
        @keyframes floatUp {
          0%, 100% { transform: translateY(-8px); }
          50% { transform: translateY(4px); }
        }
        @keyframes floatDown {
          0%, 100% { transform: translateY(4px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </section>
  );
}