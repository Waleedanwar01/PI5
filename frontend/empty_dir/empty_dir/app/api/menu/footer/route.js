import { headers } from 'next/headers';
import { getApiBase } from '../../../lib/config.js';

export async function GET() {
  const API_BASE = getApiBase();
  const url = `${API_BASE}/api/menu/footer/`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) {
      // Safe fallback structure to prevent UI hangs
      return Response.json({ company: [], legal: [] }, { status: 200 });
    }
    const json = await res.json();
    return Response.json(json);
  } catch (e) {
    console.error('footer menu upstream error:', e?.message || e);
    clearTimeout(timer);
    return Response.json({ company: [], legal: [] }, { status: 200 });
  }
}