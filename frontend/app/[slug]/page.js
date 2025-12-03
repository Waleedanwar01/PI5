import React from 'react';
import PageClient from '../components/PageClient.jsx';

export async function generateMetadata({ params }) {
  const slug = String(params?.slug || '').trim();
  
  try {
    // Fetch page data to get the actual title
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000';
    const url = `${base}/api/pages/${encodeURIComponent(slug)}/`;
    const response = await fetch(url, { cache: 'no-store' });
    
    if (response.ok) {
      const data = await response.json();
      const page = data?.page;
      if (page && page.name) {
        return { 
          title: page.name, 
          description: page.meta_description || '' 
        };
      }
    }
  } catch (error) {
    console.error('Error fetching page metadata:', error);
  }
  
  // Fallback to slug if page data not found
  return { 
    title: slug || 'Page', 
    description: '' 
  };
}

export default function Page({ params }) {
  const slug = String(params?.slug || '').trim();
  return <PageClient slug={slug} />;
}