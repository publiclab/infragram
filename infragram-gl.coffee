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


modeToEquationMap = {
    "hsv":  ["#h_exp", "#s_exp", "#v_exp"],
    "rgb":  ["#r_exp", "#g_exp", "#b_exp"],
    "mono": ["#m_exp", "#m_exp", "#m_exp"],
    "raw":  ["r", "g", "b"],
    "ndvi": ["(((r-b)/(r+b))+1)/2", "(((r-b)/(r+b))+1)/2", "(((r-b)/(r+b))+1)/2"],
    "nir":  ["r", "r", "r"],
}


imgContext = null
mapContext = null


initBuffers = (ctx) ->
    gl = ctx.gl
    ctx.vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, ctx.vertexBuffer)
    vertices = [
       -1.0, -1.0,
        1.0, -1.0,
       -1.0,  1.0,
       -1.0,  1.0,
        1.0, -1.0,
        1.0,  1.0,]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
    ctx.vertexBuffer.itemSize = 2

    ctx.textureBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, ctx.textureBuffer)
    textureCoords = [
        0.0,  0.0,
        1.0,  0.0,
        0.0,  1.0,
        0.0,  1.0,
        1.0,  0.0,
        1.0,  1.0]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW)
    ctx.textureBuffer.itemSize = 2


createContext = (mode, greyscale, colormap, slider, canvasName) ->
    ctx = new Object()
    ctx.mode = mode
    ctx.greyscale = greyscale
    ctx.colormap = colormap
    ctx.slider = slider
    ctx.canvas = document.getElementById(canvasName)
    ctx.canvas.addEventListener("webglcontextlost", ((event) -> event.preventDefault()), false)
    ctx.canvas.addEventListener("webglcontextrestored", glRestoreContext, false)
    ctx.gl = getWebGLContext(ctx.canvas)
    if ctx.gl
        initBuffers(ctx)
        return ctx
    else
        return null


initShaders = (ctx) ->
    gl = ctx.gl
    ctx.shaderProgram = createProgramFromScripts(gl, ["shader-vs", "shader-fs"])
    gl.useProgram(ctx.shaderProgram)
    ctx.shaderProgram.vertexPositionAttribute = gl.getAttribLocation(ctx.shaderProgram, "aVertexPosition")
    gl.enableVertexAttribArray(ctx.shaderProgram.vertexPositionAttribute)
    ctx.shaderProgram.textureCoordAttribute = gl.getAttribLocation(ctx.shaderProgram, "aTextureCoord")
    gl.enableVertexAttribArray(ctx.shaderProgram.textureCoordAttribute)


drawScene = (ctx, returnImage) ->
    gl = ctx.gl
    gl.bindBuffer(gl.ARRAY_BUFFER, ctx.vertexBuffer)
    gl.vertexAttribPointer(ctx.shaderProgram.vertexPositionAttribute, ctx.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0)

    gl.bindBuffer(gl.ARRAY_BUFFER, ctx.textureBuffer)
    gl.vertexAttribPointer(ctx.shaderProgram.textureCoordAttribute, ctx.textureBuffer.itemSize, gl.FLOAT, false, 0, 0)

    pSliderUniform = gl.getUniformLocation(ctx.shaderProgram, "uSlider")
    gl.uniform1f(pSliderUniform, ctx.slider)
    pNdviUniform = gl.getUniformLocation(ctx.shaderProgram, "uNdvi")
    gl.uniform1f(pNdviUniform, (if ctx.mode == "ndvi" || ctx.colormap then 1.0 else 0.0))
    pGreyscaleUniform = gl.getUniformLocation(ctx.shaderProgram, "uGreyscale")
    gl.uniform1f(pGreyscaleUniform, (if ctx.greyscale then 1.0 else 0.0))
    pHsvUniform = gl.getUniformLocation(ctx.shaderProgram, "uHsv")
    gl.uniform1f(pHsvUniform, (if ctx.mode == "hsv" then 1.0 else 0.0))
    pColormap = gl.getUniformLocation(ctx.shaderProgram, "uColormap")
    gl.uniform1f(pColormap, (if ctx.colormap then 1.0 else 0.0))

    gl.drawArrays(gl.TRIANGLES, 0, 6)

    if returnImage
        return ctx.canvas.toDataURL("image/png")


generateShader = (ctx) ->
    [r, g, b] = modeToEquationMap[ctx.mode]
    r = if r.charAt(0) == "#" then $(r).val() else r
    g = if g.charAt(0) == "#" then $(g).val() else g
    b = if b.charAt(0) == "#" then $(b).val() else b

    # Map HSV to shader variable names
    r = r.toLowerCase().replace(/h/g, "r").replace(/s/g, "g").replace(/v/g, "b")
    g = g.toLowerCase().replace(/h/g, "r").replace(/s/g, "g").replace(/v/g, "b")
    b = b.toLowerCase().replace(/h/g, "r").replace(/s/g, "g").replace(/v/g, "b")

    # Sanitize strings
    r = r.replace(/[^xrgb\/\-\+\*\(\)\.0-9]*/g, "")
    g = g.replace(/[^xrgb\/\-\+\*\(\)\.0-9]*/g, "")
    b = b.replace(/[^xrgb\/\-\+\*\(\)\.0-9]*/g, "")

    # Convert int to float
    r = r.replace(/([0-9])([^\.])?/g, "$1.0$2")
    g = g.replace(/([0-9])([^\.])?/g, "$1.0$2")
    b = b.replace(/([0-9])([^\.])?/g, "$1.0$2")

    r = "r" if r == ""
    g = "g" if g == ""
    b = "b" if b == ""

    code = $("#shader-fs-template").html()
    code = code.replace(/@1@/g, r)
    code = code.replace(/@2@/g, g)
    code = code.replace(/@3@/g, b)
    $("#shader-fs").html(code)

    initShaders(ctx)


glSetMode = (ctx, newMode) ->
    ctx.mode = newMode
    $("#download").show()
    if ctx.mode == "ndvi"
        $("#colorbar-container")[0].style.display = "inline-block"
        $("#colormaps-group")[0].style.display = "inline-block"
    else
        $("#colorbar-container")[0].style.display = "none"
        $("#colormaps-group")[0].style.display = "none"


glHandleOnLoadTexture = (ctx, imageData) ->
    gl = ctx.gl
    texImage = new Image()
    texImage.onload = (event) ->
        texture = gl.createTexture()
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, event.target)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        drawScene(ctx)
    texImage.src = imageData


glInitInfragram = () ->
    imgContext = createContext("raw", true, false, 1.0, "image")
    mapContext = createContext("raw", true, true, 1.0, "colorbar")
    $("#shader-vs").load("shader.vert")
    $("#shader-fs-template").load("shader.frag")
    return if imgContext && mapContext then true else false


glRestoreContext = () ->
    imageData = imgContext.imageData
    imgContext = createContext(
        imgContext.mode, imgContext.greyscale, imgContext.colormap, imgContext.slider, "image")
    mapContext = createContext(
        mapContext.mode, mapContext.greyscale, mapContext.colormap, mapContext.slider, "colorbar")
    if imgContext && mapContext
        generateShader(imgContext)
        glHandleOnLoadTexture(imgContext, imageData)
        generateShader(mapContext)
        drawScene(mapContext)


glHandleOnChangeFile = (files) ->
    if files && files[0]
        reader = new FileReader()
        reader.onload = (eventObject) ->
            imgContext.imageData = eventObject.target.result
            glSetMode(imgContext, "raw");
            generateShader(imgContext)
            glHandleOnLoadTexture(imgContext, eventObject.target.result)
            generateShader(mapContext)
        reader.readAsDataURL(files[0])


glHandleOnClickRaw = () ->
    glSetMode(imgContext, "raw")
    generateShader(imgContext)
    drawScene(imgContext)


glHandleOnClickNdvi = () ->
    glSetMode(imgContext, "ndvi")
    generateShader(imgContext)
    drawScene(imgContext)
    drawScene(mapContext)


glHandleOnClickNir = () ->
    glSetMode(imgContext, "nir")
    generateShader(imgContext)
    drawScene(imgContext)


glHandleOnClickDownload = () ->
    # create an "off-screen" anchor tag
    lnk = document.createElement("a")
    # the key here is to set the download attribute of the a tag
    lnk.download = (new Date()).toISOString().replace(/:/g, "_") + ".png"
    lnk.href = drawScene(imgContext, true)

    # create a "fake" click-event to trigger the download
    if document.createEvent
        event = document.createEvent("MouseEvents")
        event.initMouseEvent(
            "click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
        lnk.dispatchEvent(event)
    else if lnk.fireEvent
        lnk.fireEvent("onclick")


glHandleOnSubmitInfraHsv = () ->
    glSetMode(imgContext, "hsv")
    generateShader(imgContext)
    drawScene(imgContext)


glHandleOnSubmitInfra = () ->
    glSetMode(imgContext, "rgb")
    generateShader(imgContext)
    drawScene(imgContext)


glHandleOnSubmitInfraMono = () ->
    glSetMode(imgContext, "mono")
    generateShader(imgContext)
    drawScene(imgContext)


glHandleOnClickGrey = () ->
    imgContext.greyscale = true
    drawScene(imgContext)
    mapContext.greyscale = true
    drawScene(mapContext)


glHandleOnClickColor = () ->
    imgContext.greyscale = false
    drawScene(imgContext)
    mapContext.greyscale = false
    drawScene(mapContext)


glHandleOnSlide = (event) ->
    imgContext.slider = event.value / 100.0
    drawScene(imgContext)
