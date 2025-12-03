import ZipForm from '@/app/components/ZipForm.jsx';
import Link from 'next/link';
import { headers } from 'next/headers';
import ArticleClient from '@/app/components/ArticleClient.jsx';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  // In Next.js 14+, params is a Promise that needs to be awaited
  const { slug } = await params;
  if (!slug) return { title: 'Article' };
  try {
    const blog = await fetchBlog(slug);
    if (!blog) return { title: `Article: ${String(slug || '')}` };
    
    // Use the exact blog title for SEO
    const title = blog.title || `Article: ${String(slug || '')}`;
    const description = blog.summary || '';
    const images = blog.hero_image ? [{ url: blog.hero_image }] : [];
    
    console.log('Generated metadata for blog:', { title, description, slug });
    
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images,
        type: 'article',
      },
      alternates: {
        canonical: `/articles/${encodeURIComponent(String(slug || ''))}`,
      },
    };
  } catch (e) {
    console.error('Error generating metadata:', e);
    return { title: `Article: ${String(slug || '')}` };
  }
}

async function fetchBlog(slug) {
  const base = await getApiBase();
  const url = `${base}/api/blogs/${encodeURIComponent(String(slug || ''))}/`;
  let res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.blog || null;
}

// Removed category fallback: detail page should only resolve blog slugs

async function getApiBase() {
  const envBase = process.env.NEXT_PUBLIC_API_BASE;
  if (envBase) return envBase;
  try {
    const h = headers();
    const host = h.get('host') || '127.0.0.1:3013';
    const hostname = host.split(':')[0];
    return `http://${hostname}:8000`;
  } catch {
    return 'http://127.0.0.1:8000';
  }
}

export default async function ArticleDetailPage({ params }) {
  // In Next.js 14+, params is a Promise that needs to be awaited
  const { slug } = await params;
  // Render client-side to ensure reliable fetching via working API routes
  return <ArticleClient slug={slug} />;
}