import React from 'react';
import Image from 'next/image';

export default function SmartImage({
  src,
  alt = '',
  className = '',
  width,
  height,
  fill = false,
  sizes = '100vw',
  priority = false,
  style,
  ...rest
}) {
  const hasDims = Number.isFinite(width) && Number.isFinite(height);
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={className}
        style={style}
        {...rest}
      />
    );
  }
  // Fallback reasonable defaults when dimensions are unknown
  const w = hasDims ? width : 800;
  const h = hasDims ? height : 600;
  return (
    <Image
      src={src}
      alt={alt}
      width={w}
      height={h}
      sizes={sizes}
      priority={priority}
      className={className}
      style={style}
      {...rest}
    />
  );
}