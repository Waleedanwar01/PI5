'use client';

import { useEffect } from 'react';

export default function TableResponsiveFix({ children }) {
  useEffect(() => {
    // Find all tables and make them responsive
    const processTables = () => {
      const tables = document.querySelectorAll('table');
      tables.forEach((table) => {
        // Create wrapper if it doesn't exist
        if (!table.parentElement.classList.contains('table-responsive-wrapper')) {
          const wrapper = document.createElement('div');
          wrapper.className = 'table-responsive-wrapper';
          wrapper.style.overflowX = 'auto';
          wrapper.style.webkitOverflowScrolling = 'touch';
          wrapper.style.margin = '1rem 0';
          
          // Insert wrapper before table
          table.parentNode.insertBefore(wrapper, table);
          
          // Move table into wrapper
          wrapper.appendChild(table);
        }
      });
    };

    // Process immediately
    processTables();
    
    // Process after a short delay to catch dynamically added content
    const timer = setTimeout(processTables, 100);
    const observer = new MutationObserver(processTables);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return <>{children}</>;
}