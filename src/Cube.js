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
        draw_calls += 1;
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