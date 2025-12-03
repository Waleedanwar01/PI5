import { headers } from 'next/headers';
import { getApiBase } from '../../lib/config.js';

export async function GET() {
  const API_BASE = getApiBase();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${API_BASE}/api/homepage/`, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) {
      // Return a safe fallback payload so the frontend can still render
      return Response.json({
        sections: [],
        videos: [],
        meta_title: 'Home',
        meta_description: 'Welcome',
        hero_image: null,
        content: '',
      });
    }
    const json = await res.json();
    return Response.json(json);
  } catch (e) {
    // Network or upstream error: still return a safe fallback
    return Response.json({
      sections: [],
      videos: [],
      meta_title: 'Home',
      meta_description: 'Welcome',
      hero_image: null,
      content: '',
      error: 'homepage upstream error',
    });
  }
}