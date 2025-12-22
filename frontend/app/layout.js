import "./globals.css";
import "./theme-vars.css";
import ClientLayout from "./components/ClientLayout.jsx";
export async function generateMetadata() {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000';
    
    // Fetch site config for favicon
    const siteConfigRes = await fetch(`${apiBase}/api/site-config/`, { cache: 'no-store' });
    let icons = {};
    
    if (siteConfigRes.ok) {
        const config = await siteConfigRes.json();
        if (config.favicon) {
            icons = {
                icon: config.favicon,
                shortcut: config.favicon,
                apple: config.favicon,
            };
        }
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
