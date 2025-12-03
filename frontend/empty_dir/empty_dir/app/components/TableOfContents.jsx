import React from 'react';
import SmartLink from './SmartLink.jsx';

export default function TableOfContents({ sections }) {
  if (!Array.isArray(sections) || sections.length === 0) return null;
  const items = sections.map((s, i) => ({
    id: s.id || s.anchor_id || `section-${i + 1}`,
    title: s.title || `Section ${i + 1}`,
  }));

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-6 rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-gray-700">On this page</h3>
        <ul className="mt-3 space-y-2">
          {items.map((it) => (
            <li key={it.id}>
              <SmartLink href={`#${it.id}`} className="text-sm text-blue-600 hover:underline">
                {it.title}
              </SmartLink>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}