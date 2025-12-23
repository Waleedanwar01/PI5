// Enhance HomePage sections inline: rename add button, and toggle fieldsets per type
(function() {
  function $all(root, selector) { return Array.from((root || document).querySelectorAll(selector)); }
  function $one(root, selector) { return (root || document).querySelector(selector); }

  function findFieldsetByLegend(container, legendText) {
    const sets = $all(container, 'fieldset');
    for (const fs of sets) {
      const lg = fs.querySelector('h2, legend');
      const txt = (lg ? lg.textContent.trim() : '').toLowerCase();
      if (txt === legendText.toLowerCase()) return fs;
    }
    return null;
  }

  function setDisplay(el, show) {
    if (!el) return;
    el.style.display = show ? '' : 'none';
  }

  function toggleFieldRow(container, fieldName, show) {
    const row = $one(container, `.form-row.field-${fieldName}`);
    setDisplay(row, show);
  }

  function updateInline(container) {
    // Find type select in this inline
    const typeSel = $one(container, 'select[id$="-type"]');
    if (!typeSel) return;
    const val = typeSel.value || 'rich_text';
    const columnsInput = $one(container, 'input[id$="-columns_count"]');
    const columnsCount = parseInt((columnsInput && columnsInput.value) ? columnsInput.value : '1', 10);
    const fsBody = findFieldsetByLegend(container, 'Full Width Body');
    const fsCols = findFieldsetByLegend(container, 'Columns Content');
    const fsMedia = findFieldsetByLegend(container, 'Media');
    const fsVideo = findFieldsetByLegend(container, 'Video');
    const fsGraph = findFieldsetByLegend(container, 'Graph');
    const fsCode = findFieldsetByLegend(container, 'Code');
    const fsGallery = findFieldsetByLegend(container, 'Gallery');
    const fsStats = findFieldsetByLegend(container, 'Stats');
    const fsCTA = findFieldsetByLegend(container, 'CTA');
    const fsEditor = findFieldsetByLegend(container, 'Editor Blocks');

    // Default hide all specific groups
    const all = [fsBody, fsCols, fsMedia, fsVideo, fsGraph, fsCode, fsGallery, fsStats, fsCTA, fsEditor];
    all.forEach(el => setDisplay(el, false));

    switch (val) {
      case 'rich_text':
        setDisplay(fsBody, true);
        break;
      case 'rich_columns':
        setDisplay(fsCols, true);
        // Titles/Subtitles per column
        toggleFieldRow(container, 'col1_title', columnsCount >= 1);
        toggleFieldRow(container, 'col1_subtitle', columnsCount >= 1);
        toggleFieldRow(container, 'col2_title', columnsCount >= 2);
        toggleFieldRow(container, 'col2_subtitle', columnsCount >= 2);
        toggleFieldRow(container, 'col3_title', columnsCount >= 3);
        toggleFieldRow(container, 'col3_subtitle', columnsCount >= 3);
        toggleFieldRow(container, 'col4_title', columnsCount >= 4);
        toggleFieldRow(container, 'col4_subtitle', columnsCount >= 4);
        toggleFieldRow(container, 'col5_title', columnsCount >= 5);
        toggleFieldRow(container, 'col5_subtitle', columnsCount >= 5);
        toggleFieldRow(container, 'col1_rich', columnsCount >= 1);
        toggleFieldRow(container, 'col2_rich', columnsCount >= 2);
        toggleFieldRow(container, 'col3_rich', columnsCount >= 3);
        toggleFieldRow(container, 'col4_rich', columnsCount >= 4);
        toggleFieldRow(container, 'col5_rich', columnsCount >= 5);
        toggleFieldRow(container, 'col1_blocks', columnsCount >= 1);
        toggleFieldRow(container, 'col2_blocks', columnsCount >= 2);
        toggleFieldRow(container, 'col3_blocks', columnsCount >= 3);
        toggleFieldRow(container, 'col4_blocks', columnsCount >= 4);
        toggleFieldRow(container, 'col5_blocks', columnsCount >= 5);
        break;
      case 'media':
        setDisplay(fsMedia, true);
        setDisplay(fsBody, true);
        break;
      case 'video':
        setDisplay(fsVideo, true);
        setDisplay(fsBody, true);
        break;
      case 'graph':
        setDisplay(fsGraph, true);
        break;
      case 'code':
        setDisplay(fsCode, true);
        break;
      case 'gallery':
        setDisplay(fsGallery, true);
        // Also allow button (CTA) options on gallery sections
        setDisplay(fsCTA, true);
        break;
      case 'stats':
        setDisplay(fsStats, true);
        break;
      case 'cta':
        setDisplay(fsCTA, true);
        setDisplay(fsBody, true);
        break;
      case 'editor':
        setDisplay(fsEditor, true);
        break;
      default:
        setDisplay(fsBody, true);
        break;
    }
  }

  function enhanceAddRow() {
    // Rename the inline add button label
    $all(document, '.add-row a').forEach(a => {
      if ((a.textContent || '').toLowerCase().includes('add another')) {
        a.textContent = 'Add Section';
      }
      a.addEventListener('click', function () {
        setTimeout(() => {
          const inlines = $all(document, 'div.inline-group');
          const last = inlines[inlines.length - 1];
          if (!last) return;
          // Ask for Section ID
          const anchorInput = $one(last, 'input[id$="-anchor_id"]');
          if (anchorInput) {
            const secId = prompt('Section ID (a-z,0-9,-):', anchorInput.value || 'section-1');
            if (secId) anchorInput.value = secId.trim();
          }
          // Ask for columns 1-5 and set defaults
          const typeSel = $one(last, 'select[id$="-type"]');
          const colsInput = $one(last, 'input[id$="-columns_count"]');
          const layoutSel = $one(last, 'select[id$="-layout"]');
          const ans = prompt('Columns? Enter 1 (full), 2, 3, 4, or 5', (colsInput && colsInput.value) ? colsInput.value : '2');
          const n = [1,2,3,4,5].includes(parseInt(ans || '2', 10)) ? parseInt(ans || '2', 10) : 2;
          if (colsInput) colsInput.value = String(n);
          if (typeSel) typeSel.value = n === 1 ? 'rich_text' : 'rich_columns';
          if (layoutSel) layoutSel.value = n === 1 ? 'full' : (n === 2 ? 'grid2' : (n === 3 ? 'grid3' : (n === 4 ? 'grid4' : 'grid5')));
          if (typeSel) typeSel.dispatchEvent(new Event('change'));
          const colsInput = $one(last, 'input[id$="-columns_count"]');
          const layoutSel = $one(last, 'select[id$="-layout"]');
          if (colsInput && !colsInput.value) colsInput.value = '1';
          if (layoutSel && !layoutSel.value) layoutSel.value = 'full';
          updateInline(last);
        }, 120);
      });
    });
  }

  function bindInline(inline) {
    // Initial toggle
    updateInline(inline);
    // Listen for type changes
    const typeSel = $one(inline, 'select[id$="-type"]');
    if (typeSel) {
      typeSel.addEventListener('change', () => {
        if (typeSel.value === 'rich_columns') {
          const colsInput = $one(inline, 'input[id$="-columns_count"]');
          const layoutSel = $one(inline, 'select[id$="-layout"]');
          if (colsInput) {
            const current = parseInt(colsInput.value || '1', 10);
            if (![1,2,3,4,5].includes(current)) {
              const ans = prompt('Columns? Enter 1 (full), 2, 3, 4, or 5', '2');
              const n = parseInt(ans || '2', 10);
              if ([1,2,3,4,5].includes(n)) {
                colsInput.value = String(n);
                if (layoutSel) {
                  layoutSel.value = n === 1 ? 'full' : (n === 2 ? 'grid2' : (n === 3 ? 'grid3' : (n === 4 ? 'grid4' : 'grid5')));
                }
              }
            }
          }
        }
        updateInline(inline);
      });
    }
  }

  function init() {
    enhanceAddRow();
    // Bind all existing inlines
    $all(document, 'div.inline-group').forEach(bindInline);
    // Observe DOM for new inlines added
    const obs = new MutationObserver(muts => {
      for (const m of muts) {
        m.addedNodes && m.addedNodes.forEach(node => {
          if (node.nodeType === 1 && node.matches && node.matches('div.inline-group')) {
            bindInline(node);
          }
          // Also re-run labels update in case add button gets re-rendered
          enhanceAddRow();
        });
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();