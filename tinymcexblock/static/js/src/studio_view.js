function StudioEditSubmit(runtime, element) {
  var uploadhandlerUrl = runtime.handlerUrl(element, 'studio_file_upload');
  $(element).find('.save-button').bind('click', function() {
    var handlerUrl = runtime.handlerUrl(element, 'studio_submit');

    var data = new FormData();
    data.append('display_name', $(element).find('input[name=display_name]').val());
    data.append('header_text', $(element).find('input[name=header_text]').val());
    data.append('display_description', $(element).find('input[name=display_description]').val());
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

  $( "#text_color, #background_url" ).change(function() {
    initTinymce();
  });

  $( "#thumbnail" ).change(function() {
    $( "#thumbnail_url" ).text($(this).val())
  });

  $( "#background" ).change(function() {
    $( "#background_url" ).text($(this).val())
  });

  function initTinymce(){
    tinymce.init({
      selector: 'textarea',
      height: 500,
      plugins: [
        'image link media table textcolor'
      ],
      menubar:false,
      body_id: 'tinymcebody',
      toolbar: 'newdocument undo redo | styleselect formatselect fontselect fontsizeselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent |  link unlink anchor image media | forecolor backcolor table | hr removeformat | subscript superscript',
      content_css: '/xblock/resource/tinymcexblock/public/css/codepen.css',
      content_style: "body#tinymcebody{color:" + $('#text_color').val() +  "; background:url('" + $('#background_url').text() + "');}",
//      file_browser_callback: function(field_name, url, type, win) {
//          if(type=='image') {
//            $('#my_form').attr('action', uploadhandlerUrl)
//            $('#my_form input').click();
//            $('#my_form').on('submit', function(){
//              console.log(this);
//            });
//          }
//      }
    });
  }
  function refresh(){
    setTimeout(function(){
      $( "#content_text" ).val(tinyMCE.activeEditor.getContent({format : 'raw'}));
      if ($("#content_text_ifr").length){
        refresh();
      }
    }, 1000);
  }
  refresh();
  initTinymce();

  $(".editor-with-buttons.tinymce-studio").first().closest(".modal-content").css("height", "100%");
}


