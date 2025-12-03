import Link from 'next/link';
import { headers } from 'next/headers';
import SearchBar from '../components/SearchBar';

export const metadata = {
  title: 'Insurance Articles',
};

export const dynamic = 'force-dynamic';

export default async function ArticlesPage({ searchParams }) {
  const pageSize = 12;
  const page = Math.max(1, Number(searchParams?.page) || 1);
  const h = headers();
  const host = (typeof h.get === 'function' ? (h.get('host') || 'localhost:3000') : 'localhost:3000').trim();
  const base = process.env.NEXT_PUBLIC_SITE_URL || `http://${host}`;
  
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
  
  // Fetch categories for filter chips
  let categories = [];
  try {
    const catRes = await fetch(`${base}/api/categories/`, { cache: 'no-store' });
    if (catRes.ok) {
      const catJson = await catRes.json();
      const arr = Array.isArray(catJson?.categories)
        ? catJson.categories
        : Array.isArray(catJson?.items)
        ? catJson.items
        : Array.isArray(catJson?.data)
        ? catJson.data
        : Array.isArray(catJson)
        ? catJson
        : [];
      categories = arr.filter((c) => c && (c.slug || c.name)).map((c) => ({ slug: c.slug || String(c.name || '').toLowerCase().replace(/\s+/g, '-'), name: c.name || toTitle(c.slug || '') }));
    }
  } catch {}
  const toTitle = (s) => String(s || '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  let responseData = { blogs: [], pagination: null };
  let error = null;
  
  try {
    // Build API params with pagination and search
    const apiParams = new URLSearchParams();
    if (searchQuery) apiParams.set('search', String(searchQuery));
    if (categorySlug) apiParams.set('category', String(categorySlug));
    apiParams.set('page', String(page));
    apiParams.set('page_size', String(pageSize));

    // Fetch articles with server-side pagination/search via absolute URL to avoid URL parse errors
    const initialUrl = `${base}/api/blogs?${apiParams.toString()}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const initialRes = await fetch(initialUrl, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);
    if (!initialRes.ok) throw new Error(`Failed to load blogs: ${initialRes.status}`);
    responseData = await initialRes.json();
    // Use only the current page from backend; avoid aggregating all pages to keep UI fast
    const normalized = Array.isArray(responseData)
      ? {
          blogs: responseData,
          pagination: {
            total_count: responseData.length,
            current_page: 1,
            total_pages: 1,
            has_next: false,
            has_previous: false,
          },
        }
      : responseData;
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
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Insurance Articles'}
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
            {searchQuery
              ? `Found ${total} article${total !== 1 ? 's' : ''} matching your search`
              : 'Expert insights, comprehensive guides, and tips to help you understand auto insurance better'
            }
          </p>
        </div>

        {/* Search Bar Component */}
        <SearchBar />

        {/* Category Filter Chips */}
        {categories.length > 0 && (
          <div className="mt-6 mb-8 flex flex-wrap items-center gap-2.5">
            <Link
              href={`/articles?${new URLSearchParams(spNoCat).toString()}`}
              className={`${!categorySlug ? 'bg-orange-600 border-orange-600 text-white' : 'border-gray-300 text-gray-700 hover:bg-orange-50 hover:border-orange-300'} px-3.5 py-1.5 rounded-full border text-sm font-medium transition-colors`}
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
                  className={`${active ? 'bg-orange-600 border-orange-600 text-white' : 'border-gray-300 text-gray-700 hover:bg-orange-50 hover:border-orange-300'} px-3.5 py-1.5 rounded-full border text-sm font-medium transition-colors`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>
        )}

        {/* Status/Count */}
        <div className="mb-8 flex items-center justify-between">
          <p className="text-sm md:text-base text-gray-700">
            {error ? (
              <span className="text-red-600 dark:text-red-400 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </span>
            ) : total > 0 ? (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Showing <strong className="text-gray-900">{start + 1}</strong>–<strong className="text-gray-900">{end}</strong> of <strong className="text-gray-900">{total}</strong> articles
              </span>
            ) : (
              <span className="flex items-center gap-2 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                No articles found.
              </span>
            )}
          </p>
          {totalPages > 1 && (
            <p className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </p>
          )}
        </div>

        {/* Articles Grid */}
        {pageItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {pageItems.map((it) => (
              <article
                key={String(it.slug || '')}
                className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden"
              >
                {/* Article Image */}
                {it.hero_image ? (
                  <div className="aspect-video overflow-hidden relative">
                    <img
                      src={it.hero_image}
                      alt={it.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}

                {/* Article Content */}
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    {it.category && (
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                        {it.category}
                      </span>
                    )}
                    {it.created_at && (
                      <time className="text-xs text-gray-500 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(it.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </time>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-700 transition-colors line-clamp-2 leading-snug">
                    <Link href={`/articles/${encodeURIComponent(String(it.slug || ''))}`}>
                      {it.title}
                    </Link>
                  </h3>

                  {it.summary && (
                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {it.summary}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <Link
                      href={`/articles/${encodeURIComponent(String(it.slug || ''))}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-orange-700 hover:text-orange-800 transition-colors group/link"
                    >
                      Read article
                      <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {Math.ceil((it.summary?.length || 0) / 200) + 3} min
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : !error && (
          <div className="text-center py-20">
            <div className="inline-block mb-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No articles found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search query</p>
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              View all articles
            </Link>
          </div>
        )}

        {/* Enhanced Pagination */}
        {totalPages > 1 && pageItems.length > 0 && (
          <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
            {currentPage > 1 ? (
              <Link
                href={`/articles?${new URLSearchParams({ ...safeSearchParams, page: String(currentPage - 1) }).toString()}`}
                className="inline-flex items-center px-3.5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium"
              >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
              </Link>
            ) : (
              <button
                disabled
                className="inline-flex items-center px-3.5 py-2 rounded-lg border border-gray-200 text-gray-400 bg-gray-50 text-sm font-medium opacity-60 cursor-not-allowed"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
            )}
            
-------
            {startPage > 1 && (
              <>
                <Link
                  href={`/articles?${new URLSearchParams({ ...safeSearchParams, page: '1' }).toString()}`}
                  className="px-3.5 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
                className={`px-3.5 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  p === currentPage
                    ? 'bg-orange-600 border-orange-600 text-white'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
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
                  className="px-3.5 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {totalPages}
                </Link>
              </>
            )}
            
-------
            {currentPage < totalPages ? (
              <Link
                href={`/articles?${new URLSearchParams({ ...safeSearchParams, page: String(currentPage + 1) }).toString()}`}
                className="inline-flex items-center px-3.5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium"
              >
                Next
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <button
                disabled
                className="inline-flex items-center px-3.5 py-2 rounded-lg border border-gray-200 text-gray-400 bg-gray-50 text-sm font-medium opacity-60 cursor-not-allowed"
              >
                Next
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </nav>
        )}
      </div>
    </main>
  );
}