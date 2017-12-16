# This file is part of infragram-js.
#
# infragram-js is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 2 of the License, or
# (at your option) any later version.
#
# infragram-js is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with infragram-js.  If not, see <http://www.gnu.org/licenses/>.

camera =
    initialize: () ->
        # Initialize getUserMedia with options
        getUserMedia(this.options, this.success, this.deviceError)

        # Initialize webcam options for fallback
        window.webcam = this.options

        this.canvas = document.getElementById("image")
        this.ctx = this.canvas.getContext("2d")
        #this.image = this.ctx.getImageData(0, 0, this.options.width, this.options.height)

        # Trigger a snapshot w/ button
        $("#webcam-activate").hide()
        $("#snapshot").show()
        $("#live-video").show()
        $("#webcam").show()

    # options contains the configuration information for the shim
    # it allows us to specify the width and height of the video
    # output we"re working with, the location of the fallback swf,
    # events that are triggered onCapture and onSave (for the fallback)
    # and so on.
    options:
        "audio": false
        "video": true

        # the element (by id) you wish to use for 
        # displaying the stream from a camera
        el: "webcam"

        extern: null
        append: true

        # height and width of the output stream
        # container
        width: 640
        height: 480

        # the recommended mode to be used is 
        # "callback " where a callback is executed 
        # once data is available
        mode: "callback"

        # the flash fallback Url
        swffile: "fallback/jscam_canvas_only.swf"

        # quality of the fallback stream
        quality: 85

        # a debugger callback is available if needed
        debug: () -> return

        # callback for capturing the fallback stream
        onCapture: () -> window.webcam.save()

        # callback for saving the stream, useful for
        # relaying data further.
        onSave: (data) ->
            col = data.split("")
            img = camera.image
            tmp = null
            w = this.width
            h = this.height

            for i in [0..w-1]
                tmp = parseInt(col[i], 10)
                img.data[camera.pos + 0] = (tmp >> 16) & 0xff
                img.data[camera.pos + 1] = (tmp >> 8) & 0xff
                img.data[camera.pos + 2] = tmp & 0xff
                img.data[camera.pos + 3] = 0xff
                camera.pos += 4

            if camera.pos >= 4 * w * h
                camera.ctx.putImageData(img, 0, 0)
                camera.pos = 0

        onLoad: () -> return

    success: (stream) ->
        if camera.options.context == "webrtc"
            video = camera.options.videoEl
            vendorURL = window.URL || window.webkitURL
            if navigator.mozGetUserMedia
                video.mozSrcObject = stream
                console.log("mozilla???")
            else if (typeof MediaStream != "undefined" && MediaStream != null) && stream instanceof MediaStream
                video.src = stream
                return video.play()
            else
                video.src = if vendorURL then vendorURL.createObjectURL(stream) else stream

            video.onerror = (e) -> stream.stop()
        else
            # flash context
            return

    deviceError: (error) ->
        alert("No camera available.")
        console.log(error)
        console.error("An error occurred: [CODE " + error.code + "]")

    # not doing anything now... for copying to a 2nd canvas
    getSnapshot: () ->
        # If the current context is WebRTC/getUserMedia (something
        # passed back from the shim to avoid doing further feature
        # detection), we handle getting video/images for our canvas 
        # from our HTML5 <video> element.
        if camera.options.context == "webrtc"
            video = document.getElementsByTagName("video")[0]
            updateImage(video)
            $("#webcam").hide()

        # Otherwise, if the context is Flash, we ask the shim to
        # directly call window.webcam, where our shim is located
        # and ask it to capture for us.
        else if camera.options.context == "flash"
            window.webcam.capture()
        else
            alert("No context was supplied to getSnapshot()")
