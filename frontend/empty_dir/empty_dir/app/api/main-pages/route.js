import { headers } from 'next/headers';
import { getApiBase } from '../../lib/config.js';

export async function GET() {
  const API_BASE = getApiBase();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${API_BASE}/api/main-pages/`, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return Response.json({ pages: [] }, { status: 200 });
    const json = await res.json();
    return Response.json(json);
  } catch (e) {
    console.error('main-pages upstream error:', e?.message || e);
    return Response.json({ pages: [] }, { status: 200 });
  }
}