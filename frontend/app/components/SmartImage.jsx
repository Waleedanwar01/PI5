import React from 'react';
import Image from 'next/image';
import { getMediaUrl } from '../lib/config.js';
import SkeletonLoader from './SkeletonLoader.jsx';

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
  const finalSrc = getMediaUrl(src);
  const [srcToUse, setSrcToUse] = React.useState(finalSrc || '/icon.svg');
  const hasDims = Number.isFinite(width) && Number.isFinite(height);
  const [loaded, setLoaded] = React.useState(false);
  const blurDataURL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZWVlIi8+PC9zdmc+';

  if (fill) {
    return (
      <div className={`relative ${className}`} style={style}>
        {!loaded && <SkeletonLoader className="absolute inset-0 w-full h-full rounded-none" />}
        <Image
          src={srcToUse}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoadingComplete={() => setLoaded(true)}
          onError={() => {
            setSrcToUse('/icon.svg');
            setLoaded(true);
          }}
          placeholder={priority ? undefined : 'blur'}
          blurDataURL={priority ? undefined : blurDataURL}
          {...rest}
        />
      </div>
    );
  }
  const w = hasDims ? width : 800;
  const h = hasDims ? height : 600;
  return (
    <div className={`relative ${className}`} style={style}>
      {!loaded && <SkeletonLoader className="absolute inset-0 w-full h-full rounded-none" />}
      <Image
        src={srcToUse}
        alt={alt}
        width={w}
        height={h}
        sizes={sizes}
        priority={priority}
        className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoadingComplete={() => setLoaded(true)}
        onError={() => {
          setSrcToUse('/icon.svg');
          setLoaded(true);
        }}
        placeholder={priority ? undefined : 'blur'}
        blurDataURL={priority ? undefined : blurDataURL}
        {...rest}
      />
    </div>
  );
}
