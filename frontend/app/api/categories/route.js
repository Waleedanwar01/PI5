import { headers } from 'next/headers';
import { getApiBase } from '../../lib/config.js';

export const dynamic = 'force-dynamic';

let CACHE = null;
let CACHE_AT = 0;
const TTL_MS = 5 * 60 * 1000;

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
        url = new URL(req.url);
      } catch {
        try {
          url = new URL(req.url, 'http://localhost:3000');
        } catch {
          params = new URLSearchParams();
        }
      }
      params = url?.searchParams || new URLSearchParams();
    }
  } catch {
    params = new URLSearchParams();
  }
  
  const type = params.get('type');
  const apiUrl = `${API_BASE}/api/categories/all${type ? `?type=${encodeURIComponent(type)}` : ''}`;

  // Simple cache since categories rarely change
  if (CACHE && (Date.now() - CACHE_AT) < TTL_MS) {
    return Response.json(CACHE, { status: 200 });
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(apiUrl, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) {
      const fallback = { categories: [] };
      CACHE = fallback; CACHE_AT = Date.now();
      return Response.json(fallback, { status: 200 });
    }
    const json = await res.json();
    CACHE = json; CACHE_AT = Date.now();
    return Response.json(json);
  } catch (e) {
    console.error('categories upstream error:', e?.message || e);
    const fallback = { categories: [] };
    CACHE = fallback; CACHE_AT = Date.now();
    return Response.json(fallback, { status: 200 });
  }
}
