// Dynamically show blogs for the selected category on the Blog admin form
// Depends on Django admin IDs: #id_parent_page and #id_category

(function() {
  function byId(id) { return document.getElementById(id); }
  function create(el) { return document.createElement(el); }
  function text(t) { return document.createTextNode(t); }

  function ensurePreviewContainer() {
    var catFieldRow = document.querySelector('#id_category')?.closest('.form-row, .field-box, .form-group');
    if (!catFieldRow) return null;
    var existing = document.getElementById('category-blogs-preview');
    if (existing) return existing;
    var box = create('div');
    box.id = 'category-blogs-preview';
    box.style.marginTop = '8px';
    box.style.padding = '8px';
    box.style.border = '1px solid #eee';
    box.style.borderRadius = '6px';
    var title = create('div');
    title.style.fontWeight = '600';
    title.style.marginBottom = '6px';
    title.appendChild(text('Blogs in selected category'));
    var list = create('ul');
    list.id = 'category-blogs-preview-list';
    list.style.margin = '0';
    list.style.paddingLeft = '18px';
    box.appendChild(title);
    box.appendChild(list);
    catFieldRow.appendChild(box);
    return box;
  }

  function setPreviewLoading() {
    var list = byId('category-blogs-preview-list');
    if (!list) return;
    list.innerHTML = '';
    var li = create('li');
    li.appendChild(text('Loading…'));
    list.appendChild(li);
  }

  function setPreviewEmpty() {
    var list = byId('category-blogs-preview-list');
    if (!list) return;
    list.innerHTML = '';
    var li = create('li');
    li.appendChild(text('No blogs found for this category.'));
    list.appendChild(li);
  }

  function renderBlogs(blogs) {
    var list = byId('category-blogs-preview-list');
    if (!list) return;
    list.innerHTML = '';
    if (!blogs || !blogs.length) { setPreviewEmpty(); return; }
    blogs.forEach(function(b) {
      var li = create('li');
      // Show title and slug for quick verification
      li.appendChild(text((b.title || '') + ' — ' + (b.slug || '')));
      list.appendChild(li);
    });
  }

  async function updatePreview() {
    try {
      var pageSel = byId('id_parent_page');
      var catSel = byId('id_category');
      if (!pageSel || !catSel) return;
      var pageId = pageSel.value;
      var catId = catSel.value;
      if (!pageId || !catId) { setPreviewEmpty(); return; }

      ensurePreviewContainer();
      setPreviewLoading();

      // Fetch categories (with blogs) for the selected page id
      var url = '/api/categories/?page_id=' + encodeURIComponent(pageId) + '&include_blogs=1';
      var res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) { setPreviewEmpty(); return; }
      var json = await res.json();
      var cats = Array.isArray(json?.categories) ? json.categories : [];
      var cat = cats.find(function(c) { return String(c.id) === String(catId); });
      if (!cat) { setPreviewEmpty(); return; }
      var blogs = Array.isArray(cat.blogs) ? cat.blogs : [];
      renderBlogs(blogs);
    } catch (e) {
      setPreviewEmpty();
    }
  }

  function init() {
    var pageSel = byId('id_parent_page');
    var catSel = byId('id_category');
    if (!pageSel || !catSel) return;
    ensurePreviewContainer();
    pageSel.addEventListener('change', updatePreview);
    catSel.addEventListener('change', updatePreview);
    // Initial render in case fields are pre-filled
    updatePreview();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();