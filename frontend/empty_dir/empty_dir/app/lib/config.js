/**
 * Centralized Configuration Utility
 * 
 * This file provides a single source of truth for all API URLs and configuration.
 * Update environment variables in .env file to change all URLs in one place.
 */

// Get backend API base URL
export function getApiBase() {
  return process.env.NEXT_PUBLIC_API_BASE;
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
  const base = getMediaBase();
  return base ? `${base}${path.startsWith('/') ? path : '/' + path}` : path;
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