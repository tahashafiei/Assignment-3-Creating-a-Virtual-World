class Cube {
    constructor(){
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.textureNum = 0;

        this.model_matrix = new Matrix4();
        this.normal_matrix = new Matrix4();
        this.buffer = null;
        this.interleaved = [];

        this.vertices = [
            1, 1, 0, 1, 0, 0, 0, 0, 0,      // Front
            0, 0, 0, 0, 1, 0, 1, 1, 0,      // Front
            0, 1, 0, 0, 0, 0, 0, 0, -1,     // Left
            0, 0, -1, 0, 1, -1, 0, 1, 0,    // Left
            1, 0, 0, 1, 0, -1, 0, 0, -1,    // Bottom
            0, 0, -1, 0, 0, 0, 1, 0, 0,     // Bottom
            1, 0, 0, 1, 1, 0, 1, 1, -1,     // Right
            1, 1, -1, 1, 0, -1, 1, 0, 0,    // Right
            0, 1, -1, 0, 0, -1, 1, 0, -1,   // Back
            1, 0, -1, 1, 1, -1, 0, 1, -1,   // Back
            1, 1, -1, 1, 1, 0, 0, 1, 0,     // Top
            0, 1, 0, 0, 1, -1, 1, 1, -1     // Top
        ];

        this.normals = [
            0, 0, 1, 0, 0, 1, 0, 0, 1,      // Front
            0, 0, 1, 0, 0, 1, 0, 0, 1,      // Front
            -1, 0, 0, -1, 0, 0, -1, 0, 0,   // Left
            -1, 0, 0, -1, 0, 0, -1, 0, 0,   // Left
            0, -1, 0, 0, -1, 0, 0, -1, 0,   // Bottom
            0, -1, 0, 0, -1, 0, 0, -1, 0,   // Bottom
            1, 0, 0, 1, 0, 0, 1, 0, 0,      // Right
            1, 0, 0, 1, 0, 0, 1, 0, 0,      // Right
            0, 0, -1, 0, 0, -1, 0, 0, -1,   // Back
            0, 0, -1, 0, 0, -1, 0, 0, -1,   // Back
            0, 1, 0, 0, 1, 0, 0, 1, 0,      // Top
            0, 1, 0, 0, 1, 0, 0, 1, 0       // Top
        ];

        this.uvs = [
            0.25,0.5,0.25,0.25,0.5,0.25,    // Front
            0.5,0.25,0.5,0.5,0.25,0.5,      // Front
            0.0,0.5,0.0,0.25,0.25,0.25,     // Left
            0.25,0.25,0.25,0.5,0.0,0.5,     // Left
            0.25,0.25,0.25,0.0,0.5,0.0,     // Bottom
            0.5,0.0,0.5,0.25,0.25,0.25,     // Bottom
            0.75,0.25,0.75,0.5,1.0,0.5,     // Right
            1.0,0.5,1.0,0.25,0.75,0.25,     // Right
            0.75,0.5,0.75,0.25,1.0,0.25,    // Back
            1.0,0.25,1.0,0.5,0.75,0.5,      // Back
            0.5,0.75,0.25,0.75,0.25,0.5,    // Top
            0.25,0.5,0.5,0.5,0.5,0.75,      // Top
        ];
    }

    render() {
        // draw_calls += 1;
        this.interleaved.length = 0;
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        gl.uniform1i(u_TextureMap, this.texture_map);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.model_matrix.elements);
        this.normal_matrix.setInverseOf(this.model_matrix);
        this.normal_matrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normal_matrix.elements);

        if (this.buffer == null) {
            this.buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        }

        for (let i = 0; i < this.vertices.length; i += 3) {
            this.interleaved.push(this.vertices[i + 0]);
            this.interleaved.push(this.vertices[i + 1]);
            this.interleaved.push(this.vertices[i + 2]);

            this.interleaved.push(this.normals[i + 0]);
            this.interleaved.push(this.normals[i + 1]);
            this.interleaved.push(this.normals[i + 2]);

            this.interleaved.push(this.uvs[i/3 * 2 + 0]);
            this.interleaved.push(this.uvs[i/3 * 2 + 1]);
        }

        // Bind the buffer object to target
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.interleaved), gl.STATIC_DRAW);

        // Enable the assignment to a_Position variable
        gl.enableVertexAttribArray(a_Position);
        // Assign the buffer object to a_Position variable
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 32, 0);

        // Enable the assignment to a_Normal variable
        gl.enableVertexAttribArray(a_Normal);
        // Assign the buffer object to a_Normal variable
        gl.vertexAttribPointer(a_Normal, 2, gl.FLOAT, false, 32, 12);


        // Enable the assignment to a_UV variable
        gl.enableVertexAttribArray(a_UV);
        // Assign the buffer object to a_UV variable
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 32, 24);

        // Draw the triangles
        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }

    // render() {
    //     //var xy   = this.position;
    //     var rgba = this.color;
    //     //var size = this.size;
    
    //     // Pass the texture number
    //     gl.uniform1i(u_whichTexture, this.textureNum);

    //     // Pass the position of a point to a_Position variable
    //     //gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    
    //     // Pass the color of a point to u_FragColor variable
    //     gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    
    //     // Pass the Matrix to u_ModelMatrix attribute
    //     gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
    //     //Front of cube
    
    //     drawTriangle3DUV( [0,0,0, 1,1,0, 1,0,0], [1,0, 0,1, 1,1] );
    //     drawTriangle3DUV( [0,0,0, 1,1,0, 0,1,0], [0,0, 0,1, 1,1] );
    
    //     gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
    
    //     //Top
    //     drawTriangle3D( [0,1,0, 1,1,1, 0,1,1] );
    //     drawTriangle3D( [0,1,0, 1,1,1, 1,1,0] );
    
    //     gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
    
    //     drawTriangle3D( [0,0,0, 0,1,1, 0,0,1] );
    //     drawTriangle3D( [0,0,0, 0,1,1, 0,1,0] );
    
    //     gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
    
    //     drawTriangle3D( [0,0,0, 1,0,1, 0,0,1] );
    //     drawTriangle3D( [0,0,0, 1,0,1, 1,0,0] );
    
    //     gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    
    //     drawTriangle3D( [0,0,1, 1,1,1, 1,0,1] );
    //     drawTriangle3D( [0,0,1, 1,1,1, 0,1,1] );
    
    //     gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
    
    //     drawTriangle3D( [1,0,1, 1,1,0, 1,0,0] );
    //     drawTriangle3D( [1,0,1, 1,1,0, 1,1,1] );
    //   }
}

// // Stores and handles all information for all shapes
// // Source: https://people.ucsc.edu/~cchen258/contest/
// const COLORS = {
//     WHITE: [1.0, 1.0, 1.0, 1.0], 
//     OFF_WHITE: [0.95, 0.95, 0.95, 1.0], 
//     BLUE_WHITE: [0.9, 0.95, 0.95, 1.0],
//     BLUE_GRAY: [0.9, 0.95, 1.0, 1.0],
//     CYAN_GRAY: [0.85, 0.9, 0.9, 1.0],
//     BLACK: [0.0, 0.0, 0.0, 1.0],
//     ORANGE: [1.0, 0.5, 0.0, 1.0],
//     GRAY: [0.75, 0.75, 0.75, 1.0]
//   }
// class Shape {
//     constructor(textureType = TEXTURES.DEBUG, color = COLORS.WHITE, origin = [0.5, 0.5, 0.5], baseMatrix) {
//       this.type = undefined;
  
//       // The point where the cube is rendered from. Values are measured relative to the front lower left corner
//       // Default is the center of the cube
//       this.origin = origin;
  
//       // The texture the cube will use
//       this.textureType = textureType;
  
//       // The color of the cube
//       this.color = color;
  
//       // Handles position, and rotation of the cube
//       if(!baseMatrix) {
//         this.matrix = new Matrix4();
//       } else if(baseMatrix.type && baseMatrix.type == "cube") {
//         this.matrix = new Matrix4(baseMatrix.matrix);
//         baseMatrix.children.push(this);
//       } else {
//         this.matrix = new Matrix4(baseMatrix);
//       }
  
//       // Stores the values used in transformations so they can be undone later
//       this.translations = [0, 0, 0];
//       this.rotations = [0, 0, 0];
  
//       // Handles the transformations of the cube (carried out in rendering)
//       this.scaleVals = [1, 1, 1];
  
//       // Keeps a reference to all objects that use this matrix
//       // Allows for propagation of changes
//       this.children = [];
//     }
  
//     // Transformations
//     translate(tx = 0, ty = 0, tz = 0, saveVals = true) {
//       if(saveVals) {
//         this.translations[0] += tx;
//         this.translations[1] += ty;
//         this.translations[2] += tz;
//       }
//       this.matrix.translate(tx, ty, tz);
//       this.propagate();
//     }
  
//     rotateX(deg = 0, saveVal = true) {
//       if(saveVal) {
//         this.rotations[0] += deg;
//       }
//       this.matrix.rotate(deg, 1, 0, 0);
//       this.propagate();
//     }
  
//     rotateY(deg = 0, saveVal = true) {
//       if(saveVal) {
//         this.rotations[1] += deg;
//       }
//       this.matrix.rotate(deg, 0, 1, 0);
//       this.propagate();
//     }
  
//     rotateZ(deg = 0, saveVal = true) {
//       if(saveVal) {
//         this.rotations[2] += deg;
//       }
//       this.matrix.rotate(deg, 0, 0, 1);
//       this.propagate();
//     }
  
//     // Stored seperately to avoid changing sub-objects
//     // (yes, I know this isn't how scaling normally works but this is my own class)
//     scale(sx = 1, sy = 1, sz = 1) {
//       this.scaleVals[0] *= sx;
//       this.scaleVals[1] *= sy;
//       this.scaleVals[2] *= sz;
//       this.propagate();
//     }
  
//     // Set transformations
//     // Source: https://people.ucsc.edu/~cchen258/contest/
//     // Sets the translation, rotation, or scale without effecting the other transformations
//     setTranslate(tx = 0, ty = 0, tz = 0) {
//       this.matrix.translate(tx - this.translations[0], ty - this.translations[1], tz - this.translations[2]);
//       this.translations[0] = tx;
//       this.translations[1] = ty;
//       this.translations[2] = tz;
//       this.propagate();
//     }
  
//     setRotateX(deg = 0) {
//       this.matrix.rotate(deg - this.rotations[0], 1, 0, 0);
//       this.rotations[0] = deg;
//       this.propagate();
//     }
  
//     setRotateY(deg = 0) {
//       this.matrix.rotate(deg - this.rotations[1], 0, 1, 0);
//       this.rotations[1] = deg;
//       this.propagate();
//     }
  
//     setRotateZ(deg = 0) {
//       this.matrix.rotate(deg - this.rotations[2], 0, 0, 1);
//       this.rotations[2] = deg;
//       this.propagate();
//     }
  
//     setScale(sx = 1, sy = 1, sz = 1) {
//       this.scaleVals[0] = sx;
//       this.scaleVals[1] = sy;
//       this.scaleVals[2] = sz;
//       this.propagate();
//     }
  
//     // Handle changes in heirarchy
//     propagate() {
//       for(let child of this.children) {
//         child.update(this.matrix);
//       }
//     }
  
//     update(newBase) {
//       this.matrix = new Matrix4(newBase);
//       this.translate(this.translations[0], this.translations[1], this.translations[2], false);
//       this.rotateX(this.rotations[0], false);
//       this.rotateY(this.rotations[1], false);
//       this.rotateZ(this.rotations[2], false);
  
//       // Scaling is handled seperately anyway, so there's no need to bother
//     }
  
//     // Abstract render function. To be overwritten in subclasses
//     render() {
//       throw "Called render on abstract Shape class"
//     }
//   }
  
//   // Cube
//   class Cube extends Shape {
//     constructor(textureType = TEXTURES.DEBUG, color = COLORS.WHITE, origin = [0.5, 0.5, 0.5], baseMatrix) {
//       super(textureType, color, origin, baseMatrix);
//       this.type = "cube";
//     }
  
//     // Draw
//     render() {
//       // Use the appropriate texture
//       gl.uniform1i(u_TextureMap, this.textureType);
  
//       // Set the color
//       gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
  
//       // Set the scale
//       // Performed last and using a copy to avoid influencing the scale of joined shapes
//       let newMat = new Matrix4(this.matrix);
//       newMat.scale(this.scaleVals[0], this.scaleVals[1], this.scaleVals[2]);
  
//       // Pass the now scaled matrix copy
//       gl.uniformMatrix4fv(u_ModelMatrix, false, newMat.elements);
  
//       let vertices = [];
//       let uv = [];
  
//       // Define the cube's back
//       vertices = vertices.concat([0 - this.origin[0], 0 - this.origin[1], 0 - this.origin[2],
//                                   1 - this.origin[0], 0 - this.origin[1], 0 - this.origin[2],
//                                   1 - this.origin[0], 1 - this.origin[1], 0 - this.origin[2]]);
//       uv = uv.concat([0,0, 1,0, 1,1]);
  
//       vertices = vertices.concat([0 - this.origin[0], 0 - this.origin[1], 0 - this.origin[2],
//                                   0 - this.origin[0], 1 - this.origin[1], 0 - this.origin[2],
//                                   1 - this.origin[0], 1 - this.origin[1], 0 - this.origin[2]]);
//       uv = uv.concat([0,0, 0,1, 1,1]);
  
//       // Define the cube's front
//       vertices = vertices.concat([1 - this.origin[0], 0 - this.origin[1], 1 - this.origin[2], 
//                                   0 - this.origin[0], 0 - this.origin[1], 1 - this.origin[2], 
//                                   0 - this.origin[0], 1 - this.origin[1], 1 - this.origin[2]]);
//       uv = uv.concat([0,0, 1,0, 1,1]);
//       vertices = vertices.concat([1 - this.origin[0], 0 - this.origin[1], 1 - this.origin[2], 
//                       1 - this.origin[0], 1 - this.origin[1], 1 - this.origin[2], 
//                       0 - this.origin[0], 1 - this.origin[1], 1 - this.origin[2]]);
//       uv = uv.concat([0,0, 0,1, 1,1]);
      
//       // Define the cube's top
//       vertices = vertices.concat([0 - this.origin[0], 1 - this.origin[1], 0 - this.origin[2], 
//                       0 - this.origin[0], 1 - this.origin[1], 1 - this.origin[2], 
//                       1 - this.origin[0], 1 - this.origin[1], 1 - this.origin[2]]);
//       uv = uv.concat([0,0, 0,1, 1,1]);
//       vertices = vertices.concat([0 - this.origin[0], 1 - this.origin[1], 0 - this.origin[2], 
//                       1 - this.origin[0], 1 - this.origin[1], 0 - this.origin[2], 
//                       1 - this.origin[0], 1 - this.origin[1], 1 - this.origin[2]]);
//       uv = uv.concat([0,0, 1,0, 1,1]);
  
//       // Define the cube's bottom
//       vertices = vertices.concat([0 - this.origin[0], 0 - this.origin[1], 1 - this.origin[2], 
//                       0 - this.origin[0], 0 - this.origin[1], 0 - this.origin[2], 
//                       1 - this.origin[0], 0 - this.origin[1], 0 - this.origin[2]]);
//       uv = uv.concat([0,0, 0,1, 1,1]);
//       vertices = vertices.concat([0 - this.origin[0], 0 - this.origin[1], 1 - this.origin[2], 
//                       1 - this.origin[0], 0 - this.origin[1], 1 - this.origin[2], 
//                       1 - this.origin[0], 0 - this.origin[1], 0 - this.origin[2]]);
//       uv = uv.concat([0,0, 1,0, 1,1]);
  
//       // Define the cube's sides
//       vertices = vertices.concat([0 - this.origin[0], 0 - this.origin[1], 1 - this.origin[2], 
//                       0 - this.origin[0], 0 - this.origin[1], 0 - this.origin[2], 
//                       0 - this.origin[0], 1 - this.origin[1], 0 - this.origin[2]]);
//       uv = uv.concat([0,0, 1,0, 1,1]);
//       vertices = vertices.concat([0 - this.origin[0], 0 - this.origin[1], 1 - this.origin[2], 
//                       0 - this.origin[0], 1 - this.origin[1], 1 - this.origin[2], 
//                       0 - this.origin[0], 1 - this.origin[1], 0 - this.origin[2]]);
//       uv = uv.concat([0,0, 0,1, 1,1]);
//       vertices = vertices.concat([1 - this.origin[0], 0 - this.origin[1], 0 - this.origin[2], 
//                       1 - this.origin[0], 0 - this.origin[1], 1 - this.origin[2], 
//                       1 - this.origin[0], 1 - this.origin[1], 1 - this.origin[2]]);
//       uv = uv.concat([0,0, 1,0, 1,1]);
//       vertices = vertices.concat([1 - this.origin[0], 0 - this.origin[1], 0 - this.origin[2], 
//                       1 - this.origin[0], 1 - this.origin[1], 0 - this.origin[2], 
//                       1 - this.origin[0], 1 - this.origin[1], 1 - this.origin[2]]);
//       uv = uv.concat([0,0, 0,1, 1,1]);
      
//       drawTriangles(vertices, uv);
//     }
//   }
  
//   // Render a cube
//   function drawCube(matrix = new Matrix4()) {
//     new Cube(COLORS.WHITE, [0.5, 0.5, 0.5], matrix).render();
//   }
  
//   // Render a triangle in 3D
//   function drawTriangles(vertices, uv) {
//     // Checks to ensure validity
//     console.assert(vertices.length % 3 == 0, "vertices does not have a multiple of 3 number of elements");
  
//     const NUM_VERTICES = vertices.length / 3;
//     const vertData = new Float32Array(vertices);
//     const uvData = new Float32Array(uv);
//     console.assert(vertData.BYTES_PER_ELEMENT == uvData.BYTES_PER_ELEMENT);
//     const FSIZE = uvData.BYTES_PER_ELEMENT;
  
//     // Bind the buffer object to the gl ARRAY_BUFFER
//     gl.bindBuffer(gl.ARRAY_BUFFER, g_VertexBuffer);
    
//     // Write data into the buffer object, tell the renderer what values to use, and enable the array on the variable
//     gl.bufferData(gl.ARRAY_BUFFER, vertData, gl.DYNAMIC_DRAW);
//     gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
//     gl.enableVertexAttribArray(a_Position);
  
//     if(uv) {
//       // More validity checks
//       console.assert(uv.length % 2 == 0, "vertices does not have an even number of elements");
//       console.assert(uv.length / 2 == vertices.length / 3, "vertices and uv do not describe the same number of vertices");
  
//       // Bind the buffer object to the gl ARRAY_BUFFER
//       gl.bindBuffer(gl.ARRAY_BUFFER, g_UVBuffer);
  
//       // Write data into the buffer object, tell the renderer what values to use, and enable the array on the variable
//       gl.bufferData(gl.ARRAY_BUFFER, uvData, gl.DYNAMIC_DRAW);
//       gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
//       gl.enableVertexAttribArray(a_UV);
//     }
  
//     gl.drawArrays(gl.TRIANGLES, 0, NUM_VERTICES);
//     return;
//   }