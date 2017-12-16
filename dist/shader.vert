attribute vec2 aVertexPosition;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4(aVertexPosition, 0.0, 1.0);
    vTextureCoord = (aVertexPosition + 1.0) / 2.0;
}
