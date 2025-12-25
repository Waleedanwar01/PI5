/**
 * Centralized Configuration Utility
 * 
 * This file provides a single source of truth for all API URLs and configuration.
 * Update environment variables in .env file to change all URLs in one place.
 */

// Get backend API base URL
export function getApiBase() {
  // If env var is set, use it (works for both local with .env and production)
  if (process.env.NEXT_PUBLIC_API_BASE) {
    return process.env.NEXT_PUBLIC_API_BASE;
  }
  
  // If in development mode and no env var, default to local backend
  if (process.env.NODE_ENV === 'development') {
    return 'http://127.0.0.1:8000';
  }

  // Fallback to production URL for production builds without env vars
  return 'https://pi5-y8gd.onrender.com';
}

// Get media/assets base URL
export function getMediaBase() {
  return process.env.NEXT_PUBLIC_MEDIA_BASE || process.env.NEXT_PUBLIC_API_BASE || getApiBase();
}

// Get site URL for metadata and absolute URLs
export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL;
}

// Get backend URL
export function getBackendUrl() {
  return process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE;
}

// Get admin URL
export function getAdminUrl() {
  return process.env.NEXT_PUBLIC_ADMIN_URL;
}

// Build full API URL
export function getApiUrl(path) {
  const base = getApiBase();
  return base ? `${base}${path.startsWith('/') ? path : '/' + path}` : path;
}

// Build full media URL
export function getMediaUrl(path) {
  if (!path) return null;
  
  // PASS THROUGH LOCAL ASSETS (Logos, Icons, etc.)
  // If the path starts with /logos/, /images/, /icons/ or /favicon, assume it's a local frontend asset.
  // Note: /media/ is purposely excluded here because backend media files (uploads) often start with /media/
  if (path.startsWith('/logos/') || path.startsWith('/images/') || path.startsWith('/icons/') || path.startsWith('/favicon')) {
      return path;
  }
  
  const productionBase = 'https://pi5-y8gd.onrender.com';
  
  // If path is already absolute
  if (path.startsWith('http://') || path.startsWith('https://')) {
    // PRESERVE LOCALHOST IN DEVELOPMENT:
    // If we are running locally (client-side check), do not rewrite localhost URLs.
    // This ensures local images load correctly during development.
    if (typeof window !== 'undefined' && 
       (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      // Force 127.0.0.1 to avoid IPv6 issues with localhost on Windows
      return path.replace('localhost', '127.0.0.1');
    }

    // Replace localhost/127.0.0.1 with production base for production builds
    if (path.includes('localhost:8000') || path.includes('127.0.0.1:8000')) {
      return path.replace(/http:\/\/(localhost|127\.0\.0\.1):8000/, productionBase);
    }
    return path;
  }
  
  const base = getMediaBase() || productionBase;
  // Ensure base doesn't end with slash if path starts with slash
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  
  return `${cleanBase}${cleanPath}`;
}

// Helper function to get API base from headers (for dynamic host detection)
export function getDynamicApiBase(headers) {
  try {
    const host = headers?.get?.('host') || 'localhost:3000';
    const hostname = host.split(':')[0];
    return `http://${hostname}:8000`;
  } catch {
    return getApiBase();
  }
}

// Centralized API Endpoints
export const API_ENDPOINTS = {
  BLOGS: '/api/blogs/',
  CATEGORIES: '/api/categories/',
  SITE_CONFIG: '/api/site-config/',
  MAIN_PAGES: '/api/main-pages/',
  MENU_HEADER: '/api/menu/header/',
  MENU_FOOTER: '/api/menu/footer/',
  CONTACT: '/api/contact/',
  QUOTES: '/api/quotes/',
  FOOTER_ADDRESS: '/api/footer-address/',
  HOMEPAGE: '/api/homepage/',
  PAGES_WITH_CATEGORIES: '/api/pages-with-categories/',
};