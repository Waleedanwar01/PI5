export async function fetchJSON(path) {
  // Use Next.js internal API routes to avoid CORS
  const url = path;
  // Disable caching so newly added blogs/categories reflect immediately
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed: ${res.status} ${url}`);
  return res.json();
}

export async function getMainPages() {
  return fetchJSON('/api/main-pages/');
}

export async function getCategoriesForPage(slug) {
  return fetchJSON(`/api/categories/?page=${encodeURIComponent(slug)}&include_blogs=1`);
}

export async function getBlogsForPage(slug) {
  const pageSlug = String(slug || '').toLowerCase();
  const json = await fetchJSON(`/api/blogs/?page=${encodeURIComponent(pageSlug)}`);
  const blogs = Array.isArray(json?.blogs) ? json.blogs : [];
  const filtered = blogs.filter((b) => String(b.parent_page || '').toLowerCase() === pageSlug);
  return { ...json, blogs: filtered };
}

export async function getSiteConfig() {
  return fetchJSON('/api/site-config/');
}

// Fetch blogs by category slug (e.g., alaska, geico)
export async function getBlogsForCategory(categorySlug) {
  return fetchJSON(`/api/blogs/?category=${encodeURIComponent(categorySlug)}`);
}