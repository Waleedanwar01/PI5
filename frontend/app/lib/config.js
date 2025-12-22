/**
 * Centralized Configuration Utility
 * 
 * This file provides a single source of truth for all API URLs and configuration.
 * Update environment variables in .env file to change all URLs in one place.
 */

// Get backend API base URL
export function getApiBase() {
  // Default to production URL if env var is missing (for Vercel without env setup)
  return process.env.NEXT_PUBLIC_API_BASE || 'https://pi5-y8gd.onrender.com';
}

// Get media/assets base URL
export function getMediaBase() {
  return process.env.NEXT_PUBLIC_MEDIA_BASE || process.env.NEXT_PUBLIC_API_BASE;
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
  
  const productionBase = 'https://pi5-y8gd.onrender.com';
  
  // If path is already absolute
  if (path.startsWith('http://') || path.startsWith('https://')) {
    // Replace localhost/127.0.0.1 with production base
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