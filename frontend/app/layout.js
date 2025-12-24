import "./globals.css";
import "./theme-vars.css";
import ClientLayout from "./components/ClientLayout.jsx";
import { getApiBase, getMediaUrl } from "./lib/config.js";

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  
  // Hardcoded stable favicon (Green square with white triangle)
  const faviconDataUrl = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNiIgZmlsbD0iIzAwN0ExMSIvPjxwYXRoIGZpbGw9IiNmZmZmZmYiIGQ9Ik0xNiA2bDggMThIOHoiLz48L3N2Zz4=";

  const icons = {
      icon: [faviconDataUrl],
      shortcut: [faviconDataUrl],
      apple: [faviconDataUrl],
  };

  try {
    const apiBase = getApiBase();
    // Fetch site config only for title/description if needed, or hardcode that too if requested.
    // User said "logo faviocn or as seen logo ko hard coded kar do", didn't explicitly say title.
    // But to be safe and stable, I'll keep title dynamic but fallback gracefully.
    
    const siteConfigRes = await fetch(`${apiBase}/api/site-config/`, { cache: 'no-store' });
    if (siteConfigRes.ok) {
        const config = await siteConfigRes.json();
        // Ignore admin favicon, use hardcoded
        return {
            metadataBase: new URL(base),
            icons: icons,
            title: config.brand_name || "Car Insurance Comparison",
            description: config.tagline || "Compare car insurance rates",
        };
    }
  } catch {}

  return {
    metadataBase: new URL(base),
    icons: icons,
    title: "Car Insurance Comparison",
    description: "Compare car insurance rates and find the best coverage for you",
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&display=swap" rel="stylesheet" />
        
        {/* Preload critical assets for LCP optimization */}
        <link rel="preload" href="/logos/logo.svg" as="image" />
        <link rel="preload" href="/logos/as-seen.svg" as="image" />
        <link rel="preload" href="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1920&auto=format&fit=crop" as="image" />
      </head>

      <body className="font-google-sans antialiased overflow-x-hidden">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
