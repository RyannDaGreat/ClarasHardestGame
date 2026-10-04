// Diagnostic: rotate scratch index buffers instead of rewriting one buffer per size.
const rings = new Map();
GL.getTempIndexBuffer = size => {
  const exponent = GL.log2ceilLookup(size);
  if (!rings.has(exponent)) rings.set(exponent, {next: 0, buffers: []});
  const ring = rings.get(exponent);
  const slot = ring.next++ % 128;
  if (!ring.buffers[slot]) {
    const previous = GLctx.getParameter(GLctx.ELEMENT_ARRAY_BUFFER_BINDING);
    const buffer = GLctx.createBuffer();
    GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, buffer);
    GLctx.bufferData(GLctx.ELEMENT_ARRAY_BUFFER, 2 ** exponent, GLctx.DYNAMIC_DRAW);
    GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, previous);
    ring.buffers[slot] = buffer;
  }
  return ring.buffers[slot];
};
