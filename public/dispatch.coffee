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


webGlSupported = false
colorized = false
video_live = false
log = [] # a record of previous commands run
params = {} # the url hash

getURLParameter = (name) ->
    decodeParameters(name,location.search)


decodeParameters = (name,string) ->
    result = decodeURI(
        (RegExp("[\\?&]" + name + "=([^&#]*)").exec(string) || [null, null])[1]
    )
    return if result == "null" then null else result


parametersObject = (string) ->
    params = {}
    for param in string.replace('&amp;','&').split('&')
        key = param.split('=')[0]
        val = param.split('=')[1]
        params[key] = val
    params


setParametersFromURL = (idNameMap) ->
    for id, name of idNameMap
        val = getURLParameter(name)
        if val
            $(id).val(val)


updateImage = (img) ->
    if webGlSupported
        glUpdateImage(img)
    else
        jsUpdateImage(img)


getCurrentImage = () ->
    img = null
    if webGlSupported
        img = glGetCurrentImage()
    else
        img = jsGetCurrentImage()
    return img


run_colorize = () ->
    render(colorify(infragrammar_mono(image),(x) -> return colormap((x+1)/2)))
    return true


save_infragrammar_inputs = () ->
    mode = $('#modeSwitcher').val()
    save_infragrammar_expressions({
        'r':$('#r_exp').val(),
        'g':$('#g_exp').val(),
        'b':$('#b_exp').val(),
        'm':$('#m_exp').val(),
        'h':$('#h_exp').val(),
        's':$('#s_exp').val(),
        'v':$('#v_exp').val()
    })


# this is unfortunately js/gl specific; currently only js?
save_infragrammar_expressions = (args) ->
    if mode == "infragrammar"
        save_expressions(args['r'],args['g'],args['b'])
    if mode == "infragrammar_mono"
        save_expressions(args['m'],args['m'],args['m'])
    if mode == "infragrammar_hsv"
        save_expressions_hsv(args['h'],args['s'],args['v'])


# this should accept an object with parameters r,g,b,h,s,v,m and mode
run_infragrammar = (mode) ->
    save_log()
    if webGlSupported
        glHandleOnSubmit()
    else
        jsRunInfragrammar(mode)

log_mono = () ->
    logEntry = "mode=infragrammar_mono"
    logEntry += if $("#m_exp").val() then "&m=" + $("#m_exp").val() else ""
    logEntry += if colorized then "&c=true" else "" # no way to succinctly store the colormap... just offer range of colorizations at view-time?
    log.push(logEntry)

log_hsv = () ->
    logEntry = "mode=infragrammar_hsv"
    logEntry += if $("#h_exp").val() then "&h=" + $("#h_exp").val() else ""
    logEntry += if $("#s_exp").val() then "&s=" + $("#s_exp").val() else ""
    logEntry += if $("#v_exp").val() then "&v=" + $("#v_exp").val() else ""
    log.push(logEntry)

log_rgb = () ->
    logEntry = "mode=infragrammar"
    logEntry += if $("#r_exp").val() then "&r=" + $("#r_exp").val() else ""
    logEntry += if $("#g_exp").val() then "&g=" + $("#g_exp").val() else ""
    logEntry += if $("#b_exp").val() then "&b=" + $("#b_exp").val() else ""
    log.push(logEntry)

save_log = () ->
    if mode == "infragrammar_mono"
      log_mono()
    else if mode == "infragrammar_hsv"
      log_hsv()
    else if mode == "infragrammar"
      log_rgb()

preset_raw = () ->
    $('#modeSwitcher').val("infragrammar").change()
    $('#r_exp').val("R")
    $('#g_exp').val("G")
    $('#b_exp').val("B")
    $('#preset-modal').modal('hide')
    save_infragrammar_inputs()
    run_infragrammar(mode)


preset_ndvi_red = () ->
    $('#modeSwitcher').val("infragrammar_mono").change()
    $('#m_exp').val("(B-R)/(B+R)")
    $('#preset-modal').modal('hide')
    save_infragrammar_inputs()
    run_infragrammar(mode)


preset_ndvi_blue = () ->
    $('#modeSwitcher').val("infragrammar_mono").change()
    $('#m_exp').val("(R-B)/(R+B)")
    $('#preset-modal').modal('hide')
    save_infragrammar_inputs()
    run_infragrammar(mode)


preset_ndvi_red_color = () ->
    $('#modeSwitcher').val("infragrammar_mono").change()
    $('#m_exp').val("(B-R)/(B+R)")
    $('#preset-modal').modal('hide')
    save_infragrammar_inputs()
    colorized = true
    run_infragrammar(mode)
    run_colorize()


preset_ndvi_blue_color = () ->
    $('#modeSwitcher').val("infragrammar_mono").change()
    $('#m_exp').val("(R-B)/(R+B)")
    $('#preset-modal').modal('hide')
    save_infragrammar_inputs()
    colorized = true
    run_infragrammar(mode)
    run_colorize()


downloadImage = () ->
    # create an "off-screen" anchor tag
    lnk = document.createElement("a")
    # the key here is to set the download attribute of the a tag
    lnk.href = getCurrentImage()
    if lnk.href.match('image/jpeg')
      format = "jpg"
    else
      format = "png"

    lnk.download = (new Date()).toISOString().replace(/:/g, "_") + "." + format

    # create a "fake" click-event to trigger the download
    if document.createEvent
        event = document.createEvent("MouseEvents")
        event.initMouseEvent(
            "click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
        lnk.dispatchEvent(event)
    else if lnk.fireEvent
        lnk.fireEvent("onclick")
    return true


# from a local URL (remote may be against js security rules)
fetch_image = (src,mode) ->
    $("#save-modal-btn").show()
    $("#save-zone").show()
    img = new Image()
    img.onload = () ->
        filename = src.split('/')
        filename = filename[filename.length-1]
        FileUpload.setFilename(filename)
        if mode
            if mode.substring(0, 5) == "infra"
                $("#modeSwitcher").val(mode).change()
                $("#" + mode).submit()
            else
                $("button#" + mode).button("toggle");
                $("button#" + mode).click() # this should be via a direct call, not a click; the show.jade page should not require buttons!
        save_infragrammar_expressions(params)
        if mode == "ndvi"
            save_infragrammar_expressions({'m':'(R-B)/(R+B)'})
            mode = "infragrammar_mono"
        else if mode == "nir"
            save_infragrammar_expressions({'m':'R'})
            mode = "infragrammar_mono"
        if params['color'] || params['c'] then colorized = true
        updateImage(this)
        run_infragrammar(mode)
        if colorized
          $("button#color").button("toggle");
          $("button#color").click()
          run_colorize()
    img.src = src


$(document).ready(() ->
    FileUpload.initialize()

    $("#image-container").ready(() ->
        enablewebgl = if getURLParameter("enablewebgl") == "true" then true else false
        webGlSupported = enablewebgl && glInitInfragram()

        if webGlSupported
            $("#webgl-activate").html("&laquo; Go back to JS version")

        idNameMap =
            "#m_exp": "m"
            "#r_exp": "r"
            "#g_exp": "g"
            "#b_exp": "b"
            "#h_exp": "h"
            "#s_exp": "s"
            "#v_exp": "v"
        setParametersFromURL(idNameMap)

        src = getURLParameter('src')

        if src
          params = parametersObject(location.search.split('?')[1])
          mode = params['mode']
          fetch_image(src)
        
        return true
    )

    $("#file-sel").change(() ->
        $("#save-modal-btn").show()
        $("#save-zone").show()
        FileUpload.fromFile(this.files, updateImage)
        save_infragrammar_inputs()
        run_infragrammar(mode)
        return true
    )

    $("button#raw").click(() ->
        log.push("mode=raw")
        if webGlSupported
            glHandleOnClickRaw()
        else
            jsHandleOnClickRaw()
        return true
    )

    $("button#ndvi").click(() ->
        log.push("mode=ndvi")
        if webGlSupported
            glHandleOnClickNdvi()
        else
            jsHandleOnClickNdvi()
        return true
    )

    $("button#nir").click(() ->
        log.push("mode=nir")
        $("#m_exp").val("R")
        $("#modeSwitcher").val("infragrammar_mono").change()
        if webGlSupported
            glHandleOnSubmitInfraMono()
        else
            jsHandleOnSubmitInfraMono()
        return true
    )

    $("#download").click(() ->
        downloadImage()
        return true
    )

    $("#save").click(() ->
        sendThumbnail = () ->
            img = getCurrentImage()
            FileUpload.uploadThumbnail(img, ()->
                $("#form-filename").val(FileUpload.getFilename())
                $("#form-log").val(JSON.stringify(log))
                $("#save-form").submit()
            )
        $("#save").prop("disabled", true)
        $("#save").html("Saving...")
        if FileUpload.getFilename() == ""
            img = getCurrentImage()
            FileUpload.fromBase64("camera", img, sendThumbnail)
        else if FileUpload.isLoadedFromFile() == false
            FileUpload.duplicate(sendThumbnail)
        else
            sendThumbnail()
        return true
    )

    $("#infragrammar_hsv").submit(() ->
        mode = "infragrammar_hsv"
        log_hsv()
        if webGlSupported
            glHandleOnSubmitInfraHsv()
        else
            run_infragrammar(mode)
        return true
    )

    $("#infragrammar").submit(() ->
        mode = "infragrammar"
        log_rgb()
        if webGlSupported
            glHandleOnSubmitInfra()
        else
            run_infragrammar(mode)
        return true
    )

    $("#infragrammar_mono").submit(() ->
        mode = "infragrammar_mono"
        log_mono()
        if webGlSupported
            glHandleOnSubmitInfraMono()
        else
            run_infragrammar(mode)
        return true
    )

    $("button#grey").click(() ->
        log.push("mode=ndvi")
        if webGlSupported
            glHandleOnClickGrey()
        else
            jsHandleOnClickGrey()
        return true
    )

    $("button#colorify").click(() ->
        if webGlSupported
            glHandleOnClickColorify()
        else
            jsHandleOnClickColorify()
        return true
    )

    $("button#color").click(() ->
        log.push("mode=ndvi&color=true")
        if webGlSupported
            glHandleOnClickColor()
        else
            jsHandleOnClickColor()
        return true
    )

    $("#slider").slider().on("slide", (event) ->
        if webGlSupported
            glHandleOnSlide(event)
        else
            jsHandleOnSlide(event)
        return true
    )

    $("#webgl-activate").click(() ->
        href = window.location.href
        if webGlSupported
            href = href.replace(/(?:\?|&)enablewebgl=true/gi, "")
        else
            href += if href.indexOf("?") >= 0 then "&enablewebgl=true" else "?enablewebgl=true"
        window.location.href = href
        return true
    )

    $("#webcam-activate").click(() ->
        $("#save-modal-btn").show()
        $("#save-zone").show()
        camera.initialize()
        save_infragrammar_inputs()
        if webGlSupported
            setInterval(() -> 
               if image && video_live
                   run_infragrammar(mode)
                   video_live = true
               camera.getSnapshot()
               if colorized
                   run_colorize() 
            , 33)
        else
            setInterval(() -> 
               if image && video_live
                   run_infragrammar(mode)
                   video_live = true
               camera.getSnapshot()
               if colorized
                   run_colorize() 
            , 250)
        return true
    )

    $("#snapshot").click(() ->
        camera.getSnapshot()
        return true
    )

    $("#exit-fullscreen").click(() ->
        $("#image").css("display", "inline")
        $("#image").css("position", "relative")
        $("#image").css("height", "auto")
        $("#image").css("left", 0)
        $("#backdrop").hide()
        $("#exit-fullscreen").hide()
        $("#fullscreen").show()
        return true
    )

    $("#fullscreen").click(() ->
        $("#image").css("display", "block")
        $("#image").css("height", "100%")
        $("#image").css("width", "auto")
        $("#image").css("position", "absolute")
        $("#image").css("top", "0px")
        $("#image").css("left", parseInt((window.innerWidth - $("#image").width()) / 2) + "px")
        $("#image").css("z-index", "2")
        $("#backdrop").show()
        $("#exit-fullscreen").show()
        $("#fullscreen").hide()
        return true
    )

    $("#modeSwitcher").change(() ->
        $("#infragrammar, #infragrammar_mono, #infragrammar_hsv").hide()
        $("#" + $("#modeSwitcher").val()).css("display", "inline")
        return true 
    )

    return true
)
