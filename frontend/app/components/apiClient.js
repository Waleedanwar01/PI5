import { API_ENDPOINTS } from '../lib/config.js';

export async function fetchJSON(path) {
  // Construct full URL using environment configuration
  // Use relative path for Next.js API routes (client-side)
  // or absolute URL if path starts with http
  const url = path.startsWith('http') ? path : path;
  
  // Disable caching so newly added blogs/categories reflect immediately
  const res = await fetch(url, { 
    cache: 'no-store',
    headers: {
      'Accept': 'application/json',
    }
  });
  if (!res.ok) throw new Error(`Failed: ${res.status} ${url}`);
  return res.json();
}

export async function getMainPages() {
  return fetchJSON(API_ENDPOINTS.MAIN_PAGES);
}

export async function getCategoriesForPage(slug) {
  return fetchJSON(`${API_ENDPOINTS.CATEGORIES}?page=${encodeURIComponent(slug)}&include_blogs=1`);
}

export async function getBlogsForPage(slug) {
  const pageSlug = String(slug || '').toLowerCase();
  const json = await fetchJSON(`${API_ENDPOINTS.BLOGS}?page=${encodeURIComponent(pageSlug)}`);
  const blogs = Array.isArray(json?.blogs) ? json.blogs : [];
  const filtered = blogs.filter((b) => String(b.parent_page || '').toLowerCase() === pageSlug);
  return { ...json, blogs: filtered };
}

export async function getSiteConfig() {
  return fetchJSON(API_ENDPOINTS.SITE_CONFIG);
}

// Fetch blogs by category slug (e.g., alaska, geico)
export async function getBlogsForCategory(categorySlug) {
  return fetchJSON(`${API_ENDPOINTS.BLOGS}?category=${encodeURIComponent(categorySlug)}`);
}