/**
 * Build textured wall volumes in world units using original face attributes.
 * Input: mesh {vertices:[V,3],faces}, endpoints [2], width/height numbers.
 * Output: {vertices:[V,3],faces:[{vertices,templateFace,uv}]}.
 * >>> wallGeometry(mesh, [0,0], [20,0], 5).faces.length
 * 48 // four beam tiles, two visible junctions and two collision volumes
 */
export function wallGeometry(mesh, start, end, width, height = 2.5) {
  const length = Math.hypot(end[0] - start[0], end[1] - start[1]);
  if (!(length > 0 && width > 0))
    throw Error("A wall needs distinct endpoints and positive width.");
  const top = mesh.faces.findIndex(
    (f) => f.image?.includes("Guide") && !(f.mode & 1024),
  );
  const collision = mesh.faces.findIndex((f) => f.mode & 1024);
  const junction = mesh.faces.findIndex(
    (f) => f.image?.toLowerCase().includes("chrome") && !(f.mode & 1024),
  );
  if (top < 0 || collision < 0 || junction < 0)
    throw Error(
      "Wall template lacks original beam, collision or junction faces.",
    );
  const vertices = [[0, 0, 0]],
    faces = [];
  const ux = (end[0] - start[0]) / length,
    uy = (end[1] - start[1]) / length;
  function box(cx, cy, long, wide, zlow, zhigh, faceTop, faceSide) {
    const offset = vertices.length;
    for (const z of [zlow, zhigh])
      for (const [x, y] of [
        [-long / 2, -wide / 2],
        [long / 2, -wide / 2],
        [long / 2, wide / 2],
        [-long / 2, wide / 2],
      ])
        vertices.push([cx + x * ux - y * uy, cy + x * uy + y * ux, z]);
    for (const [indices, templateFace] of [
      [[4, 5, 6, 7], faceTop],
      [[3, 2, 1, 0], faceSide],
      [[0, 1, 5, 4], faceSide],
      [[1, 2, 6, 5], faceSide],
      [[2, 3, 7, 6], faceSide],
      [[3, 0, 4, 7], faceSide],
    ])
      faces.push({
        vertices: indices.map((i) => i + offset),
        templateFace,
        uv: [
          [0, 0],
          [0, 1],
          [1, 1],
          [1, 0],
        ],
      });
  }
  const segments = Math.ceil(length / width),
    step = length / segments;
  // Original walls extend deeply below the play plane; preserve that collision volume.
  const collisionBottom = -110;
  for (let i = 0; i < segments; i++) {
    const distance = (i + 0.5) * step;
    box(
      start[0] + distance * ux,
      start[1] + distance * uy,
      step,
      width,
      collisionBottom,
      0,
      top,
      collision,
    );
  }
  for (const p of [start, end]) {
    box(p[0], p[1], width, width, 0, height, junction, junction);
    box(p[0], p[1], width, width, collisionBottom, 0, collision, collision);
  }
  return { vertices, faces };
}

/**
 * Find faces wholly inside the XY footprint of selected convex faces.
 * Vertical sides and hidden bottoms are included, so carving opens collision too.
 * >>> containedFaces([[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,-4],[1,0,-4]],
 * ... [{vertices:[0,1,2,3]},{vertices:[0,4,5,1]}], [0])
 * [0,1]
 */
export function containedFaces(vertices, faces, selected) {
  const tolerance = 1e-5;
  const footprints = selected.map((i) =>
    faces[i].vertices.map((v) => vertices[v]),
  );
  return faces.flatMap((face, index) =>
    footprints.some((polygon) =>
      face.vertices.every((v) => {
        const point = vertices[v];
        let positive = false,
          negative = false;
        for (let i = 0; i < polygon.length; i++) {
          const a = polygon[i],
            b = polygon[(i + 1) % polygon.length];
          const cross =
            (b[0] - a[0]) * (point[1] - a[1]) -
            (b[1] - a[1]) * (point[0] - a[0]);
          positive ||= cross > tolerance;
          negative ||= cross < -tolerance;
        }
        return !(positive && negative);
      }),
    )
      ? [index]
      : [],
  );
}
