import { headers } from 'next/headers';

async function getApiBase() {
  const envBase = process.env.NEXT_PUBLIC_API_BASE;
  if (envBase) return envBase;
  try {
    const h = await headers();
    const host = h.get('host') || '127.0.0.1:3002';
    const hostname = host.split(':')[0];
    return `http://${hostname}:8000`;
  } catch {
    return 'http://127.0.0.1:8000';
  }
}

export async function POST(req) {
  const API_BASE = getApiBase();
  const body = await req.text();
  const res = await fetch(`${API_BASE}/api/contact/submit/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  const json = await res.json();
  return Response.json(json, { status: res.status });
}