import { getApiBase, getMediaUrl } from '../../lib/config.js';

export const dynamic = 'force-dynamic';

let CACHE = null;
let CACHE_AT = 0;
const TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  const API_BASE = getApiBase();
  try {
    if (CACHE && (Date.now() - CACHE_AT) < TTL_MS) {
      return Response.json(CACHE, { status: 200 });
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(`${API_BASE}/api/site-config/`, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) {
      const fallback = { brand_name: 'Site', favicon_url: null, updated_at: null };
      CACHE = fallback; CACHE_AT = Date.now();
      return Response.json(fallback, { status: 200 });
    }
    const json = await res.json();
    // Normalize media fields for frontend stability
    const favRaw = json.favicon || json.favicon_url || json.faviconUrl || null;
    const logoRaw = json.logo_url || json.logoUrl || json.logo || null;
    const normalized = {
      ...json,
      favicon_url: favRaw ? getMediaUrl(favRaw) : null,
      logo_url: logoRaw ? getMediaUrl(logoRaw) : null,
    };
    CACHE = normalized; CACHE_AT = Date.now();
    return Response.json(normalized);
  } catch (e) {
    console.error('site-config upstream error:', e?.message || e);
    const fallback = { brand_name: 'Site', favicon_url: null, updated_at: null };
    CACHE = fallback; CACHE_AT = Date.now();
    return Response.json(fallback, { status: 200 });
  }
}
