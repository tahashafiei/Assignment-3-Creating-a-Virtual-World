// world.js
// Taha Shafiei

// Global Variables
let g_globalXAngle = 0;
let g_globalYAngle = 0;
let g_lastX = 0;
let g_lastY = 0;
var g_camera = new Camera();

// var map_size = 32;
var map_size = 64;
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

function get_frustum() {
    let view_direction = new Vector3();
    view_direction.set(g_camera.at);
    view_direction.sub(g_camera.eye);
    view_direction.normalize();

    let up = new Vector3();
    up.set(view_direction);
    up = Vector3.cross(g_camera.up, up);
    up.normalize();
    let angle_v = Math.acos(Vector3.dot(g_camera.up, view_direction) / (up.magnitude() * view_direction.magnitude()));

    let right = new Vector3();
    right.set(view_direction);
    right = Vector3.cross(g_camera.up, right);
    right.normalize();
    let angle_r = Math.atan2(right.elements[2], right.elements[0]) + Math.PI/2;

    return angle_v, angle_r
}

function drawMap() {
    // Camera Frustum Culling
    let angle_v, angle_r = get_frustum();
    let cam_x = Math.round(g_camera.eye.elements[0]);
    let cam_z = Math.round(g_camera.eye.elements[2]);
    let block_x, block_z, x_pos, z_pos, angle_hor;

    l_Floor.color = [0.2, 0.4, 0.05, 1];
    for (let i = 0.0; i < map_size; i += 1) {
        for (let j = 0; j < map_size; j += 1) {
            x_pos = i - map_size/2;
            z_pos = j - map_size/2;

            angle_hor = Math.atan2(z_pos, x_pos) - angle_r;
            angle_hor = Math.atan2(Math.sin(angle_hor), Math.cos(angle_hor));

            if (Math.cos(angle_hor) * Math.sqrt(x_pos*x_pos + z_pos*z_pos) <= 0) {
                continue;
            }

            l_Floor.model_matrix.setIdentity();
            l_Floor.texture_map = 1;
            l_Floor.model_matrix.translate(cam_x + i - map_size/2, -4, cam_z + j - map_size/2);
            block_x = l_Floor.model_matrix.elements[12]/10.0;
            block_z = l_Floor.model_matrix.elements[14]/10.0;
            l_Floor.model_matrix.translate(0, Math.round(perlin.get(block_x, block_z) * 4), 0);
            if (l_Floor.model_matrix.elements[13] < -5) {
                continue;
            }
            l_Floor.render();
        }
    }

    l_SkyBox.model_matrix.setIdentity();
    l_SkyBox.color = [0.1 + (l_LightDirection.elements[1]/map_size/2), 0.5 + (l_LightDirection.elements[1]/map_size/2), 0.9 + (l_LightDirection.elements[1]/map_size/2), 1.0];
    l_SkyBox.model_matrix.translate(-map_size*4 + g_camera.eye.elements[0], -5, map_size*4 + g_camera.eye.elements[2]);
    l_SkyBox.model_matrix.scale(map_size*8, map_size*8, map_size*8);
    gl.cullFace(gl.FRONT);
    l_SkyBox.render();
    gl.cullFace(gl.BACK);

    l_Water.model_matrix.setIdentity();
    // l_Water.color = [0, 0.4, 0.8, 1];
    // l_Water.texture_map = 0;
    l_Water.texture_map = 2;
    l_Water.render();
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
    drawMap();
    
    sendTextToHTML("Draw calls: " + draw_calls, 'drawcalls');
    draw_calls = 0;
}

function main() {
    // Set up canvas and gl variables
    setupWebGL();

    // Set up GLSL shader programs and connect GLSL variables
    connectVariablesToGLSL();

    // Specify the color for clearing <canvas>
    gl.clearColor(0, 0, 0, 1.0);

    // Set up actions for the HTML UI elements
    // addActionsForHtmlUI();

    canvas.addEventListener('mousemove', function(ev) {rotateView(ev)});
    document.onkeydown = function(ev) {keydown(ev)};

    let urls = ["./src/textures/Netherrack.png", "./src/textures/Lava.png"];
    initTextures(urls);

    // Render
    requestAnimationFrame(tick);
}