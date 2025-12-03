import { getApiBase } from '../../lib/config.js';

export async function GET() {
  const API_BASE = getApiBase();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${API_BASE}/api/site-config/`, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) {
      return Response.json({ brand_name: 'Site', favicon_url: null, updated_at: null }, { status: 200 });
    }
    const json = await res.json();
    return Response.json(json);
  } catch (e) {
    console.error('site-config upstream error:', e?.message || e);
    return Response.json({ brand_name: 'Site', favicon_url: null, updated_at: null }, { status: 200 });
  }
}