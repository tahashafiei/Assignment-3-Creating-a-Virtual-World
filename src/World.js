// world.js
// Taha Shafiei

// Global Variables
let g_globalXAngle = 0;
let g_globalYAngle = 0;
let g_lastX = 0;
let g_lastY = 0;
var g_camera = new Camera();

// var map_size = 32;
var map_size = 32;
var draw_calls = 0;
var g_GrassImage = new Image();

var OFFSCREEN_WIDTH = 1280, OFFSCREEN_HEIGHT = 720;

var g_startTime = performance.now()/1000.0;
var g_global_seconds = performance.now()/1000.0 - g_startTime;

let l_Light = new Cube();
var l_ViewProjectionMatrix = new Matrix4();
let l_LightDirection = new Vector3([(map_size) * Math.sin(g_global_seconds/2), (map_size) * Math.cos(g_global_seconds/2), 0]);
var l_Floor = new Cube();
var l_SkyBox = new Cube();
var l_Water = new Cube();

function setupUIListeners() {
    canvas.onclick = async () => { if( !document.pointerLockElement ) { await canvas.requestPointerLock(); } };
    document.addEventListener("pointerlockchange", () => {
    if(document.pointerLockElement === canvas) {
      document.onmousemove = (e) => rotateView(e);
      document.onclick = (e) => {
        // Determine the grid space being clicked on
        let blockPos = [];
        blockPos.push(Math.round(g_camera.at.elements[0]) + 16);
        blockPos.push(Math.round(g_camera.at.elements[1]) - -1);
        blockPos.push(Math.round(g_camera.at.elements[2]) + 16);

        if(e.button == 2) {
          // Right click = place block
          setBlock(blockPos[0], blockPos[1], blockPos[2], TEXTURES.TEXTURE2);
        } else if(e.button == 0) {
          // Left click = remove block
          removeBlock(blockPos[0], blockPos[1], blockPos[2]);
        }
      }
    } else {
      // Remove the listeners
      document.onmousemove = null;
      document.onclick = null;
    }
  })
}

// Input handling for camera movements
function keydown(ev) {
    if (ev.keyCode == 87) { // w
        g_camera.forward();
    } else if (ev.keyCode == 83) { // s
        g_camera.back();
    } else if (ev.keyCode == 65) { // a
        g_camera.left();
    } else if (ev.keyCode == 68) { // d
        g_camera.right();
    }

    if (ev.keyCode == 81) { // q
        g_camera.rotateCameraLeft();
    } else if (ev.keyCode == 69) { // e
        g_camera.rotateCameraRight();
    }

    if (ev.keyCode == 88) { // x
        g_camera.moveDown();
    } else if (ev.keyCode == 67) { // c
        g_camera.moveUp();
    }

    if (ev.keyCode == 82) { // r
        g_camera.rotateCameraUp();
    } else if (ev.keyCode == 70) { //f
        g_camera.rotateCameraDown();
    }
}

// Called by browser repeatedly whenever its time
function tick() {
    // Print some dubug information so we know we are running
    g_seconds = performance.now()/1000.0 - g_startTime;
    var startTime = performance.now();

    // Draw everything
    renderAllShapes();

    var duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000.0/duration)/10, "numdot");

    // tell the browser to update again when it has time
    requestAnimationFrame(tick);
}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}

function rotateView(ev) {
    var x = ev.clientX;
    var y = ev.clientY;
    if (ev.buttons == 1) {
        var factor = 100/OFFSCREEN_HEIGHT;
        var dx = factor * (x - g_lastX);
        var dy = factor * (y - g_lastY);

        if (dx > 0) {
            g_camera.rotateCameraRight();
        } else if (dx < 0) {
            g_camera.rotateCameraLeft();
        }

        if (dy < 0) {
            g_camera.rotateCameraUp();
        } else if (dy > 0) {
            g_camera.rotateCameraDown();
        }
    }

    g_lastX = x;
    g_lastY = y;
}

var g_map = [
    [11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 1, 1, 11, 11, 11],
    [11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 1, 1, 11, 11, 11],
    [11, 11, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 11, 1, 1, 11, 1, 1, 1, 1, 11, 1, 1, 11, 11, 11],
    [11, 11, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 11, 1, 1, 11, 1, 1, 1, 1, 11, 1, 1, 11, 11, 11], 
    [11, 11, 1, 1, 11, 1, 1, 11, 11, 11, 11, 1, 1, 11, 1, 1, 11, 11, 11, 1, 1, 11, 1, 1, 11, 11, 11, 1, 1, 11, 11, 11], 
    [11, 11, 1, 1, 11, 11, 11, 11, 1, 1, 11, 11, 11, 11, 1, 1, 1, 1, 1, 1, 1, 11, 1, 1, 1, 1, 1, 1, 1, 11, 11, 11], 
    [11, 11, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 11, 1, 1, 1, 1, 1, 1, 1, 11, 1, 1, 1, 1, 1, 1, 1, 11, 11, 11], 
    [11, 11, 1, 1, 1, 1, 1, 1, 1, 1, 11, 11, 1, 11, 11, 11, 1, 1, 11, 11, 11, 11, 1, 1, 11, 11, 11, 11, 11, 11, 11, 11], 
    [11, 11, 11, 11, 11, 11, 11, 11, 1, 1, 11, 11, 1, 11, 1, 11, 1, 1, 11, 1, 1, 1, 1, 1, 11, 1, 1, 1, 1, 1, 11, 11], 
    [11, 11, 1, 1, 1, 1, 1, 11, 1, 1, 11, 1, 1, 11, 1, 1, 1, 1, 11, 1, 1, 1, 1, 1, 11, 1, 1, 1, 1, 1, 11, 11], 
    [11, 11, 1, 1, 1, 1, 1, 11, 1, 1, 11, 1, 1, 11, 11, 11, 1, 1, 11, 1, 1, 1, 1, 1, 11, 1, 1, 11, 1, 1, 11, 11], 
    [11, 11, 1, 1, 11, 1, 1, 11, 1, 1, 11, 11, 11, 11, 11, 11, 1, 1, 11, 1, 1, 1, 1, 1, 11, 1, 1, 11, 1, 1, 11, 11], 
    [11, 11, 1, 1, 11, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 11, 1, 1, 11, 1, 1, 1, 1, 1, 11, 11, 11, 11, 1, 1, 11, 11], 
    [11, 11, 1, 1, 11, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 11, 1, 1, 11, 1, 1, 1, 1, 1, 11, 11, 11, 11, 1, 1, 11, 11], 
    [11, 11, 1, 11, 11, 1, 1, 11, 11, 11, 11, 11, 11, 1, 1, 11, 1, 1, 11, 11, 11, 1, 1, 11, 11, 1, 1, 11, 1, 1, 11, 11], 
    [11, 11, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 11, 1, 1, 11, 1, 1, 1, 1, 1, 1, 1, 11, 11, 1, 1, 11, 1, 1, 11, 11], 
    [11, 11, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 11, 1, 1, 11, 1, 1, 1, 1, 1, 1, 1, 11, 1, 1, 1, 1, 1, 1, 11, 11], 
    [11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 1, 1, 11, 1, 1, 11, 11, 11, 11, 11, 11, 11, 11, 11, 1, 1, 1, 1, 1, 1, 11, 11], 
    [11, 11, 1, 1, 1, 1, 1, 1, 1, 11, 1, 1, 11, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 11, 11, 11, 11, 11, 1, 1, 11, 11], 
    [11, 11, 1, 1, 1, 1, 1, 1, 1, 11, 1, 1, 11, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 11, 11, 11, 11, 11, 1, 1, 11, 11], 
    [11, 11, 1, 1, 11, 11, 11, 11, 11, 11, 1, 1, 11, 11, 11, 11, 11, 11, 11, 11, 11, 1, 1, 11, 11, 1, 1, 1, 1, 1, 11, 11], 
    [11, 11, 1, 1, 11, 1, 1, 1, 1, 1, 1, 1, 11, 11, 1, 1, 1, 1, 1, 1, 11, 1, 1, 11, 11, 1, 1, 1, 1, 1, 11, 11], 
    [11, 11, 1, 1, 11, 1, 1, 1, 1, 1, 1, 1, 11, 11, 1, 1, 1, 1, 1, 1, 11, 1, 1, 1, 1, 1, 1, 11, 1, 1, 11, 11], 
    [11, 11, 1, 1, 11, 1, 1, 11, 11, 11, 11, 11, 11, 11, 1, 1, 11, 1, 11, 11, 11, 1, 1, 1, 1, 1, 1, 11, 1, 1, 11, 11], 
    [11, 11, 1, 1, 11, 1, 1, 11, 1, 1, 1, 1, 1, 1, 1, 1, 11, 1, 11, 11, 11, 11, 11, 11, 11, 1, 1, 11, 11, 11, 11, 11], 
    [11, 11, 1, 1, 11, 1, 1, 11, 1, 1, 1, 1, 1, 1, 1, 1, 11, 1, 1, 1, 1, 1, 1, 1, 11, 1, 1, 1, 1, 1, 11, 11], 
    [11, 11, 1, 1, 11, 1, 1, 11, 11, 11, 11, 11, 11, 11, 1, 1, 11, 1, 1, 1, 1, 1, 1, 1, 11, 1, 1, 1, 1, 1, 11, 11],
    [11, 11, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 11, 11, 11, 11, 11, 11, 1, 1, 11, 11, 11, 11, 1, 1, 11, 11], 
    [11, 11, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 11, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 11, 11],
    [11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 1, 1, 11, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 11, 11],
    [11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 1, 1, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11],
    [11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 1, 1, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11]
];

let g_worldPieces = []

function drawMap() {
    for (let x = 0; x < 32; x++) {
        for (let z = 0; z < 32; z += 1) {
            const height = g_map[x][z];
            for (let y = 0; y < height; y++) {
                if (y > 0) {
                    setBlock(x, y, z, 2);
                } else {
                    setBlock(x, y, z, 1);
                }
            }
        }
    }
}

function getIndex(x, y, z) {
    return ((z * 32 * 32) + (y * 32) + x) + 2;
  }
  
  // Places a block at the specified coordinates
  function setBlock(x, y, z, texture) {
    if(g_worldPieces[getIndex(x,y,z)]) {
      // Block alrady exists. Don't place another one
      return;
    }

    var body = new Cube();
    body.model_matrix.setIdentity();
    body.texture_map = texture;
    body.model_matrix.translate(x -36,y-4, z-18);
    g_worldPieces[getIndex(x, y, z)] = body;
  }
  
  // Removes a block at the specified coordinates
  function removeBlock(x, y, z) {
    g_worldPieces[getIndex(x, y, z)] = undefined;
  }
  
  // Renders all pieces of the world
  function renderWorld() {
    for(let cube of g_worldPieces) {
      if(cube) {
        cube.render();
      }
    }

    l_SkyBox.model_matrix.setIdentity();
    l_SkyBox.color = [0.1 + (l_LightDirection.elements[1]/map_size/2), 0.5 + (l_LightDirection.elements[1]/map_size/2), 0.9 + (l_LightDirection.elements[1]/map_size/2), 1.0];
    l_SkyBox.model_matrix.translate(-map_size*4 + g_camera.eye.elements[0], -5, map_size*4 + g_camera.eye.elements[2]);
    l_SkyBox.model_matrix.scale(map_size*32, map_size*32, map_size*32);
    gl.cullFace(gl.FRONT);
    l_SkyBox.render();
    gl.cullFace(gl.BACK);
  }

// Draw every shape that is supposed to be in the canvas 
function renderAllShapes() {
    OFFSCREEN_HEIGHT = canvas.height;
    OFFSCREEN_WIDTH = canvas.width;

    gl.viewport(0, 0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    l_LightDirection.elements[0] = (map_size) * Math.sin((g_global_seconds/5)-Math.PI/2);
    l_LightDirection.elements[1] = (map_size) * Math.cos((g_global_seconds/5)-Math.PI/2);
    l_LightDirection.elements[2] = 0;
    gl.uniform3fv(gl.getUniformLocation(gl.program, 'u_LightPosition'), l_LightDirection.elements);

    l_ViewProjectionMatrix.setPerspective(90, OFFSCREEN_WIDTH/OFFSCREEN_HEIGHT, 0.1, 1000);
    l_ViewProjectionMatrix.lookAt(
        g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
        g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2],
        g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]
    );
    gl.uniformMatrix4fv(u_ViewProjectionMatrix, false, l_ViewProjectionMatrix.elements);

    l_Light.color = [1, 0.7, 0, 1]
    l_Light.model_matrix.setIdentity();
    l_Light.model_matrix.translate(l_LightDirection.elements[0], l_LightDirection.elements[1], l_LightDirection.elements[2]);

    let origin = new Cube();
    origin.model_matrix.scale(0, 0, 0);
    origin.render();

    renderWorld();
    
    sendTextToHTML("Draw calls: " + draw_calls, 'drawcalls');
    draw_calls = 0;
}

function main() {
    // Set up canvas and gl variables
    setupWebGL();

    // Set up GLSL shader programs and connect GLSL variables
    connectVariablesToGLSL();

    // setupUIListeners();

    // Specify the color for clearing <canvas>
    gl.clearColor(0, 0, 0, 1.0);

    canvas.addEventListener('mousemove', function(ev) {rotateView(ev)});

    document.onkeydown = function(ev) {keydown(ev)};

    let urls = ["./src/textures/BlackStone.png", "./src/textures/Nether_Bricks_mapped.png"];
    initTextures(urls);

    // Render
    drawMap();
    requestAnimationFrame(tick);
}