class Image
        constructor: (@data, @width, @height, @channels) ->

        copyToImageData: (imgData) ->
                imgData.data.set(@data)

        extrema: ->
                n = @width * @height
                mins = (@data[i] for i in [0...@channels])
                maxs = (@data[i] for i in [0...@channels])
                j = 0
                for i in [0...n]
                        for c in [0...@channels]
                                if @data[j] > maxs[c]
                                        maxs[c] = @data[j]
                                if @data[j] < mins[c]
                                        mins[c] = @data[j]
                                j++
                return [mins, maxs]
        
get_channels = (img) ->
        n = img.width * img.height;
        r = new Float32Array(n);
        g = new Float32Array(n);
        b = new Float32Array(n);
        for i in [0...n]
                r[i] = img.data[4*i + 0];
                g[i] = img.data[4*i + 1];
                b[i] = img.data[4*i + 2];
        mkImage = (d) -> new Image(d, img.width, img.height, 1);
        return [mkImage(r), mkImage(g), mkImage(b)];

nvdi = (nir, vis) ->
        n = nir.width * nir.height;
        d = new Float64Array(n);
        for i in [0...n]
                d[i] = (nir.data[i] - vis.data[i]) / (nir.data[i] + vis.data[i]);
        return new Image(d, nir.width, nir.height, 1);

colorify = (img, colormap) -> 
        n = img.width * img.height;
        data = new Uint8ClampedArray(4*n);
        j = 0;
        for i in [0...n]
                [r,g,b] = colormap(img.data[i]);
                data[j++] = r;
                data[j++] = g;
                data[j++] = b;
                data[j++] = 255;
        cimg = new Image();
        cimg.width = img.width;
        cimg.height = img.height;
        cimg.data = data;
        return new Image(data, img.width, img.height, 4);

render = (img) ->
        e = document.getElementById("image");
        ctx = e.getContext("2d");
        d = ctx.getImageData(0, 0, img.width, img.height);
        img.copyToImageData(d);
        ctx.putImageData(d, 0, 0);

update = (img) ->
        mode = "vdi"
        if mode == "nvdi"
                [r,g,b] = get_channels(img)
                nvdi_img = nvdi(r,b)
                [[min],[max]] = nvdi_img.extrema()
                d = max - min
                colormap = (x) -> [255/d * (x - min), 0, 0]
                result = colorify(nvdi_img, colormap)
        else
            result = img
        render(result)
        
file_reader = new FileReader();
file_reader.onload = (oFREvent) ->
        file = document.forms["file-form"]["file-sel"].files[0];
        data = new Uint8Array(file_reader.result);
        if file.type == "image/png"
            png = new PNG(data);
            data = png.decode()
            img = new Image(data, png.width, png.height);
        else if file.type == "image/jpeg"
            jpeg = new JpegImage();
            jpeg.parse(data);
            d = new Uint8ClampedArray(4 * jpeg.width * jpeg.height);
            img = new Image(d, jpeg.width, jpeg.height, 4);
            jpeg.copyToImageData(img);
        else
            document.getElementById("error").html = "Unrecognized file format (supports PNG and JPEG)";
            return

        update(img);

on_file_sel = () ->
        file = document.forms["file-form"]["file-sel"].files[0];
        if file
                file_reader.readAsArrayBuffer(file);