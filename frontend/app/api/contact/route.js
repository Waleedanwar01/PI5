import { getApiBase } from '../../lib/config.js';

export async function POST(req) {
  const body = await req.text();
  const bases = [];
  const direct = process.env.NEXT_PUBLIC_CONTACT_SUBMIT_URL;
  const apiBase = getApiBase();
  
  if (direct) bases.push(direct);
  if (apiBase) bases.push(`${apiBase}/api/contact/submit/`);
  
  // Also try explicit backend URL if different
  const altBase = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (altBase && altBase !== apiBase) bases.push(`${altBase}/api/contact/submit/`);
  
  // Fallback to localhost is handled by getApiBase() default, but we can add explicit local check if needed
  // or rely on getApiBase() returning localhost if env var missing.

  for (const url of bases) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timer);
      let json = {};
      try { json = await res.json(); } catch { json = {}; }
      if (res.ok) {
        return Response.json({ ok: true }, { status: 200 });
      }
    } catch {}
  }
  return Response.json({ ok: false, error: 'Submission temporarily unavailable' }, { status: 200 });
}
