import { headers } from 'next/headers';
import { getApiBase } from '../../lib/config.js';

export const dynamic = 'force-dynamic';

let CACHE = null;
let CACHE_AT = 0;
const TTL_MS = 5 * 60 * 1000;

export async function GET() {
  const API_BASE = getApiBase();
  try {
    if (CACHE && (Date.now() - CACHE_AT) < TTL_MS) {
      return Response.json(CACHE, { status: 200 });
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${API_BASE}/api/main-pages/`, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) {
      const fallback = { pages: [] };
      CACHE = fallback; CACHE_AT = Date.now();
      return Response.json(fallback, { status: 200 });
    }
    const json = await res.json();
    CACHE = json; CACHE_AT = Date.now();
    return Response.json(json);
  } catch (e) {
    console.error('main-pages upstream error:', e?.message || e);
    const fallback = { pages: [] };
    CACHE = fallback; CACHE_AT = Date.now();
    return Response.json(fallback, { status: 200 });
  }
}
