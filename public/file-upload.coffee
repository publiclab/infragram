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


socket = io.connect("http://localhost:8001")
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


loadFileFromUrl = (url, onLoadImage) ->
    name = url.substring(url.lastIndexOf("/") + 1)
    funTxt = onLoadImage.toString()
    socket.emit("url", {"name": name, "data": url, "on_load": funTxt})


sendImage = (file) ->
    $("#file-sel").prop("disabled", true)
    upload = new FileReader()
    upload.onload = (event) ->
        socket.emit("image", {"name": file.name, "data": event.target.result})
        $("#file-sel").prop("disabled", false)
    upload.readAsBinaryString(file)


handleOnChangeFile = (files, onLoadImage) ->
    if files && files[0]
        file = files[0]
        reader = new FileReader()
        reader.onload = (event) ->
            img = new Image()
            img.onload = () ->
                onLoadImage(this)
                sendImage(file)
            img.src = event.target.result
        reader.readAsDataURL(file)


socket.on("done", (data) ->
    filename = data["name"]
)


socket.on("done_url", (data) ->
    filename = data["name"]
    img = new Image()
    img.onload = () ->
        eval("fn=" + data["on_load"])
        fn(this)
    img.src = "../upload/" + filename
)


getFilename = () ->
    return filename
