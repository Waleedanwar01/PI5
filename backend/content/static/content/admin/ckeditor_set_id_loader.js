/* Loader to register external SetID plugin path and ensure it is added */
(function() {
  if (!window.CKEDITOR) return;
  // Register external plugin folder
  CKEDITOR.plugins.addExternal('setid', '/static/content/admin/ckeditor_set_id/', 'plugin.js');
  // Make sure extraPlugins includes setid if not already
  var extra = CKEDITOR.config.extraPlugins || '';
  if (extra.indexOf('setid') === -1) {
    CKEDITOR.config.extraPlugins = extra ? (extra + ',setid') : 'setid';
  }
})();