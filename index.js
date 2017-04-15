/* global jQuery, FileReader, location, FormData */

var prettyPrinter = (function () {
  var bytes = function (bytes) {
    var abvrs = ['B', 'KiB', 'MiB', 'GiB', 'TiB']
    var count = 0
    for (count = 0; bytes > 1024.0; count++, bytes = bytes / 1024.0);
    return bytes.toFixed(3) + abvrs[count]
  }

  return {
    bytes: bytes
  }
}())

var totalSizeManager = (function () {
  var totalBytes = 0
  var node = null

  var update = function () {
    node.text(prettyPrinter.bytes(totalBytes))
  }

  var reset = function () {
    totalBytes = 0
    update()
  }

  var increment = function (bytes) {
    totalBytes += bytes
    update()
  }

  var decrement = function (bytes) {
    totalBytes -= bytes
    update()
  }

  var setup = function (dom) {
    node = dom
    reset()
  }

  return {
    setup: setup,
    reset: reset,
    increment: increment,
    decrement: decrement
  }
}(jQuery))

var uploadProgBar = (function () {
  var buildProgBar = function (element) {
    var pb = jQuery('<div class="progress">' +
                    '<div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;">' +
                      '<span class="sr-only">0% Complete</span>' +
                    '</div>' +
                  '</div>')

    var activate = function () {
      element.children().fadeTo(250, 0.25)
      pb.appendTo(element)
    }

    var deactivate = function () {
      pb.remove()
      element.children().fadeTo(250, 1.0)
    }

    var updateProg = function (cur) {
      jQuery('.progress-bar', pb).css('width', cur + '%').attr('aria-valuenow', cur)
      jQuery('span', pb).text(cur + '% Complete')
    }

    var failed = function (text) {
      pb.remove()
      var msg = jQuery('<div class="alert alert-danger" role="alert">' + text + '</div>')
      msg.appendTo(element)
    }

    return {
      activate: activate,
      deactivate: deactivate,
      updateProg: updateProg,
      failed: failed
    }
  }

  return {
    buildProgBar: buildProgBar
  }
}(jQuery))

var uploader = (function () {
  var URL = location.protocol + '//' + location.host + '/upload'

  var doUploads = function (e) {
    jQuery('#previews > div').map(function (i, thumbnail) {
      return jQuery(thumbnail)
    }).each(function (i, thumbnail) {
      var file = thumbnail[0].file
      var form = new FormData()
      form.append('file', file)

      var pb = uploadProgBar.buildProgBar(thumbnail)

      jQuery.ajax({
        url: URL,
        type: 'POST',
        data: form,

        // tell jQuery not to process data or worry about content type
        cache: false,
        contentType: false,
        processData: false,

        // custom XMLHttpRequest
        xhr: function () {
          var req = jQuery.ajaxSettings.xhr()
          if (req.upload) {
            req.upload.addEventListener('loadstart', function (e) {
              pb.activate()
            })

            req.upload.addEventListener('progress', function (e) {
              pb.updateProg((e.loaded / e.total) * 100)
            })

            req.addEventListener('readystatechange', function (e) {
              if (req.readyState === 4) {
                if (req.status >= 400 && req.status < 600) {
                  pb.failed('Server Error -> Status: ' + req.status)
                } else {
                  totalSizeManager.decrement(file.size)
                  pb.deactivate()
                  thumbnail.remove()
                }
              }
            })
          }
          return req
        }
      })
    })
  }

  var setup = function (uploadButton) {
    uploadButton.click(doUploads)
  }

  return {
    setup: setup
  }
}(jQuery))

var uploaderSelector = (function () {
  var previews = null

  var handleSelectingFiles = function (e) {
    var files = e.currentTarget.files

    // remove no items selected h4
    jQuery('h4', previews).remove()

    for (var i = 0; i < files.length; i++) {
      var f = files[i]
      totalSizeManager.increment(f.size)

      var div = jQuery('<div></div>', {
        'class': 'col-xs-2 col-sm-3 col-md-4'
      })
      .append('<span>' + prettyPrinter.bytes(f.size) + '</span>')
      .append('<h5>' + f.name + '</h5>')
      .appendTo(previews)

      div[0].file = f

      if (/^image\//.test(f.type)) {
        var span = jQuery('<span/>', {'class': 'thumbnail'}).appendTo(div)
        var img = jQuery('<img></img>')
        img.appendTo(span)
        if (f.size < 2097152) {
          var reader = new FileReader()
          reader.onload = (function (imgTag) {
            return function (e) {
              imgTag.src = e.target.result
            }
          })(img[0])
          reader.readAsDataURL(f)
        } else {
          img.attr('src', 'too-large.png')
        }
      }
    }
  }

  var setup = function (previewsPanel, formButton, fancyButton, clearButton, doUploadButton) {
    previews = previewsPanel

    fancyButton.click(function (e) {
      if (formButton) {
        formButton.click()
      }
      e.preventDefault()
    })

    formButton.change(handleSelectingFiles)

    clearButton.click(function (e) {
      previews.children().remove()
      totalSizeManager.reset()
      jQuery('<h4>No items selected</h4>').appendTo(previews)
    })
  }

  return {
    setup: setup
  }
}(jQuery))
