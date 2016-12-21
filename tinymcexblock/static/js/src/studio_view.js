function StudioEditSubmit(runtime, element) {
  var uploadImageUrl = runtime.handlerUrl(element, 'studio_image_upload');
  $(element).find('.save-button').bind('click', function() {
    var handlerUrl = runtime.handlerUrl(element, 'studio_submit');


    parseTables();

    var data = new FormData();
    data.append('usage_id', $(element).data('usage-id'));
    data.append('display_name', $(element).find('input[name=display_name]').val());
    data.append('header_text', $(element).find('input[name=header_text]').val());
    data.append('display_description', $(element).find('input[name=display_description]').val());
    data.append('text_color', $(element).find('input[name=text_color]').val());
    data.append('content_text', $( "#tinymce_content" ).html());
    data.append('background', $(element).find('input[name=background]')[0].files[0]);
    data.append('thumbnail', $(element).find('input[name=thumbnail]')[0].files[0]);

    if (data.get('thumbnail').size > 2000000) {
        alert('Thumbnail size is too large!');
        return;
    }

    if (data.get('thumbnail').type.indexOf('image') !== 0) {
        alert('Thumbnail does not have a correct format!');
        return;
    }

    if (data.get('background').size > 8000000) {
        alert('Background image size is too large!');
        return;
    }

    if (data.get('background').type.indexOf('image') !== 0) {
        alert('Background image does not have a correct format!');
        return;
    }

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

  function parseTables(){
    tables = $( "#tinymce_content" ).find("table");
    $.each( tables, function(i, table){
      var width = "100%";
      var table_width = $(table).css("width");
      if (table_width.indexOf("px") > -1){
        width = (Number(table_width.replace(/[^\d\.]/g, '')) * 100 / tinymce.activeEditor.editorContainer.clientWidth).toString() + "%";
        if (width == "0%"){
          width = "100%";
        }
      } else {
        width = table_width;
      }
      $(table).css("width", width );
    });
  }

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
      images_upload_url: 'postAcceptor.php',
      file_browser_callback_types: 'image',
      automatic_uploads: true,
      file_browser_callback: function(field_name, url, type, win) {
        if(type=='image') {
          $('#my_form input').click();
          $('#my_form').on('submit', function(evt){
            evt.preventDefault();
            var data = new FormData();
            data.append('image', $(this).find('input[name=upload_image]')[0].files[0]);
            $.ajax({
              url: uploadImageUrl,
              type: 'POST',
              data: data,
              cache: false,
              dataType: 'json',
              processData: false,
              contentType: false,
              field_name: field_name
            }).done(function(response) {
              $('#' + this.field_name).val(response.url);
            });
            return false;
          });
        }
      }
    });
    tinymce.activeEditor.on('change', function(e) {
      $.each(tinymce.activeEditor.dom.select('table'), function (i, t){
        if (!tinymce.activeEditor.dom.getAttrib(t, "width")){
          tinymce.activeEditor.dom.setAttrib(t, 'width', '100%');
        }
      });
    });
  }
  function refresh(){
    setTimeout(function(){
      $( "#tinymce_content" ).html(tinyMCE.activeEditor.getContent({format : 'raw'}));
      if ($("#content_text_ifr").length){
        refresh();
      }
    }, 2000);
  }
  refresh();
  initTinymce();

  $(".editor-with-buttons.tinymce-studio").first().closest(".modal-content").css("height", "100%");
}


