import ContactPageClient from './ContactPageClient.jsx';

export async function generateMetadata() {
  let brandName = 'Car Insurance Comparison';
  try {
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000';
    const scRes = await fetch(`${base}/api/site-config/`, { cache: 'no-store' });
    if (scRes.ok) {
        const sc = await scRes.json();
        if (sc.brand_name) brandName = sc.brand_name.trim();
    }
  } catch (e) {
    console.error('Error fetching site config:', e);
  }

  return {
    title: `Contact Us | ${brandName}`,
    description: `Contact ${brandName} for help with your car insurance quotes and comparison needs.`,
  };
}

export default function ContactPage() {
  return <ContactPageClient />;
}
