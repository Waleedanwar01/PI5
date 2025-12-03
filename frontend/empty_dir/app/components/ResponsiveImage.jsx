"use client";

import Image from 'next/image';
import { useState } from 'react';

export default function ResponsiveImage({ src, alt = '', className = '', maxHeight = 480, priority = false }) {
  const [imgSrc, setImgSrc] = useState(src || '');
  const fallback = '/window.svg';

  // If src is empty, render fallback immediately
  const isEmpty = !imgSrc || typeof imgSrc !== 'string' || imgSrc.trim() === '';
  const style = { maxHeight: maxHeight ? `${maxHeight}px` : undefined, width: '100%', height: 'auto' };

  const handleError = () => {
    if (imgSrc !== fallback) setImgSrc(fallback);
  };

  // Prefer Next.js Image for supported remote patterns; otherwise use <img>
  const canOptimize = imgSrc.startsWith('http://localhost:8000') ||
                      imgSrc.startsWith('http://127.0.0.1:8000') ||
                      imgSrc.startsWith('https://www.autoinsurance.org');

  if (isEmpty) {
    return (
      <img src={fallback} alt={alt || 'image'} className={className} style={style} loading="lazy" />
    );
  }

  if (canOptimize) {
    return (
      <Image
        src={imgSrc}
        alt={alt || 'image'}
        width={1200}
        height={675}
        className={className}
        style={style}
        priority={priority}
        onError={handleError}
      />
    );
  }

  return (
    <img src={imgSrc} alt={alt || 'image'} className={className} style={style} loading="lazy" onError={handleError} />
  );
}