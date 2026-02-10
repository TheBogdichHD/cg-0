const canvas = document.getElementById("glcanvas");
const gl = canvas.getContext("webgl");
if (!gl) {
  alert("WebGL not supported in this browser");
}

const vsSource = `
attribute vec3 aPosition;
attribute vec4 aColor;
attribute vec2 aTexCoord;

uniform mat4 uMVP;

varying vec4 vColor;
varying vec2 vTexCoord;

void main(void) {
  gl_Position = uMVP * vec4(aPosition, 1.0);
  vColor = aColor;
  vTexCoord = aTexCoord;
}
`;

const fsSource = `
precision mediump float;

varying vec4 vColor;
varying vec2 vTexCoord;

uniform sampler2D uSampler;
uniform bool uUseTexture;

void main(void) {
  if (uUseTexture) {
    gl_FragColor = texture2D(uSampler, vTexCoord);
  } else {
    gl_FragColor = vColor;
  }
}
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vsSource, fsSource) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

const program = createProgram(gl, vsSource, fsSource);
gl.useProgram(program);

const aPositionLoc = gl.getAttribLocation(program, "aPosition");
const aColorLoc = gl.getAttribLocation(program, "aColor");
const aTexCoordLoc = gl.getAttribLocation(program, "aTexCoord");

const uMVPLoc = gl.getUniformLocation(program, "uMVP");
const uSamplerLoc = gl.getUniformLocation(program, "uSampler");
const uUseTextureLoc = gl.getUniformLocation(program, "uUseTexture");

const positions = [
  // Front face (z = 1)
  -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,

  // Back face (z = -1)
  1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1, -1,

  // Top face (y = 1)
  -1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 1, -1,

  // Bottom face (y = -1)
  -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1,

  // Right face (x = 1)
  1, -1, 1, 1, -1, -1, 1, 1, -1, 1, 1, 1,

  // Left face (x = -1)
  -1, -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1,
];

const indices = [
  0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14,
  15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23,
];

function faceColor(r, g, b) {
  return [r, g, b, 1.0, r, g, b, 1.0, r, g, b, 1.0, r, g, b, 1.0];
}

const colorsCube1 = [
  ...faceColor(0, 1, 0),
  ...faceColor(0, 1, 0),
  ...faceColor(1, 0, 0),
  ...faceColor(1, 0, 0),
  ...faceColor(0, 0, 1),
  ...faceColor(0, 0, 1),
];

const colorsCube2 = new Array(colorsCube1.length).fill(1.0);

const texCoords = [
  // Front
  0, 0, 1, 0, 1, 1, 0, 1,
  // Back
  0, 0, 1, 0, 1, 1, 0, 1,
  // Top
  0, 0, 1, 0, 1, 1, 0, 1,
  // Bottom
  0, 0, 1, 0, 1, 1, 0, 1,
  // Right
  0, 0, 1, 0, 1, 1, 0, 1,
  // Left
  0, 0, 1, 0, 1, 1, 0, 1,
];

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

const colorBuffer1 = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer1);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorsCube1), gl.STATIC_DRAW);

const colorBuffer2 = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer2);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorsCube2), gl.STATIC_DRAW);

const texCoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(
  gl.ELEMENT_ARRAY_BUFFER,
  new Uint16Array(indices),
  gl.STATIC_DRAW,
);

const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);

const image = new Image();
image.src = "/src/texture.jpg";
image.onload = function () {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
};

const mat4 = glMatrix.mat4;

const projMatrix = mat4.create();
const viewMatrix = mat4.create();
const modelMatrix1 = mat4.create();
const modelMatrix2 = mat4.create();
const mvpMatrix = mat4.create();

const fov = (45 * Math.PI) / 180;
const aspect = canvas.clientWidth / canvas.clientHeight;
mat4.perspective(projMatrix, fov, aspect, 0.1, 100.0);

mat4.lookAt(viewMatrix, [0, 0, 7], [0, 0, 0], [0, 1, 0]);

gl.enable(gl.DEPTH_TEST);
gl.clearColor(0.1, 0.1, 0.1, 1.0);

function render(now) {
  now *= 0.001;

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //
  mat4.identity(modelMatrix1);
  mat4.translate(modelMatrix1, modelMatrix1, [-2.0, 0.0, 0.0]);
  mat4.rotateY(modelMatrix1, modelMatrix1, now);
  mat4.rotateX(modelMatrix1, modelMatrix1, now * 0.7);

  mat4.multiply(mvpMatrix, viewMatrix, modelMatrix1);
  mat4.multiply(mvpMatrix, projMatrix, mvpMatrix);

  gl.uniformMatrix4fv(uMVPLoc, false, mvpMatrix);
  gl.uniform1i(uUseTextureLoc, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.enableVertexAttribArray(aPositionLoc);
  gl.vertexAttribPointer(aPositionLoc, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer1);
  gl.enableVertexAttribArray(aColorLoc);
  gl.vertexAttribPointer(aColorLoc, 4, gl.FLOAT, false, 0, 0);

  gl.disableVertexAttribArray(aTexCoordLoc);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

  //
  mat4.identity(modelMatrix2);
  mat4.translate(modelMatrix2, modelMatrix2, [2.0, 0.0, 0.0]);
  mat4.rotateY(modelMatrix2, modelMatrix2, -now);
  mat4.rotateX(modelMatrix2, modelMatrix2, now * 0.5);

  mat4.multiply(mvpMatrix, viewMatrix, modelMatrix2);
  mat4.multiply(mvpMatrix, projMatrix, mvpMatrix);

  gl.uniformMatrix4fv(uMVPLoc, false, mvpMatrix);
  gl.uniform1i(uUseTextureLoc, 1);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.enableVertexAttribArray(aPositionLoc);
  gl.vertexAttribPointer(aPositionLoc, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer2);
  gl.enableVertexAttribArray(aColorLoc);
  gl.vertexAttribPointer(aColorLoc, 4, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.enableVertexAttribArray(aTexCoordLoc);
  gl.vertexAttribPointer(aTexCoordLoc, 2, gl.FLOAT, false, 0, 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(uSamplerLoc, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

  requestAnimationFrame(render);
}

requestAnimationFrame(render);
