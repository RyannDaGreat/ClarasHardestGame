/* Shared chrome themes, inspired by Ryan's WebSurge. No game pixels are altered. */
(() => {
  const STORAGE = "hardest-game.theme.v1";
  const sans = "system-ui, sans-serif";
  const mono = "ui-monospace, SFMono-Regular, Menlo, monospace";
  const serif = "Georgia, Cambria, serif";
  // Palette order: page, panel, control, text, secondary text, border, accent, accent text.
  const themes = {
    glass: {
      name: "Frosted Glass",
      palette: [
        "#090e23",
        "#171e3bea",
        "#242d4e",
        "#eef4ff",
        "#acb9d9",
        "#465477",
        "#82dfff",
        "#071622",
      ],
      radius: "2px",
      font: sans,
      shadow: "0 12px 36px #02061980",
      decor:
        "radial-gradient(ellipse at 20% 0%, #6366f140, transparent 65%), radial-gradient(ellipse at 95% 100%, #22d3ee25, transparent 60%)",
      surface: "linear-gradient(125deg, #ffffff08, #ffffff00)",
      blur: "blur(16px)",
    },
    brutalist: {
      name: "Brutalist",
      palette: [
        "#ffe445",
        "#fffef0",
        "#fffef0",
        "#171711",
        "#45452d",
        "#171711",
        "#d92f22",
        "#ffffff",
      ],
      radius: "0px",
      font: mono,
      weight: "800",
      border: "3px",
      shadow: "5px 5px 0 #171711",
      decor:
        "repeating-linear-gradient(135deg, #1717110b 0 12px, transparent 12px 24px)",
      caps: "uppercase",
      scheme: "light",
    },
    synthwave: {
      name: "Synthwave",
      palette: [
        "#110b25",
        "#1d123b",
        "#2a194f",
        "#f7e8ff",
        "#c1a7db",
        "#774194",
        "#f59ade",
        "#260a28",
      ],
      radius: "2px",
      font: sans,
      shadow: "0 0 24px #da49ed35",
      decor:
        "radial-gradient(ellipse at 50% 0%, #c1269e40, transparent 65%), repeating-linear-gradient(0deg, #a855f708 0 1px, transparent 1px 8px)",
      surface: "linear-gradient(110deg, #f472b615, #22d3ee08)",
      tracking: ".12em",
    },
    crt: {
      name: "CRT Terminal",
      palette: [
        "#020c05",
        "#041108",
        "#092114",
        "#a8ffc0",
        "#65ba84",
        "#286b3e",
        "#84f5a4",
        "#03200c",
      ],
      radius: "0px",
      font: mono,
      shadow: "0 0 18px #4ade801b",
      decor:
        "repeating-linear-gradient(0deg, #00000025 0 1px, transparent 1px 4px)",
      caps: "uppercase",
      tracking: ".06em",
    },
    paper: {
      name: "Paper & Ink",
      palette: [
        "#eae6df",
        "#faf8f3",
        "#f1ede4",
        "#28241f",
        "#6e6253",
        "#c5bbaa",
        "#a43e19",
        "#fff8ee",
      ],
      radius: "2px",
      font: serif,
      shadow: "0 5px 18px #4f39251c",
      decor:
        "repeating-linear-gradient(135deg, #8d796309 0 1px, transparent 1px 10px)",
      tracking: ".08em",
      scheme: "light",
    },
    blueprint: {
      name: "Blueprint",
      palette: [
        "#14274d",
        "#193257",
        "#203d65",
        "#dcf5ff",
        "#9ccee6",
        "#47759c",
        "#9ce9ff",
        "#102947",
      ],
      radius: "0px",
      font: mono,
      decor:
        "linear-gradient(#9bd8ff12 1px, transparent 1px), linear-gradient(90deg, #9bd8ff12 1px, transparent 1px)",
      pattern: "24px 24px",
      tracking: ".1em",
      caps: "uppercase",
    },
    swiss: {
      name: "Swiss",
      palette: [
        "#eeeae2",
        "#faf8f3",
        "#e7e3db",
        "#191919",
        "#595650",
        "#bab5ab",
        "#c6261b",
        "#ffffff",
      ],
      radius: "0px",
      font: "Helvetica, Arial, sans-serif",
      weight: "800",
      border: "2px",
      tracking: "-.035em",
      scheme: "light",
    },
    contrast: {
      name: "High Contrast",
      palette: [
        "#000000",
        "#000000",
        "#111111",
        "#ffffff",
        "#eeeeee",
        "#ffffff",
        "#ffff00",
        "#000000",
      ],
      radius: "0px",
      font: sans,
      border: "2px",
      weight: "750",
    },
    hardware: {
      name: "Rack Hardware",
      palette: [
        "#18191c",
        "#2b2d30",
        "#202125",
        "#f0ece2",
        "#b4b0a6",
        "#55565a",
        "#f2c461",
        "#241c0d",
      ],
      radius: "2px",
      font: mono,
      shadow: "inset 0 1px 0 #ffffff16, 0 5px 10px #0007",
      decor:
        "repeating-linear-gradient(90deg, #ffffff04 0 1px, transparent 1px 4px)",
      surface: "linear-gradient(#ffffff07, #00000012)",
      tracking: ".08em",
    },
    pastel: {
      name: "Pastel Dream",
      palette: [
        "#f3eefa",
        "#fffbff",
        "#eee5f6",
        "#392e4f",
        "#706080",
        "#cdbada",
        "#794890",
        "#ffffff",
      ],
      radius: "2px",
      font: sans,
      shadow: "0 6px 24px #9d78b522",
      decor:
        "radial-gradient(ellipse at 15% 0%, #fbcfe888, transparent 60%), radial-gradient(ellipse at 90% 100%, #bceee477, transparent 65%)",
      scheme: "light",
    },
    linear: {
      name: "Linear",
      palette: [
        "#0c0d10",
        "#13151a",
        "#1c1f27",
        "#ececf1",
        "#a0a3af",
        "#343843",
        "#a4acff",
        "#14172e",
      ],
      radius: "2px",
      font: sans,
    },
    vercel: {
      name: "Vercel",
      palette: [
        "#000000",
        "#0a0a0a",
        "#161616",
        "#fafafa",
        "#a3a3a3",
        "#333333",
        "#ffffff",
        "#000000",
      ],
      radius: "2px",
      font: sans,
    },
    nord: {
      name: "Nord",
      palette: [
        "#2e3440",
        "#353e4e",
        "#414c60",
        "#eceff4",
        "#c0cbdb",
        "#637188",
        "#a3d8e4",
        "#263848",
      ],
      radius: "2px",
      font: sans,
    },
    mono: {
      name: "Monochrome",
      palette: [
        "#f1f1f1",
        "#ffffff",
        "#e9e9e9",
        "#202020",
        "#626262",
        "#bcbcbc",
        "#292929",
        "#ffffff",
      ],
      radius: "2px",
      font: sans,
      scheme: "light",
    },
    sky: {
      name: "Daylight",
      palette: [
        "#f1f5fa",
        "#ffffff",
        "#eaf0f8",
        "#16263d",
        "#50647d",
        "#b8c7da",
        "#2455bf",
        "#ffffff",
      ],
      radius: "2px",
      font: sans,
      scheme: "light",
    },
  };
  const keys = [
    "bg",
    "panel",
    "raised",
    "ink",
    "muted",
    "line",
    "accent",
    "on-accent",
  ];
  const defaults = {
    radius: "2px",
    font: sans,
    weight: "650",
    border: "1px",
    shadow: "none",
    decor: "none",
    surface: "none",
    blur: "none",
    tracking: "0em",
    caps: "none",
    pattern: "auto",
    scheme: "dark",
  };
  const root = document.documentElement;
  function apply(name, persist = false) {
    if (!themes[name]) throw Error("Unknown theme: " + name);
    const theme = { ...defaults, ...themes[name] };
    root.dataset.theme = name;
    for (const [i, key] of keys.entries())
      root.style.setProperty("--theme-" + key, theme.palette[i]);
    for (const key of Object.keys(defaults))
      root.style.setProperty("--theme-" + key, theme[key]);
    root.style.colorScheme = theme.scheme;
    for (const picker of document.querySelectorAll("[data-theme-picker]"))
      picker.value = name;
    if (persist) localStorage.setItem(STORAGE, name);
    window.dispatchEvent(new CustomEvent("themechange", { detail: name }));
  }
  let initial = localStorage.getItem(STORAGE) || "glass";
  if (!themes[initial]) {
    console.warn("Saved theme unavailable:", initial);
    initial = "glass";
  }
  apply(initial);
  document.addEventListener("DOMContentLoaded", () => {
    for (const picker of document.querySelectorAll("[data-theme-picker]")) {
      for (const [value, theme] of Object.entries(themes)) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = theme.name;
        picker.append(option);
      }
      picker.value = root.dataset.theme;
      picker.addEventListener("change", () => apply(picker.value, true));
    }
  });
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE) apply(event.newValue || "glass");
  });
})();
