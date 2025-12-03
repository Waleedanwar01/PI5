import "./globals.css";
import "./theme-vars.css";
import ClientLayout from "./components/ClientLayout.jsx";
export async function generateMetadata() {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    return {
      metadataBase: new URL(base),
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
        <link href="https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
      </head>

      <body className="font-exo2 antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
