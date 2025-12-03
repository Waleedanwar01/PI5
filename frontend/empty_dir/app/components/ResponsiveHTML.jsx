"use client";
import React, { useEffect, useRef } from "react";

export default function ResponsiveHTML({ html, className }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const tables = root.querySelectorAll('table.ai-table');
    tables.forEach((table) => {
      // Collect header labels
      const labels = [];
      const theadTr = table.querySelector('thead tr');
      if (theadTr) {
        theadTr.querySelectorAll('th, td').forEach((cell) => {
          labels.push((cell.textContent || '').trim());
        });
      } else {
        const firstTr = table.querySelector('tr');
        if (firstTr) {
          firstTr.querySelectorAll('th, td').forEach((cell) => {
            labels.push((cell.textContent || '').trim());
          });
        }
      }
      // Assign data-label to each cell for mobile display
      const rows = table.querySelectorAll('tbody tr');
      const targetRows = rows.length ? rows : table.querySelectorAll('tr');
      targetRows.forEach((tr) => {
        const cells = tr.querySelectorAll('td');
        let idx = 0;
        cells.forEach((td) => {
          if (!td.getAttribute('data-label')) {
            td.setAttribute('data-label', labels[idx] || '');
          }
          idx += 1;
        });
      });
    });
  }, [html]);

  return (
    <div ref={rootRef} className={className} dangerouslySetInnerHTML={{ __html: html }} />
  );
}