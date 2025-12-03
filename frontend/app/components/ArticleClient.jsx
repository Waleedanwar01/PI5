"use client";

import { useEffect, useState, useRef } from "react";
import ZipForm from "@/app/components/ZipForm.jsx";
import Link from "next/link";
import ResponsiveImage from "@/app/components/ResponsiveImage.jsx";
import SocialIcons from "@/app/components/SocialIcons.jsx";

// Create URL-friendly slugs
function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Social sharing handler
const handleSocialShare = (platform, title, url) => {
  const shareUrl = encodeURIComponent(url);
  const shareText = encodeURIComponent(title);
  
  switch (platform) {
    case 'twitter':
      window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`, '_blank');
      break;
    case 'facebook':
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank');
      break;
    case 'linkedin':
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, '_blank');
      break;
    case 'whatsapp':
      window.open(`https://wa.me/?text=${shareText}%20${shareUrl}`, '_blank');
      break;
  }
};

export default function ArticleClient({ slug }) {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const articleRef = useRef(null);
  const [related, setRelated] = useState([]);
  const [isLiked, setIsLiked] = useState(false);

  /* ----------------------------------------------------------------------
     LOAD BLOG CONTENT
  ---------------------------------------------------------------------- */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        // Guard against undefined slug to avoid 404 spam
        const raw = slug;
        if (!raw || String(raw).trim() === '' || String(raw).toLowerCase() === 'undefined') {
          if (!cancelled) {
            setBlog(null);
          }
          return;
        }
        let res;
        try {
          // Call Django backend API directly instead of Next.js API route
          res = await fetch(`http://localhost:8000/api/blogs/${encodeURIComponent(String(raw))}/`, { 
            cache: "no-store",
            redirect: "follow"
          });
        } catch (fetchError) {
          console.error('Fetch error:', fetchError);
          // Network error or fetch failed
          if (!cancelled) setBlog(null);
          return;
        }

        if (res.ok) {
          const json = await res.json();
          if (!cancelled) setBlog(json.blog ?? null);
        } else {
          // If not found, keep blog as null to render not-found view
          if (!cancelled) setBlog(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  /* ----------------------------------------------------------------------
     DYNAMIC PAGE TITLE
  ---------------------------------------------------------------------- */
  useEffect(() => {
    if (blog?.title) {
      // Update the page title dynamically
      document.title = `${blog.title} | Car Insurance Comparison`;
      
      // Also update meta description if available
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription && blog.summary) {
        metaDescription.setAttribute('content', blog.summary);
      }
      
      // Update OpenGraph title
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', blog.title);
      }
      
      // Update OpenGraph description
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription && blog.summary) {
        ogDescription.setAttribute('content', blog.summary);
      }
    }
  }, [blog?.title, blog?.summary]);

  /* ----------------------------------------------------------------------
     ENHANCE ARTICLE: images and tables
  ---------------------------------------------------------------------- */
  useEffect(() => {
    if (!blog || !articleRef.current) return;

    const root = articleRef.current;

    // IMAGES - Enhanced styling
    root.querySelectorAll("img").forEach((img) => {
      img.loading = "lazy";
      img.style.width = "100%";
      img.style.height = "auto";
      img.style.borderRadius = "12px";
      img.style.objectFit = "contain";
      img.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
      img.style.transition = "transform 0.3s ease, box-shadow 0.3s ease";
      img.onmouseover = () => {
        img.style.transform = "scale(1.02)";
        img.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
      };
      img.onmouseout = () => {
        img.style.transform = "scale(1)";
        img.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
      };
      img.onerror = () => (img.src = "/window.svg");
    });

    // TABLES → responsive wrapper
    root.querySelectorAll("table").forEach((table) => {
      if (table.classList.contains("ai-table")) return;
      const wrapper = document.createElement("div");
      wrapper.className = "ai-table-wrap overflow-x-auto my-8 rounded-lg shadow-lg";
      wrapper.style.background = "white";
      wrapper.style.padding = "1rem";
      const clone = table.cloneNode(true);
      clone.classList.add("ai-table");
      clone.style.width = "100%";
      clone.style.borderCollapse = "separate";
      clone.style.borderSpacing = "0";
      table.replaceWith(wrapper);
      wrapper.appendChild(clone);
    });
  }, [blog]);

  /* ----------------------------------------------------------------------
     RELATED ARTICLES
  ---------------------------------------------------------------------- */
  useEffect(() => {
    // Use related_blogs from blog detail response if available
    if (blog?.related_blogs && Array.isArray(blog.related_blogs)) {
      setRelated(blog.related_blogs);
      return;
    }

    // Fallback: fetch related articles by category if related_blogs not available
    if (!blog?.category) return;

    async function loadRelated() {
      const parent = String(blog.parent_page || '').trim();
      const url = parent
        ? `/api/blogs?category=${encodeURIComponent(blog.category)}&page=${encodeURIComponent(parent)}`
        : `/api/blogs?category=${encodeURIComponent(blog.category)}`;
      const res = await fetch(`http://localhost:8000${url}`, { 
        cache: "no-store",
        redirect: "follow"
      });
      if (!res.ok) return;

      const json = await res.json();
      const list = Array.isArray(json.blogs) ? json.blogs : [];

      const filtered = list.filter((x) => {
        const samePage = parent ? String(x.parent_page || '').trim().toLowerCase() === parent.toLowerCase() : true;
        return samePage && x.slug !== blog.slug;
      });

      setRelated(filtered.slice(0, 3));
    }

    loadRelated();
  }, [blog?.category, blog?.slug, blog?.related_blogs]);

  /* ----------------------------------------------------------------------
     LOADING VIEW - Enhanced
  ---------------------------------------------------------------------- */
  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Skeleton */}
        <div className="animate-pulse mb-12">
          <div className="text-center max-w-4xl mx-auto">
            <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
            <div className="h-64 bg-gray-200 rounded-2xl mb-8"></div>
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-9">
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="bg-gray-200 rounded-xl h-64"></div>
          </div>
        </div>
      </main>
    );
  }

  /* ----------------------------------------------------------------------
     NOT FOUND
  ---------------------------------------------------------------------- */
  if (!blog) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="bg-white rounded-2xl p-12 shadow-lg border">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Article not found</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">The article you're looking for doesn't exist or has been moved to a different location.</p>
            <Link href="/articles" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-medium rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              Browse Articles
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  /* ----------------------------------------------------------------------
     MAIN ARTICLE PAGE WITH ENHANCED DESIGN
  ---------------------------------------------------------------------- */
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      
      {/* SECTION 1: ENHANCED HERO SECTION */}
      <section className="mb-16">
        <div className="text-center max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/articles" className="hover:text-blue-600 transition-colors">Articles</Link>
            <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {blog.category && <span className="text-blue-600 font-medium">{blog.category}</span>}
          </nav>

          {/* Category Badge */}
          {blog.category && (
            <div className="mb-6">
              <span className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-sm font-semibold shadow-sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {blog.category}
              </span>
            </div>
          )}
          
          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight mb-8 tracking-tight">
            {blog.title}
          </h1>
          
          {/* Summary/Description */}
          {blog.summary && (
            <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-10 font-light">
              {blog.summary}
            </p>
          )}
          
          {/* Enhanced Meta Information */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500 mb-12">
            {blog.created_at && (
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">{new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            )}
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">~{Math.ceil((blog.summary?.length || 0) / 200) + 3} min read</span>
            </div>
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border">
              <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="font-medium">Featured Article</span>
            </div>
          </div>
          
          {/* Hero Image with Enhanced Styling */}
          {blog.hero_image && (
            <div className="mb-16">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-3xl"></div>
                <ResponsiveImage
                  src={blog.hero_image}
                  alt={blog.title}
                  className="rounded-3xl shadow-2xl group-hover:shadow-3xl transition-all duration-500 border-4 border-white"
                  maxHeight={600}
                />
              </div>
            </div>
          )}

          {/* Social Share Buttons */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="text-sm font-medium text-gray-700 mr-2">Share:</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleSocialShare('twitter', blog.title, currentUrl)}
                className="w-10 h-10 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center"
                aria-label="Share on Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </button>
              <button
                onClick={() => handleSocialShare('facebook', blog.title, currentUrl)}
                className="w-10 h-10 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-colors flex items-center justify-center"
                aria-label="Share on Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              <button
                onClick={() => handleSocialShare('linkedin', blog.title, currentUrl)}
                className="w-10 h-10 bg-violet-500 text-white rounded-full hover:bg-violet-600 transition-colors flex items-center justify-center"
                aria-label="Share on LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </button>
              <button
                onClick={() => handleSocialShare('whatsapp', blog.title, currentUrl)}
                className="w-10 h-10 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors flex items-center justify-center"
                aria-label="Share on WhatsApp"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.486"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>
{/* MAIN CONTENT AREA */}
<div className="max-w-4xl mx-auto">
  {/* Enhanced Article Content */}
  <article
    ref={articleRef}
    className="prose prose-lg md:prose-xl max-w-none prose-headings:tracking-tight prose-h1:text-gray-900 prose-h2:text-gray-900 prose-p:leading-relaxed prose-p:text-gray-800 prose-a:text-gray-600 hover:prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-img:rounded-2xl prose-img:shadow-lg prose-code:bg-gray-100 prose-code:text-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-blockquote:border-l-4 prose-blockquote:border-blue-300 prose-blockquote:pl-6 prose-blockquote:text-gray-700 prose-hr:border-blue-200"
  >
      <div className="rich-html leading-relaxed text-gray-800">
        <div className="space-y-6" dangerouslySetInnerHTML={{ __html: blog.content_html }} />
      </div>
  </article>

  {/* Like Button */}
  <div className="flex items-center justify-center mt-12 mb-8">
    <button
      onClick={() => setIsLiked(!isLiked)}
      className={`flex items-center gap-3 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
        isLiked
          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <svg className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      {isLiked ? 'Liked!' : 'Like this article'}
    </button>
  </div>
</div>


      {/* SECTION 4: ENHANCED AUTHOR & REVIEWER SECTION */}
      {(blog.author || blog.author_image || blog.reviewer || blog.reviewer_image) && (
        <section className="mt-20 mb-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Expert Review & Authorship</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Learn more about the qualified professionals behind this content</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* Enhanced Author Section */}
            {(blog.author || blog.author_image) && (
              <div className="group">
                <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100/30 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-blue-200 relative overflow-hidden">
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-200/50 to-transparent rounded-full transform translate-x-10 -translate-y-10"></div>
                  
                  <div className="text-center relative z-10">
                    <div className="relative mb-6">
                      {blog.author_image ? (
                        <img
                          src={blog.author_image}
                          className="h-28 w-28 rounded-full object-cover border-4 border-blue-300 mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                          alt="Author"
                        />
                      ) : (
                        <div className="h-28 w-28 rounded-full bg-gradient-to-r from-blue-300 to-blue-400 flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300">
                          <svg className="w-14 h-14 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-bold text-gray-900 text-xl mb-3">{blog.author ?? "Unknown Author"}</h4>
                      <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-200 to-blue-300 rounded-full shadow-sm">
                        <svg className="w-4 h-4 mr-2 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="text-sm font-bold text-blue-800">Content Writer</span>
                      </div>
                    </div>
                    
                    {blog.author_description && (
                      <p className="text-gray-700 leading-relaxed mb-4">{blog.author_description}</p>
                    )}
                    
                    <div className="mt-6 pt-6 border-t border-blue-200">
                      <div className="flex items-center justify-center gap-6 text-sm">
                        <div className="flex items-center gap-2 text-blue-700">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="font-medium">Expert Writer</span>
                        </div>
                        <div className="flex items-center gap-2 text-blue-700">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="font-medium">SEO Optimized</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Enhanced Reviewer Section */}
            {(blog.reviewer || blog.reviewer_image) && (
              <div className="group">
                <div className="bg-gradient-to-br from-indigo-50 via-white to-indigo-100/30 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-indigo-200 relative overflow-hidden">
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-indigo-200/50 to-transparent rounded-full transform translate-x-10 -translate-y-10"></div>
                  
                  <div className="text-center relative z-10">
                    <div className="relative mb-6">
                      {blog.reviewer_image ? (
                        <img
                          src={blog.reviewer_image}
                          className="h-28 w-28 rounded-full object-cover border-4 border-indigo-300 mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                          alt="Reviewer"
                        />
                      ) : (
                        <div className="h-28 w-28 rounded-full bg-gradient-to-r from-indigo-300 to-indigo-400 flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300">
                          <svg className="w-14 h-14 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-bold text-gray-900 text-xl mb-3">{blog.reviewer ?? "Unknown Reviewer"}</h4>
                      <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-200 to-indigo-300 rounded-full shadow-sm">
                        <svg className="w-4 h-4 mr-2 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-bold text-indigo-800">Expert Reviewer</span>
                      </div>
                    </div>
                    
                    {blog.reviewer_description && (
                      <p className="text-gray-700 leading-relaxed mb-4">{blog.reviewer_description}</p>
                    )}
                    
                    <div className="mt-6 pt-6 border-t border-indigo-200">
                      <div className="flex items-center justify-center gap-6 text-sm">
                        <div className="flex items-center gap-2 text-indigo-700">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                          <span className="font-medium">Quality Assured</span>
                        </div>
                        <div className="flex items-center gap-2 text-indigo-700">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                          <span className="font-medium">Fact-Checked</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Trust badge */}
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-full shadow-sm">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-sm font-semibold text-emerald-800">Verified & Trusted Content</span>
            </div>
          </div>
        </section>
      )}

{/* WRITTEN BY & REVIEWED BY SECTION */}
<section className="mt-16 mb-12">
  <div className="max-w-4xl mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      
      {/* Written by this blog */}
      {blog.author && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-blue-800 text-lg">Written by</h4>
              <p className="text-blue-700 font-semibold">{blog.author}</p>
            </div>
          </div>
        </div>
      )}

      {/* Reviewed by this blog */}
      {blog.reviewer && (
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-2xl p-6 border-2 border-indigo-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-indigo-800 text-lg">Reviewed by</h4>
              <p className="text-indigo-700 font-semibold">{blog.reviewer}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
</section>

      {/* Enhanced Related Articles Section */}
      {related.length > 0 && (
        <section className="mt-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-6 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Related Articles</h3>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">Continue learning about auto insurance with these carefully selected articles</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {related.map((it) => (
              <div
                key={String(it.slug || '')}
                className="group bg-white rounded-3xl shadow-xl border border-gray-200 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 overflow-hidden transform hover:-translate-y-3"
              >
                {/* Article Image Container */}
                <div className="relative">
                  {it.hero_image ? (
                    <div className="aspect-video overflow-hidden relative">
                      <ResponsiveImage
                        src={it.hero_image}
                        alt={it.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        maxHeight={200}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Category Badge Overlay */}
                      {it.category && (
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-white bg-opacity-95 text-blue-800 backdrop-blur-sm shadow-lg">
                            {it.category}
                          </span>
                        </div>
                      )}
                      
                      {/* Read Time Badge */}
                      <div className="absolute bottom-4 right-4">
                        <span className="flex items-center gap-1 text-xs font-bold text-white bg-black bg-opacity-60 backdrop-blur-sm px-2 py-1 rounded-full">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {Math.ceil((it.summary?.length || 0) / 200) + 2} min
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-200/30 to-transparent"></div>
                      <svg className="w-16 h-16 text-blue-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      
                      {/* Category Badge */}
                      {it.category && (
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-blue-600 bg-opacity-95 text-white backdrop-blur-sm shadow-lg">
                            {it.category}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Article Content */}
                <div className="p-6">
                  {/* Date Badge */}
                  {it.created_at && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <time className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
                        {new Date(it.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </time>
                    </div>
                  )}
                  
                  <h4 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors line-clamp-2 leading-tight">
                    <Link href={`/articles/${encodeURIComponent(String(it.slug || ''))}`}>
                      {it.title}
                    </Link>
                  </h4>

                  {it.summary && (
                    <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                      {it.summary}
                    </p>
                  )}

                  {/* Enhanced Read More Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <Link
                      href={`/articles/${encodeURIComponent(String(it.slug || ''))}`}
                      className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-800 transition-all duration-200 group/link bg-blue-50 hover:bg-blue-100 hover:shadow-md px-4 py-2 rounded-xl"
                    >
                      <span>Read Article</span>
                      <svg className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                    
                    <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Featured</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Call to Action */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-200">
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Explore More Articles</h4>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">Discover our complete collection of insurance guides, tips, and expert insights</p>
              <Link
                href="/articles"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>View All Articles</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

    </main>
  );
}
