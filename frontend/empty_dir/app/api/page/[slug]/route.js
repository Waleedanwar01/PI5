import { headers } from 'next/headers';
import { getApiBase } from '../../../lib/config.js';

export async function GET(req, { params }) {
  const API_BASE = getApiBase();
  const slugRaw = params?.slug;
  const slug = encodeURIComponent(String(slugRaw || ''));
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${API_BASE}/api/page/${slug}/`, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return Response.json({ sections: [] }, { status: 200 });
    const json = await res.json();
    return Response.json(json);
  } catch (e) {
    console.error('page detail upstream error:', e?.message || e);
    return Response.json({ sections: [] }, { status: 200 });
  }
}