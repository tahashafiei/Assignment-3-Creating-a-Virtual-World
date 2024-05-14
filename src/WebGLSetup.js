let canvas;
let gl;

let a_Position;
let a_UV;
let a_Normal;

let u_FragColor;
let u_ModelMatrix;
let u_NormalMatrix;
let u_Sampler0;
let u_Sampler1;
let u_LightPosition;
let u_TextureMap;
let u_ViewProjectionMatrix;

let g_Textures = [];
let g_VertexBuffer;
let g_UVBuffer;

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.depthMask(true);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CW);
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage loaction of a_UV
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    // Get the storage loaction of a_Normal
    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_Normal < 0) {
        console.log('Failed to get the storage location of a_Normal');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    // Get the storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    // Get the storage location of u_NormalMatrix
    u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    if (!u_NormalMatrix) {
        console.log('Failed to get the storage location of u_NormalMatrix');
        return;
    }

    // Get the storage location of u_TextureMap
    u_TextureMap = gl.getUniformLocation(gl.program, 'u_TextureMap');
    if (!u_TextureMap) {
        console.log('Failed to get the storage location of u_TextureMap');
        return;
    }

    // Get the storage location of u_ViewProjectionMatrix
    u_ViewProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ViewProjectionMatrix');
    if (!u_ViewProjectionMatrix) {
        console.log('Failed to get the storage location of u_ViewProjectionMatrix');
        return;
    }

    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
        console.log('Failed to get the storage location of u_Sampler0');
        return;
    }

    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
        console.log('Failed to get the storage location of u_Sampler1');
        return;
    }

    // Create a vertex buffer and UV buffer
    g_VertexBuffer = gl.createBuffer();
    if (!g_VertexBuffer) {
        throw('Failed to create the Vertex buffer object');
    }

    g_UVBuffer = gl.createBuffer();
    if (!g_UVBuffer) {
        throw('Failed to create the UV buffer object');
    }

    // Set an initial value for this matrix to identify
    var l_ModelMatrix = new Matrix4();
    var l_ViewProjectionMatrix = new Matrix4();

    gl.uniformMatrix4fv(u_ModelMatrix, false, l_ModelMatrix.elements);
    gl.uniformMatrix4fv(u_ViewProjectionMatrix, false, l_ViewProjectionMatrix.elements);
}

function initTextures(urls) {    

    var netherrackImage = new Image();
    if (!netherrackImage) {
        console.log('Failed to create the grassImage object');
        return false;
    }
    // Tell the browser to load an image
    netherrackImage.src = urls[0];
    // Register the event handler to be called on loading an image
    netherrackImage.onload = function(){ 
        var texture = gl.createTexture();
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, netherrackImage);
        g_Textures.push(texture); 
    };

    var brickImage = new Image();
    if (!brickImage) {
        console.log('Failed to create the lavaImage object');
        return false;
    }
    brickImage.src = urls[1];
    brickImage.onload = function(){
        var texture = gl.createTexture();
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, brickImage);
        g_Textures.push(texture);
    };
    
    gl.uniform1i(u_Sampler0, 0);
    gl.uniform1i(u_Sampler1, 1);
    return true;
}