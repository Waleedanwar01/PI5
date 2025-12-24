import React from 'react';
import PageClient from '../components/PageClient.jsx';

export async function generateMetadata({ params }) {
  const { slug } = params || {};
  const safeSlug = String(slug || '').trim();
  let brandName = 'Car Insurance Comparison';

  try {
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000';

    try {
      const siteConfigUrl = `${base}/api/site-config/`;
      const scRes = await fetch(siteConfigUrl, { cache: 'no-store' });
      if (scRes.ok) {
        const sc = await scRes.json();
        if (sc.brand_name) brandName = sc.brand_name.trim();
      }
    } catch {}

    const url = `${base}/api/page/${encodeURIComponent(safeSlug)}/`;
    const response = await fetch(url, { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      const meta = data?.meta;
      if (meta?.meta_title) {
        return {
          title: meta.meta_title,
          description: meta.meta_description || '',
          openGraph: { title: meta.meta_title, description: meta.meta_description || '' },
        };
      }
      if (meta?.title) {
        const title = `${meta.title} | ${brandName}`;
        return {
          title,
          description: meta.meta_description || '',
          openGraph: { title, description: meta.meta_description || '' },
        };
      }
    }

    const mainPageUrl = `${base}/api/main-page/${encodeURIComponent(safeSlug)}/`;
    const mainPageResponse = await fetch(mainPageUrl, { cache: 'no-store' });
    if (mainPageResponse.ok) {
      const data = await mainPageResponse.json();
      const page = data?.page;
      if (page?.meta_title) {
        return {
          title: page.meta_title,
          description: page.meta_description || '',
          openGraph: { title: page.meta_title, description: page.meta_description || '' },
        };
      }
      if (page?.name) {
        const title = `${page.name} | ${brandName}`;
        return {
          title,
          description: page.meta_description || '',
          openGraph: { title, description: page.meta_description || '' },
        };
      }
    }
  } catch {}

  const cap = safeSlug ? safeSlug.charAt(0).toUpperCase() + safeSlug.slice(1) : 'Page';
  return { title: `${cap} | ${brandName}`, description: '' };
}

export default async function Page({ params }) {
  const { slug } = params || {};
  const safeSlug = String(slug || '');
  return <PageClient slug={safeSlug} />;
}
