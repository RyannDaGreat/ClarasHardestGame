/** Original exported geometry + image textures, cached by source object. */
const previews = new Map();
const SIZE = 144,
  PADDING = 12;

/**
 * Original vertex paint takes precedence over material RGB, as in BGE.
 * @example
 * componentFaceColor({colors: [[255,0,0,255],[255,100,0,255]]}, null)
 * // => 'rgb(255 50 0)'
 * componentFaceColor({}, {r: 1, g: 0, b: 0}) // => 'rgb(255 0 0)'
 */
export function componentFaceColor(face, material) {
  if (face.colors?.length) {
    const rgb = [0, 1, 2].map((channel) =>
      Math.round(
        face.colors.reduce((sum, color) => sum + color[channel], 0) /
          face.colors.length,
      ),
    );
    return `rgb(${rgb.join(" ")})`;
  }
  return material
    ? `rgb(${material.r * 255} ${material.g * 255} ${material.b * 255})`
    : "#ffffff";
}

/** Render an original component assembly; returns null for invisible markers. */
export function componentThumbnail(source, library, textures) {
  if (previews.has(source))
    return previews.get(source)?.cloneNode(true) || null;
  const members = new Set([source]);
  let added = true;
  while (added) {
    added = false;
    for (const [name, object] of Object.entries(library.objects)) {
      if (members.has(object.parent) && !members.has(name)) {
        members.add(name);
        added = true;
      }
    }
  }
  // A rack's underground posts and long rail obscure its launcher at icon size.
  // Show the original working head as a detail, retaining the assembly label.
  let detail = [...members].find((name) => /FRC Projector/.test(name));
  if (/LaserRack/.test(source))
    detail = [...members].find((name) => /Still Turret/.test(name));
  if (detail) {
    members.clear();
    members.add(detail);
  }
  const faces = [];
  for (const name of members) {
    const object = library.objects[name],
      mesh = library.meshes[object.data];
    if (!mesh || object.restrictflag & 4) continue; // BGE render restriction.
    const matrix = new DOMMatrix(object.matrix);
    const vertices = mesh.vertices.map((v) => {
      const p = matrix.transformPoint(new DOMPoint(...v));
      return [p.x, p.y, p.z];
    });
    for (const face of mesh.faces) {
      if (face.mode & 1024) continue; // Original invisible collision/sensor face.
      const points = face.vertices.map((index) => vertices[index]);
      faces.push({
        face,
        material: library.materials[mesh.materials[face.material]],
        points,
        depth: points.reduce((sum, p) => sum + p[2], 0) / points.length,
      });
    }
  }
  if (!faces.length) {
    previews.set(source, null);
    return null;
  }
  // Use the game's top view so arrows keep their actual directions. Only
  // vertical disks need a side view to avoid an unrecognizable edge-on line.
  const worldPoints = faces.flatMap((f) => f.points);
  const spans = [0, 1, 2].map((axis) => {
    const values = worldPoints.map((p) => p[axis]);
    return Math.max(...values) - Math.min(...values);
  });
  const side = Math.min(spans[0], spans[1]) < spans[2] * 0.01;
  for (const item of faces) {
    item.points = item.points.map(([x, y, z]) =>
      side ? (spans[0] < spans[1] ? [y, -z, x] : [x, -z, y]) : [x, -y, z],
    );
    item.depth =
      item.points.reduce((sum, p) => sum + p[2], 0) / item.points.length;
  }
  const points = faces.flatMap((f) => f.points);
  const xs = points.map((p) => p[0]),
    ys = points.map((p) => p[1]);
  const left = Math.min(...xs),
    right = Math.max(...xs);
  const top = Math.min(...ys),
    bottom = Math.max(...ys);
  const scale = (SIZE - PADDING * 2) / Math.max(right - left, bottom - top);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  faces.sort((a, b) => a.depth - b.depth);
  for (const { face, material, points } of faces) {
    const pixels = points.map(([x, y]) => [
      (x - (left + right) / 2) * scale + SIZE / 2,
      (y - (top + bottom) / 2) * scale + SIZE / 2,
    ]);
    ctx.beginPath();
    ctx.moveTo(...pixels[0]);
    for (const p of pixels.slice(1)) ctx.lineTo(...p);
    ctx.closePath();
    ctx.fillStyle = componentFaceColor(face, material);
    ctx.fill();
    const texture = textures.get(face.image);
    if (texture && face.uv) {
      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      paintTexture(ctx, pixels, face.uv, texture.image);
      ctx.restore();
    }
  }
  const image = new Image();
  image.src = canvas.toDataURL();
  image.alt = "";
  image.className = "component-preview";
  image.setAttribute("aria-hidden", "true");
  previews.set(source, image);
  return image.cloneNode(true);
}

/** Paint original UV triangles, preserving repeating source texture coordinates. */
function paintTexture(ctx, points, uv, image) {
  const coords = Array.isArray(uv[0])
    ? uv
    : points.map((_, i) => uv.slice(i * 2, i * 2 + 2));
  const pixels = coords.map(([u, v]) => [
    u * image.width,
    (1 - v) * image.height,
  ]);
  for (const indices of points.length === 4
    ? [
        [0, 1, 2],
        [0, 2, 3],
      ]
    : [[0, 1, 2]]) {
    const [[u0, v0], [u1, v1], [u2, v2]] = indices.map((i) => pixels[i]);
    const [[x0, y0], [x1, y1], [x2, y2]] = indices.map((i) => points[i]);
    const du1 = u1 - u0,
      dv1 = v1 - v0,
      du2 = u2 - u0,
      dv2 = v2 - v0;
    const det = du1 * dv2 - du2 * dv1;
    if (Math.abs(det) < 1e-9) continue; // UVs can be intentionally degenerate.
    const a = ((x1 - x0) * dv2 - (x2 - x0) * dv1) / det;
    const b = ((y1 - y0) * dv2 - (y2 - y0) * dv1) / det;
    const c = ((x2 - x0) * du1 - (x1 - x0) * du2) / det;
    const d = ((y2 - y0) * du1 - (y1 - y0) * du2) / det;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.clip();
    ctx.transform(a, b, c, d, x0 - a * u0 - c * v0, y0 - b * u0 - d * v0);
    ctx.fillStyle = ctx.createPattern(image, "repeat");
    const minX = Math.min(u0, u1, u2),
      minY = Math.min(v0, v1, v2);
    ctx.fillRect(
      minX,
      minY,
      Math.max(u0, u1, u2) - minX,
      Math.max(v0, v1, v2) - minY,
    );
    ctx.restore();
  }
}
