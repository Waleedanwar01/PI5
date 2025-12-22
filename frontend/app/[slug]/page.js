import React from 'react';
import PageClient from '../components/PageClient.jsx';

export async function generateMetadata({ params }) {
  // Await params for Next.js 15+
  const { slug } = await params;
  
  try {
    // Fetch page data to get the actual title
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000';
    let brandName = 'Car Insurance Comparison';
    
    try {
    // Fetch Site Config for Brand Name
        const siteConfigUrl = `${base}/api/site-config/`;
        const scRes = await fetch(siteConfigUrl, { cache: 'no-store' });
        if (scRes.ok) {
            const sc = await scRes.json();
            if (sc.brand_name) brandName = sc.brand_name.trim();
        }
    } catch (e) {
        console.error('Error fetching site config:', e);
    }

    // Try Page API
    const url = `${base}/api/page/${encodeURIComponent(String(slug || '').trim())}/`;
    const response = await fetch(url, { cache: 'no-store' });
    
    if (response.ok) {
      const data = await response.json();
      const meta = data?.meta;
      // If meta_title is explicitly set, use it.
      // Otherwise, use page title + brand.
      if (meta?.meta_title) {
        return { 
          title: meta.meta_title, 
          description: meta.meta_description || '',
          openGraph: {
            title: meta.meta_title,
            description: meta.meta_description || '',
          }
        };
      }
      if (meta?.title) {
          const title = `${meta.title} | ${brandName}`;
          return {
              title,
              description: meta.meta_description || '',
              openGraph: {
                title,
                description: meta.meta_description || '',
              }
          };
      }
    }

    // Try MainPage API
    const mainPageUrl = `${base}/api/main-page/${encodeURIComponent(String(slug || '').trim())}/`;
    const mainPageResponse = await fetch(mainPageUrl, { cache: 'no-store' });

    if (mainPageResponse.ok) {
        const data = await mainPageResponse.json();
        const page = data?.page;
        if (page?.meta_title) {
            return {
                title: page.meta_title,
                description: page.meta_description || '',
                openGraph: {
                    title: page.meta_title,
                    description: page.meta_description || '',
                }
            };
        }
        if (page?.name) {
             const title = `${page.name} | ${brandName}`;
             return {
                title,
                description: page.meta_description || '',
                openGraph: {
                    title,
                    description: page.meta_description || '',
                }
            };
        }
    }

  } catch (error) {
    console.error('Error fetching page metadata:', error);
  }
  
  // Fallback
  return { 
    title: `${String(slug || 'Page').charAt(0).toUpperCase() + String(slug || 'Page').slice(1)} | ${brandName || 'Car Insurance'}`, 
    description: '' 
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  return <PageClient slug={slug} />;
}