import "./globals.css";
import "./theme-vars.css";
import ClientLayout from "./components/ClientLayout.jsx";
import { getApiBase, getMediaUrl } from "./lib/config.js";

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const apiBase = getApiBase();
    
    // Fetch site config for favicon
    const siteConfigRes = await fetch(`${apiBase}/api/site-config/`, { cache: 'no-store' });
    let icons = {};
    
    if (siteConfigRes.ok) {
        const config = await siteConfigRes.json();
        if (config.favicon) {
            const faviconUrl = getMediaUrl(config.favicon);
            icons = {
                icon: faviconUrl,
                shortcut: faviconUrl,
                apple: faviconUrl,
            };
        } else {
             // Fallback to default icon
             icons = {
                icon: '/icon.svg',
                shortcut: '/icon.svg',
                apple: '/icon.svg',
            };
        }
    } else {
        // Fallback to default icon if fetch fails
        icons = {
            icon: '/icon.svg',
            shortcut: '/icon.svg',
            apple: '/icon.svg',
        };
    }

    return {
      metadataBase: new URL(base),
      icons: icons,
    };
  } catch {
    return {};
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&display=swap" rel="stylesheet" />
      </head>

      <body className="font-google-sans antialiased overflow-x-hidden">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
