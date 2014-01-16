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


socket = io.connect(window.location.protocol + "//" + window.location.host)
activeFile = null
upload = null
filename = ""


sendThumbnail = (img) ->
    e = new Image()
    e.onload = () ->
        canvas = document.createElement("canvas")
        ctx = canvas.getContext("2d")
        canvas.width = 260
        canvas.height = 195
        ctx.drawImage(this, 0, 0, this.width, this.height, 0, 0, canvas.width, canvas.height)
        dataUrl = canvas.toDataURL("image/jpeg")
        socket.emit("thumbnail", {"name": filename, "data": dataUrl})
    e.src = img


handleOnChangeFile = (files, onLoadImage) ->
    if files && files[0]
        $("#file-sel").prop("disabled", true)
        $("#save-modal-btn").prop("disabled", true)

        activeFile = files[0]

        upload = new FileReader()
        upload.onload = (event) ->
            socket.emit("image_send", {"id": socket.socket.sessionid, "data": event.target.result})
        socket.emit("image_start", {"id": socket.socket.sessionid, "name": activeFile.name, "size": activeFile.size})

        reader = new FileReader()
        reader.onload = (event) ->
            img = new Image()
            img.onload = () ->
                onLoadImage(this)
            img.src = event.target.result
        reader.readAsDataURL(activeFile)


socket.on("image_request", (data) ->
    txt = $("#save-modal-btn").html().split(/\s-\s/g)[0]
    txt += " - " + data["percent"] + "%"
    $("#save-modal-btn").html(txt)
    uploaded = data["uploaded"]
    chunk = data["chunk"]
    newFile = activeFile.slice(uploaded, uploaded + Math.min(chunk, (activeFile.size - uploaded)))
    upload.readAsBinaryString(newFile)
)


socket.on("image_done", (data) ->
    if "error" in data
        alert(data["error"])
    else
        filename = data["name"]
    txt = $("#save-modal-btn").html().split(/\s-\s/g)[0]
    $("#save-modal-btn").html(txt)
    $("#file-sel").prop("disabled", false)
    $("#save-modal-btn").prop("disabled", false)
)


loadFileFromUrl = (url, onLoadImage) ->
    name = url.substring(url.lastIndexOf("/") + 1)
    funTxt = onLoadImage.toString()
    socket.emit("url", {"name": name, "url": url, "on_load": funTxt})


socket.on("done_url", (data) ->
    filename = data["name"]
    img = new Image()
    img.onload = () ->
        eval("var fn=" + data["on_load"])
        fn(this)
    img.src = "../upload/" + filename
)


getFilename = () ->
    return filename
