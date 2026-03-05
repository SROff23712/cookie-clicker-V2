const STORAGE_KEY = "mini_cookie_clicker_save_v1";

const fmt = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const fmt1 = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

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
    desc: "Importe des cookies d’un autre monde.",
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
    desc: "Cada clic devient une explosion de cookies.",
    baseCost: 2000000000,
    type: "cpc",
    value: 50,
  },
];

const RARITY_ORDER = { common: 0, rare: 1, epic: 2, legendary: 3 };

// Chaque skin appartient à UNE box et a un "poids" pour le tirage dans cette box.
// Les poids de chaque box font 4000 au total -> le skin le plus rare (poids 1) ≈ 1 / 4000 = 0,025 %.
const SKIN_DEFS = [
  // Box Bronze
  { id: "default",  emoji: "🍪", name: "Cookie classique", rarity: "common",    boxId: "bronze", weight: 1500 },
  { id: "chocolate",emoji: "🍫", name: "Chocolat",         rarity: "common",    boxId: "bronze", weight: 1200 },
  { id: "candy",    emoji: "🍬", name: "Bonbon",           rarity: "common",    boxId: "bronze", weight: 800  },
  { id: "donut",    emoji: "🍩", name: "Donut",            rarity: "rare",      boxId: "bronze", weight: 499  },
  { id: "bronzeStar",emoji:"🌟", name: "Étoile de bronze", rarity: "legendary", boxId: "bronze", weight: 1    },

  // Box Argent
  { id: "cupcake",  emoji: "🧁", name: "Cupcake",          rarity: "common",    boxId: "silver", weight: 1500 },
  { id: "honey",    emoji: "🍯", name: "Miel",             rarity: "rare",      boxId: "silver", weight: 1200 },
  { id: "moon",     emoji: "🌙", name: "Lune",             rarity: "rare",      boxId: "silver", weight: 800  },
  { id: "star",     emoji: "⭐", name: "Étoile",           rarity: "epic",      boxId: "silver", weight: 499  },
  { id: "silverStar",emoji:"✨", name: "Étoile d’argent",  rarity: "legendary", boxId: "silver", weight: 1    },

  // Box Or
  { id: "fire",     emoji: "🔥", name: "Feu",              rarity: "rare",      boxId: "gold",   weight: 1500 },
  { id: "rainbow",  emoji: "🌈", name: "Arc-en-ciel",      rarity: "epic",      boxId: "gold",   weight: 1200 },
  { id: "diamond",  emoji: "💎", name: "Diamant",          rarity: "epic",      boxId: "gold",   weight: 800  },
  { id: "galaxy",   emoji: "🌌", name: "Galaxie",          rarity: "epic",      boxId: "gold",   weight: 499  },
  { id: "golden",   emoji: "👑", name: "Golden Cookie",    rarity: "legendary", boxId: "gold",   weight: 1    },
];

const BOX_DEFS = [
  { id: "bronze", name: "Box Bronze", icon: "🥉", price: 2000 },
  { id: "silver", name: "Box Argent", icon: "🥈", price: 6000 },
  { id: "gold",   name: "Box Or",     icon: "🥇", price: 15000 },
];

const state = {
  cookies: 0,
  totalCookies: 0,
  upgrades: Object.fromEntries(UPGRADE_DEFS.map((u) => [u.id, { owned: 0 }])),
  unlockedSkins: ["default"],
  currentSkinId: "default",
  currentBoxId: "bronze",
  lastSave: null,
  lastTick: null,
  lastLoadedAt: null,
  lastOfflineGain: null,
};

function getCpc() {
  let cpc = 1;
  for (const u of UPGRADE_DEFS) {
    const owned = state.upgrades[u.id]?.owned ?? 0;
    if (u.type === "cpc") cpc += owned * u.value;
  }
  return cpc;
}

function getCps() {
  let cps = 0;
  for (const u of UPGRADE_DEFS) {
    const owned = state.upgrades[u.id]?.owned ?? 0;
    if (u.type === "cps") cps += owned * u.value;
  }
  return cps;
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

function runGambleAnimation(wonSkin, onComplete) {
  const modal = document.getElementById("gambleModal");
  const reelEmoji = document.getElementById("gambleReelEmoji");
  const modalResult = document.getElementById("gambleModalResult");
  const modalClose = document.getElementById("gambleModalClose");
  if (!modal || !reelEmoji) {
    onComplete();
    return;
  }
  if (modalResult) modalResult.textContent = "";
  if (modalClose) modalClose.style.display = "none";
  modal.classList.add("is-open");

  let step = 0;
  const totalSteps = 28;
  const baseDelay = 70;
  const delays = [];
  for (let i = 0; i < totalSteps; i++) {
    delays.push(baseDelay + i * 18 + Math.floor(Math.random() * 25));
  }

  function showRandom() {
    const s = SKIN_DEFS[Math.floor(Math.random() * SKIN_DEFS.length)];
    reelEmoji.textContent = s.emoji;
    reelEmoji.classList.toggle("spin", true);
    const t = setTimeout(() => reelEmoji.classList.toggle("spin", false), 60);
  }

  function tick() {
    showRandom();
    step++;
    if (step >= totalSteps) {
      reelEmoji.textContent = wonSkin.emoji;
      reelEmoji.classList.toggle("spin", false);
      onComplete();
      return;
    }
    setTimeout(tick, delays[step - 1]);
  }

  tick();
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
    upgrades: Object.fromEntries(
      Object.entries(state.upgrades).map(([id, u]) => [id, { owned: u.owned ?? 0 }]),
    ),
    unlockedSkins: Array.isArray(state.unlockedSkins) ? state.unlockedSkins : ["default"],
    currentSkinId: state.currentSkinId || "default",
    lastSave: nowMs(),
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

    for (const u of UPGRADE_DEFS) {
      const owned = parsed.upgrades?.[u.id]?.owned ?? 0;
      state.upgrades[u.id] = { owned: clamp(Number(owned), 0, 1e9) };
    }

    state.unlockedSkins = Array.isArray(parsed.unlockedSkins) ? parsed.unlockedSkins : ["default"];
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
    tagCost.textContent = `Coût: ${fmt.format(cost)}`;
    meta.appendChild(tagCost);

    if (cps) {
      const t = document.createElement("div");
      t.className = "tag tag--good";
      t.textContent = `+${fmt1.format(cps)}/s`;
      meta.appendChild(t);
    }
    if (cpc) {
      const t = document.createElement("div");
      t.className = "tag tag--warn";
      t.textContent = `+${fmt.format(cpc)}/clic`;
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
    ownedEl.textContent = `Possédés: ${fmt.format(owned)}`;
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

  if (cookiesEl) cookiesEl.textContent = fmt.format(Math.floor(state.cookies));
  if (cpsEl) cpsEl.textContent = fmt1.format(roundTo(cps, 1));
  if (cpcEl) cpcEl.textContent = fmt.format(cpc);
  if (totalEl) totalEl.textContent = `Total: ${fmt.format(Math.floor(state.totalCookies))}`;
  if (lastSaveEl) lastSaveEl.textContent = state.lastSave ? formatTime(state.lastSave) : "—";
  if (offlineGainEl)
    offlineGainEl.textContent =
      state.lastOfflineGain == null ? "—" : `+${fmt.format(Math.floor(state.lastOfflineGain))}`;

  const cookieEmojiEl = document.getElementById("cookieEmoji");
  if (cookieEmojiEl) cookieEmojiEl.textContent = getSkinEmoji(state.currentSkinId);

  const currentBox = getBoxById(state.currentBoxId);
  const gambleCostEl = document.getElementById("gambleCost");
  if (gambleCostEl) gambleCostEl.textContent = fmt.format(getBoxPrice(currentBox.id));
  const currentBoxLabel = document.getElementById("currentBoxLabel");
  if (currentBoxLabel)
    currentBoxLabel.textContent = `${currentBox.icon} ${currentBox.name}`;
  const btnGamble = document.getElementById("btnGamble");
  if (btnGamble) btnGamble.disabled = !canAfford(getBoxPrice(currentBox.id));

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
    if (costTag) costTag.textContent = `Coût: ${fmt.format(cost)}`;

    const btn = itemEl.querySelector("button.buy__btn");
    if (btn) btn.disabled = !canAfford(cost);

    const ownedEl = itemEl.querySelector(`[data-owned-for="${u.id}"]`);
    if (ownedEl) ownedEl.textContent = `Possédés: ${fmt.format(owned)}`;
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
      const price = getBoxPrice(box.id);
      if (!canAfford(price)) {
        setHint(`Pas assez de cookies pour ouvrir ${box.icon} ${box.name}.`);
        if (gambleResult) gambleResult.textContent = "";
        return;
      }
      spendCookies(price);
      const won = drawRandomSkinFromBox(box.id);
      runGambleAnimation(won, () => {
        const alreadyHad = state.unlockedSkins.includes(won.id);
        if (!alreadyHad) state.unlockedSkins.push(won.id);
        state.currentSkinId = won.id;
        const msg = alreadyHad
          ? `Tu as tiré ${won.emoji} ${won.name} (déjà possédé) — équipé !`
          : `Nouveau skin: ${won.emoji} ${won.name} (${won.rarity}) !`;
        setHint(msg);
        if (gambleResult) gambleResult.textContent = msg;
        if (modalResult) modalResult.textContent = msg;
        if (modal) modal.classList.add("is-open");
        if (modalClose) modalClose.style.display = "";
        saveDebounced();
        buildSkinsList();
        render();
      });
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

  // Tabs des box
  const boxTabs = document.getElementById("boxTabs");
  if (boxTabs) {
    boxTabs.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      const boxId = target.dataset.boxId;
      if (!boxId) return;
      state.currentBoxId = boxId;
      for (const child of boxTabs.children) {
        child.classList.toggle("box-tab--active", child === target);
      }
      render();
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
