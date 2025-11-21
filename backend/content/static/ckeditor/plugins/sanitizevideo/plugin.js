/* CKEditor 4 plugin: sanitizevideo
 * Converts YouTube watch/short URLs to embed format automatically
 * during paste and data load, preventing ORB blocks.
 */
(function() {
  function transform(html) {
    try {
      var s = String(html || '');
      // Convert src attributes with watch?v= to embed/
      s = s.replace(/src=["']https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([A-Za-z0-9_-]+)[^"']*["']/g,
                    function(m, id){ return 'src="https://www.youtube.com/embed/' + id + '"'; });
      // Convert plain watch URLs to embed URLs
      s = s.replace(/https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([A-Za-z0-9_-]+)/g,
                    'https://www.youtube.com/embed/$1');
      // Convert youtu.be short links
      s = s.replace(/https?:\/\/(?:www\.)?youtu\.be\/([A-Za-z0-9_-]+)/g,
                    'https://www.youtube.com/embed/$1');
      // Vimeo plain links to player embeds
      s = s.replace(/https?:\/\/(?:www\.)?vimeo\.com\/([0-9]+)/g,
                    'https://player.vimeo.com/video/$1');
      return s;
    } catch (e) {
      return html;
    }
  }

  CKEDITOR.plugins.add('sanitizevideo', {
    init: function(editor) {
      // On paste: clean incoming content
      editor.on('paste', function(evt) {
        if (evt && evt.data && typeof evt.data.dataValue === 'string') {
          evt.data.dataValue = transform(evt.data.dataValue);
        }
      });
      // On setData (loading existing content): normalize before render
      editor.on('setData', function(evt) {
        if (evt && evt.data && typeof evt.data.data === 'string') {
          evt.data.data = transform(evt.data.data);
        }
      });
    }
  });
})();