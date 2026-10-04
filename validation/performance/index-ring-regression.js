const output = document.querySelector('#result');
const check = (condition, message) => {
  if (!condition) throw new Error(message);
};
const GL = {
  currentContext: null,
  log2ceilLookup: size => 32 - Math.clz32(size === 0 ? 0 : size - 1),
};
let GLctx;
// Direct eval deliberately uses the same GL/GLctx lexical interface as post-js.
const response = await fetch('../../runtime/browser-support.js');
check(response.ok, `Helper download failed: ${response.status}`);
eval(await response.text());

function prepare(canvas) {
  const gl = canvas.getContext('webgl', {antialias: false, preserveDrawingBuffer: true});
  check(gl, 'WebGL unavailable');
  const program = gl.createProgram();
  for (const [type, source] of [
    [gl.VERTEX_SHADER, 'attribute vec2 position; attribute vec3 color; varying vec3 pixelColor; void main(){gl_Position=vec4(position,0.,1.); pixelColor=color;}'],
    [gl.FRAGMENT_SHADER, 'precision mediump float; varying vec3 pixelColor; uniform float blue; void main(){gl_FragColor=vec4(pixelColor+vec3(0.,0.,blue),1.);}'],
  ]) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    check(gl.getShaderParameter(shader, gl.COMPILE_STATUS), gl.getShaderInfoLog(shader));
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  check(gl.getProgramParameter(program, gl.LINK_STATUS), gl.getProgramInfoLog(program));
  gl.useProgram(program);
  const vertices = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
  // Two identical covering triangles have different vertex colors. Changing
  // uploaded indices must select the right color even after a ring slot wraps.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1,-1, 1,0,0, 3,-1, 1,0,0, -1,3, 1,0,0,
    -1,-1, 0,1,0, 3,-1, 0,1,0, -1,3, 0,1,0,
  ]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  const color = gl.getAttribLocation(program, 'color');
  const vertexStride = 5 * Float32Array.BYTES_PER_ELEMENT;
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, vertexStride, 0);
  gl.enableVertexAttribArray(color);
  gl.vertexAttribPointer(color, 3, gl.FLOAT, false, vertexStride, 2 * Float32Array.BYTES_PER_ELEMENT);
  gl.enable(gl.SCISSOR_TEST);
  return {GLctx: gl, blue: gl.getUniformLocation(program, 'blue'), sentinel: gl.createBuffer(), seen: [new Set(), new Set()]};
}

function drawAndCheck(context, phase) {
  GL.currentContext = context;
  GLctx = context.GLctx;
  const gl = GLctx;
  const width = gl.canvas.width;
  const height = gl.canvas.height;
  const expected = new Uint8Array(width * height * 4);
  for (let pixel = 0; pixel < width * height; ++pixel) {
    const sizeClass = pixel % 2;
    const triangle = ((pixel >> 1) + phase) % 2;
    const indices = new Uint16Array((sizeClass ? [0,1,2,2,1,0] : [0,1,2]).map(index => index + triangle * 3));
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, context.sentinel);
    const buffer = GL.getTempIndexBuffer(indices.byteLength);
    check(gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING) === context.sentinel, 'Allocator changed caller element binding');
    context.seen[sizeClass].add(buffer);
    if (pixel < 2 && phase === 0) {
      check(context.seen[sizeClass].size === 1, 'Allocation must start lazily');
      check(context.tempIndexBufferRings[sizeClass ? 4 : 3].buffers.length === 1, 'Allocated unused ring slots eagerly');
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    check(gl.getBufferParameter(gl.ELEMENT_ARRAY_BUFFER, gl.BUFFER_SIZE) === (sizeClass ? 16 : 8), 'Incorrect rounded buffer size');
    gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, indices);
    const rgb = [1 - triangle, triangle, ((pixel >> 2) + phase) % 2];
    gl.uniform1f(context.blue, rgb[2]);
    gl.scissor(pixel % width, Math.floor(pixel / width), 1, 1);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    expected.set([...rgb.map(value => value * 255), 255], pixel * 4);
  }
  const actual = new Uint8Array(expected.length);
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, actual);
  check(actual.every((value, index) => value === expected[index]), `Pixel mismatch after ring reuse, phase ${phase}`);
  for (const seen of context.seen) check(seen.size === 128, `Expected bounded 128-buffer reuse, received ${seen.size}`);
  check(gl.getError() === gl.NO_ERROR, 'WebGL reported an error');
}

try {
  const contexts = [prepare(document.querySelector('#first')), prepare(document.querySelector('#second'))];
  for (let phase = 0; phase < 3; ++phase) {
    for (const context of contexts) drawAndCheck(context, phase);
  }
  for (const buffer of contexts[0].seen[0]) {
    check(!contexts[1].seen[0].has(buffer), 'Index buffer escaped its owning WebGL context');
  }
  window.indexRingRegression = {passed: true, contexts: 2, sizeClasses: 2, buffersPerSize: 128, draws: 3072, exactPixels: 3072, phases: 3};
  output.textContent = JSON.stringify(window.indexRingRegression, null, 2);
} catch (error) {
  window.indexRingRegression = {passed: false, error: String(error)};
  output.textContent = error.stack;
  throw error;
}
