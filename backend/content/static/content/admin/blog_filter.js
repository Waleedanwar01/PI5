// Dynamically filter Category options by selected Parent Page in Blog admin
document.addEventListener('DOMContentLoaded', function () {
  var parentInput = document.getElementById('id_parent_page') || document.querySelector('[name="parent_page"]');
  var categorySelect = document.getElementById('id_category') || document.querySelector('[name="category"]');
  if (!parentInput || !categorySelect) return;

  function setCategories(categories, preserveValue) {
    // Clear and rebuild options
    var currentValue = preserveValue ? categorySelect.value : '';
    categorySelect.innerHTML = '';
    var emptyOpt = document.createElement('option');
    emptyOpt.value = '';
    emptyOpt.textContent = '---------';
    categorySelect.appendChild(emptyOpt);

    (categories || []).forEach(function (c) {
      var opt = document.createElement('option');
      opt.value = String(c.id);
      opt.textContent = c.name;
      categorySelect.appendChild(opt);
    });

    if (preserveValue && currentValue) {
      categorySelect.value = currentValue;
    }

    categorySelect.disabled = false;
  }

  function loadCategories(pageId, preserveValue) {
    if (!pageId) {
      setCategories([], false);
      categorySelect.disabled = true;
      return;
    }
    fetch('/api/categories/?page_id=' + encodeURIComponent(pageId))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var categories = (data && data.categories) ? data.categories : [];
        setCategories(categories, preserveValue);
      })
      .catch(function () {
        setCategories([], false);
      });
  }

  // Initial load: if parent page already selected, populate categories
  if (parentInput.value) {
    loadCategories(parentInput.value, true);
  } else {
    categorySelect.disabled = true;
  }

  // React to changes in parent page selection
  function onParentChanged() {
    var pageId = parentInput.value;
    // Clear category when parent changes to avoid mismatches
    categorySelect.value = '';
    loadCategories(pageId, false);
  }

  // Support both native change and select2 event
  parentInput.addEventListener('change', onParentChanged);
  try {
    if (window.jQuery && jQuery(parentInput).data('select2')) {
      jQuery(parentInput).on('select2:select', onParentChanged);
      jQuery(parentInput).on('select2:clear', onParentChanged);
    }
  } catch (e) {
    // ignore
  }
});