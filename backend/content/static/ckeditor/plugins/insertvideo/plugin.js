/* CKEditor 4 plugin: InsertVideo
 * Allows inserting YouTube/Vimeo iframe or local MP4 via a simple prompt.
 */
(function() {
  CKEDITOR.plugins.add('insertvideo', {
    icons: 'image', // reuse image icon to avoid custom asset
    init: function(editor) {
      // Command to insert video HTML
      editor.addCommand('insertvideoCommand', {
        exec: function(editor) {
          try {
            var url = window.prompt('Paste video URL (YouTube/Vimeo/embed) or /media/uploads/your-video.mp4');
            if (!url) return;
            url = (url || '').trim();
            // Strip accidental backticks and surrounding spaces
            if (url.charAt(0) === '`' && url.charAt(url.length - 1) === '`') {
              url = url.substring(1, url.length - 1).trim();
            }
            // Normalize YouTube URLs
            if (url.indexOf('youtube.com/watch') !== -1) {
              var id = (url.split('v=')[1] || '').split('&')[0];
              if (id) url = 'https://www.youtube.com/embed/' + id;
            }
            if (url.indexOf('youtu.be/') !== -1) {
              var yid = (url.split('youtu.be/')[1] || '').split(/[?&]/)[0];
              if (yid) url = 'https://www.youtube.com/embed/' + yid;
            }
            // Normalize Vimeo URLs
            if (url.indexOf('vimeo.com/') !== -1 && url.indexOf('player.vimeo.com') === -1) {
              var vid = (url.split('vimeo.com/')[1] || '').split(/[?&]/)[0];
              if (vid) url = 'https://player.vimeo.com/video/' + vid;
            }

            var html;
            // Normalize local /media path to absolute URL for consistent playback across admin/frontend
            var origin = (window && window.location && window.location.origin) ? window.location.origin : '';
            if (url.indexOf('/media/') === 0 && origin) {
              url = origin + url; // e.g., http://127.0.0.1:8001/media/uploads/your-video.mp4
            }
            // Local or direct video file
            if (/\.(mp4|webm|ogg)(\?.*)?$/.test(url) || url.indexOf('/media/') !== -1) {
              var safeVideo = CKEDITOR.tools.htmlEncode(url);
              // Include <source> with type for better compatibility
              html = '<video controls width="640" playsinline>' +
                     '<source src="' + safeVideo + '" type="video/mp4">' +
                     'Your browser does not support the video tag.' +
                     '</video>';
            } else {
              // Generic iframe embed
              var safe = CKEDITOR.tools.htmlEncode(url);
              html = '<iframe width="560" height="315" src="' + safe + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
            }
            editor.insertHtml(html);
          } catch (e) {
            console.error('insertvideo error', e);
          }
        }
      });

      // Add toolbar button
      editor.ui.addButton('InsertVideo', {
        label: 'Insert Video',
        command: 'insertvideoCommand',
        toolbar: 'insert',
        icon: 'image'
      });
    }
  });
})();