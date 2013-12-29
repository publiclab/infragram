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
    )

    $("#file-sel").change(() ->
        if webGlSupported
            glHandleOnChangeFile(this.files)
        else
            jsHandleOnChangeFile(this.files)
    )

    $("button#raw").click(() ->
        if webGlSupported
            glHandleOnClickRaw()
        else
            jsHandleOnClickRaw()
    )

    $("button#ndvi").click(() ->
        if webGlSupported
            glHandleOnClickNdvi()
        else
            jsHandleOnClickNdvi()
    )

    $("button#nir").click(() ->
        if webGlSupported
            glHandleOnClickNir()
        else
            jsHandleOnClickNir()
    )

    $("#download").click(() ->
        if webGlSupported
            glHandleOnClickDownload()
        else
            jsHandleOnClickDownload()
    )

    $("#infragrammar_hsv").submit(() ->
        if webGlSupported
            glHandleOnSubmitInfraHsv()
        else
            jsHandleOnSubmitInfraHsv()
    )

    $("#infragrammar").submit(() ->
        if webGlSupported
            glHandleOnSubmitInfra()
        else
            jsHandleOnSubmitInfra()
    )

    $("#infragrammar_mono").submit(() ->
        if webGlSupported
            glHandleOnSubmitInfraMono()
        else
            jsHandleOnSubmitInfraMono()
    )

    $("button#grey").click(() ->
        if webGlSupported
            glHandleOnClickGrey()
        else
            jsHandleOnClickGrey()
    )

    $("button#color").click(() ->
        if webGlSupported
            glHandleOnClickColor()
        else
            jsHandleOnClickColor()
    )

    $("#slider").slider().on("slide", (event) ->
        if webGlSupported
            glHandleOnSlide(event)
        else
            jsHandleOnSlide(event)
    )

    $("#webgl-activate").click(() ->
        href = window.location.href
        if webGlSupported
            href = href.replace(/enablewebgl=true&?/gi, "")
        else
            href += if href.indexOf("?") >= 0 then "enablewebgl=true" else "?enablewebgl=true"
        window.location.href = href
    )

    $("#webcam-activate").click(() ->
        camera.initialize()
    )

    $("#snapshot").click(() ->
        camera.getSnapshot()
    )

    $("#live-video").click(() ->
        setInterval(camera.getSnapshot, 250)
    )
)
