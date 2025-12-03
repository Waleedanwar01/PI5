import { getApiBase } from '../../lib/config.js';

export async function GET(req) {
  const API_BASE = getApiBase();
  // Parse params robustly
  let params;
  try {
    if (req?.nextUrl?.searchParams) {
      params = req.nextUrl.searchParams;
    } else {
      const raw = typeof req?.url === 'string' ? req.url : '';
      const qs = raw.includes('?') ? raw.split('?')[1] : '';
      params = new URLSearchParams(qs);
    }
  } catch {
    params = new URLSearchParams();
  }

  const zip = params.get('zip') || '';
  const qs = new URLSearchParams();
  if (zip) qs.set('zip', String(zip));
  const url = `${API_BASE}/api/quotes${qs.toString() ? `?${qs.toString()}` : ''}`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) {
      try {
        const err = await res.json();
        return Response.json({ ...err, zip }, { status: res.status });
      } catch {
        return Response.json({ ok: false, error: 'Upstream quotes error', zip }, { status: res.status });
      }
    }
    const json = await res.json();
    return Response.json({ ...json, zip }, { status: 200 });
  } catch (e) {
    const message = typeof e?.message === 'string' ? e.message : 'Proxy fetch failed';
    // Fallback: try localhost if env/headers used 127.0.0.1 or different host
    try {
      const altBase = 'http://localhost:8000';
      const altUrl = `${altBase}/api/quotes${qs.toString() ? `?${qs.toString()}` : ''}`;
      const res2 = await fetch(altUrl, { cache: 'no-store' });
      const json2 = await res2.json();
      return Response.json({ ...json2, zip }, { status: 200 });
    } catch (e2) {
      const msg2 = typeof e2?.message === 'string' ? e2.message : message;
      return Response.json({ ok: false, companies: [], error: msg2, zip }, { status: 200 });
    }
  }
}