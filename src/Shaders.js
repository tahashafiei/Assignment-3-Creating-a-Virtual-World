var VSHADER_SOURCE = `
precision mediump float;

attribute vec4 a_Position;
attribute vec2 a_UV;
attribute vec3 a_Normal;

uniform mat4 u_ModelMatrix;
uniform mat4 u_NormalMatrix;
uniform mat4 u_ViewProjectionMatrix;

varying vec2 v_UV;
varying vec3 v_Position;
varying vec4 v_Normal;

  void main() {
    gl_Position = u_ViewProjectionMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Position = vec3(u_ModelMatrix * a_Position);
    v_Normal = normalize(u_NormalMatrix * vec4(a_Normal, 1.0));
  }`

// Fragment shader program              
var FSHADER_SOURCE = `
  precision mediump float;
  
  uniform vec4 u_FragColor;
  uniform vec3 u_LightPosition;
  uniform vec4 u_Eye;

  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;

  uniform int u_TextureMap;

  varying vec2 v_UV;
  varying vec3 v_Position;
  varying vec4 v_Normal;
  varying float v_Dist;

  float near = 0.1;
  float far = 100.0;
  float linearizedDepthValue(float depth) {
    return (2.0 * near *far) / (far + near - (depth * 2.0 - 1.0) * (far - near));
  }

  float logisticDepth(float depth) {
    float steepness = 0.5;
    float offset = 10.0;
    float zVal = linearizedDepthValue(depth);
    return (1.0 / (1.0 + exp(-steepness * zVal - offset)));
  }

  void main() {

    // Textures
    vec4 color;
    if (u_TextureMap == 0) {                         // Use color
        color = u_FragColor;
    } else if (u_TextureMap == 1) {                  // Use UV debug color
        color = texture2D(u_Sampler0, v_UV);
    } else if (u_TextureMap == 2) {                   // Use Texture0
        color = texture2D(u_Sampler1, v_UV);
    } else if (u_TextureMap == 3) {
        color = texture2D(u_Sampler2, v_UV);
    } else {                                            // Error, put Redish
        gl_FragColor = vec4(1, .2, .2, 1);
    }

    // Lighting
    vec3 incident_vector = normalize(v_Position - u_LightPosition);
    vec3 light_vector = -incident_vector;
    float diffuse = max(dot(light_vector, v_Normal.xyz), 0.0);
    float ambient = 0.3;

    if (u_LightPosition.y < 0.0) {
      diffuse = diffuse * (1.0/(1.0 - u_LightPosition.y));
      ambient = max(ambient * (1.0/(1.0 - u_LightPosition.y)), 0.1);
    }

    gl_FragColor = vec4(color.rgb, color.a);
  }`
