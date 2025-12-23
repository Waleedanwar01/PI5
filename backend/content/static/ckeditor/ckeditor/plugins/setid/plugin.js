/* CKEditor v4 plugin to set an ID on the current selection or element */
(function() {
  if (!window.CKEDITOR) return;
  CKEDITOR.plugins.add('setid', {
    init: function(editor) {
      editor.addCommand('setID', {
        exec: function(editor) {
          var id = window.prompt('Enter ID (no spaces)', '');
          if (!id) return;
          id = id.trim();
          if (!id) return;

          try {
            var selection = editor.getSelection();
            var element = selection && selection.getStartElement();
            var allowed = { h1:1, h2:1, h3:1, h4:1, h5:1, h6:1, p:1, a:1, span:1, div:1 };
            if (element && allowed[element.getName()]) {
              element.setAttribute('id', id);
            } else {
              var style = new CKEDITOR.style({ element: 'span', attributes: { id: id } });
              editor.applyStyle(style);
            }
          } catch (e) {
            console && console.warn && console.warn('SetID error', e);
          }
        }
      });

      editor.ui.addButton('SetID', {
        label: 'Set ID',
        command: 'setID',
        toolbar: 'insert',
        icon: 'anchor'
      });
    }
  });
})();