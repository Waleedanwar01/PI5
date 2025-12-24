import { headers } from 'next/headers';
import { getApiBase } from '../../lib/config.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const API_BASE = getApiBase();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(`${API_BASE}/api/footer-address/`, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) {
      return Response.json({ address: '', source: 'fallback' }, { status: 200 });
    }
    const json = await res.json();
    CACHE = json; CACHE_AT = Date.now();
    return Response.json(json);
  } catch (e) {
    return Response.json({ address: '', source: 'fallback' }, { status: 200 });
  }
}
