import { getApiBase } from '../../lib/config.js';

const FALLBACK_COMPANIES = [
  {
    id: 991,
    name: "Progressive",
    slug: "progressive",
    logo: "https://www.progressive.com/content/images/domainprogressive/wh3/base/header/logo_progressive.svg", 
    headline: "Drivers save an average of $700",
    features: "Snapshot Program\nBundle & Save\n24/7 Support",
    cta_text: "View Quote",
    rating: 4.8,
    landing_url: "https://www.progressive.com/",
  },
  {
    id: 992,
    name: "Geico",
    slug: "geico",
    logo: "https://www.geico.com/public/images/logo/geico-logo.svg",
    headline: "15 minutes could save you 15%",
    features: "Multi-Policy Discount\nAccident Forgiveness\nVehicle Systems",
    cta_text: "View Quote",
    rating: 4.7,
    landing_url: "https://www.geico.com/",
  },
  {
    id: 993,
    name: "State Farm",
    slug: "state-farm",
    logo: "https://www.statefarm.com/content/dam/sf-library/en-us/secure/branding/sf-logo-red.svg",
    headline: "Like a good neighbor, State Farm is there",
    features: "Safe Driver Discount\nSteer Clear\nDrive Safe & Save",
    cta_text: "View Quote",
    rating: 4.9,
    landing_url: "https://www.statefarm.com/",
  },
  {
    id: 994,
    name: "Allstate",
    slug: "allstate",
    logo: "https://www.allstate.com/resources/allstate/images/tools/nav/allstate-logo-horiz.svg",
    headline: "You're in good hands",
    features: "Drivewise\nMilewise\nNew Car Replacement",
    cta_text: "View Quote",
    rating: 4.6,
    landing_url: "https://www.allstate.com/",
  },
  {
    id: 995,
    name: "Liberty Mutual",
    slug: "liberty-mutual",
    logo: "https://www.libertymutual.com/akam/13/pixel_52504b77.png", // Generic or text if logo unavailable
    headline: "Only pay for what you need",
    features: "RightTrack\nViolation Free\nMulti-Car",
    cta_text: "View Quote",
    rating: 4.5,
    landing_url: "https://www.libertymutual.com/",
  }
];

export async function GET(req) {
  const API_BASE = getApiBase();
  // Parse params robustly
  let params;
  try {
    if (req?.nextUrl?.searchParams) {
      params = req.nextUrl.searchParams;
    } else {
      const raw = typeof req?.url === 'string' ? req.url : '';
      const qs = raw.includes('?') ? raw.split('?')[1] : '';
      params = new URLSearchParams(qs);
    }
  } catch {
    params = new URLSearchParams();
  }

  const zip = params.get('zip') || '';
  const qs = new URLSearchParams();
  if (zip) qs.set('zip', String(zip));
  const url = `${API_BASE}/api/quotes/${qs.toString() ? `?${qs.toString()}` : ''}`;
  
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);
    
    if (!res.ok) {
        // Fallback to static data on error
        console.error('Upstream quotes error, using fallback');
        return Response.json({ ok: true, companies: FALLBACK_COMPANIES, zip, _source: 'fallback_error' }, { status: 200 });
    }
    
    const json = await res.json();
    
    // If backend returns empty list (no companies found), use fallback
    if (!json.companies || json.companies.length === 0) {
        return Response.json({ ...json, companies: FALLBACK_COMPANIES, zip, _source: 'fallback_empty' }, { status: 200 });
    }
    
    return Response.json({ ...json, zip }, { status: 200 });
  } catch (e) {
    const message = typeof e?.message === 'string' ? e.message : 'Proxy fetch failed';
    console.error('Proxy fetch failed, using fallback:', message);
    
    // Fallback: try production URL explicitly if env var failed
    try {
      const altBase = 'https://pi5-y8gd.onrender.com';
      const altUrl = `${altBase}/api/quotes/${qs.toString() ? `?${qs.toString()}` : ''}`;
      const res2 = await fetch(altUrl, { cache: 'no-store' });
      const json2 = await res2.json();
      
      if (!json2.companies || json2.companies.length === 0) {
          return Response.json({ ...json2, companies: FALLBACK_COMPANIES, zip, _source: 'fallback_alt_empty' }, { status: 200 });
      }
      return Response.json({ ...json2, zip }, { status: 200 });
    } catch (e2) {
      // Final Fallback: Return static data
      return Response.json({ ok: true, companies: FALLBACK_COMPANIES, error: message, zip, _source: 'fallback_final' }, { status: 200 });
    }
  }
}