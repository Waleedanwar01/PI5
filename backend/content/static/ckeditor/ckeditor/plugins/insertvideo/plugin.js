/* CKEditor 4 plugin: InsertVideo (duplicate path for resource loader)
 * Allows inserting YouTube/Vimeo iframe or local MP4 via a prompt.
 */
(function() {
  CKEDITOR.plugins.add('insertvideo', {
    icons: 'image',
    init: function(editor) {
      editor.addCommand('insertvideoCommand', {
        exec: function(editor) {
          try {
            var url = window.prompt('Paste video URL (YouTube/Vimeo/embed) or /media/uploads/your-video.mp4');
            if (!url) return;
            url = (url || '').trim();
            if (url.charAt(0) === '`' && url.charAt(url.length - 1) === '`') {
              url = url.substring(1, url.length - 1).trim();
            }
            if (url.indexOf('youtube.com/watch') !== -1) {
              var id = (url.split('v=')[1] || '').split('&')[0];
              if (id) url = 'https://www.youtube-nocookie.com/embed/' + id;
            }
            if (url.indexOf('youtu.be/') !== -1) {
              var yid = (url.split('youtu.be/')[1] || '').split(/[?&]/)[0];
              if (yid) url = 'https://www.youtube-nocookie.com/embed/' + yid;
            }
            if (url.indexOf('vimeo.com/') !== -1 && url.indexOf('player.vimeo.com') === -1) {
              var vid = (url.split('vimeo.com/')[1] || '').split(/[?&]/)[0];
              if (vid) url = 'https://player.vimeo.com/video/' + vid;
            }

            var origin = (window && window.location && window.location.origin) ? window.location.origin : '';
            if (url.indexOf('/media/') === 0 && origin) {
              url = origin + url;
            }
            var html;
            if (/\.(mp4|webm|ogg)(\?.*)?$/.test(url) || url.indexOf('/media/') !== -1) {
              var safeVideo = CKEDITOR.tools.htmlEncode(url);
              html = '<video controls width="640" playsinline>' +
                     '<source src="' + safeVideo + '" type="video/mp4">' +
                     'Your browser does not support the video tag.' +
                     '</video>';
            } else {
              var safe = CKEDITOR.tools.htmlEncode(url);
              html = '<iframe width="560" height="315" src="' + safe + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
            }
            editor.insertHtml(html);
          } catch (e) {
            console.error('insertvideo error', e);
          }
        }
      });

      editor.ui.addButton('InsertVideo', {
        label: 'Insert Video',
        command: 'insertvideoCommand',
        toolbar: 'insert',
        icon: 'image'
      });
    }
  });
})();