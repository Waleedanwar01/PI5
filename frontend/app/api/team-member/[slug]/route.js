import { headers } from 'next/headers';
import { getApiBase } from '../../../lib/config.js';

export async function GET(req, { params }) {
  const API_BASE = getApiBase();
  const slugRaw = params?.slug;
  const slug = encodeURIComponent(String(slugRaw || ''));
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${API_BASE}/api/team-member/${slug}/`, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);
    
    if (!res.ok) {
        if (res.status === 404) {
            return Response.json({ error: 'Team member not found' }, { status: 404 });
        }
        return Response.json({ error: 'Failed to fetch team member' }, { status: res.status });
    }
    
    const json = await res.json();
    return Response.json(json);
  } catch (e) {
    console.error('team member detail upstream error:', e?.message || e);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
