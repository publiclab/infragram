precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float uSlider;
uniform float uNdvi;
uniform float uGreyscale;
uniform float uHsv;
uniform float uColormap;

vec4 greyscale_colormap(float n)
{
    vec2 x  = vec2(0.0, 1.0);
    vec3 y0 = vec3(0.0, 0.0, 0.0);
    vec3 y1 = vec3(255.0, 255.0, 255.0) / 255.0;

    return vec4(
        (n - x[0]) / (x[1] - x[0]) * (y1[0] - y0[0]) + y0[0],
        (n - x[0]) / (x[1] - x[0]) * (y1[1] - y0[1]) + y0[1],
        (n - x[0]) / (x[1] - x[0]) * (y1[2] - y0[2]) + y0[2],
        1.0);
}

vec4 color_colormap(float n)
{
    vec2 x = vec2(0.0, 0.5);
    vec3 y0 = vec3(0.0, 0.0, 255.0) / 255.0;
    vec3 y1 = vec3(38.0, 195.0, 195.0) / 255.0;

    if ((n >= 0.5) && (n < 0.75))
    {
        x = vec2(0.5, 0.75);
        y0 = vec3(0.0, 150.0, 0.0) / 255.0;
        y1 = vec3(255.0, 255.0, 0.0) / 255.0;
    }
    else if (n >= 0.75)
    {
        x = vec2(0.75, 1.0);
        y0 = vec3(255.0, 255.0, 0.0) / 255.0;
        y1 = vec3(255.0, 50.0, 50.0) / 255.0;
    }

    return vec4(
        (n - x[0]) / (x[1] - x[0]) * (y1[0] - y0[0]) + y0[0],
        (n - x[0]) / (x[1] - x[0]) * (y1[1] - y0[1]) + y0[1],
        (n - x[0]) / (x[1] - x[0]) * (y1[2] - y0[2]) + y0[2],
        1.0);
}

vec4 rgb2hsv(vec4 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec4(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x, 1.0);
}

vec4 hsv2rgb(vec4 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return vec4(c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y), 1.0);
}

void main(void)
{
    vec4 color = texture2D(uSampler, vTextureCoord);
    if (uColormap >= 1.0)
    {
        color = vec4(vTextureCoord, 0.0, 0.0);
    }
    else if (uHsv >= 1.0)
    {
        color = rgb2hsv(color);
    }
    float x = uSlider;
    float r = color.r;
    float g = color.g;
    float b = color.b;
    float rr = @1@;
    float gg = @2@;
    float bb = @3@;
    if (uNdvi < 1.0)
    {
        color = vec4(rr, gg, bb, 1.0);
        gl_FragColor = (uHsv < 1.0) ? color : hsv2rgb(color);
    }
    else
    {
        gl_FragColor = (uGreyscale < 1.0) ? color_colormap(rr) : greyscale_colormap(rr);
    }
}
