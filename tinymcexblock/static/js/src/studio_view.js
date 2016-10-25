function StudioEditSubmit(runtime, element) {
  $(element).find('.save-button').bind('click', function() {
    var handlerUrl = runtime.handlerUrl(element, 'studio_submit');

    var data = new FormData();
    data.append('display_name', $(element).find('input[name=display_name]').val());
    data.append('text_color', $(element).find('input[name=text_color]').val());
    data.append('content_text', tinyMCE.activeEditor.getContent({format : 'raw'}));
    data.append('background', $(element).find('input[name=background]')[0].files[0]);
    data.append('thumbnail', $(element).find('input[name=thumbnail]')[0].files[0]);

    runtime.notify('save', {state: 'start'});

    $.ajax({
      url: handlerUrl,
      type: 'POST',
      data: data,
      cache: false,
      dataType: 'json',
      processData: false,
      contentType: false,
    }).done(function(response) {
      runtime.notify('save', {state: 'end'});
    });
  });

  $(element).find('.cancel-button').bind('click', function() {
    runtime.notify('cancel', {});
  });
  tinymce.init({
    selector: 'textarea',
    height: 600,
    plugins: [
      'codemirror image link media paste spellchecker table textcolor'
    ],
    toolbar: 'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
    content_css: '//www.tinymce.com/css/codepen.min.css'
  });

  $(".editor-with-buttons.tinymce-studio").first().parent().parent().parent().css("height", "800px");
}


