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


getURLParameter = (name) ->
    result = decodeURI(
        (RegExp(name + "=" + "(.+?)(&|$|/)").exec(location.search) || [null, null])[1]
    )
    return if result == "null" then null else result


setParametersFromURL = (idNameMap) ->
    for id, name of idNameMap
        val = getURLParameter(name)
        if val
            $(id).val(val)


updateImage = (video) ->
    if webGlSupported
        glUpdateImage(video)
    else
        jsUpdateImage(video)


$(document).ready(() ->
    $("#image-container").ready(() ->
        idNameMap =
            "#m_exp": "m"
            "#r_exp": "r"
            "#g_exp": "g"
            "#b_exp": "b"
            "#h_exp": "h"
            "#s_exp": "s"
            "#v_exp": "v"
        setParametersFromURL(idNameMap)

        enablewebgl = if getURLParameter("enablewebgl") == "true" then true else false
        webGlSupported = enablewebgl && glInitInfragram()

        if webGlSupported
            $("#webgl-activate").html("&laquo; Go back to JS version")
        return true
    )

    $("#file-sel").change(() ->
        if webGlSupported
            glHandleOnChangeFile(this.files)
        else
            jsHandleOnChangeFile(this.files)
        return true
    )

    $("button#raw").click(() ->
        if webGlSupported
            glHandleOnClickRaw()
        else
            jsHandleOnClickRaw()
        return true
    )

    $("button#ndvi").click(() ->
        #$('#h_exp').val() # <-- some viable NDVI expression...
        #$('#s_exp').val(1)
        #$('#v_exp').val(1)
        #$('#modeSwitcher').val('infragrammar_mono').click()
        if webGlSupported
            glHandleOnClickNdvi()
        else
            jsHandleOnClickNdvi()
        return true
    )

    $("button#nir").click(() ->
        $('#m_exp').val('R')
        $('#modeSwitcher').val('infragrammar_mono').change()
        if webGlSupported
            glHandleOnSubmitInfraMono()
        else
            jsHandleOnSubmitInfraMono()
        return true
    )

    $("#download").click(() ->
        if webGlSupported
            glHandleOnClickDownload()
        else
            jsHandleOnClickDownload()
        return true
    )

    $("#save").click(() ->
        if webGlSupported
            glHandleOnClickSave()
        else
            jsHandleOnClickSave()
    )

    $("#infragrammar_hsv").submit(() ->
        if webGlSupported
            glHandleOnSubmitInfraHsv()
        else
            jsHandleOnSubmitInfraHsv()
        return true
    )

    $("#infragrammar").submit(() ->
        if webGlSupported
            glHandleOnSubmitInfra()
        else
            jsHandleOnSubmitInfra()
        return true
    )

    $("#infragrammar_mono").submit(() ->
        if webGlSupported
            glHandleOnSubmitInfraMono()
        else
            jsHandleOnSubmitInfraMono()
        return true
    )

    $("button#grey").click(() ->
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
            href = href.replace(/enablewebgl=true&?/gi, "")
        else
            href += if href.indexOf("?") >= 0 then "enablewebgl=true" else "?enablewebgl=true"
        window.location.href = href
        return true
    )

    $("#webcam-activate").click(() ->
        camera.initialize()
        return true
    )

    $("#snapshot").click(() ->
        camera.getSnapshot()
        return true
    )

    $("#exit-fullscreen").click(() ->
        $("#image").css('display','inline')
        $("#image").css('position','relative')
        $("#image").css('height','auto')
        $('#image').css('left',0)
        $("#backdrop").hide()
        $("#exit-fullscreen").hide()
        $("#fullscreen").show()
        return true
    )

    $("#fullscreen").click(() ->
        $("#image").css('display','block')
        $("#image").css('height','100%')
        $("#image").css('width','auto')
        $("#image").css('position','absolute')
        $("#image").css('top','0px')
        $("#image").css('left',parseInt((window.innerWidth-$('#image').width())/2)+'px')
        $("#image").css('z-index','2')
        $("#backdrop").show()
        $("#exit-fullscreen").show()
        $("#fullscreen").hide()
        return true
    )

    $("#live-video").click(() ->
        if webGlSupported
            setInterval(camera.getSnapshot, 33)
        else
            setInterval(camera.getSnapshot, 250)
        return true
    )

    $("#modeSwitcher").change(() ->
        $('#infragrammar, #infragrammar_mono, #infragrammar_hsv').hide()
        $('#'+$("#modeSwitcher").val()).css('display','inline')
        return true 
    )

    return true
)
