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
  const cls = String(className || '').trim() || 'text-blue-600 hover:text-blue-700';
  if (isInternal(href)) {
    return (
      <Link href={href} className={cls} prefetch={prefetch} onClick={onClick} {...rest}>
        {children}
      </Link>
    );
  }
  const externalProps = isSpecial(href) ? {} : { target: '_blank', rel: 'noopener noreferrer' };
  return (
    <a href={href} className={cls} onClick={onClick} {...externalProps} {...rest}>
      {children}
    </a>
  );
}
