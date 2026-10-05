const STORAGE = "reforged-levels-v1";
const $ = (selector) => document.querySelector(selector);
const saved = JSON.parse(localStorage.getItem(STORAGE) || "[]");

function report(error) {
  console.error(error);
  $("#notice").textContent = error.message;
  $("#notice").hidden = false;
}

/** Check the portable envelope; the editor and native adapter validate components.
 * >>> checkLevel({format:'reforged',version:1,name:'Maze',scene:'Lv10',objects:[]}).name
 * 'Maze'
 */
function checkLevel(level) {
  if (
    level?.format !== "reforged" ||
    level.version !== 1 ||
    typeof level.name !== "string" ||
    !level.name.trim() ||
    typeof level.scene !== "string" ||
    !Array.isArray(level.objects)
  ) {
    throw Error("Choose a Reforged version 1 level JSON file.");
  }
  return level;
}

async function fetchLevel(url) {
  const response = await fetch(url);
  if (!response.ok)
    throw Error(`Could not load level: HTTP ${response.status}`);
  return checkLevel(await response.json());
}

function handoff(level, edit) {
  localStorage.setItem(
    edit ? "reforged-workshop-v1" : "reforged-play-v1",
    JSON.stringify(level),
  );
  location.href = edit ? "../reforged/" : "../?reforged=editor";
}

function button(text, action, primary = false) {
  const element = document.createElement("button");
  element.textContent = text;
  if (primary) element.className = "primary";
  element.onclick = () => Promise.resolve().then(action).catch(report);
  return element;
}

function exportLevel(level) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(level, null, 2) + "\n"], {
      type: "application/json",
    }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = (level.name.replace(/[^\w-]+/g, "-") || "level") + ".json";
  link.click();
  URL.revokeObjectURL(url);
}

function card(entry, local = false) {
  const element = document.createElement("article");
  element.className = "card";
  const title = document.createElement("h3");
  title.textContent = local ? entry.level.name : entry.name;
  const meta = document.createElement("span");
  meta.className = "meta";
  meta.textContent = local ? "Your imported level" : entry.difficulty;
  const description = document.createElement("p");
  description.textContent = local
    ? entry.level.description || "Open in the workshop to customize this level."
    : entry.description;
  const actions = document.createElement("div");
  actions.className = "actions";
  const getLevel = () =>
    local ? checkLevel(entry.level) : fetchLevel(entry.url);
  actions.append(
    button(
      "Play",
      async () =>
        local
          ? handoff(await getLevel(), false)
          : (location.href = "../?reforged=" + encodeURIComponent(entry.name)),
      true,
    ),
    button("Edit in workshop", async () => handoff(await getLevel(), true)),
    button("Export JSON", async () => exportLevel(await getLevel())),
  );
  if (local)
    actions.append(
      button("Remove", () => {
        saved.splice(
          saved.findIndex((item) => item.id === entry.id),
          1,
        );
        localStorage.setItem(STORAGE, JSON.stringify(saved));
        renderSaved();
      }),
    );
  if (!local) {
    const preview = document.createElement("img");
    preview.src = "previews/" + entry.name + ".png";
    preview.alt = entry.name + " running in the original Blender engine";
    preview.loading = "lazy";
    element.append(preview);
  }
  element.append(meta, title, description, actions);
  return element;
}

function renderSaved() {
  $("#saved").replaceChildren(...saved.map((entry) => card(entry, true)));
  $("#empty").hidden = saved.length > 0;
}

$("#import").onclick = () => $("#file").click();
$("#file").onchange = async () => {
  const file = $("#file").files[0];
  if (!file) return;
  try {
    const level = checkLevel(JSON.parse(await file.text()));
    saved.push({ id: crypto.randomUUID(), level });
    localStorage.setItem(STORAGE, JSON.stringify(saved));
    renderSaved();
  } catch (error) {
    report(error);
  }
  $("#file").value = "";
};

try {
  const response = await fetch("catalog.json");
  if (!response.ok)
    throw Error(`Could not load level catalog: HTTP ${response.status}`);
  $("#bundled").replaceChildren(
    ...(await response.json()).map((entry) => card(entry)),
  );
  renderSaved();
} catch (error) {
  report(error);
}
