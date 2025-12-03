import { headers } from 'next/headers';
import { getApiBase } from '../../lib/config.js';

export async function GET(req) {
  try {
    const API_BASE = getApiBase();
    
    // Robustly parse search params even if req.url is relative
    let search = '';
    try {
      if (req?.nextUrl?.searchParams) {
        const params = req.nextUrl.searchParams;
        search = params.toString() ? `?${params.toString()}` : '';
      } else {
        // Handle both relative and absolute URLs more robustly
        let url;
        try {
          // If req.url is already absolute, use it directly
          url = new URL(req.url);
        } catch {
          try {
            // If req.url is relative, add base URL
            url = new URL(req.url, 'http://localhost:3000');
          } catch {
            // Fallback: no search params
            search = '';
          }
        }
        if (url) {
          search = url.search || '';
        }
      }
    } catch {
      search = '';
    }
    
    const backendUrl = `${API_BASE}/api/pages-with-categories/${search}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(backendUrl, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) {
      // Gracefully degrade to an empty structure to avoid client fetch rejection
      return Response.json({ pages: [] }, { status: 200 });
    }
    const json = await res.json();
    return Response.json(json);
  } catch (err) {
    console.error('pages-with-categories upstream error:', err?.message || err);
    // Never throw; always return safe JSON to prevent client-side Failed to fetch
    return Response.json({ pages: [] }, { status: 200 });
  }
}