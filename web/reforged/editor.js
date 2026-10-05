import { wallGeometry, containedFaces } from "./geometry.js";
const $ = (selector) => document.querySelector(selector);
const canvas = $("#map"),
  context = canvas.getContext("2d");
const colors = getComputedStyle(document.documentElement);
const color = (name) => colors.getPropertyValue("--" + name).trim();
const STORAGE = "reforged-workshop-v1",
  PLAY_STORAGE = "reforged-play-v1";
const MAX_HISTORY = 80,
  PICK_RADIUS = 9,
  MIN_SCALE = 0.25,
  MAX_SCALE = 50;
const state = {
  level: null,
  library: null,
  selected: null,
  tool: "select",
  placement: null,
  history: [],
  future: [],
  view: { x: 0, y: 0, scale: 3 },
  drag: null,
  space: false,
};
const textures = new Map(),
  blueprints = new Map();
let matrices = new Map(),
  shapes = [],
  renderPending = false;
/** Independent JSON clone: >>> clone({x:[1,2]}).x → [1,2]. */
const clone = (value) => structuredClone(value);
function report(error) {
  console.error(error);
  $("#notice").textContent = error.message || String(error);
  $("#notice").hidden = false;
}
$("#notice").onclick = () => ($("#notice").hidden = true);
window.addEventListener("error", (event) =>
  report(event.error || event.message),
);
window.addEventListener("unhandledrejection", (event) => report(event.reason));
async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw Error(`${url}: HTTP ${response.status}`);
  return response.json();
}
function snapshot() {
  return JSON.stringify(state.level);
}
function checkpoint() {
  state.history.push(snapshot());
  if (state.history.length > MAX_HISTORY) state.history.shift();
  state.future = [];
}
function changed() {
  validate(state.level);
  localStorage.setItem(STORAGE, snapshot());
  $("#save-state").textContent = "Saved in this browser";
  $("#undo").disabled = !state.history.length;
  $("#redo").disabled = !state.future.length;
  matrices.clear();
  render();
}
function mutate(action) {
  const before = snapshot();
  checkpoint();
  try {
    action();
    validate(state.level);
  } catch (error) {
    state.level = JSON.parse(before);
    state.history.pop();
    matrices.clear();
    syncControls();
    inspect();
    objectList();
    render();
    report(error);
    return;
  }
  changed();
  inspect();
  objectList();
  palette();
}
function restore(from, to) {
  if (!from.length) return;
  to.push(snapshot());
  state.level = JSON.parse(from.pop());
  state.selected = null;
  syncControls();
  changed();
  inspect();
  objectList();
}
function validate(level) {
  if (
    level?.format !== "reforged" ||
    level.version !== 1 ||
    !Array.isArray(level.objects)
  )
    throw Error("Expected a Reforged version 1 JSON level.");
  if (!state.library.blueprints.some((b) => b.scene === level.scene))
    throw Error("Unknown original template scene.");
  if (
    !(
      Number.isFinite(level.grid?.spacing) &&
      level.grid.spacing > 0 &&
      Number.isInteger(level.grid.subdivisions) &&
      level.grid.subdivisions >= 1 &&
      level.grid.subdivisions <= 64
    )
  )
    throw Error("Grid spacing must be positive; subdivisions must be 1–64.");
  if (
    !Array.isArray(level.grid.origin) ||
    level.grid.origin.length !== 2 ||
    !level.grid.origin.every(Number.isFinite)
  )
    throw Error("Grid origin requires finite X and Y coordinates.");
  const ids = new Set();
  for (const o of level.objects) {
    if (
      typeof o.id !== "string" ||
      !/^OB[^/]{1,21}$/.test(o.id) ||
      ids.has(o.id)
    )
      throw Error("Object IDs must be unique and start with OB.");
    ids.add(o.id);
    if (!state.library.objects[o.source])
      throw Error("Unknown component template: " + o.source);
    for (const key of ["position", "rotation", "scale"])
      if (
        !Array.isArray(o[key]) ||
        o[key].length !== 3 ||
        !o[key].every(Number.isFinite)
      )
        throw Error(`${o.id}: invalid ${key}`);
    if (o.scale.some((v) => Math.abs(v) < 1e-6))
      throw Error(`${o.id}: scale must not be zero`);
    if (typeof o.active !== "boolean" || !o.logic)
      throw Error(`${o.id}: missing component configuration`);
  }
  if (!ids.has(level.camera))
    throw Error("The level needs its original camera.");
  const objects = new Map(level.objects.map((o) => [o.id, o]));
  for (const o of level.objects) {
    const seen = new Set([o.id]);
    let parent = o.parent;
    while (parent) {
      if (!objects.has(parent) || seen.has(parent))
        throw Error("Missing or cyclic parent: " + o.id);
      seen.add(parent);
      parent = objects.get(parent).parent;
    }
    for (const [kind, bricks] of Object.entries(o.logic))
      for (const b of bricks) {
        for (const link of b.links || []) {
          const [id, targetKind, name] = link.split("/");
          if (!objects.get(id)?.logic[targetKind]?.some((x) => x.name === name))
            throw Error("Broken connection: " + link);
        }
        for (const target of Object.values(b.references || {}))
          if (target?.startsWith("OB") && !ids.has(target))
            throw Error("Missing connection target: " + target);
      }
  }
  return level;
}
function object(id) {
  return state.level.objects.find((o) => o.id === id);
}
function metadata(o) {
  return state.library.objects[o.source];
}
function rootOf(o) {
  while (o.parent) o = object(o.parent);
  return o;
}
function descendants(id) {
  return state.level.objects.filter((o) => {
    let p = o;
    while (p) {
      if (p.id === id) return true;
      p = object(p.parent);
    }
    return false;
  });
}
/** XYZ Euler transform: >>> trs([2,3,0],[0,0,0],[1,1,1]).m41 → 2. */
function trs(position, rotation, scale) {
  const degrees = 180 / Math.PI;
  return new DOMMatrix()
    .translate(...position)
    .rotateAxisAngle(0, 0, 1, rotation[2] * degrees)
    .rotateAxisAngle(0, 1, 0, rotation[1] * degrees)
    .rotateAxisAngle(1, 0, 0, rotation[0] * degrees)
    .scale(...scale);
}
function worldMatrix(o) {
  if (matrices.has(o.id)) return matrices.get(o.id);
  const source = metadata(o),
    local = trs(o.position, o.rotation, o.scale);
  let result = local;
  if (o.parent) {
    const p = object(o.parent),
      originalParent = state.library.objects[source.parent];
    if (!originalParent)
      throw Error("Parent template unavailable: " + source.parent);
    const inverseParent = new DOMMatrix(originalParent.matrix)
      .inverse()
      .multiply(new DOMMatrix(source.matrix))
      .multiply(trs(source.loc, source.rotation, source.scale).inverse());
    result = worldMatrix(p).multiply(inverseParent).multiply(local);
  }
  matrices.set(o.id, result);
  return result;
}
function point(matrix, xyz) {
  const p = matrix.transformPoint(new DOMPoint(...xyz));
  return [p.x, p.y, p.z];
}
function screen(x, y) {
  return [
    (x - state.view.x) * state.view.scale + canvas.clientWidth / 2,
    canvas.clientHeight / 2 - (y - state.view.y) * state.view.scale,
  ];
}
function world(x, y) {
  return [
    (x - canvas.clientWidth / 2) / state.view.scale + state.view.x,
    (canvas.clientHeight / 2 - y) / state.view.scale + state.view.y,
  ];
}
function snapped(x) {
  const step = state.level.grid.spacing / state.level.grid.subdivisions;
  return state.level.grid.snap ? Math.round(x / step) * step : x;
}
function family(o) {
  const m = metadata(o),
    name = o.source.toLowerCase(),
    props = m.properties;
  if (m.type === 11) return "Camera";
  if (m.type === 10) return "Light";
  if (name.includes("spawnpoint")) return "Start";
  if (name.includes("finish")) return "Finish";
  if (name.includes("portal")) return "Portal";
  if (name.includes("grid")) return "Wall";
  if (name.includes("plane") && props.includes("Ice")) return "Floor";
  if (name.includes("laserrack")) return "Turret";
  if (name.includes("forcefield") || name.includes("frcprojector"))
    return "Forcefield";
  if (props.includes("Switch") || name.includes("switch")) return "Switch";
  if (name.includes("killer") || name.includes("zapper"))
    return "Moving hazard";
  if (
    name.includes("laserplatform") ||
    name.includes("launcher") ||
    name.includes("turret")
  )
    return "Turret";
  if (
    props.includes("Ice") ||
    props.includes("Muck") ||
    name.includes("icer") ||
    name.includes("mucker")
  )
    return "Floor";
  if (props.some((p) => p.startsWith("Spd")) || name.includes("push"))
    return "Push";
  if (props.includes("Ball")) return "Hazard";
  if (props.includes("Walrus")) return "Player";
  if (props.includes("Power") || name.includes("power")) return "Power";
  if (props.includes("Wall")) return "Wall";
  if (m.type !== 1) return "Utility";
  if (name.includes("sphere") || name.includes("background"))
    return "Background";
  return "Prop";
}
function label(o) {
  return o.label || o.source.replace(/^OB/, "").replace(/\.\d+$/, "");
}
function visible(o) {
  return o.active || $("#show-inactive").checked;
}
function render() {
  if (renderPending) return;
  renderPending = true;
  requestAnimationFrame(draw);
}
function draw() {
  renderPending = false;
  if (!state.level) return;
  const ratio = devicePixelRatio,
    w = canvas.clientWidth,
    h = canvas.clientHeight;
  if (
    canvas.width !== Math.round(w * ratio) ||
    canvas.height !== Math.round(h * ratio)
  ) {
    canvas.width = Math.round(w * ratio);
    canvas.height = Math.round(h * ratio);
  }
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.fillStyle = color("bg");
  context.fillRect(0, 0, w, h);
  shapes = [];
  const grid = state.level.grid.spacing,
    minor = grid / state.level.grid.subdivisions,
    step = minor * state.view.scale >= 8 ? minor : grid;
  const [left, bottom] = world(0, h),
    [right, top] = world(w, 0);
  context.strokeStyle = color("map-grid");
  context.lineWidth = 1;
  context.beginPath();
  for (let x = Math.ceil(left / step) * step; x < right; x += step) {
    const sx = screen(x, 0)[0];
    context.moveTo(sx, 0);
    context.lineTo(sx, h);
  }
  for (let y = Math.ceil(bottom / step) * step; y < top; y += step) {
    const sy = screen(0, y)[1];
    context.moveTo(0, sy);
    context.lineTo(w, sy);
  }
  context.stroke();
  const drawn = state.level.objects
    .filter(visible)
    .filter(
      (o) => !["Background", "Camera", "Light", "Utility"].includes(family(o)),
    )
    .sort((a, b) => worldMatrix(a).m43 - worldMatrix(b).m43);
  for (const o of drawn) drawObject(o);
  for (const o of state.level.objects.filter(
    (o) => visible(o) && ["Start", "Finish"].includes(family(o)),
  ))
    drawMarker(o);
  if ($("#links").checked) drawLinks();
  if (state.selected) {
    const selected = object(state.selected);
    if (selected) {
      const members = new Set(descendants(selected.id).map((o) => o.id));
      context.strokeStyle = color("selected");
      context.lineWidth = 2;
      for (const shape of shapes.filter((s) => members.has(s.id))) {
        context.stroke(shape.path);
      }
      const p = screen(...point(worldMatrix(selected), [0, 0, 0]));
      context.beginPath();
      context.arc(...p, 6, 0, Math.PI * 2);
      context.stroke();
      if (state.tool === "vertex") drawVertices(selected);
    }
  }
  $("#zoom-label").textContent = Math.round((state.view.scale * 100) / 3) + "%";
}
function drawObject(o) {
  const m = metadata(o),
    mesh = state.library.meshes[m.data];
  if (!mesh) return;
  const matrix = worldMatrix(o),
    verts = (o.geometry?.vertices || mesh.vertices).map((v) =>
      screen(...point(matrix, v)),
    );
  const disabled = new Set(o.geometry?.disabledFaces || []);
  const combined = new Path2D();
  let count = 0;
  context.globalAlpha = o.active ? 1 : 0.28;
  const faces =
    o.geometry?.faces?.map((f) => ({ ...mesh.faces[f.templateFace], ...f })) ||
    mesh.faces;
  for (let i = 0; i < faces.length; i++) {
    const f = faces[i];
    if (disabled.has(i) || f.mode & 1024) continue;
    const points = f.vertices.map((index) => verts[index]);
    if (points.some((p) => !p))
      throw Error("Mesh face references missing vertex");
    const path = new Path2D();
    path.moveTo(...points[0]);
    for (const p of points.slice(1)) path.lineTo(...p);
    path.closePath();
    combined.addPath(path);
    const image = f.image || "",
      kind = family(o);
    context.fillStyle =
      image.toLowerCase().includes("ice") || image.includes("Gloop")
        ? color("floor")
        : image.includes("Guide")
          ? color("wall")
          : image.toLowerCase().includes("chrome")
            ? color("junction")
            : kind === "Portal"
              ? color("portal")
              : kind === "Floor"
                ? color("floor")
                : kind === "Finish"
                  ? color("goal")
                  : kind === "Player"
                    ? color("player")
                    : ["Hazard", "Moving hazard", "Turret"].includes(kind)
                      ? color("hazard")
                      : color("junction");
    context.fill(path);
    if (textures.has(image)) drawTexture(points, f.uv, textures.get(image));
    count++;
  }
  context.globalAlpha = 1;
  if (count) shapes.push({ id: o.id, path: combined });
}
/** Map three texture-space points [3,2] to screen [3,2].
 * >>> textureTransform([[0,0],[1,0],[0,1]], [[2,3],[4,3],[2,5]])
 * [2,0,0,2,2,3]
 */
function textureTransform(uv, p) {
  const [[u0, v0], [u1, v1], [u2, v2]] = uv,
    [[x0, y0], [x1, y1], [x2, y2]] = p;
  const du1 = u1 - u0,
    dv1 = v1 - v0,
    du2 = u2 - u0,
    dv2 = v2 - v0,
    det = du1 * dv2 - du2 * dv1;
  if (Math.abs(det) < 1e-9) return null;
  const a = ((x1 - x0) * dv2 - (x2 - x0) * dv1) / det,
    c = ((x2 - x0) * du1 - (x1 - x0) * du2) / det;
  const b = ((y1 - y0) * dv2 - (y2 - y0) * dv1) / det,
    d = ((y2 - y0) * du1 - (y1 - y0) * du2) / det;
  return [a, b, c, d, x0 - a * u0 - c * v0, y0 - b * u0 - d * v0];
}
function drawTexture(points, uv, texture) {
  if (!uv) return;
  const coords = Array.isArray(uv[0])
    ? uv
    : points.map((_, i) => uv.slice(i * 2, i * 2 + 2));
  const pixels = coords.map(([u, v]) => [
    u * texture.image.width,
    (1 - v) * texture.image.height,
  ]);
  for (const indices of points.length === 4
    ? [
        [0, 1, 2],
        [0, 2, 3],
      ]
    : [[0, 1, 2]]) {
    const source = indices.map((i) => pixels[i]),
      target = indices.map((i) => points[i]),
      transform = textureTransform(source, target);
    if (!transform) continue;
    context.save();
    context.beginPath();
    context.moveTo(...target[0]);
    context.lineTo(...target[1]);
    context.lineTo(...target[2]);
    context.closePath();
    context.clip();
    context.transform(...transform);
    context.fillStyle = texture.pattern;
    const xs = source.map((p) => p[0]),
      ys = source.map((p) => p[1]);
    context.fillRect(
      Math.min(...xs),
      Math.min(...ys),
      Math.max(...xs) - Math.min(...xs),
      Math.max(...ys) - Math.min(...ys),
    );
    context.restore();
  }
}
function drawMarker(o) {
  const p = screen(...point(worldMatrix(o), [0, 0, 0]));
  context.fillStyle = family(o) === "Start" ? color("player") : color("goal");
  context.beginPath();
  context.arc(...p, 8, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = color("ink");
  context.font = "11px system-ui";
  context.fillText(family(o).toUpperCase(), p[0] + 12, p[1] - 10);
}
function crossLinks(root) {
  const members = descendants(root.id),
    ids = new Set(members.map((o) => o.id));
  return members.flatMap((o) =>
    o.logic.controllers.flatMap((b) =>
      (b.links || [])
        .map((link, index) => ({
          owner: o,
          brick: b,
          index,
          link,
          target: object(link.split("/")[0]),
        }))
        .filter((l) => l.target && !ids.has(l.target.id) && l.target.active),
    ),
  );
}
function drawLinks() {
  const selected = state.selected && rootOf(object(state.selected));
  const roots = state.level.objects.filter((o) => !o.parent && o.active);
  for (const root of roots) {
    for (const link of crossLinks(root)) {
      const target = rootOf(link.target);
      const a = screen(...point(worldMatrix(root), [0, 0, 0])),
        b = screen(...point(worldMatrix(target), [0, 0, 0]));
      if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 10) continue;
      context.strokeStyle = color("cyan");
      context.globalAlpha = selected && selected.id !== root.id ? 0.18 : 0.7;
      context.lineWidth = selected?.id === root.id ? 2 : 1;
      context.setLineDash([5, 5]);
      context.beginPath();
      context.moveTo(...a);
      context.lineTo(...b);
      context.stroke();
      context.setLineDash([]);
      const angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
      context.beginPath();
      context.moveTo(...b);
      context.lineTo(
        b[0] - 10 * Math.cos(angle - 0.4),
        b[1] - 10 * Math.sin(angle - 0.4),
      );
      context.moveTo(...b);
      context.lineTo(
        b[0] - 10 * Math.cos(angle + 0.4),
        b[1] - 10 * Math.sin(angle + 0.4),
      );
      context.stroke();
    }
  }
  context.globalAlpha = 1;
}
function drawVertices(o) {
  const mesh = state.library.meshes[metadata(o).data];
  if (!mesh) return;
  context.fillStyle = color("selected");
  for (const v of o.geometry?.vertices || mesh.vertices) {
    const p = screen(...point(worldMatrix(o), v));
    context.fillRect(p[0] - 2, p[1] - 2, 4, 4);
  }
}
function fit() {
  matrices.clear();
  const points = [];
  for (const o of state.level.objects.filter(
    (o) =>
      o.active &&
      !o.parent &&
      !["Background", "Camera", "Light", "Utility"].includes(family(o)),
  )) {
    const mesh = state.library.meshes[metadata(o).data];
    if (mesh && family(o) === "Wall")
      for (const v of o.geometry?.vertices || mesh.vertices)
        points.push(point(worldMatrix(o), v));
    else points.push(point(worldMatrix(o), [0, 0, 0]));
  }
  if (!points.length) return;
  const xs = points.map((p) => p[0]),
    ys = points.map((p) => p[1]),
    minx = Math.min(...xs),
    maxx = Math.max(...xs),
    miny = Math.min(...ys),
    maxy = Math.max(...ys);
  state.view = {
    x: (minx + maxx) / 2,
    y: (miny + maxy) / 2,
    scale: Math.min(
      canvas.clientWidth / (maxx - minx + 30),
      canvas.clientHeight / (maxy - miny + 30),
    ),
  };
  render();
}
function addWall(start, end) {
  const source = "OBGrid.014",
    mesh = state.library.meshes[state.library.objects[source].data];
  mutate(() => {
    const id = "OB" + crypto.randomUUID().replaceAll("-", "").slice(0, 18);
    state.level.objects.push({
      id,
      source,
      label: "Drawn wall",
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      parent: null,
      active: true,
      logic: { sensors: [], controllers: [], actuators: [] },
      geometry: wallGeometry(mesh, start, end, state.level.grid.spacing),
    });
    state.selected = id;
  });
}
function select(id) {
  state.selected = id;
  inspect();
  objectList();
  render();
  $("#selection-status").textContent = id
    ? label(object(id)) + " · " + family(object(id))
    : "Nothing selected";
}
function input(labelText, value, onchange, type = "number") {
  const label = document.createElement("label");
  label.textContent = labelText;
  const field = document.createElement("input");
  field.type = type;
  field.value = value;
  if (type === "number") field.step = "any";
  field.onchange = () => {
    const value = type === "number" ? Number(field.value) : field.value;
    mutate(() => onchange(value));
  };
  label.append(field);
  return label;
}
function selector(options, value, onchange) {
  const select = document.createElement("select");
  for (const [key, label] of options) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = label;
    select.append(option);
  }
  select.value = value;
  select.onchange = () => mutate(() => onchange(select.value));
  return select;
}
function inspect() {
  const panel = $("#inspector");
  panel.replaceChildren();
  const o = state.selected && object(state.selected);
  if (!o) {
    panel.innerHTML =
      '<p class="empty">Select a component on the map.<br><br>Place components from the palette. Connect portals and switches here.</p>';
    return;
  }
  const title = document.createElement("h1");
  title.textContent = label(o);
  panel.append(title);
  const hint = document.createElement("p");
  hint.className = "small";
  hint.textContent = family(o) + " · " + o.id;
  panel.append(
    hint,
    input("Label", label(o), (value) => (o.label = value), "text"),
  );
  for (const [key, name] of [
    ["position", "Position"],
    ["rotation", "Rotation · degrees"],
    ["scale", "Scale"],
  ]) {
    const heading = document.createElement("h2");
    heading.textContent = name;
    panel.append(heading);
    const row = document.createElement("div");
    row.className = "row";
    for (let i = 0; i < 3; i++)
      row.append(
        input(
          "XYZ"[i],
          Number(
            (o[key][i] * (key === "rotation" ? 180 / Math.PI : 1)).toFixed(4),
          ),
          (value) =>
            (o[key][i] = value * (key === "rotation" ? Math.PI / 180 : 1)),
        ),
      );
    panel.append(row);
  }
  const active = document.createElement("label");
  active.className = "inline";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = o.active;
  checkbox.onchange = () =>
    mutate(() => {
      for (const member of descendants(o.id)) member.active = checkbox.checked;
    });
  active.append(checkbox, "Active in game");
  panel.append(active);
  const actions = document.createElement("div");
  actions.className = "actions";
  for (const [text, action] of [
    ["Duplicate", () => duplicate(o)],
    ["Delete", () => remove(o)],
  ]) {
    const button = document.createElement("button");
    button.textContent = text;
    button.onclick = action;
    actions.append(button);
  }
  panel.append(actions);
  const root = rootOf(o),
    links = crossLinks(root);
  const parts = descendants(root.id);
  if (parts.length > 1) {
    const partSelect = document.createElement("select");
    partSelect.setAttribute("aria-label", "Component part");
    for (const part of parts)
      partSelect.add(new Option(label(part) + " · " + part.id, part.id));
    partSelect.value = o.id;
    partSelect.onchange = () => select(partSelect.value);
    panel.append(partSelect);
  }
  if (family(root) === "Portal") {
    const outputs = state.level.objects.filter(
      (x) => x.active && x.source.includes("PortalOut"),
    );
    const portalLinks = links.filter((l) =>
      l.target.source.includes("PortalOut"),
    );
    const heading = document.createElement("h2");
    heading.textContent = "Portal destination";
    panel.append(heading);
    for (const l of portalLinks) {
      panel.append(
        selector(
          outputs.map((x) => [
            x.id + "/actuators/" + x.logic.actuators[0].name,
            label(rootOf(x)) + " · " + x.id,
          ]),
          l.link,
          (v) => (l.brick.links[l.index] = v),
        ),
      );
    }
    panel.append(
      input(
        "Exit direction · degrees",
        Number(((root.rotation[2] * 180) / Math.PI).toFixed(2)),
        (v) => (root.rotation[2] = (v * Math.PI) / 180),
      ),
    );
    const pair = document.createElement("button");
    pair.textContent = "Make destination a two-way pair";
    pair.onclick = () =>
      mutate(() => {
        const outgoing = portalLinks[0];
        if (!outgoing) throw Error("Choose a portal destination first.");
        const peer = rootOf(
          object(outgoing.brick.links[outgoing.index].split("/")[0]),
        );
        const exit = descendants(root.id).find((x) =>
          x.source.includes("PortalOut"),
        );
        const returning = crossLinks(peer).filter((l) =>
          l.target.source.includes("PortalOut"),
        );
        if (peer.id === root.id || !exit || !returning.length)
          throw Error(
            "The destination must be another complete portal component.",
          );
        for (const link of returning)
          link.brick.links[link.index] =
            exit.id + "/actuators/" + exit.logic.actuators[0].name;
      });
    panel.append(pair);
  }
  if (links.length) {
    const h = document.createElement("h2");
    h.textContent = "Connections";
    panel.append(h);
    for (const link of links) {
      const row = document.createElement("div");
      row.className = "connection";
      const text = document.createElement("div");
      text.className = "small";
      text.textContent = label(link.owner) + " → " + link.brick.name;
      row.append(text);
      const targets = state.level.objects
        .filter((x) => x.active)
        .flatMap((x) =>
          x.logic.actuators.map((b) => [
            x.id + "/actuators/" + b.name,
            label(rootOf(x)) + " / " + label(x) + " / " + b.name,
          ]),
        );
      row.append(
        selector(
          targets,
          link.link,
          (value) => (link.brick.links[link.index] = value),
        ),
      );
      const disconnect = document.createElement("button");
      disconnect.textContent = "Disconnect";
      disconnect.onclick = () =>
        mutate(() => link.brick.links.splice(link.index, 1));
      row.append(disconnect);
      panel.append(row);
    }
  }
  const connector = document.createElement("details"),
    connectorTitle = document.createElement("summary");
  connectorTitle.textContent = "Add a connection";
  connector.append(connectorTitle);
  const sourceSelect = document.createElement("select"),
    targetSelect = document.createElement("select"),
    connect = document.createElement("button");
  sourceSelect.setAttribute("aria-label", "Connection source");
  targetSelect.setAttribute("aria-label", "Connection destination");
  const sources = descendants(root.id).flatMap((member) =>
    ["sensors", "controllers"].flatMap((kind) =>
      member.logic[kind].map((brick) => ({ member, kind, brick })),
    ),
  );
  sources.forEach((source, index) => {
    const option = new Option(
      label(source.member) + " / " + source.kind + " / " + source.brick.name,
      String(index),
    );
    sourceSelect.add(option);
  });
  const destinations = () => {
    targetSelect.replaceChildren();
    const source = sources[Number(sourceSelect.value)];
    if (!source) return;
    const kind = source.kind === "sensors" ? "controllers" : "actuators";
    for (const member of state.level.objects.filter((x) => x.active))
      for (const brick of member.logic[kind])
        targetSelect.add(
          new Option(
            label(rootOf(member)) + " / " + label(member) + " / " + brick.name,
            member.id + "/" + kind + "/" + brick.name,
          ),
        );
  };
  sourceSelect.onchange = destinations;
  destinations();
  connect.textContent = "Connect";
  connect.disabled = !sources.length;
  connect.onclick = () =>
    mutate(() => {
      const source = sources[Number(sourceSelect.value)];
      if (!source || !targetSelect.value)
        throw Error("Choose a source and destination.");
      if (!source.brick.links.includes(targetSelect.value))
        source.brick.links.push(targetSelect.value);
    });
  connector.append(sourceSelect, targetSelect, connect);
  panel.append(connector);
  appendSettings(panel, o);
  const mesh = state.library.meshes[metadata(o).data];
  if (mesh && family(o) === "Wall") {
    const vertices = o.geometry?.vertices || mesh.vertices;
    const vertexPanel = document.createElement("details");
    const vertexTitle = document.createElement("summary");
    vertexTitle.textContent = "Vertex coordinates · world space";
    vertexPanel.append(vertexTitle);
    const choose = document.createElement("input");
    choose.type = "number";
    choose.min = 0;
    choose.max = vertices.length - 1;
    choose.step = 1;
    choose.value = Math.min(state.vertexIndex || 0, vertices.length - 1);
    choose.setAttribute("aria-label", "Vertex index");
    choose.onchange = () => {
      state.vertexIndex = Math.max(
        0,
        Math.min(vertices.length - 1, Math.floor(Number(choose.value))),
      );
      inspect();
    };
    vertexPanel.append(choose);
    const index = Number(choose.value),
      coordinates = point(worldMatrix(o), vertices[index]);
    for (let axis = 0; axis < 3; axis++)
      vertexPanel.append(
        input("World " + "XYZ"[axis], coordinates[axis], (value) => {
          const next = [...coordinates];
          next[axis] = value;
          o.geometry ||= {};
          o.geometry.vertices ||= clone(mesh.vertices);
          o.geometry.vertices[index] = point(worldMatrix(o).inverse(), next);
        }),
      );
    panel.append(vertexPanel);
    const info = document.createElement("p");
    info.className = "small";
    info.textContent =
      "Shape edits vertices, including hidden collision surfaces. Carve removes a wall cell and its hidden collision surfaces. Export includes your geometry edits.";
    panel.append(info);
    const restore = document.createElement("button");
    restore.textContent = "Restore template geometry";
    restore.onclick = () => mutate(() => delete o.geometry);
    panel.append(restore);
  }
  const advanced = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = "Logic & component settings";
  advanced.append(summary);
  for (const member of descendants(o.id)) {
    for (const [kind, bricks] of Object.entries(member.logic)) {
      for (const brick of bricks) {
        const details = document.createElement("details");
        details.className = "brick";
        const s = document.createElement("summary");
        s.textContent =
          label(member) +
          " / " +
          brick.name +
          " · " +
          (brick.payloadType || kind).replace(/^b/, "");
        details.append(s);
        for (const [group, values] of [
          ["settings", brick.settings],
          ["payload", brick.payload],
        ]) {
          for (const [key, value] of Object.entries(values || {})) {
            if (Array.isArray(value)) {
              const row = document.createElement("div");
              row.className = "row";
              value.forEach((v, i) =>
                row.append(
                  input(key + " " + i, v, (n) => (values[key][i] = n)),
                ),
              );
              details.append(row);
            } else
              details.append(
                input(
                  key,
                  value,
                  (v) => (values[key] = v),
                  typeof value === "string" ? "text" : "number",
                ),
              );
          }
        }
        advanced.append(details);
      }
    }
  }
  panel.append(advanced);
}

function appendSettings(panel, o) {
  const properties = metadata(o).propertyValues || {};
  if (Object.keys(properties).length) {
    const details = document.createElement("details"),
      heading = document.createElement("summary");
    heading.textContent = "Game properties";
    details.append(heading);
    for (const [name, property] of Object.entries(properties))
      details.append(
        input(
          name,
          o.properties?.[name] ?? property.value,
          (value) => {
            o.properties ||= {};
            o.properties[name] = String(value);
          },
          property.type === 4 ? "text" : "number",
        ),
      );
    panel.append(details);
  }
  const animation = o.animation || metadata(o).animation;
  if (!animation) return;
  const details = document.createElement("details"),
    heading = document.createElement("summary");
  heading.textContent = "Motion path · animation keys";
  details.append(heading);
  const channels = {
    1: "Position X",
    2: "Position Y",
    3: "Position Z",
    7: "Rotation X",
    8: "Rotation Y",
    9: "Rotation Z",
    13: "Scale X",
    14: "Scale Y",
    15: "Scale Z",
  };
  animation.curves.forEach((curve, index) => {
    const group = document.createElement("details"),
      title = document.createElement("summary");
    title.textContent = channels[curve.channel] || "Channel " + curve.channel;
    group.append(title);
    group.append(
      selector(
        [
          [0, "Constant"],
          [1, "Linear"],
          [2, "Bézier"],
        ],
        curve.interpolation,
        (value) => {
          o.animation ||= clone(animation);
          o.animation.curves[index].interpolation = Number(value);
        },
      ),
    );
    group.append(
      selector(
        [
          [0, "Hold endpoints"],
          [1, "Extend direction"],
          [2, "Repeat"],
          [3, "Repeat with offset"],
        ],
        curve.extrapolation,
        (value) => {
          o.animation ||= clone(animation);
          o.animation.curves[index].extrapolation = Number(value);
        },
      ),
    );
    curve.points.forEach((key, keyIndex) => {
      const row = document.createElement("div");
      row.className = "row";
      for (const [axis, name] of [
        [0, "Frame"],
        [1, "Value"],
      ])
        row.append(
          input(name, key[3 + axis], (value) => {
            o.animation ||= clone(animation);
            const point = o.animation.curves[index].points[keyIndex],
              delta = value - point[3 + axis];
            for (const offset of [0, 3, 6]) point[offset + axis] += delta;
          }),
        );
      group.append(row);
    });
    details.append(group);
  });
  panel.append(details);
}

function duplicate(o, position) {
  const template = blueprints.get(state.level.scene),
    available = new Map(template.objects.map((x) => [x.id, x]));
  const group = object(o.id)
    ? descendants(o.id)
    : template.objects.filter((x) => {
        let p = x;
        while (p) {
          if (p.id === o.id) return true;
          p = available.get(p.parent);
        }
        return false;
      });
  const mapping = new Map(
    group.map((x) => [
      x.id,
      "OB" + crypto.randomUUID().replaceAll("-", "").slice(0, 18),
    ]),
  );
  mutate(() => {
    const required = new Set(group.map((x) => x.id)),
      pending = [...group];
    while (pending.length) {
      const source = pending.pop();
      const ids = [source.parent];
      for (const bricks of Object.values(source.logic))
        for (const brick of bricks) {
          for (const link of brick.links || []) ids.push(link.split("/")[0]);
          for (const value of Object.values(brick.references || {}))
            if (value?.startsWith("OB")) ids.push(value);
        }
      for (const id of ids)
        if (id && !object(id) && !required.has(id)) {
          const dependency = available.get(id);
          if (!dependency) throw Error("Missing component dependency: " + id);
          required.add(id);
          pending.push(dependency);
        }
    }
    for (const id of required)
      if (!object(id)) {
        const original = clone(available.get(id));
        original.active = false;
        state.level.objects.push(original);
      }
    const copies = group.map((x) => {
      const c = clone(x);
      if (!o.active) c.active = available.get(x.source)?.active ?? x.active;
      c.id = mapping.get(x.id);
      if (mapping.has(c.parent)) c.parent = mapping.get(c.parent);
      for (const bricks of Object.values(c.logic))
        for (const b of bricks) {
          if (b.links)
            b.links = b.links.map((link) => {
              const parts = link.split("/");
              parts[0] = mapping.get(parts[0]) || parts[0];
              return parts.join("/");
            });
          for (const key of Object.keys(b.references || {}))
            b.references[key] =
              mapping.get(b.references[key]) || b.references[key];
        }
      return c;
    });
    const root = copies.find((c) => c.id === mapping.get(o.id));
    root.active = true;
    root.position[0] = position
      ? position[0]
      : root.position[0] + state.level.grid.spacing;
    root.position[1] = position
      ? position[1]
      : root.position[1] + state.level.grid.spacing;
    state.level.objects.push(...copies);
    state.selected = root.id;
  });
}
function remove(o) {
  if (descendants(o.id).some((x) => x.id === state.level.camera))
    throw Error("Keep the active camera.");
  const ids = new Set(descendants(o.id).map((x) => x.id));
  mutate(() => {
    state.level.objects = state.level.objects.filter((x) => !ids.has(x.id));
    for (const x of state.level.objects)
      for (const bricks of Object.values(x.logic))
        for (const b of bricks) {
          if (b.links)
            b.links = b.links.filter((l) => !ids.has(l.split("/")[0]));
          for (const key of Object.keys(b.references || {}))
            if (ids.has(b.references[key])) b.references[key] = null;
        }
    state.selected = null;
  });
}
function palette() {
  const container = $("#components");
  container.replaceChildren();
  const glyphs = {
    Wall: "▱",
    Portal: "◎",
    Start: "➤",
    Finish: "◆",
    Switch: "⊙",
    Forcefield: "≋",
    Turret: "↗",
    "Moving hazard": "✣",
    Floor: "▧",
    Push: "»",
    Hazard: "●",
    Power: "♦",
    Prop: "◇",
    Player: "➤",
  };
  const filter = $("#search").value.toLowerCase();
  const candidates = [
    ...state.level.objects.filter((o) => o.active),
    ...blueprints
      .get(state.level.scene)
      .objects.filter((o) => !object(o.id)?.active),
  ];
  const roots = candidates
    .filter(
      (o) =>
        !o.parent &&
        o.active &&
        !["Camera", "Light", "Background", "Utility", "Player"].includes(
          family(o),
        ),
    )
    .sort(
      (a, b) =>
        Number(b.source.includes("Grid")) - Number(a.source.includes("Grid")),
    );
  const shown = new Set();
  for (const o of roots) {
    const category = family(o);
    const key = category + " " + label(o);
    if (shown.has(key) || !key.toLowerCase().includes(filter)) continue;
    shown.add(key);
    const button = document.createElement("button");
    button.className = "component";
    const glyph = document.createElement("span");
    glyph.className = "glyph";
    glyph.textContent = glyphs[category] || "◇";
    const text = document.createElement("span");
    text.textContent = category;
    const small = document.createElement("small");
    small.textContent = label(o);
    text.append(small);
    button.append(glyph, text);
    button.onclick = () => {
      state.placement = o.id;
      $("#placement").textContent =
        "Place " + category + " · click the map · Esc cancels";
      $("#placement").hidden = false;
    };
    container.append(button);
  }
}
function objectList() {
  const list = $("#objects");
  list.replaceChildren();
  for (const o of state.level.objects.filter((o) => !o.parent && visible(o))) {
    const button = document.createElement("button");
    button.textContent = label(o) + " · " + family(o);
    if (o.id === state.selected) button.className = "active";
    button.onclick = () => select(o.id);
    list.append(button);
  }
}
function syncControls() {
  $("#name").value = state.level.name;
  $("#spacing").value = state.level.grid.spacing;
  $("#subdivisions").value = state.level.grid.subdivisions;
  $("#snap").checked = state.level.grid.snap;
  $("#origin-x").value = state.level.grid.origin[0];
  $("#origin-y").value = state.level.grid.origin[1];
  $("#blueprint").value = state.library.blueprints.find(
    (b) => b.scene === state.level.scene,
  )?.url;
  palette();
}
async function load(url) {
  const level = validate(await fetchJSON(url));
  state.level = level;
  state.history = [];
  state.future = [];
  state.selected = null;
  syncControls();
  changed();
  inspect();
  objectList();
  fit();
}
function pick(x, y, individual = false) {
  context.save();
  context.setTransform(1, 0, 0, 1, 0, 0);
  let found;
  for (const shape of [...shapes].reverse())
    if (context.isPointInPath(shape.path, x, y)) {
      found = object(shape.id);
      break;
    }
  context.restore();
  if (!found) {
    found = state.level.objects
      .filter((o) => o.active)
      .find((o) => {
        const p = screen(...point(worldMatrix(o), [0, 0, 0]));
        return Math.hypot(p[0] - x, p[1] - y) < PICK_RADIUS;
      });
  }
  return found && (individual ? found : rootOf(found));
}
function pointer(event) {
  const rect = canvas.getBoundingClientRect();
  return [event.clientX - rect.left, event.clientY - rect.top];
}
canvas.onpointerdown = (event) => {
  canvas.focus();
  const p = pointer(event),
    w = world(...p);
  if (event.button === 1 || state.space) {
    state.drag = { kind: "pan", p, view: { ...state.view } };
    canvas.setPointerCapture(event.pointerId);
    return;
  }
  if (event.button !== 0) return;
  if (state.tool === "wall") {
    state.drag = { kind: "wall", start: w.map(snapped) };
    canvas.setPointerCapture(event.pointerId);
    return;
  }
  if (state.placement) {
    duplicate(
      object(state.placement) ||
        blueprints
          .get(state.level.scene)
          .objects.find((o) => o.id === state.placement),
      w.map(snapped),
    );
    state.placement = null;
    $("#placement").hidden = true;
    return;
  }
  let o = state.selected && object(state.selected);
  if (state.tool === "vertex" && o) {
    const mesh = state.library.meshes[metadata(o).data];
    if (mesh) {
      const vertices = o.geometry?.vertices || mesh.vertices;
      const nearby = vertices
        .map((v, index) => ({ index, p: screen(...point(worldMatrix(o), v)) }))
        .filter((v) => Math.hypot(v.p[0] - p[0], v.p[1] - p[1]) < PICK_RADIUS);
      if (nearby.length) {
        checkpoint();
        o.geometry ||= { vertices: clone(mesh.vertices) };
        o.geometry.vertices ||= clone(mesh.vertices);
        state.drag = {
          kind: "vertex",
          object: o,
          indices: nearby.map((v) => v.index),
          start: w,
          vertices: clone(o.geometry.vertices),
        };
        canvas.setPointerCapture(event.pointerId);
        return;
      }
    }
  }
  if (state.tool === "carve" && o) {
    const mesh = state.library.meshes[metadata(o).data];
    if (mesh) {
      const vertices = o.geometry?.vertices || mesh.vertices;
      const faces =
        o.geometry?.faces?.map((f) => ({
          ...mesh.faces[f.templateFace],
          ...f,
        })) || mesh.faces;
      const hits = [];
      for (let i = 0; i < faces.length; i++) {
        const f = faces[i];
        if (f.mode & 1024) continue;
        const path = new Path2D();
        f.vertices
          .map((v) => screen(...point(worldMatrix(o), vertices[v])))
          .forEach((v, n) => (n ? path.lineTo(...v) : path.moveTo(...v)));
        path.closePath();
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        if (context.isPointInPath(path, ...p)) hits.push(i);
        context.restore();
      }
      if (hits.length) {
        mutate(() => {
          o.geometry ||= {};
          o.geometry.disabledFaces = [
            ...new Set([
              ...(o.geometry.disabledFaces || []),
              ...containedFaces(vertices, faces, hits),
            ]),
          ];
        });
        return;
      }
    }
  }
  o = pick(...p, event.altKey);
  select(o?.id || null);
  if (o && state.tool === "select") {
    checkpoint();
    state.drag = {
      kind: "move",
      object: o,
      start: w,
      position: [...o.position],
    };
    canvas.setPointerCapture(event.pointerId);
  }
};
canvas.onpointermove = (event) => {
  const p = pointer(event),
    w = world(...p);
  $("#coordinates").textContent = w.map((n) => n.toFixed(2)).join(", ");
  const drag = state.drag;
  if (!drag) return;
  if (drag.kind === "pan") {
    state.view.x = drag.view.x - (p[0] - drag.p[0]) / state.view.scale;
    state.view.y = drag.view.y + (p[1] - drag.p[1]) / state.view.scale;
  } else if (drag.kind === "wall") {
    drag.end = w.map(snapped);
  } else if (drag.kind === "move") {
    const delta = [w[0] - drag.start[0], w[1] - drag.start[1]];
    drag.object.position[0] = snapped(drag.position[0] + delta[0]);
    drag.object.position[1] = snapped(drag.position[1] + delta[1]);
    matrices.clear();
  } else {
    const inverse = worldMatrix(drag.object).inverse();
    for (const i of drag.indices) {
      const original = point(worldMatrix(drag.object), drag.vertices[i]);
      drag.object.geometry.vertices[i] = point(inverse, [
        snapped(original[0] + w[0] - drag.start[0]),
        snapped(original[1] + w[1] - drag.start[1]),
        original[2],
      ]);
    }
    matrices.clear();
  }
  render();
};
canvas.onpointerup = () => {
  if (state.drag?.kind === "wall") {
    if (
      state.drag.end &&
      Math.hypot(
        state.drag.end[0] - state.drag.start[0],
        state.drag.end[1] - state.drag.start[1],
      ) > 0
    )
      addWall(state.drag.start, state.drag.end);
    state.drag = null;
    return;
  }
  if (state.drag && state.drag.kind !== "pan") {
    changed();
    inspect();
  }
  state.drag = null;
};
canvas.onwheel = (event) => {
  event.preventDefault();
  const p = pointer(event),
    before = world(...p);
  state.view.scale = Math.max(
    MIN_SCALE,
    Math.min(MAX_SCALE, state.view.scale * Math.exp(-event.deltaY * 0.001)),
  );
  const after = world(...p);
  state.view.x += before[0] - after[0];
  state.view.y += before[1] - after[1];
  render();
};
window.onkeydown = (event) => {
  if (
    ["INPUT", "SELECT", "TEXTAREA"].includes(event.target.tagName) ||
    $("#play-dialog").open
  )
    return;
  if (event.code === "Space") {
    state.space = true;
    event.preventDefault();
  }
  if ((event.metaKey || event.ctrlKey) && event.code === "KeyZ") {
    event.preventDefault();
    event.shiftKey
      ? restore(state.future, state.history)
      : restore(state.history, state.future);
  }
  if (event.code === "Escape") {
    state.placement = null;
    $("#placement").hidden = true;
    select(null);
  }
  if (event.code === "KeyF") fit();
  if (event.code === "KeyV") setTool("select");
  if (event.code === "KeyE") setTool("vertex");
  if (["Delete", "Backspace"].includes(event.code) && state.selected) {
    event.preventDefault();
    remove(object(state.selected));
  }
};
window.onkeyup = (event) => {
  if (event.code === "Space") state.space = false;
};
function setTool(tool) {
  state.tool = tool;
  for (const button of document.querySelectorAll("[data-tool]"))
    button.classList.toggle("active", button.dataset.tool === tool);
  render();
}
for (const button of document.querySelectorAll("[data-tool]"))
  button.onclick = () => setTool(button.dataset.tool);
$("#undo").onclick = () => restore(state.history, state.future);
$("#redo").onclick = () => restore(state.future, state.history);
$("#fit").onclick = fit;
$("#search").oninput = palette;
$("#show-inactive").onchange = () => {
  objectList();
  render();
};
$("#links").onchange = render;
$("#name").onchange = () => mutate(() => (state.level.name = $("#name").value));
$("#spacing").onchange = () =>
  mutate(() => (state.level.grid.spacing = Number($("#spacing").value)));
$("#subdivisions").onchange = () =>
  mutate(
    () => (state.level.grid.subdivisions = Number($("#subdivisions").value)),
  );
$("#snap").onchange = () =>
  mutate(() => (state.level.grid.snap = $("#snap").checked));
for (const [axis, id] of ["origin-x", "origin-y"].entries())
  $("#" + id).onchange = () =>
    mutate(() => {
      state.level.grid.origin[axis] = Number($("#" + id).value);
    });
$("#blueprint").onchange = () => load($("#blueprint").value).catch(report);
$("#import").onclick = () => $("#file").click();
$("#file").onchange = async () => {
  const file = $("#file").files[0];
  if (!file) return;
  const level = validate(JSON.parse(await file.text()));
  checkpoint();
  state.level = level;
  state.selected = null;
  syncControls();
  changed();
  inspect();
  objectList();
  fit();
  $("#file").value = "";
};
$("#export").onclick = () => {
  validate(state.level);
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(state.level, null, 2) + "\n"], {
      type: "application/json",
    }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = (state.level.name.replace(/[^\w-]+/g, "-") || "level") + ".json";
  a.click();
  URL.revokeObjectURL(url);
};
$("#save-level").onclick = () => {
  validate(state.level);
  const levels = JSON.parse(localStorage.getItem("reforged-levels-v1") || "[]");
  const existing = levels.find(
    (entry) => entry.level.name === state.level.name,
  );
  if (existing) existing.level = clone(state.level);
  else levels.push({ id: crypto.randomUUID(), level: clone(state.level) });
  localStorage.setItem("reforged-levels-v1", JSON.stringify(levels));
  $("#save-state").textContent = "Saved to your levels";
};
$("#play").onclick = () => {
  validate(state.level);
  localStorage.setItem(PLAY_STORAGE, snapshot());
  $("#play-title").textContent = state.level.name;
  $("#play-frame").src = "../?reforged=editor";
  $("#play-dialog").showModal();
};
function closePlay() {
  $("#play-frame").src = "about:blank";
  $("#play-dialog").close();
  canvas.focus();
}
$("#close-play").onclick = closePlay;
$("#play-dialog").addEventListener("cancel", (event) => {
  event.preventDefault();
  closePlay();
});
window.addEventListener("themechange", render);
new ResizeObserver(render).observe($("#viewport"));
const textureManifest = await fetchJSON("textures.json");
await Promise.all(
  Object.entries(textureManifest.images).map(async ([id, url]) => {
    const image = new Image();
    image.src = url;
    await image.decode();
    textures.set(id, {
      image,
      pattern: context.createPattern(image, "repeat"),
    });
  }),
);
state.library = await fetchJSON("library.json");
await Promise.all(
  state.library.blueprints.map(async (b) =>
    blueprints.set(b.scene, await fetchJSON(b.url)),
  ),
);
for (const b of state.library.blueprints) {
  const option = document.createElement("option");
  option.value = b.url;
  option.textContent =
    b.scene === "LvGen B"
      ? "Original component workshop"
      : b.scene + " · editable original";
  $("#blueprint").append(option);
}
const saved = localStorage.getItem(STORAGE);
if (saved) {
  state.level = validate(JSON.parse(saved));
  syncControls();
  changed();
  inspect();
  objectList();
  fit();
} else await load("levels/Lv10.json");
window.reforgedEditor = {
  state,
  validate,
  select,
  fit,
  duplicate,
  remove,
  worldMatrix,
  load,
  mutate,
  addWall,
};
