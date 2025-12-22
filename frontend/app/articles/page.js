import Link from 'next/link';
import { headers } from 'next/headers';
import SearchBar from '../components/SearchBar';

export async function generateMetadata() {
  let brandName = 'Car Insurance Comparison';
  try {
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000';
    const scRes = await fetch(`${base}/api/site-config/`, { cache: 'no-store' });
    if (scRes.ok) {
        const sc = await scRes.json();
        if (sc.brand_name) brandName = sc.brand_name.trim();
    }
  } catch (e) {
    console.error('Error fetching site config:', e);
  }
  return {
    title: `Insurance Articles | ${brandName}`,
  };
}

export const dynamic = 'force-dynamic';

export default async function ArticlesPage({ searchParams }) {
  const pageSize = 24;
  const page = Math.max(1, Number(searchParams?.page) || 1);
  const h = headers();
  const host = (typeof h.get === 'function' ? (h.get('host') || 'localhost:3000') : 'localhost:3000').trim();
  const base = process.env.NEXT_PUBLIC_SITE_URL || `http://${host}`;
  const toTitle = (s) => String(s || '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const formatDate = (input) => {
    try {
      const d = new Date(input);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return ''; }
  };

  async function safeFetchJson(url, { timeout = 4000 } = {}) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), Math.max(1, Number(timeout)));
      const res = await fetch(url, { cache: 'no-store', signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }
  
  // Normalize and sanitize incoming query params
  const normalizeParam = (v) => {
    if (v == null) return '';
    if (Array.isArray(v)) return v.map((x) => String(x)).join(',');
    return String(v);
  };
  const normalizeSearchParams = (sp) => {
    const out = {};
    for (const [k, v] of Object.entries(sp || {})) {
      out[String(k)] = normalizeParam(v);
    }
    return out;
  };

  const safeSearchParams = normalizeSearchParams(searchParams);
  const searchQuery = safeSearchParams?.q || '';
  const categorySlug = safeSearchParams?.category || '';
  // Build a version of search params without category for the "All" chip
  const spNoCat = { ...safeSearchParams };
  if (spNoCat.category) delete spNoCat.category;
  spNoCat.page = '1';
  
  // Fetch categories and blogs concurrently with safe timeouts
  let categories = [];

  let responseData = { blogs: [], pagination: null };
  let error = null;
  
  try {
    const apiParams = new URLSearchParams();
    if (searchQuery) apiParams.set('search', String(searchQuery));
    if (categorySlug) apiParams.set('category', String(categorySlug));
    apiParams.set('page', String(page));
    apiParams.set('page_size', String(pageSize));

    const initialUrl = `${base}/api/blogs?${apiParams.toString()}`;
    const [catJson, blogsJson] = await Promise.all([
      safeFetchJson(`${base}/api/categories/all/`, { timeout: 3000 }),
      safeFetchJson(initialUrl, { timeout: 5000 }),
    ]);

    if (catJson) {
      const arr = Array.isArray(catJson?.categories)
        ? catJson.categories
        : Array.isArray(catJson?.items)
        ? catJson.items
        : Array.isArray(catJson?.data)
        ? catJson.data
        : Array.isArray(catJson)
        ? catJson
        : [];
      categories = arr
        .filter((c) => c && (c.slug || c.name))
        .map((c) => ({ slug: c.slug || String(c.name || '').toLowerCase().replace(/\s+/g, '-'), name: c.name || toTitle(c.slug || '') }));
    }

    if (!blogsJson) throw new Error('Failed to load blogs');
    const normalized = Array.isArray(blogsJson)
      ? {
          blogs: blogsJson,
          pagination: {
            total_count: blogsJson.length,
            current_page: 1,
            total_pages: 1,
            has_next: false,
            has_previous: false,
          },
        }
      : blogsJson;
    responseData = normalized;
  } catch (e) {
    error = e?.message || 'Unable to load blog articles.';
  }

  const items = responseData.blogs || [];
  const pagination = responseData.pagination;
  const total = pagination?.total_count || items.length;
  const totalPages = pagination?.total_pages || Math.max(1, Math.ceil(total / pageSize));
  const currentPage = pagination?.current_page || Math.max(1, Math.min(page, totalPages));
  const start = (currentPage - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const pageItems = items;

  // Build pagination window
  const windowSize = 7;
  const half = Math.floor(windowSize / 2);
  let startPage = Math.max(1, currentPage - half);
  let endPage = Math.min(totalPages, startPage + windowSize - 1);
  if (endPage - startPage + 1 < windowSize) {
    startPage = Math.max(1, endPage - windowSize + 1);
  }
  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section - Sharp Design */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 mb-6 shadow-md">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight uppercase">
            {searchQuery ? `Search Results` : 'Insurance Articles'}
          </h1>
          {searchQuery && (
            <p className="text-xl md:text-2xl text-blue-600 font-semibold mb-2">
              for "{searchQuery}"
            </p>
          )}
          <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
            {searchQuery
              ? `Found ${total} article${total !== 1 ? 's' : ''} matching your search`
              : 'Expert insights, comprehensive guides, and tips to help you understand auto insurance better'
            }
          </p>
        </div>

        {/* Search Bar Component */}
        <div className="mb-10">
            <SearchBar />
        </div>

        {/* Category Filter Chips - Sharp Design */}
        {categories.length > 0 && (
          <div className="mb-10">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 uppercase tracking-wider text-sm">
              <span className="w-4 h-4 bg-blue-600 inline-block"></span>
              Filter by Category
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/articles?${new URLSearchParams(spNoCat).toString()}`}
                className={`${!categorySlug ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'} px-5 py-2 border text-sm font-bold uppercase tracking-wide transition-all duration-200`}
              >
                All
              </Link>
              {categories.map((cat) => {
                const q = { ...safeSearchParams, category: String(cat.slug || ''), page: '1' };
                const active = categorySlug === String(cat.slug || '');
                return (
                  <Link
                    key={String(cat.slug || cat.name)}
                    href={`/articles?${new URLSearchParams(q).toString()}`}
                    className={`${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'} px-5 py-2 border text-sm font-bold uppercase tracking-wide transition-all duration-200`}
                  >
                    {cat.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Status/Count - Sharp Design */}
        <div className="mb-10 bg-white border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-base md:text-lg text-gray-700">
              {error ? (
                <span className="text-red-600 flex items-center gap-2">
                  <span className="font-bold">Error:</span> {error}
                </span>
              ) : total > 0 ? (
                <span className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-green-500"></span>
                  <span>
                    Showing <strong className="text-gray-900">{start + 1}</strong>–<strong className="text-gray-900">{end}</strong> of <strong className="text-gray-900">{total}</strong> articles
                  </span>
                </span>
              ) : (
                <span className="flex items-center gap-2 text-gray-500">
                  No articles found.
                </span>
              )}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 border border-gray-200">
                Page {currentPage} of {totalPages}
              </div>
            )}
          </div>
        </div>

        {/* Articles Grid - Sharp Design (Zero Radius) */}
        {pageItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {pageItems.map((it) => (
              <article
                key={String(it.slug || '')}
                className="group bg-white border border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
              >
                {/* Article Image - Sharp */}
                <Link href={`/articles/${encodeURIComponent(String(it.slug || ''))}`} className="block relative aspect-video overflow-hidden bg-gray-100">
                    {it.hero_image ? (
                      <img
                        src={it.hero_image}
                        alt={it.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <img
                        src={`https://picsum.photos/seed/${it.slug}/600/400`}
                        alt={it.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 hover:opacity-100"
                        loading="lazy"
                      />
                    )}
                    {it.category && (
                      <div className="absolute top-0 left-0">
                        <span className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-blue-600 text-white">
                          {it.category}
                        </span>
                      </div>
                    )}
                </Link>

                {/* Article Content - Sharp */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-3 mb-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {it.created_at && formatDate(it.created_at) && (
                      <time className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(it.created_at)}
                      </time>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                    <Link href={`/articles/${encodeURIComponent(String(it.slug || ''))}`}>
                      {it.title}
                    </Link>
                  </h3>

                  {it.summary && (
                    <p className="text-gray-600 mb-5 line-clamp-3 leading-relaxed text-sm flex-grow">
                      {it.summary}
                    </p>
                  )}

                  <div className="pt-4 mt-auto border-t border-gray-100 flex items-center justify-between">
                    <Link
                      href={`/articles/${encodeURIComponent(String(it.slug || ''))}`}
                      className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wide group/link"
                    >
                      Read article
                      <svg className="w-4 h-4 ml-1 transform group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : !error && (
          <div className="text-center py-20 border border-gray-200 bg-white">
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No articles found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search query</p>
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold uppercase tracking-wide hover:bg-blue-700 transition-colors"
            >
              View all articles
            </Link>
          </div>
        )}

        {/* Pagination - Sharp Design */}
        {totalPages > 1 && pageItems.length > 0 && (
          <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
            {currentPage > 1 ? (
              <Link
                href={`/articles?${new URLSearchParams({ ...safeSearchParams, page: String(currentPage - 1) }).toString()}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-bold uppercase tracking-wide bg-white"
              >
              Previous
              </Link>
            ) : (
              <button
                disabled
                className="inline-flex items-center px-4 py-2 border border-gray-200 text-gray-400 bg-gray-50 text-sm font-bold uppercase tracking-wide opacity-60 cursor-not-allowed"
              >
                Previous
              </button>
            )}
            
            {startPage > 1 && (
              <>
                <Link
                  href={`/articles?${new URLSearchParams({ ...safeSearchParams, page: '1' }).toString()}`}
                  className="px-4 py-2 border border-gray-300 text-sm font-bold text-gray-700 hover:bg-gray-50 bg-white"
                >
                  1
                </Link>
                {startPage > 2 && <span className="px-2 text-gray-400 font-bold">...</span>}
              </>
            )}
            
            {pages.map((p) => (
              <Link
                key={p}
                href={`/articles?${new URLSearchParams({ ...safeSearchParams, page: String(p) }).toString()}`}
                className={`px-4 py-2 border text-sm font-bold transition-colors ${
                  p === currentPage
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 bg-white'
                }`}
              >
                {p}
              </Link>
            ))}
            
            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && <span className="px-2 text-gray-400 font-bold">...</span>}
                <Link
                  href={`/articles?${new URLSearchParams({ ...safeSearchParams, page: String(totalPages) }).toString()}`}
                  className="px-4 py-2 border border-gray-300 text-sm font-bold text-gray-700 hover:bg-gray-50 bg-white"
                >
                  {totalPages}
                </Link>
              </>
            )}

            {currentPage < totalPages ? (
              <Link
                href={`/articles?${new URLSearchParams({ ...safeSearchParams, page: String(currentPage + 1) }).toString()}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-bold uppercase tracking-wide bg-white"
              >
                Next
              </Link>
            ) : (
              <button
                disabled
                className="inline-flex items-center px-4 py-2 border border-gray-200 text-gray-400 bg-gray-50 text-sm font-bold uppercase tracking-wide opacity-60 cursor-not-allowed"
              >
                Next
              </button>
            )}
          </nav>
        )}
      </div>
    </main>
  );
}