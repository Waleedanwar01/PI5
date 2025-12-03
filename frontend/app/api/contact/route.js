export async function POST(req) {
  const body = await req.text();
  const bases = [];
  const direct = process.env.NEXT_PUBLIC_CONTACT_SUBMIT_URL;
  const envBase = process.env.NEXT_PUBLIC_API_BASE;
  const altBase = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (direct) bases.push(direct);
  if (envBase) bases.push(`${envBase}/api/contact/submit/`);
  if (altBase) bases.push(`${altBase}/api/contact/submit/`);
  bases.push(`http://localhost:8000/api/contact/submit/`);
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
