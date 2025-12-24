import { headers } from 'next/headers';
import { getApiBase } from '../../../lib/config.js';

export const dynamic = 'force-dynamic';

let CACHE = null;
let CACHE_AT = 0;
const TTL_MS = 5 * 60 * 1000;

export async function GET() {
  const API_BASE = getApiBase();
  const url = `${API_BASE}/api/menu/footer/`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    if (CACHE && (Date.now() - CACHE_AT) < TTL_MS) {
      return Response.json(CACHE, { status: 200 });
    }
    const res = await fetch(url, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) {
      // Safe fallback structure to prevent UI hangs
      const fallback = { company: [], legal: [] };
      CACHE = fallback; CACHE_AT = Date.now();
      return Response.json(fallback, { status: 200 });
    }
    const json = await res.json();
    CACHE = json; CACHE_AT = Date.now();
    return Response.json(json);
  } catch (e) {
    console.error('footer menu upstream error:', e?.message || e);
    clearTimeout(timer);
    const fallback = { company: [], legal: [] };
    CACHE = fallback; CACHE_AT = Date.now();
    return Response.json(fallback, { status: 200 });
  }
}
