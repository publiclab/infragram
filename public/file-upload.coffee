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


FileUpload =
    socket: null
    file: null
    serverFilename: ""


    isLoadedFromFile: () ->
        return if FileUpload.file then true else false


    getFilename: () ->
        return FileUpload.serverFilename


    uploadThumbnail: (src, onLoadImage) ->
        img = new Image()
        img.onload = () ->
            canvas = document.createElement("canvas")
            ctx = canvas.getContext("2d")
            canvas.width = 260
            canvas.height = 195
            ctx.drawImage(this, 0, 0, this.width, this.height, 0, 0, canvas.width, canvas.height)
            onLoad = onLoadImage.toString()
            dataUrl = canvas.toDataURL("image/jpeg")
            FileUpload.socket.emit("thumbnail_start", {"name": FileUpload.serverFilename, "data": dataUrl, "on_load": onLoad})
        img.src = src


    fromFile: (files, onLoadImage) ->
        if files && files[0]
            $("#file-sel").prop("disabled", true)
            $("#save-modal-btn").prop("disabled", true)

            FileUpload.file = files[0]
            FileUpload.file.reader = new FileReader()
            FileUpload.file.reader.onload = (event) ->
                FileUpload.socket.emit("image_send", {
                    "name": FileUpload.serverFilename,
                    "size": FileUpload.file.size,
                    "data": event.target.result})
            FileUpload.socket.emit("image_send", {"name": files[0].name, "size": files[0].size})
            FileUpload.file.uploaded = 0

            reader = new FileReader()
            reader.onload = (event) ->
                img = new Image()
                img.onload = () ->
                    onLoadImage(this)
                img.src = event.target.result
            reader.readAsDataURL(files[0])


    fromUrl: (url, onLoadImage) ->
        name = url.substring(url.lastIndexOf("/") + 1)
        onLoad = onLoadImage.toString()
        FileUpload.socket.emit("url_start", {"name": name, "url": url, "on_load": onLoad})


    fromBase64: (name, data, onLoadImage) ->
        onLoad = onLoadImage.toString()
        FileUpload.socket.emit("base64_start", {"name": name, "data": data, "on_load": onLoad})


    initialize: () ->
        options =
            rememberTransport: false
            transports: ['WebSocket', 'AJAX long-polling']
        FileUpload.socket = io.connect(window.location.protocol + "//" + window.location.host, options)

        FileUpload.socket.on("image_request", (data) ->
            file = FileUpload.file
            txt = $("#save-modal-btn").html().split(/\s-\s/g)[0]
            txt += " - " + Math.round((file.uploaded / file.size) * 100) + "%"
            $("#save-modal-btn").html(txt)
            newFile = file.slice(file.uploaded, file.uploaded + Math.min(data["chunk"], (file.size - file.uploaded)))
            FileUpload.file.uploaded += data["chunk"]
            FileUpload.serverFilename = data["name"]
            file.reader.readAsDataURL(newFile)
        )

        FileUpload.socket.on("image_done", (data) ->
            if data["error"]
                alert(data["error"])
            else
                FileUpload.serverFilename = data["name"]
            txt = $("#save-modal-btn").html().split(/\s-\s/g)[0]
            $("#save-modal-btn").html(txt)
            $("#file-sel").prop("disabled", false)
            $("#save-modal-btn").prop("disabled", false)
        )

        FileUpload.socket.on("url_done", (data) ->
            FileUpload.serverFilename = data["name"]
            img = new Image()
            img.onload = () ->
                eval("var fn=" + data["on_load"])
                fn(this)
            img.src = "../upload/" + FileUpload.getFilename()
        )

        FileUpload.socket.on("base64_done", (data) ->
            FileUpload.serverFilename = data["name"]
            eval("var fn=" + data["on_load"])
            fn()
        )

        FileUpload.socket.on("thumbnail_done", (data) ->
            eval("var fn=" + data["on_load"])
            fn()
        )

        return;
