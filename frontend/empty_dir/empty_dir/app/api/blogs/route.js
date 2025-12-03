import { headers } from 'next/headers';
import { getApiBase } from '../../lib/config.js';

export async function GET(req) {
  const API_BASE = getApiBase();
  try {
    // Parse search params from Next.js request
    let inParams;
    if (req?.nextUrl?.searchParams) {
      // Use Next.js built-in searchParams for server requests
      inParams = req.nextUrl.searchParams;
    } else {
      // Fallback: parse query string manually from req.url
      const raw = typeof req?.url === 'string' ? req.url : '';
      const qs = raw.includes('?') ? raw.split('?')[1] : '';
      inParams = new URLSearchParams(qs);
    }
    
    const outParams = new URLSearchParams();
    const category = inParams.get('category');
    if (category) outParams.set('category', String(category));
    
    // Forward page parameter for pagination (only numeric values)
    const page = inParams.get('page');
    if (page && /^\d+$/.test(String(page))) {
      outParams.set('page', String(page));
    }
    
    // Forward page_size parameter for pagination
    let pageSize = inParams.get('page_size');
    if (pageSize && /^\d+$/.test(String(pageSize))) {
      outParams.set('page_size', String(pageSize));
    }
    // Support `limit` as an alias of page_size (used by ClientHomepage)
    const limit = inParams.get('limit');
    if (!pageSize && limit && /^\d+$/.test(String(limit))) {
      pageSize = String(limit);
      outParams.set('page_size', pageSize);
    }
    
    // Forward search parameter
    const search = inParams.get('search');
    if (search) outParams.set('search', String(search));
    
    // Forward q parameter (alternative to search)
    const q = inParams.get('q');
    if (q) outParams.set('search', String(q));
    
    const backendSearch = outParams.toString();
    const target = backendSearch ? `${API_BASE}/api/blogs/?${backendSearch}` : `${API_BASE}/api/blogs/`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(target, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);
    // Avoid throwing on non-JSON error bodies; forward status cleanly
    if (!res.ok) {
      let msg = 'Upstream error';
      try {
        const errJson = await res.json();
        msg = errJson?.error || msg;
      } catch {
        try {
          msg = await res.text();
        } catch {}
      }
      return Response.json({ error: msg || 'Blogs proxy failed' }, { status: res.status });
    }
    const json = await res.json();
    
    // Normalize various backend shapes into { blogs, pagination }
    // Preferred shape: { blogs: [...], pagination: { ... } }
    let blogs = [];
    let pagination = null;
    
    if (Array.isArray(json?.blogs)) {
      // Already in preferred shape
      blogs = json.blogs;
      pagination = json.pagination || null;
    } else if (Array.isArray(json?.results)) {
      // Typical DRF pagination: { count, next, previous, results }
      blogs = json.results;
      const pNum = Number(page) || 1;
      const psNum = Number(pageSize) || blogs.length || 10;
      const totalCount = Number(json.count) || blogs.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / psNum));
      const hasNext = Boolean(json.next);
      const hasPrev = Boolean(json.previous);
      pagination = {
        total_count: totalCount,
        page_size: psNum,
        current_page: pNum,
        total_pages: totalPages,
        has_next: hasNext,
        has_previous: hasPrev,
      };
    } else if (Array.isArray(json)) {
      // Raw list
      blogs = json;
      const psNum = Number(pageSize) || blogs.length || 10;
      const totalCount = blogs.length;
      const pNum = Number(page) || 1;
      pagination = {
        total_count: totalCount,
        page_size: psNum,
        current_page: pNum,
        total_pages: Math.max(1, Math.ceil(totalCount / psNum)),
        has_next: false,
        has_previous: false,
      };
    } else {
      // Unknown shape: try a few common keys
      const maybe = json?.items || json?.data || [];
      blogs = Array.isArray(maybe) ? maybe : [];
      pagination = json?.pagination || null;
    }
    
    // Return normalized payload alongside original fields
    return Response.json({ ...json, blogs, pagination });
  } catch (e) {
    console.error('blogs upstream error:', e?.message || e);
    return Response.json({ error: e?.message || 'Blogs proxy failed' }, { status: 500 });
  }
}