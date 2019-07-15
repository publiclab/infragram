## usage

```js
var canvas = $('#myCanvas')
var fragmentShader = 'my valid fs'
var vertextShader = 'my valid vs'

// returns either null(if an error occurs) or gl-context with an installed program as a property (gl.program)
var gl = getGLprog(canvas, fragmentShader, vertexShader)

//handling error returns
if(!gl) {
    return
} else {
    // magic :3
}
```

##errors

if any errors occur during shader compilation or program linkage:

- an error report will be logged to your console
    
- getGLprog function will return null