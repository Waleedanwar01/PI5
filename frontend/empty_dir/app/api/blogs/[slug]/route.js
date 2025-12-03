import { headers } from 'next/headers';
import { getApiBase } from '../../../lib/config.js';

export async function GET(req, { params }) {
  const API_BASE = getApiBase();
  // In Next.js 14+, params is a Promise
  const { slug: slugRaw } = await params;
  
  // Guard against missing or literal 'undefined' slug
  if (!slugRaw || String(slugRaw).trim() === '' || String(slugRaw).toLowerCase() === 'undefined') {
    return Response.json({ error: 'Missing article slug' }, { status: 400 });
  }
  
  const slug = encodeURIComponent(String(slugRaw || ''));
  try {
    const res = await fetch(`${API_BASE}/api/blogs/${slug}/`, { cache: 'no-store' });
    if (!res.ok) {
      // Do not fallback to category: detail route only resolves real blog slugs
      return Response.json({ error: 'Blog not found' }, { status: res.status });
    }
    const json = await res.json();
    return Response.json(json);
  } catch (e) {
    return Response.json({ error: 'Upstream error' }, { status: 500 });
  }
}