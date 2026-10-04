// Emscripten 3.1.74 FULL_ES2 client indices otherwise rewrite one GPU buffer
// per size on every draw. A ring avoids measured ANGLE synchronization stalls.
// Match the existing vertex pool's two sets of 64 buffers; allocate lazily.
(() => {
  const buffersPerSize = 128;
  GL.getTempIndexBuffer = sizeBytes => {
    const context = GL.currentContext;
    const exponent = GL.log2ceilLookup(sizeBytes);
    const rings = context.tempIndexBufferRings || (context.tempIndexBufferRings = []);
    const ring = rings[exponent] || (rings[exponent] = {next: 0, buffers: []});
    const slot = ring.next;
    ring.next = (slot + 1) % buffersPerSize;
    if (!ring.buffers[slot]) {
      const previous = GLctx.getParameter(GLctx.ELEMENT_ARRAY_BUFFER_BINDING);
      const buffer = GLctx.createBuffer();
      if (!buffer) throw new Error('Unable to allocate temporary WebGL index buffer.');
      GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, buffer);
      GLctx.bufferData(GLctx.ELEMENT_ARRAY_BUFFER, 2 ** exponent, GLctx.DYNAMIC_DRAW);
      GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, previous);
      ring.buffers[slot] = buffer;
    }
    return ring.buffers[slot];
  };
})();
