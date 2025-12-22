import React from 'react';
import { getApiBase } from '../lib/config.js';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }) {
  try {
    const zip = String(searchParams?.zip || '').slice(0, 5);
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`${base}/api/site-config/`, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);
    const cfg = await res.json();
    const brand = (cfg?.brand_name || 'Car Insurance Comparison').trim();
    const titleZip = zip || 'Your Area';
    return {
      title: `${titleZip} Quotes - ${brand}`,
      description: `Compare auto insurance rates in ${titleZip}. Get quotes from top insurers and save today with ${brand}.`,
    };
  } catch {
    return {
      title: 'Auto Insurance Quotes',
      description: 'Compare auto insurance rates and save today.',
    };
  }
}

async function fetchQuotes(searchParams) {
  const zip = searchParams?.zip || '';
  const qs = new URLSearchParams();
  if (zip) qs.set('zip', String(zip));
  
  // Prefer Next.js API proxy first (fast local call)
  try {
    const proxyUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/quotes${qs.toString() ? `?${qs.toString()}` : ''}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(proxyUrl, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);
    const json = await res.json().catch(() => ({}));
    const arr = Array.isArray(json?.companies) ? json.companies : [];
    if (json?.ok === true) {
      return { ...json, _source: 'proxy' };
    }
  } catch (e) {
    console.log('Proxy fetch failed:', e?.message || e);
  }

  // If proxy fails, try a single backend base (env)
  try {
    const base = getApiBase();
    const url = `${base}/api/quotes${qs.toString() ? `?${qs.toString()}` : ''}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(url, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);
    const json = await res.json().catch(() => ({}));
    const arr = Array.isArray(json?.companies) ? json.companies : [];
    if (json?.ok === true) {
      return { ...json, _source: 'backend-direct-env' };
    }
  } catch (e) {
    console.log('Direct backend fetch failed:', e?.message || e);
  }
  
  return { ok: false, companies: [], _source: 'all-failed' };
}

export default async function QuotesPage({ searchParams }) {
  const data = await fetchQuotes(searchParams);
  const zip = String(searchParams?.zip || data?.zip || '').slice(0, 5);
  const companies = Array.isArray(data?.companies) ? data.companies : [];
  const ok = data?.ok === true;

  // Filter Logic (Client-side Fallback)
  function filterCompaniesByZip(list, zipCode) {
    const z = String(zipCode || '').replace(/\D/g, '').slice(0, 5);
    if (z.length !== 5) return list; // If invalid ZIP, show all (or handle as error)
    
    // Helper to check range strings "10000-20000"
    const within = (range) => {
      const s = String(range || '').trim();
      if (!s) return false;
      const m = s.match(/^(\d{5})\s*-\s*(\d{5})$/);
      if (!m) return false;
      const a = parseInt(m[1], 10);
      const b = parseInt(m[2], 10);
      const v = parseInt(z, 10);
      if (Number.isNaN(a) || Number.isNaN(b) || Number.isNaN(v)) return false;
      return v >= Math.min(a, b) && v <= Math.max(a, b);
    };

    const matches = (c) => {
      if (!c || typeof c !== 'object') return false;
      // Backend should handle filtering, but if we get a raw list, check coverages
      // Note: The backend 'quotes' view already filters by ZIP if provided.
      // So this client-side filter is mostly a backup if the API returns everything.
      return true; 
    };
    
    // If backend already filtered, we trust it.
    // If companies array is empty, it means backend found nothing or error.
    return list;
  }

  const filteredCompanies = filterCompaniesByZip(companies, zip);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="mx-auto max-w-5xl px-8 sm:px-12 lg:px-16">
        
        {/* Results List */}
        <div className="space-y-6">
          {filteredCompanies.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900">No companies found in this area.</h3>
              <p className="mt-2 text-gray-500">Try entering a different ZIP code.</p>
            </div>
          ) : (
            filteredCompanies.map((company, idx) => (
              <div key={company.id || idx} className="relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                
                {/* Yellow Ribbon (Top Left) */}
                <div className="absolute top-0 left-0 z-10">
                    <div className="w-0 h-0 border-t-[70px] border-t-[#ffeb3b] border-r-[70px] border-r-transparent"></div>
                    <div className="absolute top-2 left-2 text-white">
                        <svg className="w-6 h-6 transform -rotate-45" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row p-6 items-center gap-6">
                  
                  {/* Logo Column */}
                  <div className="w-full md:w-1/4 flex flex-col items-center justify-center">
                    <div className="w-full border border-gray-200 rounded p-2 flex items-center justify-center h-24 bg-white">
                        {company.logo ? (
                            <img 
                                src={company.logo} 
                                alt={`${company.name} Logo`} 
                                className="max-h-16 max-w-full object-contain"
                            />
                        ) : (
                            <span className="text-gray-400 font-bold text-lg">{company.name}</span>
                        )}
                    </div>
                  </div>

                  {/* Content Column */}
                  <div className="w-full md:w-1/2 text-left">
                    <h2 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                        {company.headline || `${company.name} offers great rates in ${zip || 'your area'}`}
                    </h2>
                    
                    <ul className="space-y-1">
                        {company.features ? (
                            company.features.split('\n').map((feature, i) => (
                                feature.trim() && (
                                    <li key={i} className="flex items-start text-sm text-gray-800">
                                        <span className="mr-2 text-black font-bold">•</span>
                                        <span>{feature.trim()}</span>
                                    </li>
                                )
                            ))
                        ) : (
                            // Fallback bullets
                            <>
                                <li className="flex items-start text-sm text-gray-800">
                                    <span className="mr-2 text-black font-bold">•</span>
                                    <span>Top rated and trusted providers in your area</span>
                                </li>
                                <li className="flex items-start text-sm text-gray-800">
                                    <span className="mr-2 text-black font-bold">•</span>
                                    <span>Easy, fast & 100% free comparison</span>
                                </li>
                                <li className="flex items-start text-sm text-gray-800">
                                    <span className="mr-2 text-black font-bold">•</span>
                                    <span>Get *REAL* quotes in minutes</span>
                                </li>
                                <li className="flex items-start text-sm text-gray-800">
                                    <span className="mr-2 text-black font-bold">•</span>
                                    <span>Click Here to Start Saving!</span>
                                </li>
                            </>
                        )}
                    </ul>
                  </div>

                  {/* CTA Column */}
                  <div className="w-full md:w-1/4 flex flex-col items-center justify-center space-y-2">
                    <a 
                        href={company.landing_url || company.domain_url || '#'} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded shadow-sm text-center transition-colors text-lg"
                    >
                        {company.cta_text || 'View My Quote'}
                    </a>
                    <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">
                        COMPARE RATES
                    </span>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
