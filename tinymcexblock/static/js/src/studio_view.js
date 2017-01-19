function StudioEditSubmit(runtime, element) {
  var uploadImageUrl = runtime.handlerUrl(element, 'studio_image_upload');
  var $element = $(element);
  $element.find('.save-button').bind('click', function() {
    var handlerUrl = runtime.handlerUrl(element, 'studio_submit');

    var usageId            = $element.data('usage-id');
    var displayName        = $element.find('input[name=display_name]').val();
    var headerText         = $element.find('input[name=header_text]').val();
    var displayDescription = $element.find('input[name=display_description]').val();
    var textColor          = $element.find('input[name=text_color]').val();
    var contentText        = $("#tinymce_content").html();
    var background         = $element.find('input[name=background]')[0].files[0];
    var thumbnail          = $element.find('input[name=thumbnail]')[0].files[0];

    function imagesAreValid() {
      if (thumbnail != undefined) {
        if (thumbnail.size > 2000000) {
            alert('Thumbnail size is too large!');
            return false;
        }
        if (thumbnail.type.indexOf('image') !== 0) {
            alert('Thumbnail does not have a correct format!');
            return false;
        }
      }
      if (background != undefined) {
        if (background.size > 8000000) {
            alert('Background image size is too large!');
            return false;
        }
        if (background.type.indexOf('image') !== 0) {
            alert('Background image does not have a correct format!');
            return false;
        }
      }
      return true;
    };
    if (!imagesAreValid()) {
      return;
    }

    parseTables();

    var data = new FormData();
    data.append('usage_id', usageId);
    data.append('display_name', displayName);
    data.append('header_text', headerText);
    data.append('display_description', displayDescription);
    data.append('text_color', textColor);
    data.append('content_text', contentText);
    data.append('background', background);
    data.append('thumbnail', thumbnail);

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
      menubar: 'file edit insert view tools',
      theme: 'modern',
      plugins: [
        'image imagetools link media table textcolor fullscreen',
        'advlist autolink lists link image charmap print preview hr anchor pagebreak',
        'searchreplace wordcount visualblocks visualchars code fullscreen',
        'insertdatetime media nonbreaking save table contextmenu directionality',
        'emoticons template paste textcolor colorpicker textpattern imagetools codesample toc'
      ],
      toolbar1: 'fullscreen | newdocument undo redo | styleselect formatselect fontsizeselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent |  link unlink anchor image media | forecolor backcolor table | hr removeformat | subscript superscript',
      // toolbar1: 'undo redo | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
      toolbar2: 'print preview media | forecolor backcolor emoticons | codesample',
      image_advtab: true,
      body_id: 'tinymcebody',
      imagetools_toolbar: "rotateleft rotateright | flipv fliph | editimage imageoptions",
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


