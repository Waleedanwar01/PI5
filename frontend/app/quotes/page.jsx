import FilterBar from './FilterBar.jsx';
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
      title: `Auto Insurance Quotes in ${titleZip} | ${brand}`,
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
    const proxyUrl = `/api/quotes${qs.toString() ? `?${qs.toString()}` : ''}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(proxyUrl, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);
    const json = await res.json().catch(() => ({}));
    const arr = Array.isArray(json?.companies) ? json.companies : [];
    if (json?.ok === true && arr.length >= 0) {
      return { ...json, _source: 'proxy' };
    }
  } catch (e) {
    console.log('Proxy fetch failed:', e?.message || e);
  }

  // If proxy fails, try a single backend base (env)
  try {
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';
    const url = `${base}/api/quotes${qs.toString() ? `?${qs.toString()}` : ''}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(url, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);
    const json = await res.json().catch(() => ({}));
    const arr = Array.isArray(json?.companies) ? json.companies : [];
    if (json?.ok === true && arr.length >= 0) {
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
  const source = data?._source || 'proxy';

  function filterCompaniesByZip(list, zipCode) {
    const z = String(zipCode || '').replace(/\D/g, '').slice(0, 5);
    if (z.length !== 5) return list;
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
      if (Array.isArray(c.zip_ranges) && c.zip_ranges.some(within)) return true;
      if (Array.isArray(c.coverage_zip_ranges) && c.coverage_zip_ranges.some(within)) return true;
      const prefixes = c.zip_prefixes || c.coverage_zip_prefixes;
      if (Array.isArray(prefixes) && prefixes.some((p) => String(z).startsWith(String(p || '').trim()))) return true;
      const zips = c.supported_zips || c.coverage_zips || c.zips;
      if (Array.isArray(zips) && zips.some((v) => String(v || '').trim() === z)) return true;
      return false;
    };
    const filtered = list.filter(matches);
    return filtered.length > 0 ? filtered : list;
  }

  const filteredCompanies = filterCompaniesByZip(companies, zip);
  const topCompany = filteredCompanies.length > 0 ? filteredCompanies[0] : null;
  const otherCompanies = filteredCompanies.slice(1);

  return (
    <div className="min-h-[60vh] bg-white pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* Page title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          The Best Auto Insurance Rates for {zip || '—'}
        </h1>
        <p className="mt-2 text-gray-600">Companies found: {filteredCompanies.length}</p>

        {/* Top filter bar (client component) */}
        <div className="mt-6">
          <FilterBar zip={zip} />
        </div>

        {/* Highlight card for top company */}
        {topCompany ? (
          <div className="mt-8 rounded-2xl sm:rounded-3xl border border-orange-200 bg-orange-50 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-100 to-orange-200 px-4 py-2 text-orange-800 text-sm font-semibold shadow-sm">
                  <span aria-hidden>👑</span>
                  Top Pick
                </div>
                <h2 className="mt-4 text-xl sm:text-2xl font-bold text-gray-900">
                  Drivers who save by switching to {topCompany.name}
                </h2>
                <p className="mt-2 text-gray-700">
                  Fast, easy quotes and trusted service. Compare rates and see how much you can save.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-700 list-disc pl-5">
                  <li>Customized quote in minutes</li>
                  <li>24/7 claims support</li>
                  <li>Millions of drivers trust {topCompany.name}</li>
                </ul>
              </div>
              <div className="flex-shrink-0">
                {topCompany?.landing_url ? (
                  <a
                    href={topCompany.landing_url}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center justify-center rounded-lg bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 text-base font-semibold shadow-sm"
                  >
                    View My Quote
                  </a>
                ) : topCompany?.domain_url ? (
                  <a
                    href={topCompany.domain_url}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 hover:border-gray-400 text-gray-900 px-5 py-3 text-base font-semibold shadow-sm"
                  >
                    Compare Rates
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {/* Companies grid cards */}
        <div className="mt-10">
          {filteredCompanies.length === 0 ? (
            <div className="rounded-xl border border-gray-200 p-6 text-gray-800">
              No companies found for ZIP {zip || '—'}. Try a different ZIP.
              {!ok && data?.error ? (
                <p className="mt-2 text-xs text-red-600">Note: {String(data.error)}</p>
              ) : null}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredCompanies.map((c, idx) => {
                return (
                  <div key={`${c.slug || c.name}-${idx}`} className="group relative rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">{c.name}</h3>
                          {typeof c.rating === 'number' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs font-medium">{c.rating} ★</span>
                          ) : null}
                        </div>
                        {c.short_description ? (
                          <p className="mt-1 text-gray-700 text-sm">{c.short_description}</p>
                        ) : null}
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                          {c.short_url ? (
                            <a href={c.short_url} target="_blank" rel="noopener" className="text-blue-700 hover:underline">Promo</a>
                          ) : null}
                          {c.contact_url ? (
                            <a href={c.contact_url} target="_blank" rel="noopener" className="text-blue-700 hover:underline">Support</a>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.landing_url ? (
                          <a href={c.landing_url} target="_blank" rel="noopener" className="btn inline-flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 text-sm font-semibold">Get Quote</a>
                        ) : null}
                        {c.domain_url ? (
                          <a href={c.domain_url} target="_blank" rel="noopener" className="btn inline-flex items-center justify-center border border-gray-300 hover:border-gray-400 text-gray-900 px-3 py-1.5 text-sm font-semibold">Website</a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
