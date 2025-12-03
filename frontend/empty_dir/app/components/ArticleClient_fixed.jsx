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

export default function ArticleClient({ slug }) {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const articleRef = useRef(null);
  const [toc, setToc] = useState([]);
  const [related, setRelated] = useState([]);
  const [activeHeading, setActiveHeading] = useState(null);

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
        let res = await fetch(`/api/blogs/${encodeURIComponent(String(raw))}`, { cache: "no-store" });

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
      ENHANCE ARTICLE: images, tables, toc, scrollspy
  ---------------------------------------------------------------------- */
  useEffect(() => {
    if (!blog || !articleRef.current) return;

    const root = articleRef.current;

    // IMAGES
    root.querySelectorAll("img").forEach((img) => {
      img.loading = "lazy";
      img.style.width = "100%";
      img.style.height = "auto";
      img.style.borderRadius = "8px";
      img.style.objectFit = "contain";
      img.onerror = () => (img.src = "/window.svg");
    });

    // TABLES → responsive wrapper
    root.querySelectorAll("table").forEach((table) => {
      if (table.classList.contains("ai-table")) return;
      const wrapper = document.createElement("div");
      wrapper.className = "ai-table-wrap overflow-x-auto";
      const clone = table.cloneNode(true);
      clone.classList.add("ai-table");
      table.replaceWith(wrapper);
      wrapper.appendChild(clone);
    });

    // TABLE OF CONTENTS
    const headings = Array.from(root.querySelectorAll("h2, h3"));
    const usedIds = new Set();
    const items = headings.map((el) => {
      const text = el.textContent.trim();
      const base = slugify(text);
      let id = base;
      let counter = 1;
      while (usedIds.has(id)) id = `${base}-${counter++}`;
      usedIds.add(id);
      el.id = id;

      return { id, level: el.tagName.toLowerCase(), text };
    });

    setToc(items);

    // IMPROVED SCROLLSPY
    const updateActiveHeading = () => {
      const headerOffset = 80;
      const scrollTop = window.pageYOffset;
      
      let current = null;
      for (let i = items.length - 1; i >= 0; i--) {
        const heading = items[i];
        const element = document.getElementById(heading.id);
        if (!element) continue;
        
        const offsetTop = element.offsetTop - headerOffset;
        if (scrollTop >= offsetTop) {
          current = heading.id;
          break;
        }
      }
      
      setActiveHeading(current);
    };

    // Throttled scroll handler
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateActiveHeading();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Initial call
    updateActiveHeading();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [blog]);

  /* ----------------------------------------------------------------------
      SMOOTH SCROLL FOR TOC
  ---------------------------------------------------------------------- */
  const handleTocClick = (e, headingId) => {
    e.preventDefault();
    const element = document.getElementById(headingId);
    if (!element) return;

    const headerOffset = 80;
    const elementPosition = element.offsetTop - headerOffset;

    window.scrollTo({
      top: elementPosition,
      behavior: "smooth"
    });
  };

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
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return;

      const json = await res.json();
      const list = Array.isArray(json.blogs) ? json.blogs : [];

      const filtered = list.filter((x) => {
        const samePage = parent ? String(x.parent_page || '').trim().toLowerCase() === parent.toLowerCase() : true;
        return samePage && x.slug !== blog.slug;
      });

      setRelated(filtered.slice(0, 6));
    }

    loadRelated();
  }, [blog?.category, blog?.slug, blog?.related_blogs]);

  /* ----------------------------------------------------------------------
      LOADING VIEW
  ---------------------------------------------------------------------- */
  if (loading) {
    return (
      <main className="max-w-6xl mx-auto p-10 text-center">
        <h1 className="text-xl font-bold">Loading…</h1>
      </main>
    );
  }

  /* ----------------------------------------------------------------------
      NOT FOUND
  ---------------------------------------------------------------------- */
  if (!blog) {
    return (
      <main className="max-w-6xl mx-auto p-10 text-center">
        <h1 className="text-2xl font-bold">Article not found</h1>
      </main>
    );
  }

  /* ----------------------------------------------------------------------
      MAIN ARTICLE PAGE
  ---------------------------------------------------------------------- */
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">

      {/* ------------------------------------------------------------------ */}
      {/* LEFT FIXED SOCIAL ICONS (DB-driven via SiteConfig) */}
      <SocialIcons className="hidden lg:flex flex-col gap-2 fixed left-6 top-1/3 z-40" showTitle={false} />

      {/* HEADER */}
      <header>
        <div className="rounded-xl border bg-white p-6 shadow-xl text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold">{blog.title}</h1>
          {blog.summary && (
            <p className="mt-3 text-gray-700">{blog.summary}</p>
          )}
        </div>
      </header>

      {/* ZIP FORM */}
      <div className="mt-6 max-w-2xl mx-auto">
        <ZipForm heading="Get Auto Insurance Quotes" />
      </div>

      {/* AUTHOR & REVIEWER */}
      {(blog.author || blog.author_image || blog.reviewer || blog.reviewer_image) && (
        <div className="mt-6 p-4 max-w-2xl mx-auto border rounded-xl bg-gray-50 shadow-sm">
          <div className="grid grid-cols-1 gap-4">
            {/* Author Section */}
            {(blog.author || blog.author_image) && (
              <div className="flex items-center gap-4">
                {blog.author_image ? (
                  <img
                    src={blog.author_image}
                    className="h-12 w-12 rounded-full object-cover"
                    alt="Author"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-200" />
                )}
                <div className="flex-1">
                  <div className="font-semibold text-orange-700">Written by:</div>
                  <div className="font-medium">{blog.author ?? "Unknown"}</div>
                  {blog.author_description && (
                    <div className="text-sm text-gray-600 mt-1">{blog.author_description}</div>
                  )}
                </div>
              </div>
            )}
            
            {/* Reviewer Section */}
            {(blog.reviewer || blog.reviewer_image) && (
              <div className="flex items-center gap-4 pt-2 border-t border-gray-200">
                {blog.reviewer_image ? (
                  <img
                    src={blog.reviewer_image}
                    className="h-12 w-12 rounded-full object-cover"
                    alt="Reviewer"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-200" />
                )}
                <div className="flex-1">
                  <div className="font-semibold text-orange-700">Reviewed by:</div>
                  <div className="font-medium">{blog.reviewer ?? "Unknown"}</div>
                  {blog.reviewer_description && (
                    <div className="text-sm text-gray-600 mt-1">{blog.reviewer_description}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HERO IMAGE */}
      {blog.hero_image && (
        <div className="mt-6">
          <ResponsiveImage
            src={blog.hero_image}
            alt={blog.title}
            className="rounded-xl border shadow-md"
            maxHeight={300}
          />
        </div>
      )}

      {/* LAYOUT → TOC + ARTICLE */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* ----------------------- TOC SIDEBAR --------------------------- */}
        {toc.length > 0 && (
          <aside className="hidden lg:block lg:col-span-4">
            <div className="toc bg-white border p-5 rounded-xl shadow-sm sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
              <h3 className="text-base font-bold mb-4 pb-2 border-b text-gray-900">
                On this page
              </h3>
              <ul className="space-y-2">
                {toc.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={(e) => handleTocClick(e, item.id)}
                      className={`block w-full text-left text-sm transition-all duration-200 hover:text-orange-700 ${
                        item.level === "h3" ? "pl-4 border-l ml-1" : ""
                      } ${
                        activeHeading === item.id
                          ? "text-orange-700 font-semibold"
                          : "text-gray-600"
                      }`}
                    >
                      {item.text}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}

        {/* ----------------------- ARTICLE CONTENT ------------------------ */}
        <div className={`${toc.length > 0 ? "lg:col-span-8" : "col-span-12"}`}>
          <article
            ref={articleRef}
            className="prose prose-lg max-w-none px-2 sm:px-0"
          >
            <div dangerouslySetInnerHTML={{ __html: blog.content_html }} />
          </article>
        </div>
      </div>

      {/* ----------------------- RELATED ARTICLES ------------------------ */}
      {related.length > 0 && (
        <section className="mt-16">
          <div className="rounded-xl border bg-white p-6 shadow-xl">
            <h3 className="text-2xl font-extrabold mb-6">Related Articles</h3>

            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((it) => (
                <li
                  key={String(it.slug || '')}
                  className="group rounded-xl border bg-white shadow-md hover:shadow-xl transition overflow-hidden flex flex-col"
                >
                  {it.hero_image && (
                    <ResponsiveImage
                      src={it.hero_image}
                      className="w-full"
                      maxHeight={160}
                    />
                  )}

                  <div className="p-4 flex flex-col flex-grow">
                    <h4 className="text-base font-semibold group-hover:text-orange-700">
                      <Link href={`/articles/${encodeURIComponent(String(it.slug || ''))}`}>{it.title}</Link>
                    </h4>

                    {it.summary && (
                      <p className="mt-1 text-sm text-gray-700 flex-grow">
                        {it.summary.length > 120
                          ? it.summary.slice(0, 120) + "…"
                          : it.summary}
                      </p>
                    )}

                    <div className="mt-3 text-xs text-gray-500 flex justify-between border-t pt-2">
                      {it.created_at && (
                        <span>
                          {new Date(it.created_at).toLocaleDateString()}
                        </span>
                      )}
                      <Link
                        href={`/articles/${encodeURIComponent(String(it.slug || ''))}`}
                        className="text-orange-700 font-semibold"
                      >
                        Read more →
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}