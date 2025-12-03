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
    <html lang="en">
      <head>
        {/* ✅ Google Font: Public Sans */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className="font-public antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
