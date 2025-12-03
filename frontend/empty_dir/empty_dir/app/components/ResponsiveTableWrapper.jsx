'use client';

import { useEffect, useRef } from 'react';

export default function ResponsiveTableWrapper({ html, className }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const tables = container.querySelectorAll('table');
    
    tables.forEach((table) => {
      // Check if table is already wrapped
      if (table.parentElement.classList.contains('table-scroll-container')) {
        return;
      }
      
      // Create wrapper div
      const wrapper = document.createElement('div');
      wrapper.className = 'table-scroll-container';
      
      // Insert wrapper before table
      table.parentNode.insertBefore(wrapper, table);
      
      // Move table into wrapper
      wrapper.appendChild(table);
    });
  }, [html]);

  return (
    <div 
      ref={containerRef} 
      className={`rich-html max-w-none break-words leading-relaxed text-gray-800 ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
}