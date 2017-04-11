/* global jQuery, FileReader */
var uploader = (function () {
  var prettyPrintBytes = function (bytes) {
    var abvrs = ['B', 'KiB', 'MiB', 'GiB', 'TiB']
    var count = 0
    while (bytes > 1024.0) {
      bytes = bytes / 1024.0
    }
    return bytes.toFixed(3) + abvrs[count]
  }

  var handleFiles = function (e) {
    var files = e.currentTarget.files
    var previews = jQuery('#previews')
    var totalBytes = 0
    for (var i = 0; i < files.length; i++) {
      var f = files[i]
      totalBytes += f.size

      var div = jQuery('<div></div>', {
        'class': 'col-xs-2 col-sm-3 col-md-4'
      }).text('Selected File { name: ' + f.name + ', size: ' + prettyPrintBytes(f.size) + ', type: ' + (f.type || '<none>') + '}').appendTo(previews)

      if (/^image\//.test(f.type)) {
        // this could also be done with Object URLs
        //   https://developer.mozilla.org/en-US/docs/Using_files_from_web_applications#Example_Using_object_URLs_to_display_images
        var img = jQuery('<img/>', {
          'class': 'previewImg',
          'style': 'height: 2em'
        }).appendTo(div)

        var reader = new FileReader()
        reader.onload = (function (imgTag) {
          return function (e) {
            imgTag.src = e.target.result
          }
        })(img[0]) // this is because we're in a loop and we need to capture each img tag, if we don't include the wraper function we'll get the last item in the list always because of the way closure works
        reader.readAsDataURL(f)
      }
    }

    jQuery('#total').text(prettyPrintBytes(totalBytes))
  }

  var setup = function (formButton, fancyButton) {
    fancyButton.click(function (e) {
      if (formButton) {
        formButton.click()
      }
      e.preventDefault()
    })

    formButton.change(handleFiles)
  }

  return {
    setup: setup
  }
}(jQuery))
