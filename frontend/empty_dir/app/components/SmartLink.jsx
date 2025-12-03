import React from 'react';
import Link from 'next/link';

function isInternal(href) {
  const v = String(href || '').trim();
  if (!v) return false;
  if (v.startsWith('/') || v.startsWith('#')) return true;
  if (!/^[a-z]+:/i.test(v)) return true; // relative like "blog/post"
  return false;
}

function isSpecial(href) {
  const v = String(href || '').trim().toLowerCase();
  return v.startsWith('mailto:') || v.startsWith('tel:');
}

export default function SmartLink({ href = '#', children, className = '', prefetch, onClick, ...rest }) {
  if (isInternal(href)) {
    return (
      <Link href={href} className={className} prefetch={prefetch} onClick={onClick} {...rest}>
        {children}
      </Link>
    );
  }
  const externalProps = isSpecial(href) ? {} : { target: '_blank', rel: 'noopener noreferrer' };
  return (
    <a href={href} className={className} onClick={onClick} {...externalProps} {...rest}>
      {children}
    </a>
  );
}