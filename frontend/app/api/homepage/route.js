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
    const timer = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(`${API_BASE}/api/homepage/`, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) {
      // Return a safe fallback payload so the frontend can still render
      return Response.json({
        sections: [],
        videos: [],
        meta_title: 'Home',
        meta_description: 'Welcome',
        hero_image: null,
        content: '',
      });
    }
    const json = await res.json();
    return Response.json(json);
  } catch (e) {
    // Network or upstream error: still return a safe fallback
    return Response.json({
      sections: [],
      videos: [],
      meta_title: 'Home',
      meta_description: 'Welcome',
      hero_image: null,
      content: '',
      error: 'homepage upstream error',
    });
  }
}