const STORAGE_KEY = "mini_cookie_clicker_save_v1";

const fmt = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const fmt1 = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

const SUFFIXES = [
  { value: 1e21, label: "Sx" },
  { value: 1e18, label: "Qt" },
  { value: 1e15, label: "Qd" },
  { value: 1e12, label: "T" },
  { value: 1e9, label: "B" },
  { value: 1e6, label: "M" },
  { value: 1e3, label: "K" },
];

function fmtShort(n) {
  if (!Number.isFinite(n)) return "0";
  const abs = Math.abs(n);
  for (const s of SUFFIXES) {
    if (abs >= s.value) {
      const val = n / s.value;
      return (val >= 100 ? Math.floor(val) : val.toFixed(1).replace(/\.0$/, "")) + " " + s.label;
    }
  }
  return fmt.format(Math.floor(n));
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function nowMs() {
  return Date.now();
}

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleString("fr-FR");
  } catch {
    return "—";
  }
}

function powCost(base, owned, growth = 1.15) {
  return Math.floor(base * Math.pow(growth, owned));
}

function roundTo(n, digits = 1) {
  const p = Math.pow(10, digits);
  return Math.round(n * p) / p;
}

const UPGRADE_DEFS = [
  {
    id: "finger",
    name: "Doigt musclé 💪",
    desc: "Augmente les cookies gagnés par clic.",
    baseCost: 15,
    type: "cpc",
    value: 1,
  },
  {
    id: "cursor",
    name: "Curseur auto 🖱️",
    desc: "Clique automatiquement pour toi.",
    baseCost: 100,
    type: "cps",
    value: 0.5,
  },
  {
    id: "grandma",
    name: "Grand-mère 👵",
    desc: "Des cookies faits avec amour.",
    baseCost: 500,
    type: "cps",
    value: 3,
  },
  {
    id: "farm",
    name: "Ferme 🌾",
    desc: "Une production stable et massive.",
    baseCost: 2500,
    type: "cps",
    value: 12,
  },
  {
    id: "factory",
    name: "Usine 🏭",
    desc: "Des cookies à la chaîne.",
    baseCost: 12000,
    type: "cps",
    value: 60,
  },
  {
    id: "portal",
    name: "Portail interdimensionnel 🚪",
    desc: "Importe des cookies d'un autre monde.",
    baseCost: 65000,
    type: "cps",
    value: 340,
  },
  {
    id: "bank",
    name: "Banque 💰",
    desc: "Investit tes cookies pour toi.",
    baseCost: 300000,
    type: "cps",
    value: 1500,
  },
  {
    id: "lab",
    name: "Laboratoire 🔬",
    desc: "Optimise la recette des cookies.",
    baseCost: 1500000,
    type: "cps",
    value: 8000,
  },
  {
    id: "temple",
    name: "Temple ⛩️",
    desc: "Prie les dieux du cookie.",
    baseCost: 7000000,
    type: "cps",
    value: 42000,
  },
  {
    id: "timeMachine",
    name: "Machine à remonter le temps ⏳",
    desc: "Va chercher des cookies dans le passé.",
    baseCost: 50000000,
    type: "cps",
    value: 260000,
  },
  {
    id: "galaxy",
    name: "Forge galactique 🌌",
    desc: "Transforme des étoiles en cookies.",
    baseCost: 350000000,
    type: "cps",
    value: 1800000,
  },
  {
    id: "godHand",
    name: "Main divine ✋",
    desc: "Chaque clic devient une explosion de cookies.",
    baseCost: 2000000000,
    type: "cpc",
    value: 50,
  },
  // ── Tier 2 : 10 milliards → 100 milliards ──
  {
    id: "blackHole",
    name: "Trou noir 🕳️",
    desc: "Aspire des cookies depuis d'autres galaxies.",
    baseCost: 15000000000,
    type: "cps",
    value: 12000000,
  },
  {
    id: "quantumOven",
    name: "Four quantique ⚛️",
    desc: "Cuit des cookies dans plusieurs dimensions à la fois.",
    baseCost: 80000000000,
    type: "cps",
    value: 75000000,
  },
  {
    id: "titanFist",
    name: "Poing de titan 👊",
    desc: "Frappe le cookie avec une force cosmique.",
    baseCost: 100000000000,
    type: "cpc",
    value: 500,
  },
  // ── Tier 3 : 100 milliards → 10 trillions ──
  {
    id: "nebula",
    name: "Nébuleuse cookienne 🌀",
    desc: "Un nuage interstellaire fait de pâte.",
    baseCost: 500000000000,
    type: "cps",
    value: 450000000,
  },
  {
    id: "matrix",
    name: "Matrice digitale 💻",
    desc: "Simule des cookies dans un univers virtuel.",
    baseCost: 3000000000000,
    type: "cps",
    value: 2800000000,
  },
  {
    id: "dragonBreath",
    name: "Souffle de dragon 🐉",
    desc: "Un dragon cuit des cookies avec son haleine.",
    baseCost: 8000000000000,
    type: "cpc",
    value: 5000,
  },
  // ── Tier 4 : 10 trillions → 1 quadrillion ──
  {
    id: "antimatter",
    name: "Condenseur d'antimatière 💥",
    desc: "Convertit l'antimatière en cookies purs.",
    baseCost: 50000000000000,
    type: "cps",
    value: 18000000000,
  },
  {
    id: "prism",
    name: "Prisme photonique 🔮",
    desc: "Transforme la lumière en cookies.",
    baseCost: 300000000000000,
    type: "cps",
    value: 120000000000,
  },
  {
    id: "cosmicClick",
    name: "Clic cosmique 🪐",
    desc: "Chaque clic fait trembler l'univers.",
    baseCost: 500000000000000,
    type: "cpc",
    value: 50000,
  },
  // ── Tier 5 : 1 quadrillion → 100 quadrillions ──
  {
    id: "dysonSphere",
    name: "Sphère de Dyson ☀️",
    desc: "Enveloppe une étoile entière pour produire des cookies.",
    baseCost: 2000000000000000,
    type: "cps",
    value: 800000000000,
  },
  {
    id: "multiverse",
    name: "Usine multivers 🌐",
    desc: "Récolte des cookies dans des univers parallèles.",
    baseCost: 15000000000000000,
    type: "cps",
    value: 5000000000000,
  },
  {
    id: "infiniteHammer",
    name: "Marteau infini 🔨",
    desc: "Un marteau qui frappe le cookie... infiniment.",
    baseCost: 20000000000000000,
    type: "cpc",
    value: 500000,
  },
  // ── Tier 6 : 100 quadrillions → 10 quintillions ──
  {
    id: "singularity",
    name: "Singularité 🌑",
    desc: "L'espace-temps se plie pour créer des cookies.",
    baseCost: 100000000000000000,
    type: "cps",
    value: 35000000000000,
  },
  {
    id: "omniscience",
    name: "Omniscience 🧠",
    desc: "Tu sais exactement où trouver chaque cookie de l'univers.",
    baseCost: 800000000000000000,
    type: "cps",
    value: 250000000000000,
  },
  {
    id: "godClick",
    name: "Clic divin ⚡",
    desc: "Un clic qui résonne dans l'éternité.",
    baseCost: 1000000000000000000,
    type: "cpc",
    value: 5000000,
  },
  // ── Tier 7 : 10 quintillions → 2 sextillions ──
  {
    id: "bigBang",
    name: "Big Bang cookie 💫",
    desc: "Crée un nouvel univers entièrement fait de cookies.",
    baseCost: 5000000000000000000,
    type: "cps",
    value: 1800000000000000,
  },
  {
    id: "eternity",
    name: "Éternité fractale 🔁",
    desc: "Une boucle infinie de production de cookies.",
    baseCost: 50000000000000000000,
    type: "cps",
    value: 12000000000000000,
  },
  {
    id: "ultimateClick",
    name: "Clic ultime 🌈",
    desc: "Le clic qui met fin à tous les clics.",
    baseCost: 100000000000000000000,
    type: "cpc",
    value: 50000000,
  },
  {
    id: "cookieGod",
    name: "Dieu du Cookie 🍪👑",
    desc: "Tu ES le cookie. Le cookie, c'est toi.",
    baseCost: 500000000000000000000,
    type: "cps",
    value: 100000000000000000,
  },
];

const RARITY_ORDER = { common: 0, rare: 1, epic: 2, legendary: 3 };

// Chaque skin appartient à UNE box et a un "poids" pour le tirage dans cette box.
// Les poids de chaque box font 4000 au total -> le skin le plus rare (poids 1) ≈ 1 / 4000 = 0,025 %.
const SKIN_DEFS = [
  // Box Bronze
  { id: "default", emoji: "🍪", name: "Cookie classique", rarity: "common", boxId: "bronze", weight: 1500 },
  { id: "chocolate", emoji: "🍫", name: "Chocolat", rarity: "common", boxId: "bronze", weight: 1200 },
  { id: "candy", emoji: "🍬", name: "Bonbon", rarity: "common", boxId: "bronze", weight: 800 },
  { id: "donut", emoji: "🍩", name: "Donut", rarity: "rare", boxId: "bronze", weight: 499 },
  { id: "bronzeStar", emoji: "🌟", name: "Étoile de bronze", rarity: "legendary", boxId: "bronze", weight: 1 },

  // Box Argent
  { id: "cupcake", emoji: "🧁", name: "Cupcake", rarity: "common", boxId: "silver", weight: 1500 },
  { id: "honey", emoji: "🍯", name: "Miel", rarity: "rare", boxId: "silver", weight: 1200 },
  { id: "moon", emoji: "🌙", name: "Lune", rarity: "rare", boxId: "silver", weight: 800 },
  { id: "star", emoji: "⭐", name: "Étoile", rarity: "epic", boxId: "silver", weight: 499 },
  { id: "silverStar", emoji: "✨", name: "Étoile d’argent", rarity: "legendary", boxId: "silver", weight: 1 },

  // Box Or
  { id: "fire", emoji: "🔥", name: "Feu", rarity: "rare", boxId: "gold", weight: 1500 },
  { id: "rainbow", emoji: "🌈", name: "Arc-en-ciel", rarity: "epic", boxId: "gold", weight: 1200 },
  { id: "diamond", emoji: "💎", name: "Diamant", rarity: "epic", boxId: "gold", weight: 800 },
  { id: "galaxy", emoji: "🌌", name: "Galaxie", rarity: "epic", boxId: "gold", weight: 499 },
  { id: "golden", emoji: "👑", name: "Golden Cookie", rarity: "legendary", boxId: "gold", weight: 1 },

  // VIP Box
  { id: "mult2", emoji: "2️⃣", name: "Multiplicateur X2", rarity: "epic", boxId: "paid", weight: 1200, multiplier: 2 },
  { id: "mult3", emoji: "3️⃣", name: "Multiplicateur X3", rarity: "epic", boxId: "paid", weight: 700, multiplier: 3 },
  { id: "mult5", emoji: "5️⃣", name: "Multiplicateur X5", rarity: "legendary", boxId: "paid", weight: 99.5, multiplier: 5 },
  { id: "mult25", emoji: "🌟", name: "Multiplicateur X25", rarity: "legendary", boxId: "paid", weight: 0.5, multiplier: 25 },
];

const BOX_DEFS = [
  { id: "bronze", name: "Box Bronze", icon: "🥉", price: 2000 },
  { id: "silver", name: "Box Argent", icon: "🥈", price: 6000 },
  { id: "gold", name: "Box Or", icon: "🥇", price: 15000 },
  { id: "paid", name: "VIP Box", icon: "�", price: "0.99€", isPaid: true },
];

const state = {
  cookies: 0,
  totalCookies: 0,
  clickCount: 0,
  upgrades: {},
  currentBoxId: "bronze",
  currentSkinId: "default",
  unlockedSkins: ["default"],
  lastSave: null,
  lastOfflineGain: null,
  usedKeys: [],
};

const VALID_KEY_HASHES = ["8a86acf30cf6c321", "bb60e1d228a9ea5f", "47b12f1147e58254", "e8f0e073be53c687", "335db85b1bd1a783", "15b2af4ec6f4416c", "58ad96ab42396a80", "b6c22177540334f1", "f5af4045f078d681", "b5c351266bbe4417", "243f4d5a4f9e36c5", "6e5e09e387353c17", "ed64f7ed6c6e37eb", "e640972949a47da1", "5f119ae1378885dd", "8e6db43561a3bb01", "efa691fc27be18b4", "eef5f827c6e49264", "b2bfcc2a6ab9ba33", "9c31fef9e4c4b0e2", "b6762bfca206d2b8", "5c6ebec785bbbb16", "64109879c45dc79b", "4013db72c5e51184", "63de129f8ed6ed5f", "54d6a925d6638da4", "cb521d1bf2c9c023", "97c69947edd98eb4", "6312f0cd37446c17", "b8ab50d72ba984f3", "df28e3300047f588", "b54b703eb9c56ff7", "4bc5914c5e223aca", "a8d1842baca7a484", "00045670ed5e76b5", "8a41069de6615f8a", "55c1cb68248e8b68", "954b788fc28e5668", "46da12ea136c1eb5", "e53e7fbb9209f3b2", "371a518f3a58d076", "859a9f83d5767814", "1de4d01ddbea4864", "529bd477bb6c56bd", "447ace3ade1bede4", "5baef43e35c007bc", "cb78b5b410861c3d", "9b486605b8fb1b6d", "9fe0e1f49d9245f4", "fbc6700cf6d2a572", "005abe59d86f1604", "93ef7e36d523954c", "8e4e732439dd3982", "12d65cf9ed6ecef4", "5e676bf8fe3902ac", "1924291a878fb241", "f83af6737d993da9", "c623b78b247948cb", "c00a2e2e006d0118", "7fe45707ad1268cc", "0decf0b29c7c47db", "3045971646669471", "76a29811e85b50d7", "2d4e98a8b37bdf78", "0072ee632d73677d", "cab75a23eed08b85", "95daea40c9c0f3cd", "b2df1e9ead4067a7", "5741914700fd0e42", "028afffa572b536e", "643b39dc480ff116", "d647f6ffd073c697", "c1efab9918de601f", "dc752ee52e06813b", "64182ba05331964a", "de750eae2350c36e", "8530e84bc9aa1ebc", "de722bb850459405", "c6db10a012551c64", "c63baadf9087f2b3", "8d899da540d80e3a", "181ec15b6323f649", "bd663b28c23d004f", "453aa188a7928aa2", "a392cc63e53a150a", "27d746939a46f190", "1790aa39a2d6bb3f", "77c7cb36b95d64c9", "e495aa8cb2b68305", "2c8b4e7729818704", "d6010d23cabd3869", "66cdb4a001bb4a60", "0285c89b3b03a939", "c87c4b0687a9c04c", "2ae506621887162a", "96ea03f315b7bc4c", "2c5a4eba389d273b", "5a9b9703eea12838", "16a95565b00c9a09", "533a8439a31b58ce"];

async function hashKey(str) {
  const enc = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', enc);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
}

function getCpc() {
  let cpc = 1;
  for (const u of UPGRADE_DEFS) {
    const owned = state.upgrades[u.id]?.owned ?? 0;
    if (u.type === "cpc") cpc += owned * u.value;
  }
  const currentSkin = getSkinById(state.currentSkinId);
  return cpc * (currentSkin.multiplier || 1);
}

function getCps() {
  let cps = 0;
  for (const u of UPGRADE_DEFS) {
    const owned = state.upgrades[u.id]?.owned ?? 0;
    if (u.type === "cps") cps += owned * u.value;
  }
  const currentSkin = getSkinById(state.currentSkinId);
  return cps * (currentSkin.multiplier || 1);
}

function getSkinById(id) {
  return SKIN_DEFS.find((s) => s.id === id) || SKIN_DEFS[0];
}

function getBoxById(id) {
  return BOX_DEFS.find((b) => b.id === id) || BOX_DEFS[0];
}

function getBoxPrice(id) {
  return getBoxById(id).price;
}

function getSkinEmoji(skinId) {
  return getSkinById(skinId).emoji;
}

function getBoxTotalWeight(boxId) {
  return SKIN_DEFS.filter((s) => s.boxId === boxId).reduce((sum, s) => sum + (s.weight ?? 0), 0);
}

function drawRandomSkinFromBox(boxId) {
  const candidates = SKIN_DEFS.filter((s) => s.boxId === boxId);
  const total = candidates.reduce((s, skin) => s + (skin.weight ?? 0), 0);
  let r = Math.random() * total;
  for (const skin of candidates) {
    r -= skin.weight ?? 0;
    if (r <= 0) return skin;
  }
  return candidates[candidates.length - 1] || SKIN_DEFS[SKIN_DEFS.length - 1];
}

function getSkinsSortedByRarity() {
  return [...SKIN_DEFS].sort(
    (a, b) => {
      const ra = RARITY_ORDER[a.rarity] ?? 0;
      const rb = RARITY_ORDER[b.rarity] ?? 0;
      if (ra !== rb) return ra - rb;
      if (a.boxId !== b.boxId) return a.boxId.localeCompare(b.boxId);
      return a.name.localeCompare(b.name);
    }
  );
}

function formatProbabilityForSkin(skin) {
  const total = getBoxTotalWeight(skin.boxId);
  const p = (skin.weight ?? 0) / (total || 1);
  const pct = p * 100;
  if (pct >= 1) return pct.toFixed(1) + " %";
  if (pct >= 0.01) return pct.toFixed(2) + " %";
  return pct.toFixed(3) + " %";
}

function runGambleAnimation(wonSkin, currentBoxId, onComplete) {
  const modal = document.getElementById("gambleModal");
  const track = document.getElementById("gambleTrack");
  const modalResult = document.getElementById("gambleModalResult");
  const modalClose = document.getElementById("gambleModalClose");

  if (!modal || !track) {
    onComplete();
    return;
  }

  if (modalResult) modalResult.textContent = "";
  if (modalClose) modalClose.style.display = "none";
  modal.classList.add("is-open");

  // Filter skins available in this specific box
  const availableSkins = SKIN_DEFS.filter(s => s.boxId === currentBoxId);
  const totalWeight = availableSkins.reduce((sum, s) => sum + (s.weight ?? 0), 0);

  // Helper to draw a purely visual random skin for the scrolling track
  function getVisualRandomSkin() {
    let r = Math.random() * totalWeight;
    for (const s of availableSkins) {
      if (r < (s.weight ?? 0)) return s;
      r -= (s.weight ?? 0);
    }
    return availableSkins[availableSkins.length - 1];
  }

  // Generate 60 items for the track
  const ITEM_COUNT = 60;
  const WINNING_INDEX = 50;

  track.innerHTML = "";
  track.style.transition = "none";
  track.style.transform = "translateX(0px)";

  for (let i = 0; i < ITEM_COUNT; i++) {
    const s = (i === WINNING_INDEX) ? wonSkin : getVisualRandomSkin();

    const el = document.createElement("div");
    el.className = `gamble-modal__item gamble-modal__item--${s.rarity}`;

    const emojiEl = document.createElement("div");
    emojiEl.textContent = s.emoji;

    const nameEl = document.createElement("div");
    nameEl.className = "gamble-modal__item-name";
    nameEl.textContent = s.name;

    el.appendChild(emojiEl);
    el.appendChild(nameEl);
    track.appendChild(el);
  }

  // Force reflow
  track.offsetHeight;

  // Calculate the exact pixel offset
  // Item width = 90px + gap 10px = 100px per item.
  // The center of the window should land perfectly on the winning item.
  const itemWidth = 100;

  // Initial starting offset of the track inside the window (usually 20px padding)
  const windowWidth = document.getElementById("gambleWindow").offsetWidth;
  const centerOffset = windowWidth / 2;

  // Calculate exact position of the center of the winning item
  // 20px global padding + 50 items * 100px width + 45px (half of 90px item size)
  const winnerCenterPos = 20 + (WINNING_INDEX * itemWidth) + 45;

  // Add a slight random offset so the cursor doesn't perfectly land in the dead center every time
  const randomOffset = (Math.random() - 0.5) * 60; // +/- 30px

  const finalTranslate = -(winnerCenterPos - centerOffset + randomOffset);

  // Apply the CSS transition and transform
  track.style.transition = "transform cubic-bezier(0.12, 0.9, 0.25, 1) 5s";
  track.style.transform = `translateX(${finalTranslate}px)`;

  // Wait 5 seconds for the CSS animation to complete, then call onComplete
  setTimeout(() => {
    onComplete();
  }, 5100);
}

function canAfford(cost) {
  return state.cookies >= cost;
}

function addCookies(amount) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  state.cookies += amount;
  state.totalCookies += amount;
}

function spendCookies(amount) {
  state.cookies = Math.max(0, state.cookies - amount);
}

function save() {
  const payload = {
    v: 1,
    cookies: state.cookies,
    totalCookies: state.totalCookies,
    clickCount: state.clickCount,
    upgrades: Object.fromEntries(
      Object.entries(state.upgrades).map(([id, u]) => [id, { owned: u.owned ?? 0 }]),
    ),
    unlockedSkins: Array.isArray(state.unlockedSkins) ? state.unlockedSkins : ["default"],
    currentSkinId: state.currentSkinId || "default",
    lastSave: nowMs(),
    usedKeys: state.usedKeys,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    state.lastSave = payload.lastSave;
    setHint("Sauvegardé.");
  } catch {
    setHint("Impossible de sauvegarder (localStorage).");
  }
  render();
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    state.lastLoadedAt = nowMs();
    state.lastTick = nowMs();
    render();
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    state.cookies = clamp(Number(parsed.cookies ?? 0), 0, Number.MAX_SAFE_INTEGER);
    state.totalCookies = clamp(
      Number(parsed.totalCookies ?? state.cookies ?? 0),
      0,
      Number.MAX_SAFE_INTEGER,
    );
    state.clickCount = clamp(Number(parsed.clickCount ?? 0), 0, Number.MAX_SAFE_INTEGER);

    for (const u of UPGRADE_DEFS) {
      const owned = parsed.upgrades?.[u.id]?.owned ?? 0;
      state.upgrades[u.id] = { owned: clamp(Number(owned), 0, 1e9) };
    }

    state.unlockedSkins = Array.isArray(parsed.unlockedSkins) ? parsed.unlockedSkins : ["default"];
    if (Array.isArray(parsed.usedKeys)) state.usedKeys = parsed.usedKeys;
    if (!state.unlockedSkins.includes("default")) state.unlockedSkins.unshift("default");
    const skinId = parsed.currentSkinId && SKIN_DEFS.some((s) => s.id === parsed.currentSkinId)
      ? parsed.currentSkinId
      : "default";
    state.currentSkinId = state.unlockedSkins.includes(skinId) ? skinId : "default";

    state.lastSave = Number(parsed.lastSave ?? null) || null;
    state.lastLoadedAt = nowMs();
    state.lastTick = nowMs();

    const offlineMs =
      state.lastSave && Number.isFinite(state.lastSave)
        ? Math.max(0, state.lastLoadedAt - state.lastSave)
        : 0;
    const offlineSec = offlineMs / 1000;
    const offlineGain = getCps() * offlineSec;
    if (offlineGain > 0.01) {
      addCookies(offlineGain);
      state.lastOfflineGain = offlineGain;
      setHint(`+${fmt.format(Math.floor(offlineGain))} cookies hors‑ligne.`);
    } else {
      state.lastOfflineGain = 0;
    }
  } catch {
    state.lastLoadedAt = nowMs();
    state.lastTick = nowMs();
    setHint("Sauvegarde corrompue, démarrage à zéro.");
  }

  render();
}

function resetAll() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  state.cookies = 0;
  state.totalCookies = 0;
  state.upgrades = Object.fromEntries(UPGRADE_DEFS.map((u) => [u.id, { owned: 0 }]));
  state.unlockedSkins = ["default"];
  state.currentSkinId = "default";
  state.lastSave = null;
  state.lastTick = nowMs();
  state.lastLoadedAt = nowMs();
  state.lastOfflineGain = null;
  setHint("Réinitialisé.");
  render();
}

function setupDevApi() {
  const api = {
    help() {
      console.log("Commandes dev `cookieDev` :", {
        give: "cookieDev.give(n) -> ajoute n cookies",
        set: "cookieDev.set(n) -> fixe les cookies à n",
        addUpgrade: "cookieDev.addUpgrade(id, n) -> ajoute n exemplaires de l'amélioration",
        maxAll: "cookieDev.maxAll(n) -> ajoute n exemplaires de chaque amélioration (par défaut 100)",
        unlockSkin: "cookieDev.unlockSkin(id) -> débloque et équipe un skin",
        setSkin: "cookieDev.setSkin(id) -> équipe un skin (le débloque si besoin)",
        listSkins: "cookieDev.listSkins() -> liste les skins et leur état",
        resetSave: "cookieDev.resetSave() -> reset la sauvegarde",
        stats: "cookieDev.stats() -> affiche l'état courant",
        listUpgrades: "cookieDev.listUpgrades() -> liste les améliorations",
      });
    },
    give(amount = 1_000_000) {
      amount = Number(amount) || 0;
      addCookies(amount);
      render();
      saveDebounced();
      console.log(`+${fmt.format(Math.floor(amount))} cookies ajoutés (dev).`);
    },
    set(value) {
      const n = Math.max(0, Number(value) || 0);
      state.cookies = n;
      render();
      saveDebounced();
      console.log(`Cookies fixés à ${fmt.format(Math.floor(n))}.`);
    },
    addUpgrade(id, count = 1) {
      const def = UPGRADE_DEFS.find((u) => u.id === id);
      if (!def) {
        console.warn("Id d'amélioration inconnu:", id);
        return;
      }
      const c = Math.max(0, Number(count) || 0);
      if (!state.upgrades[id]) state.upgrades[id] = { owned: 0 };
      state.upgrades[id].owned += c;
      render();
      saveDebounced();
      console.log(`Ajouté ${c}x ${def.name} (${id}).`);
    },
    maxAll(count = 100) {
      const c = Math.max(0, Number(count) || 0);
      for (const u of UPGRADE_DEFS) {
        if (!state.upgrades[u.id]) state.upgrades[u.id] = { owned: 0 };
        state.upgrades[u.id].owned += c;
      }
      render();
      saveDebounced();
      console.log(`Ajouté ${c} exemplaires de chaque amélioration.`);
    },
    resetSave() {
      resetAll();
      saveDebounced();
      console.log("Sauvegarde réinitialisée via cookieDev.resetSave().");
    },
    stats() {
      console.table({
        cookies: state.cookies,
        totalCookies: state.totalCookies,
        cps: getCps(),
        cpc: getCpc(),
      });
    },
    listUpgrades() {
      console.table(
        UPGRADE_DEFS.map((u) => ({
          id: u.id,
          name: u.name,
          type: u.type,
          value: u.value,
          owned: state.upgrades[u.id]?.owned ?? 0,
        })),
      );
    },
    unlockSkin(id) {
      const skin = SKIN_DEFS.find((s) => s.id === id);
      if (!skin) {
        console.warn("Skin inconnu:", id, "Ids:", SKIN_DEFS.map((s) => s.id).join(", "));
        return;
      }
      if (!state.unlockedSkins.includes(id)) state.unlockedSkins.push(id);
      state.currentSkinId = id;
      render();
      saveDebounced();
      console.log("Skin débloqué et équipé:", skin.name, skin.emoji);
    },
    setSkin(id) {
      const skin = SKIN_DEFS.find((s) => s.id === id);
      if (!skin) {
        console.warn("Skin inconnu:", id);
        return;
      }
      if (!state.unlockedSkins.includes(id)) state.unlockedSkins.push(id);
      state.currentSkinId = id;
      render();
      saveDebounced();
      console.log("Skin équipé:", skin.name, skin.emoji);
    },
    listSkins() {
      console.table(
        SKIN_DEFS.map((s) => ({
          id: s.id,
          name: s.name,
          emoji: s.emoji,
          rarity: s.rarity,
          unlocked: state.unlockedSkins.includes(s.id),
          equipped: state.currentSkinId === s.id,
        })),
      );
    },
  };

  window.cookieDev = api;
  console.log(
    "%cCookie dev prêt.",
    "color:#4ade80;font-weight:bold",
    "Tape `cookieDev.help()` dans la console pour voir les commandes.",
  );
}

function setHint(text) {
  const el = document.getElementById("hint");
  if (!el) return;
  el.textContent = text ?? "";
}

function floatText(anchorEl, text) {
  const rect = anchorEl.getBoundingClientRect();
  const el = document.createElement("div");
  el.className = "float";
  el.textContent = text;
  el.style.left = `${rect.left + rect.width / 2}px`;
  el.style.top = `${rect.top + rect.height / 2}px`;
  el.style.transform = "translate(-50%, -20px) scale(0.98)";
  el.style.opacity = "0";
  document.body.appendChild(el);

  const t0 = performance.now();
  const dur = 850;
  function tick(t) {
    const p = clamp((t - t0) / dur, 0, 1);
    const y = -20 - p * 42;
    el.style.transform = `translate(-50%, ${y}px) scale(${0.98 + p * 0.06})`;
    el.style.opacity = `${(1 - p) * 1.0}`;
    if (p < 1) requestAnimationFrame(tick);
    else el.remove();
  }
  requestAnimationFrame(tick);
}

function showBoxInfoPopup(boxId) {
  const box = getBoxById(boxId);
  const skins = SKIN_DEFS.filter(s => s.boxId === boxId);
  const totalWeight = skins.reduce((sum, s) => sum + (s.weight ?? 0), 0);

  // Remove any existing popup
  const existing = document.getElementById("boxInfoModal");
  if (existing) existing.remove();

  const rarityColors = {
    common: "#94a3b8",
    rare: "#38bdf8",
    epic: "#a855f7",
    legendary: "#fbbf24"
  };

  let lootHtml = skins.map(s => {
    const pct = ((s.weight ?? 0) / (totalWeight || 1)) * 100;
    const pctStr = pct >= 1 ? pct.toFixed(1) + "%" : pct >= 0.01 ? pct.toFixed(3) + "%" : pct.toFixed(4) + "%";
    const color = rarityColors[s.rarity] || "#fff";
    const mult = s.multiplier ? ` <span style="color:#4ade80;font-weight:700">(×${s.multiplier})</span>` : "";
    return `<div style="display:flex;align-items:center;gap:0.6rem;padding:0.45rem 0;border-bottom:1px solid rgba(255,255,255,0.06)">
      <span style="font-size:1.5rem">${s.emoji}</span>
      <div style="flex:1">
        <div style="font-weight:600;color:#fff">${s.name}${mult}</div>
        <div style="font-size:0.78rem;color:${color};text-transform:uppercase;letter-spacing:0.03em">${s.rarity}</div>
      </div>
      <div style="font-size:0.9rem;font-weight:700;color:${color}">${pctStr}</div>
    </div>`;
  }).join("");

  const priceLabel = box.isPaid
    ? `<span style="color:#fbbf24;font-weight:700">${box.price}</span>`
    : `<span style="color:#4ade80;font-weight:700">${fmtShort(box.price)} 🍪</span>`;

  const modal = document.createElement("div");
  modal.id = "boxInfoModal";
  modal.style.cssText = "position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;animation:fadeIn .2s ease";

  modal.innerHTML = `
    <div style="position:absolute;inset:0;background:rgba(0,0,0,0.65);backdrop-filter:blur(4px)" id="boxInfoBackdrop"></div>
    <div style="position:relative;background:linear-gradient(135deg,#1e1b2e 0%,#2d2250 100%);border:1px solid rgba(255,255,255,0.1);border-radius:1rem;padding:1.5rem;max-width:420px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.5)">
      <div style="text-align:center;margin-bottom:1rem">
        <div style="font-size:2.5rem">${box.icon}</div>
        <div style="font-size:1.3rem;font-weight:800;color:#fff;margin-top:0.3rem">${box.name}</div>
        <div style="font-size:0.95rem;margin-top:0.3rem">Prix : ${priceLabel}</div>
      </div>
      <div style="font-size:0.85rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.5rem">Loots possibles</div>
      <div>${lootHtml}</div>
      
      ${box.isPaid ? `
        <div style="margin-top:1.25rem;padding:1rem;background:rgba(0,0,0,0.3);border-radius:0.75rem;border:1px solid rgba(255,255,255,0.05)">
          <div style="font-weight:700;margin-bottom:0.75rem;font-size:0.9rem">Tu as une Product Key ? 🔑</div>
          <input type="text" id="boxKeyInput" placeholder="KEY-SROFF-XXXX-XXXX-XXXX-XXXX" style="width:100%;padding:0.6rem;background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.15);border-radius:0.4rem;color:#fff;font-family:monospace;margin-bottom:0.5rem;outline:none" />
          <div style="display:flex;gap:0.5rem">
            <button id="boxInfoBuy" type="button" style="flex:1;padding:0.6rem;border:none;border-radius:0.4rem;background:linear-gradient(135deg,#10b981,#059669);color:#fff;font-weight:800;font-size:0.9rem;cursor:pointer;transition:opacity .15s">Valider la clé</button>
            <a href="https://sroff-shop.mysellauth.com/product/lootbox-key" target="_blank" style="flex:1;padding:0.6rem;border:1px solid #fbbf24;border-radius:0.4rem;background:rgba(251,191,36,0.1);color:#fbbf24;font-weight:800;font-size:0.9rem;cursor:pointer;transition:opacity .15s;text-align:center;text-decoration:none">Acheter une clé</a>
          </div>
        </div>
      ` : `
        <button id="boxInfoBuy" type="button" style="margin-top:1rem;width:100%;padding:0.75rem;border:none;border-radius:0.5rem;background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;font-weight:800;font-size:1rem;cursor:pointer;transition:opacity .15s;letter-spacing:0.02em">🎲 Ouvrir la box (${fmtShort(box.price)} 🍪)</button>
      `}
      
      <button id="boxInfoClose" type="button" style="margin-top:0.5rem;width:100%;padding:0.55rem;border:1px solid rgba(255,255,255,0.15);border-radius:0.5rem;background:transparent;color:#94a3b8;font-weight:600;font-size:0.85rem;cursor:pointer;transition:opacity .15s">Fermer</button>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById("boxInfoBackdrop").addEventListener("click", () => modal.remove());
  document.getElementById("boxInfoClose").addEventListener("click", () => modal.remove());
  document.getElementById("boxInfoBuy").addEventListener("click", async () => {
    if (box.isPaid) {
      const inputEl = document.getElementById("boxKeyInput");
      const keyVal = inputEl ? inputEl.value.trim() : "";
      if (!keyVal) {
        setHint("⚠️ Veuillez entrer une clé produit.");
        return;
      }

      const hashed = await hashKey(keyVal);

      // Call the server to validate & consume the key globally
      let serverOk = false;
      let serverError = "Erreur réseau, réessaye.";
      try {
        const resp = await fetch("/api/redeem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyHash: hashed }),
        });
        const data = await resp.json();
        if (data.ok) {
          serverOk = true;
        } else {
          serverError = data.error || "Clé invalide.";
        }
      } catch (e) {
        serverError = "Erreur réseau, vérifie ta connexion.";
      }

      if (!serverOk) {
        setHint(`❌ ${serverError}`);
        return;
      }

      // Key accepted by server — award the prize
      state.usedKeys.push(hashed);
      saveDebounced();
      modal.remove();
      state.currentBoxId = boxId;
      render();

      // Manually trigger the gamble for the paid box using the redeemed key
      const won = drawRandomSkinFromBox("paid");
      runGambleAnimation(won, boxId, () => {
        const alreadyHad = state.unlockedSkins.includes(won.id);
        if (!alreadyHad) state.unlockedSkins.push(won.id);
        state.currentSkinId = won.id;
        const msg = alreadyHad
          ? `Clé validée ! Tu as tiré ${won.emoji} ${won.name} (déjà possédé) — équipé !`
          : `Clé validée ! Nouveau skin exclusif: ${won.emoji} ${won.name} !`;
        setHint(msg);

        const gResult = document.getElementById("gambleResult");
        if (gResult) gResult.textContent = msg;

        const gambleModal = document.getElementById("gambleModal");
        if (gambleModal) gambleModal.classList.add("is-open");

        const gambleModalClose = document.getElementById("gambleModalClose");
        if (gambleModalClose) gambleModalClose.style.display = "";

        const gambleModalResult = document.getElementById("gambleModalResult");
        if (gambleModalResult) gambleModalResult.textContent = msg;

        saveDebounced();
        buildSkinsList();
        render();
      });
      return;
    }

    modal.remove();
    // Ensure the correct box is selected
    state.currentBoxId = boxId;
    render();
    // Simulate clicking the gamble button
    const btn = document.getElementById("btnGamble");
    if (btn) btn.click();
  });
}

function buildShop() {
  const shop = document.getElementById("shop");
  if (!shop) return;
  shop.innerHTML = "";

  for (const u of UPGRADE_DEFS) {
    const owned = state.upgrades[u.id]?.owned ?? 0;
    const cost = powCost(u.baseCost, owned);
    const cps = u.type === "cps" ? u.value : 0;
    const cpc = u.type === "cpc" ? u.value : 0;

    const item = document.createElement("div");
    item.className = "item";

    const left = document.createElement("div");
    const name = document.createElement("div");
    name.className = "item__name";
    name.textContent = u.name;
    const desc = document.createElement("div");
    desc.className = "item__desc";
    desc.textContent = u.desc;

    const meta = document.createElement("div");
    meta.className = "item__meta";

    const tagCost = document.createElement("div");
    tagCost.className = "tag";
    tagCost.textContent = `Coût: ${fmtShort(cost)}`;
    meta.appendChild(tagCost);

    if (cps) {
      const t = document.createElement("div");
      t.className = "tag tag--good";
      t.textContent = `+${fmtShort(cps)}/s`;
      meta.appendChild(t);
    }
    if (cpc) {
      const t = document.createElement("div");
      t.className = "tag tag--warn";
      t.textContent = `+${fmtShort(cpc)}/clic`;
      meta.appendChild(t);
    }

    left.appendChild(name);
    left.appendChild(desc);
    left.appendChild(meta);

    const right = document.createElement("div");
    right.className = "buy";

    const btn = document.createElement("button");
    btn.className = "buy__btn";
    btn.type = "button";
    btn.textContent = "Acheter";
    btn.disabled = !canAfford(cost);
    btn.addEventListener("click", () => {
      const ownedNow = state.upgrades[u.id]?.owned ?? 0;
      const realCost = powCost(u.baseCost, ownedNow);
      if (!canAfford(realCost)) return;
      spendCookies(realCost);
      state.upgrades[u.id] = { owned: ownedNow + 1 };
      setHint(`${u.name} acheté.`);
      saveDebounced();
      render();
    });

    const ownedEl = document.createElement("div");
    ownedEl.className = "buy__owned";
    ownedEl.textContent = `Possédés: ${fmtShort(owned)}`;
    ownedEl.dataset.ownedFor = u.id;

    right.appendChild(btn);
    right.appendChild(ownedEl);

    item.appendChild(left);
    item.appendChild(right);
    shop.appendChild(item);
  }
}

function render() {
  const cookiesEl = document.getElementById("cookies");
  const cpsEl = document.getElementById("cps");
  const cpcEl = document.getElementById("cpc");
  const totalEl = document.getElementById("total");
  const lastSaveEl = document.getElementById("lastSave");
  const offlineGainEl = document.getElementById("offlineGain");

  const cps = getCps();
  const cpc = getCpc();

  if (cookiesEl) cookiesEl.textContent = fmtShort(Math.floor(state.cookies));
  if (cpsEl) cpsEl.textContent = fmtShort(roundTo(cps, 1));
  if (cpcEl) cpcEl.textContent = fmtShort(cpc);
  if (totalEl) totalEl.textContent = `Total: ${fmtShort(Math.floor(state.totalCookies))}`;
  if (lastSaveEl) lastSaveEl.textContent = state.lastSave ? formatTime(state.lastSave) : "—";
  if (offlineGainEl)
    offlineGainEl.textContent =
      state.lastOfflineGain == null ? "—" : `+${fmtShort(Math.floor(state.lastOfflineGain))}`;

  const cookieEmojiEl = document.getElementById("cookieEmoji");
  if (cookieEmojiEl) cookieEmojiEl.textContent = getSkinEmoji(state.currentSkinId);

  // The box tabs and VIP popup handle everything now; btnGamble is hidden.

  // refresh shop (costs + disabled state + owned)
  const shop = document.getElementById("shop");
  if (!shop || shop.children.length === 0) {
    buildShop();
    return;
  }

  const itemEls = shop.querySelectorAll(".item");
  itemEls.forEach((itemEl, idx) => {
    const u = UPGRADE_DEFS[idx];
    if (!u) return;
    const owned = state.upgrades[u.id]?.owned ?? 0;
    const cost = powCost(u.baseCost, owned);

    const costTag = itemEl.querySelector(".tag");
    if (costTag) costTag.textContent = `Coût: ${fmtShort(cost)}`;

    const btn = itemEl.querySelector("button.buy__btn");
    if (btn) btn.disabled = !canAfford(cost);

    const ownedEl = itemEl.querySelector(`[data-owned-for="${u.id}"]`);
    if (ownedEl) ownedEl.textContent = `Possédés: ${fmtShort(owned)}`;
  });

  const list = document.getElementById("skinsList");
  if (list) {
    if (list.children.length !== SKIN_DEFS.length) {
      buildSkinsList();
    } else {
      const unlocked = state.unlockedSkins || ["default"];
      for (const card of list.children) {
        const id = card.dataset.skinId;
        const isUnlocked = unlocked.includes(id);
        card.classList.toggle("skin-card--equipped", state.currentSkinId === id);
        card.classList.toggle("skin-card--locked", !isUnlocked);
        card.disabled = !isUnlocked;
      }
    }
  }
}

function buildSkinsList() {
  const list = document.getElementById("skinsList");
  if (!list) return;
  list.innerHTML = "";
  const unlocked = state.unlockedSkins || ["default"];
  const sorted = getSkinsSortedByRarity();
  for (const skin of sorted) {
    const id = skin.id;
    const isUnlocked = unlocked.includes(id);
    const card = document.createElement("button");
    card.type = "button";
    card.dataset.skinId = id;
    card.className =
      "skin-card" +
      (state.currentSkinId === id ? " skin-card--equipped" : "") +
      (isUnlocked ? "" : " skin-card--locked");
    card.disabled = !isUnlocked;
    const prob = formatProbabilityForSkin(skin);
    card.innerHTML = `
      <span class="skin-card__emoji">${skin.emoji}</span>
      <div class="skin-card__info">
        <div class="skin-card__name">${skin.name}</div>
        <div class="skin-card__rarity skin-card__rarity--${skin.rarity}">${skin.rarity}</div>
        <div class="skin-card__prob">${prob}</div>
      </div>`;
    card.addEventListener("click", (e) => {
      e.preventDefault();
      if (!(state.unlockedSkins || ["default"]).includes(id)) return;
      state.currentSkinId = id;
      setHint(`Skin équipé: ${skin.name} ${skin.emoji}`);
      saveDebounced();
      render();
    });
    list.appendChild(card);
  }
}

let saveTimer = null;
function saveDebounced() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    save();
  }, 450);
}

function gameLoop() {
  const t = nowMs();
  if (state.lastTick == null) state.lastTick = t;

  const dtMs = Math.min(250, Math.max(0, t - state.lastTick));
  state.lastTick = t;

  const cps = getCps();
  if (cps > 0) {
    addCookies((cps * dtMs) / 1000);
  }

  render();
  requestAnimationFrame(gameLoop);
}

function init() {
  const cookieBtn = document.getElementById("cookieBtn");
  const btnSave = document.getElementById("btnSave");
  const btnReset = document.getElementById("btnReset");

  if (cookieBtn) {
    cookieBtn.addEventListener("click", () => {
      const gain = getCpc();
      addCookies(gain);
      floatText(cookieBtn, `+${fmt.format(gain)}`);
      saveDebounced();
      render();
    });
  }

  if (btnSave) btnSave.addEventListener("click", () => save());

  if (btnReset)
    btnReset.addEventListener("click", () => {
      const ok = confirm("Reset la sauvegarde ? (irréversible)");
      if (!ok) return;
      resetAll();
      saveDebounced();
    });

  const btnGamble = document.getElementById("btnGamble");
  const gambleResult = document.getElementById("gambleResult");
  const modal = document.getElementById("gambleModal");
  const reelEmoji = document.getElementById("gambleReelEmoji");
  const modalResult = document.getElementById("gambleModalResult");
  const modalClose = document.getElementById("gambleModalClose");

  if (btnGamble) {
    btnGamble.addEventListener("click", () => {
      const box = getBoxById(state.currentBoxId);
      if (box.isPaid) {
        showBoxInfoPopup(box.id);
        return;
      } else {
        const price = getBoxPrice(box.id);
        if (!canAfford(price)) return;
        spendCookies(price);
        state.clickCount++;

        const won = drawRandomSkinFromBox(box.id);
        runGambleAnimation(won, box.id, () => {
          const alreadyHad = state.unlockedSkins.includes(won.id);
          if (!alreadyHad) state.unlockedSkins.push(won.id);
          state.currentSkinId = won.id;
          const msg = alreadyHad
            ? `Tu as tiré ${won.emoji} ${won.name} (déjà possédé) — équipé !`
            : `Nouveau skin débloqué: ${won.emoji} ${won.name} !`;
          setHint(msg);

          if (gambleResult) gambleResult.textContent = msg;
          if (modalResult) modalResult.textContent = msg;
          if (modal) modal.classList.add("is-open");
          if (modalClose) modalClose.style.display = "";
          saveDebounced();
          buildSkinsList();
          render();
        });
      }
    });
  }

  function closeGambleModal() {
    if (modal) modal.classList.remove("is-open");
    if (modalResult) modalResult.textContent = "";
    if (modalClose) modalClose.style.display = "none";
  }

  if (modalClose) {
    modalClose.style.display = "none";
    modalClose.addEventListener("click", closeGambleModal);
  }
  const backdrop = modal && modal.querySelector(".gamble-modal__backdrop");
  if (backdrop) backdrop.addEventListener("click", closeGambleModal);

  // Navigation tabs (Améliorations / Achats / Skins)
  const navTabs = document.getElementById("navTabs");
  if (navTabs) {
    navTabs.addEventListener("click", (e) => {
      const target = e.target.closest("[data-tab]");
      if (!target) return;
      const tabId = target.dataset.tab;
      if (!tabId) return;

      // Toggle active tab button
      for (const t of navTabs.children) {
        t.classList.toggle("nav-tab--active", t === target);
      }

      // Toggle active tab content
      document.querySelectorAll(".tab-content").forEach(el => {
        el.classList.toggle("tab-content--active", el.dataset.tabContent === tabId);
      });
    });
  }

  // Tabs des box
  const boxTabs = document.getElementById("boxTabs");
  if (boxTabs) {
    boxTabs.addEventListener("click", (e) => {
      const target = e.target.closest("[data-box-id]");
      if (!target) return;
      const boxId = target.dataset.boxId;
      if (!boxId) return;
      state.currentBoxId = boxId;
      for (const child of boxTabs.children) {
        child.classList.toggle("box-tab--active", child === target);
      }
      render();
      showBoxInfoPopup(boxId);
    });
  }

  window.addEventListener("beforeunload", () => {
    try {
      save();
    } catch {
      // ignore
    }
  });

  load();
  buildShop();
  render();
  setupDevApi();
  requestAnimationFrame(gameLoop);

  setInterval(() => {
    // autosave léger
    saveDebounced();
  }, 12_000);
}

document.addEventListener("DOMContentLoaded", init);
