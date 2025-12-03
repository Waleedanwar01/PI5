"use client";

import { useEffect, useState } from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaLinkedin, FaLink } from 'react-icons/fa';

function iconFor(url) {
  try {
    const u = new URL(url);
    const h = (u.hostname || '').toLowerCase();
    if (h.includes('facebook')) return FaFacebook;
    if (h.includes('twitter') || h.includes('x.com')) return FaTwitter;
    if (h.includes('instagram')) return FaInstagram;
    if (h.includes('youtube')) return FaYoutube;
    if (h.includes('linkedin')) return FaLinkedin;
  } catch {}
  return FaLink;
}

export default function SocialIcons({ className = '', showTitle = true }) {
  const [links, setLinks] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/site-config/', { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        const arr = Array.isArray(json?.social_links) ? json.social_links : [];
        if (!cancelled) setLinks(arr);
      } catch {}
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (!links.length) return null;

  return (
    <div className={className}>
      {showTitle && (
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Follow us</h3>
      )}
      <div className="flex flex-col items-start gap-2">
        {links.map((href, i) => {
          const Icon = iconFor(href);
          return (
            <a
              key={href + i}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 bg-white text-gray-700 hover:text-orange-700 hover:border-orange-700 transition"
              aria-label={href}
            >
              <Icon className="text-lg" />
            </a>
          );
        })}
      </div>
    </div>
  );
}