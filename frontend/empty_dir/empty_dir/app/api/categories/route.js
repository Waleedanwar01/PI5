import { headers } from 'next/headers';
import { getApiBase } from '../../lib/config.js';

export async function GET(req) {
  const API_BASE = getApiBase();
  
  // Robustly parse search params even if req.url is relative
  let params;
  try {
    if (req?.nextUrl?.searchParams) {
      params = req.nextUrl.searchParams;
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
          // Fallback: empty search params if all else fails
          params = new URLSearchParams();
          const type = params.get('type');
          const apiUrl = `${API_BASE}/api/categories/all${type ? `?type=${encodeURIComponent(type)}` : ''}`;
          const res = await fetch(apiUrl, { cache: 'no-store' });
          const json = await res.json();
          return Response.json(json);
        }
      }
      params = url.searchParams;
    }
  } catch {
    params = new URLSearchParams();
  }
  
  const type = params.get('type');
  
  // Use the new categories API endpoint
  const apiUrl = `${API_BASE}/api/categories/all${type ? `?type=${encodeURIComponent(type)}` : ''}`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(apiUrl, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return Response.json({ categories: [] }, { status: 200 });
    const json = await res.json();
    return Response.json(json);
  } catch (e) {
    console.error('categories upstream error:', e?.message || e);
    return Response.json({ categories: [] }, { status: 200 });
  }
}
