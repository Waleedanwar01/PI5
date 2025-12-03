'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ClientHomepage() {
  const [articles, setArticles] = useState([]);
  const [homepageData, setHomepageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch homepage content with CKEditor data
        const [homepageRes, articlesRes] = await Promise.all([
          fetch('/api/homepage/', { cache: 'no-store' }),
          fetch('/api/blogs/?limit=6', { cache: 'no-store' })
        ]);
        
        if (homepageRes.ok) {
          const homepageData = await homepageRes.json();
          setHomepageData(homepageData);
          
          // Set dynamic page title and meta from homepage
          if (homepageData.meta_title) {
            document.title = `${homepageData.meta_title} | Car Insurance Comparison`;
          
            // Update meta description
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription && homepageData.meta_description) {
              metaDescription.setAttribute('content', homepageData.meta_description);
            }
            
            // Update OpenGraph tags
            const ogTitle = document.querySelector('meta[property="og:title"]');
            if (ogTitle) {
              ogTitle.setAttribute('content', homepageData.meta_title);
            }
            
            const ogDescription = document.querySelector('meta[property="og:description"]');
            if (ogDescription && homepageData.meta_description) {
              ogDescription.setAttribute('content', homepageData.meta_description);
            }
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
  }, []);

  if (loading) {
    return (
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Homepage content skeleton */}
          <div className="mb-12">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-6 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto animate-pulse"></div>
          </div>
          
          {/* Featured logos skeleton */}
          <div className="mb-16">
            <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-8 animate-pulse"></div>
            <div className="flex justify-center items-center space-x-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-24 h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
          
          {/* Articles skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-2xl h-64 lg:h-80 animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // If no data at all, return null
  if (!homepageData && !articles.length) return null;

  // Sample featured logos (you can make this dynamic based on your data)
  const featuredLogos = [
    { name: 'Allstate', logo: '/images/Allstate-Logo-1-7.png' },
    { name: 'Geico', logo: '/images/Geico-Logo-1-2.png' },
    { name: 'State Farm', logo: '/images/State-Farm-Logo-1-7.png' },
    { name: 'Progressive', logo: '/images/Progressive-1-21.png' },
    { name: 'Farmers', logo: '/images/Farmers-2.png' },
    { name: 'USAA', logo: '/images/USAA-Logo-38.png' },
    { name: 'Liberty Mutual', logo: '/images/Liberty-Mutual-Logo-47-1-6.png' },
    { name: 'Nationwide', logo: '/images/Nationwide-Logo-1-8.png' },
    { name: 'American Family', logo: '/images/American-Family-Insurance-Logo-1-6.png' },
    { name: 'Travelers', logo: '/images/Travelers-Logo-35.png' },
  ];

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* CKEditor Homepage Content Section */}
        {homepageData?.content && (
          <div className="mb-16">
            <div className="prose prose-lg md:prose-xl max-w-none prose-a:text-orange-800 hover:prose-a:text-orange-900">
              <div 
                className="text-center prose-headings:text-center prose-p:text-center"
                dangerouslySetInnerHTML={{ __html: homepageData.content }}
              />
            </div>
          </div>
        )}

        {/* Homepage Sections with CKEditor Data - Only Why Choose Us Section */}
        {homepageData?.sections && homepageData.sections.length > 0 && (
          <div className="mb-16">
            {homepageData.sections
              .filter(section => {
                const titleLc = String(section.title || '').toLowerCase();
                const subtitleLc = String(section.subtitle || '').toLowerCase();
                const bodyLc = String(section.body || '').toLowerCase();
                
                // Remove Why Choose Us and other unwanted sections
                return titleLc !== 'featured in' && 
                       titleLc !== 'insurance guides' &&
                       titleLc !== 'why choose us' &&
                       !titleLc.includes('insurance guide') &&
                       !subtitleLc.includes('transparent, accurate, and easy to compare') &&
                       !subtitleLc.includes('get up to speed quickly') &&
                       !bodyLc.includes('we make shopping for auto insurance simpler');
              })
              .map((section, index) => (
                <div key={section.id || index} className="text-center mb-12">
                  {section.title && (
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                      {section.title}
                    </h2>
                  )}
                  {section.subtitle && (
                    <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                      {section.subtitle}
                    </p>
                  )}
                  
                  {/* Display section content based on type */}
                  {section.type === 'rich_text' && section.body && (
                    <div className="prose prose-lg max-w-none text-left prose-a:text-orange-800 hover:prose-a:text-orange-900">
                      <div dangerouslySetInnerHTML={{ __html: section.body }} />
                    </div>
                  )}
                </div>
              ))
            }
          </div>
        )}

        {/* Articles Section */}
        {articles.length > 0 && (
          <>
            <div className="text-center mb-8 md:mb-12">
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
                {homepageData?.meta_title || 'Related Articles'}
              </h3>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                {homepageData?.meta_description || 'Continue learning about auto insurance'}
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="space-y-4 md:space-y-6">
                {articles.slice(0, 6).map((it, index) => (
                  <div key={String(it.slug || index)} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <Link
                      href={`/articles/${encodeURIComponent(String(it.slug || ''))}`}
                      className="text-lg md:text-xl font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-200 block line-clamp-2"
                    >
                      {it.title}
                    </Link>
                    {it.summary && (
                      <p className="text-gray-600 mt-2 line-clamp-2 text-sm md:text-base">
                        {it.summary}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center mt-8 md:mt-12">
              <Link
                href="/articles"
                className="inline-flex items-center justify-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-900 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm md:text-base w-full sm:w-auto"
              >
                View All Articles
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
