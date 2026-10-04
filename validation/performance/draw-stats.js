// Diagnostic census of calls in one rendered frame; runs before the timed sample.
const gl = GL.currentContext.GLctx;
const stats = {calls: {}, shaders: GL.shaders.filter(Boolean).map(shader => gl.getShaderSource(shader))};
const saved = {};
const names = ['drawArrays','drawElements','bufferData','bufferSubData','copyTexImage2D','copyTexSubImage2D','readPixels','finish','flush'];
for (const name of names) {
  saved[name] = gl[name];
  gl[name] = function(...args) {
    const row = stats.calls[name] ||= {count: 0, elements: 0, bytes: 0};
    row.count++;
    if (name === 'drawElements') row.elements += args[1];
    if (name === 'drawArrays') row.elements += args[2];
    if (name === 'bufferData') row.bytes += typeof args[1] === 'number' ? args[1] : args[1].byteLength;
    if (name === 'bufferSubData') row.bytes += args[2].byteLength;
    return saved[name].apply(this, args);
  };
}
const run = MainLoop.runIter;
MainLoop.runIter = function(func) {
  run.call(this, func);
  if (stats.calls.drawElements || stats.calls.drawArrays) {
    for (const name of names) gl[name] = saved[name];
    MainLoop.runIter = run;
    window.drawStats = stats;
  }
};
