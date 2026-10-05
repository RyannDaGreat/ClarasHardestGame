/**
 * Project a world point into an overhead editor camera; output [screenX,screenY,depth].
 * The view's scale is pixels/world-unit at the ground-plane center.
 * >>> project([10,20,0], {x:0,y:0,scale:2}, [800,600], false)
 * [420,260,450]
 */
export function project(
  [x, y, z = 0],
  view,
  [width, height],
  perspective = false,
) {
  const distance = Math.max(300, (height / view.scale) * 1.5);
  const tilt = perspective ? Math.PI / 9 : 0;
  const c = Math.cos(tilt),
    s = Math.sin(tilt),
    dx = x - view.x,
    dy = y - view.y;
  const depth = distance + s * dy - c * z;
  const factor = perspective ? distance / Math.max(0.01, depth) : 1;
  return [
    width / 2 + dx * view.scale * factor,
    height / 2 - (c * dy + s * z) * view.scale * factor,
    depth,
  ];
}
/**
 * Intersect a screen ray with the horizontal plane z; inverse of project on that plane.
 * >>> unproject([420,260], {x:0,y:0,scale:2}, [800,600], false)
 * [10,20]
 */
export function unproject(
  [x, y],
  view,
  [width, height],
  perspective = false,
  z = 0,
) {
  const u = (x - width / 2) / view.scale,
    v = (height / 2 - y) / view.scale;
  if (!perspective) return [view.x + u, view.y + v];
  const distance = Math.max(300, (height / view.scale) * 1.5),
    tilt = Math.PI / 9;
  const c = Math.cos(tilt),
    s = Math.sin(tilt);
  const dy =
    (v * (distance - c * z) - distance * s * z) / (distance * c - v * s);
  return [view.x + (u * (distance + s * dy - c * z)) / distance, view.y + dy];
}
