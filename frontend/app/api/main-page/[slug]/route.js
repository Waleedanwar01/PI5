import { headers } from 'next/headers';
import { getApiBase } from '../../../lib/config.js';

export async function GET(req, { params }) {
  const API_BASE = getApiBase();
  const slugRaw = params?.slug;
  const slug = encodeURIComponent(String(slugRaw || ''));
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${API_BASE}/api/main-page/${slug}/`, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return Response.json({ error: 'Not found' }, { status: 404 });
    const json = await res.json();
    return Response.json(json);
  } catch (e) {
    console.error('main-page detail upstream error:', e?.message || e);
    return Response.json({ error: 'Error' }, { status: 500 });
  }
}
