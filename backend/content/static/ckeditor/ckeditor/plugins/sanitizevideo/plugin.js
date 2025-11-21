/* CKEditor 4 plugin: sanitizevideo (duplicate path for CKEditor resource loader)
 * Converts YouTube watch/short URLs to embed format automatically.
 */
(function() {
  function transform(html) {
    try {
      var s = String(html || '');
      s = s.replace(/src=["']https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([A-Za-z0-9_-]+)[^"']*["']/g,
                    function(m, id){ return 'src="https://www.youtube-nocookie.com/embed/' + id + '"'; });
      s = s.replace(/https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([A-Za-z0-9_-]+)/g,
                    'https://www.youtube-nocookie.com/embed/$1');
      s = s.replace(/https?:\/\/(?:www\.)?youtu\.be\/([A-Za-z0-9_-]+)/g,
                    'https://www.youtube-nocookie.com/embed/$1');
      s = s.replace(/https?:\/\/(?:www\.)?vimeo\.com\/([0-9]+)/g,
                    'https://player.vimeo.com/video/$1');
      return s;
    } catch (e) {
      return html;
    }
  }

  CKEDITOR.plugins.add('sanitizevideo', {
    init: function(editor) {
      editor.on('paste', function(evt) {
        if (evt && evt.data && typeof evt.data.dataValue === 'string') {
          evt.data.dataValue = transform(evt.data.dataValue);
        }
      });
      editor.on('setData', function(evt) {
        if (evt && evt.data && typeof evt.data.data === 'string') {
          evt.data.data = transform(evt.data.data);
        }
      });
      // As a safety, after the editor is ready, re-normalize content once
      editor.on('instanceReady', function() {
        try {
          var d = editor.getData();
          var t = transform(d);
          if (t !== d) {
            editor.setData(t);
          }
        } catch (e) {}
      });
    }
  });
})();