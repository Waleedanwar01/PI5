'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import FeaturedIn from './components/FeaturedIn.jsx';
import SkeletonLoader from './components/SkeletonLoader.jsx';

export default function ClientHomepage({ initialMeta }) {
  const [articles, setArticles] = useState([]);
  const [homepageData, setHomepageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [homepageRes, articlesRes] = await Promise.all([
          fetch('/api/homepage/', { cache: 'no-store' }),
          fetch('/api/blogs/?limit=6', { cache: 'no-store' })
        ]);
        
        if (homepageRes.ok) {
          const data = await homepageRes.json();
          setHomepageData(data);
          
          // Use initialMeta if provided, otherwise fallback to fetched data
          const meta = initialMeta || data.meta || {};
          
          if (meta.meta_title) {
             // Title handling is usually better in layout/page metadata, but we keep this for client-side transitions if needed
          }
        }
        
        if (articlesRes.ok) {
          const articlesData = await articlesRes.json();
          setArticles(articlesData.blogs || []);
        }
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [initialMeta]);

  if (loading) {
    return (
      <section className="py-12 md:py-20 bg-white">
         {/* ... Skeletons ... */}
      </section>
    );
  }

  // If no data at all, return null
  if (!homepageData && !articles.length) return null;

  const meta = initialMeta || homepageData?.meta || {};
  
  // Use a simple list layout for Related Articles as seen in the screenshot
  return (
    <section className="bg-white pb-0">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-8">
        
        {/* Featured Logos Section REMOVED */}

        {/* Content rendering removed to avoid duplication with page.js */}

        {/* Articles Section - Simple List Style */}
        {articles.length > 0 && (
          <div className="py-8 md:py-12">
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6">
              Recent Articles
            </h3>

            <div className="flex flex-col gap-3">
              {articles.slice(0, 6).map((it, index) => (
                <Link 
                  key={String(it.slug || index)}
                  href={`/articles/${encodeURIComponent(String(it.slug || ''))}`}
                  className="text-sky-600 hover:text-sky-800 hover:underline text-base md:text-lg font-medium transition-colors duration-200 block"
                >
                  {it.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
