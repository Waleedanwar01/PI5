import { headers } from 'next/headers';
import { getApiBase } from '../../lib/config.js';

export async function GET() {
  const API_BASE = getApiBase();
  try {
    const res = await fetch(`${API_BASE}/api/footer-address/`, { cache: 'no-store' });
    if (!res.ok) {
      return Response.json({ address: '', source: 'fallback' }, { status: 200 });
    }
    const json = await res.json();
    return Response.json(json);
  } catch (e) {
    return Response.json({ address: '', source: 'fallback' }, { status: 200 });
  }
}
