/* global jQuery, FileReader */

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

  var setup = function (dom) {
    node = dom
    reset()
  }

  return {
    setup: setup,
    reset: reset,
    increment: increment
  }
}(jQuery))

var uploader = (function () {
  var previews = null

  var handleFiles = function (e) {
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

      if (/^image\//.test(f.type)) {
        var span = jQuery('<span/>', {'class': 'thumbnail'}).appendTo(div)
        if (f.size < 2097152) {
          var img = jQuery('<img></img>').appendTo(span)
          var reader = new FileReader()
          reader.onload = (function (imgTag) {
            return function (e) {
              imgTag.src = e.target.result
            }
          })(img[0])
          reader.readAsDataURL(f)
        } else {
          jQuery('<img src="too-large.png" />').appendTo(span)
        }
      }
    }
  }

  var setup = function (previewsPanel, formButton, fancyButton, clearButton) {
    previews = previewsPanel

    fancyButton.click(function (e) {
      if (formButton) {
        formButton.click()
      }
      e.preventDefault()
    })

    formButton.change(handleFiles)

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
