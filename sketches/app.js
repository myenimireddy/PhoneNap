/**
 * App wiring. Data comes from:
 *   PlacesStore  — home situations
 *   MissionsStore — missions for a place
 *   PinStore — parent unlock PIN
 * See docs/FLOW.md
 */
const RECENT_KEY = "phonenap-recent-v24";
const AGE_KEY = "phonenap-age-band";
/** Append-only local check-in log for multi-session pilots */
const FEEDBACK_KEY = "phonenap-feedback-log-v1";
/** Set true only for demos — physical pilot keeps recents empty until real naps */
const SEED_RECENTS_FOR_DEMO = false;
/** Quiet pause after speech ends before the screen goes inert */
const SETTLE_MS = 3000;
/** If utterance never ends (muted APIs, errors), treat speech as done */
const SPEECH_FALLBACK_MS = 10000;

const state = {
  situation: null,
  mission: null,
  pin: "",
  setupPin: "",
  setupMode: "create", // verify | create | confirm
  settleTimer: null,
  speechFallbackTimer: null,
  speechFinished: false,
  speechRunId: 0,
  replayUsed: false,
  /** "recent" | "new" — automatic path metric */
  path: null,
  flowStartedAt: null,
  secondsToSleep: null,
};

function $(sel, root = document) {
  return root.querySelector(sel);
}

function $all(sel, root = document) {
  return [...root.querySelectorAll(sel)];
}

function placeLabel(id) {
  return PlacesStore.label(id);
}

function findMission(_situation, missionId) {
  return MissionsStore.get(missionId);
}

function carSVG(color = "#d45b5b") {
  return `<svg class="shape-car-svg" viewBox="0 0 40 24" width="28" height="17" aria-hidden="true">
    <path fill="${color}" d="M8 14h24l-2-6c-1-3-3-4-6-4h-8c-3 0-5 1-6 4l-2 6z"/>
    <rect x="6" y="14" width="28" height="5" rx="1.5" fill="${color}"/>
    <circle cx="12" cy="19" r="3" fill="#1a2a2e"/>
    <circle cx="28" cy="19" r="3" fill="#1a2a2e"/>
    <path fill="#c8e0ea" d="M14 8h5l1 5h-7l1-5zm7 0h5c1.5.5 2 2 2.5 5h-7.5l0-5z"/>
  </svg>`;
}

function artHTML(art, large = false) {
  const size = large ? " lg" : "";
  const xl = large ? " xl" : "";
  const cars = Array(5)
    .fill(0)
    .map(() => `<span class="car-wrap">${carSVG()}</span>`)
    .join("");

  const map = {
    "three-blue": `<div class="art-inner"><span class="dot blue${size}"></span><span class="dot blue${size}"></span><span class="dot blue${size}"></span></div>`,
    "one-yellow": `<div class="art-inner"><span class="dot yellow${xl || " lg"}"></span></div>`,
    "five-round": `<div class="art-inner">${Array(5).fill(`<span class="dot${size}"></span>`).join("")}</div>`,
    cart: `<div class="art-inner"><span class="shape-cart"></span></div>`,
    spoons: `<div class="art-inner"><span class="shape-spoon"></span><span class="shape-spoon"></span><span class="shape-spoon"></span></div>`,
    "three-green": `<div class="art-inner"><span class="dot green${size}"></span><span class="dot green${size}"></span><span class="dot green${size}"></span></div>`,
    cup: `<div class="art-inner"><span class="shape-cup"></span></div>`,
    hands: `<div class="art-inner"><span class="shape-hands"></span></div>`,
    "five-cars": `<div class="art-inner art-cars">${cars}</div>`,
    truck: `<div class="art-inner"><span class="shape-truck"></span></div>`,
    sign: `<div class="art-inner"><span class="shape-sign"></span></div>`,
    clouds: `<div class="art-inner"><span class="shape-cloud"></span><span class="shape-cloud"></span></div>`,
    pajamas: `<div class="art-inner"><span class="shape-pj"></span></div>`,
    "shoes-away": `<div class="art-inner art-action"><span class="shape-shoe"></span><span class="shape-arrow-down"></span><span class="shape-bin"></span></div>`,
    "shoes-on": `<div class="art-inner art-action"><span class="shape-shoe"></span><span class="shape-arrow-down"></span><span class="shape-foot"></span></div>`,
    "get-book": `<div class="art-inner art-action"><span class="shape-book"></span><span class="shape-arrow-in"></span><span class="shape-hands-small"></span></div>`,
    "hug-bear": `<div class="art-inner art-hug"><span class="shape-arm left"></span><span class="shape-bear"></span><span class="shape-arm right"></span><span class="shape-heart"></span></div>`,
  };
  return map[art] || `<div class="art-inner"><span class="dot blue"></span></div>`;
}

function fillArt(el, art, large = false) {
  if (!el) return;
  el.innerHTML = artHTML(art, large);
}

function loadRecent() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecent(entry) {
  const next = [
    entry,
    ...loadRecent().filter(
      (r) => !(r.situation === entry.situation && r.missionId === entry.missionId)
    ),
  ].slice(0, 3);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  renderRecent();
}

function seedRecentIfEmpty() {
  if (!SEED_RECENTS_FOR_DEMO) return;
  if (loadRecent().length) return;
  localStorage.setItem(
    RECENT_KEY,
    JSON.stringify([
      { situation: "anytime", missionId: "any-hug" },
      { situation: "anytime", missionId: "any-blue" },
      { situation: "car", missionId: "car-red" },
    ])
  );
}

function renderRecent() {
  const block = $("#recent-block");
  const list = $("#recent-list");
  const recent = loadRecent()
    .map((r) => ({ ...r, mission: findMission(r.situation, r.missionId) }))
    .filter((r) => r.mission);

  if (!recent.length) {
    block.hidden = true;
    list.innerHTML = "";
    return;
  }

  block.hidden = false;
  list.innerHTML = "";
  recent.forEach((r) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "recent-card";
    if (state.situation === r.situation && state.mission?.id === r.missionId) {
      btn.classList.add("is-selected");
    }
    btn.innerHTML = `
      <div class="mission-art">${artHTML(r.mission.art)}</div>
      <div class="recent-copy">
        <p class="sit">${placeLabel(r.situation)}</p>
        <p class="mis">${r.mission.text}</p>
      </div>
    `;
    btn.addEventListener("click", () => {
      state.situation = r.situation;
      state.mission = r.mission;
      state.path = "recent";
      // Timer already running from Home visible — do not restart here
      $all("[data-situation]").forEach((b) => b.classList.remove("is-selected"));
      showReadyBar(true);
      renderRecent();
    });
    list.appendChild(btn);
  });
}

function showReadyBar(show) {
  const bar = $("#ready-bar");
  bar.hidden = !show;
  if (!show || !state.mission) return;
  $("#ready-situation").textContent = placeLabel(state.situation);
  $("#ready-mission").textContent = state.mission.text;
  fillArt($("#ready-art"), state.mission.art);
}

function renderPlaces() {
  const grid = $("#situation-grid");
  grid.innerHTML = "";
  const places = PlacesStore.listEnabled();
  places.forEach((place, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice" + (i === places.length - 1 && places.length % 2 === 1 ? " choice-wide" : "");
    btn.dataset.situation = place.id;
    btn.innerHTML = `<span>${place.label}</span>`;
    if (state.situation === place.id) btn.classList.add("is-selected");
    btn.addEventListener("click", () => {
      state.situation = place.id;
      state.mission = null;
      state.path = "new";
      // Timer already running from Home visible — do not restart here
      $all("[data-situation]").forEach((b) => b.classList.remove("is-selected"));
      btn.classList.add("is-selected");
      showReadyBar(false);
      renderMissions();
      showScreen(2);
    });
    grid.appendChild(btn);
  });
}

function showScreen(n) {
  $all(".phone-wrap").forEach((el) => {
    el.classList.toggle("is-active", el.dataset.screen === String(n));
  });
  $all(".screen-nav button").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.jump === String(n));
  });
  if (n !== 3) clearSettle();
  // Success metric: Home visible → sleep screen
  if (n === 1) state.flowStartedAt = performance.now();
}

function renderMissions() {
  const list = $("#mission-list");
  const key = state.situation || "store";
  list.innerHTML = "";
  MissionsStore.forPlace(key).forEach((m) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mission";
    if (state.mission?.id === m.id) btn.classList.add("is-selected");
    btn.innerHTML = `<div class="mission-art">${artHTML(m.art)}</div><span>${m.text}</span>`;
    btn.addEventListener("click", () => {
      state.mission = m;
      // Mission tap starts sleep immediately — no extra Sleep tap to refuse or miss
      startSleep();
    });
    list.appendChild(btn);
  });
  $("#situation-chip").textContent = placeLabel(key);
}

function syncSleep() {
  if (!state.mission) return;
  $("#sleep-mission").textContent = state.mission.text;
  fillArt($("#sleep-art"), state.mission.art, true);
}

function clearSpeechTimers() {
  if (state.settleTimer) {
    clearTimeout(state.settleTimer);
    state.settleTimer = null;
  }
  if (state.speechFallbackTimer) {
    clearTimeout(state.speechFallbackTimer);
    state.speechFallbackTimer = null;
  }
}

/** Bump run id so stale utterance onend/onerror/fallback cannot affect the current nap. */
function invalidateSpeechRuns() {
  state.speechRunId = (state.speechRunId || 0) + 1;
  clearSpeechTimers();
  state.speechFinished = false;
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

function beginSettleCountdown() {
  if (state.settleTimer) return;
  state.settleTimer = window.setTimeout(settleSleep, SETTLE_MS);
}

function onSpeechComplete() {
  if (state.speechFinished) return;
  state.speechFinished = true;
  if (state.speechFallbackTimer) {
    clearTimeout(state.speechFallbackTimer);
    state.speechFallbackTimer = null;
  }
  beginSettleCountdown();
}

function speakMission() {
  // Invalidate first, then capture this run's id — cancel() may fire the old onend
  invalidateSpeechRuns();
  const runId = state.speechRunId;

  const complete = () => {
    if (runId !== state.speechRunId) return;
    onSpeechComplete();
  };

  if (!state.mission) {
    complete();
    return;
  }

  if (!window.speechSynthesis) {
    complete();
    return;
  }

  const utter = new SpeechSynthesisUtterance(state.mission.speak);
  utter.rate = 0.92;
  utter.pitch = 1;
  utter.onend = complete;
  utter.onerror = complete;

  // Fallback if the engine never fires onend (common when muted / blocked)
  state.speechFallbackTimer = window.setTimeout(complete, SPEECH_FALLBACK_MS);

  try {
    window.speechSynthesis.speak(utter);
  } catch {
    complete();
  }
}

function hideReplay() {
  const btn = $("#speak-again");
  if (btn) btn.hidden = true;
}

function showReplay() {
  const btn = $("#speak-again");
  if (!btn) return;
  btn.hidden = false;
  state.replayUsed = false;
}

function clearSettle() {
  invalidateSpeechRuns();
  const sleep = $("#sleep-screen");
  sleep?.classList.remove("is-settled", "is-inert");
  const handback = $("#handback");
  if (handback) handback.hidden = true;
}

function settleSleep() {
  const sleep = $("#sleep-screen");
  sleep.classList.add("is-settled", "is-inert");
  $("#handback").hidden = false;
  hideReplay();
}

function markSecondsToSleep() {
  if (state.flowStartedAt == null) {
    state.secondsToSleep = 0;
    return;
  }
  state.secondsToSleep = Math.max(
    0,
    Math.round((performance.now() - state.flowStartedAt) / 100) / 10
  );
}

function autoSessionMeta() {
  return {
    path: state.path || "new",
    secondsToSleep: state.secondsToSleep,
    missionClass: state.mission?.class || null,
    missionId: state.mission?.id || null,
    situation: state.situation,
    ageBand: localStorage.getItem(AGE_KEY) || null,
  };
}

function renderCheckinMeta() {
  const meta = autoSessionMeta();
  const age = meta.ageBand ? ` · age ${meta.ageBand}` : "";
  $("#checkin-meta").textContent = `Auto: ${meta.path} path · ${meta.secondsToSleep ?? "—"}s · ${meta.missionClass || "—"} class${age}`;
}

function resetCheckinForm() {
  $all('input[name="handoff"], input[name="mission"], input[name="again"]').forEach(
    (el) => {
      el.checked = false;
    }
  );
}

function loadFeedbackLog() {
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function appendFeedback(payload) {
  const list = loadFeedbackLog();
  list.push(payload);
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(list));
}

function renderSessionLog() {
  const body = $("#session-log-body");
  const count = $("#session-log-count");
  if (!body) return;
  const list = loadFeedbackLog();
  if (count) count.textContent = `${list.length} saved`;
  if (!list.length) {
    body.textContent = "No check-ins saved yet.";
    return;
  }
  body.textContent = JSON.stringify(list, null, 2);
}

function renderAgeSelection() {
  const saved = localStorage.getItem(AGE_KEY);
  $all("[data-age]").forEach((btn) => {
    btn.classList.toggle("is-selected", btn.dataset.age === saved);
  });
}

function startSleep() {
  if (!state.situation || !state.mission) return;
  if (!state.path) state.path = "new";
  markSecondsToSleep();
  saveRecent({ situation: state.situation, missionId: state.mission.id });
  syncSleep();
  clearSettle();
  showReplay();
  showScreen(3);
  // 3s settle starts when speech ends (or speech fallback fires)
  speakMission();
}

function resetPin() {
  state.pin = "";
  updatePinDots();
}

function updatePinDots() {
  $all("#pin-dots span").forEach((dot, i) => {
    dot.classList.toggle("filled", i < state.pin.length);
  });
}

function finishToHome() {
  showReadyBar(Boolean(state.mission));
  renderRecent();
  showScreen(1);
}

function onPinComplete() {
  if (PinStore.verify(state.pin)) {
    invalidateSpeechRuns();
    state.pin = "";
    updatePinDots();
    resetCheckinForm();
    renderCheckinMeta();
    showScreen(5);
    return;
  }
  const dots = $("#pin-dots");
  dots.classList.remove("shake");
  void dots.offsetWidth;
  dots.classList.add("shake");
  state.pin = "";
  updatePinDots();
}

function updateSetupPinDots() {
  $all("#pin-setup-dots span").forEach((dot, i) => {
    dot.classList.toggle("filled", i < state.setupPin.length);
  });
}

function setPinSetupCopy(mode) {
  if (mode === "verify") {
    $("#pin-setup-title").textContent = "Enter current PIN";
    $("#pin-setup-hint").textContent =
      "Verify your current PIN before choosing a new one.";
  } else if (mode === "create") {
    $("#pin-setup-title").textContent = "Create your PIN";
    $("#pin-setup-hint").textContent =
      "4 digits · unlocks after a nap. Kids never see this tip on the sleep screen.";
  } else {
    $("#pin-setup-title").textContent = "Confirm your PIN";
    $("#pin-setup-hint").textContent = "Enter the same 4 digits again.";
  }
}

function resetPinSetup(mode = "create", { clearError = true } = {}) {
  state.setupMode = mode;
  state.setupPin = "";
  updateSetupPinDots();
  const err = $("#pin-setup-error");
  if (err && clearError) err.hidden = true;
  setPinSetupCopy(mode);
}

function showPinSetupError(message) {
  const err = $("#pin-setup-error");
  if (!err) return;
  err.textContent = message;
  err.hidden = false;
}

function onSetupPinComplete() {
  if (state.setupMode === "verify") {
    if (!PinStore.verify(state.setupPin)) {
      showPinSetupError("Current PIN is incorrect. Try again.");
      state.setupPin = "";
      updateSetupPinDots();
      return;
    }
    resetPinSetup("create", { clearError: true });
    return;
  }

  if (state.setupMode === "create") {
    state._pendingPin = state.setupPin;
    resetPinSetup("confirm", { clearError: true });
    return;
  }

  // confirm
  if (state.setupPin !== state._pendingPin) {
    showPinSetupError("PINs didn’t match. Try again.");
    state._pendingPin = null;
    // Clear digits and return to create — keep the error visible
    resetPinSetup("create", { clearError: false });
    return;
  }
  PinStore.setPin(state.setupPin);
  state._pendingPin = null;
  state.setupPin = "";
  finishToHome();
}

$("#home-sleep").addEventListener("click", startSleep);
$("#speak-again").addEventListener("click", () => {
  if (state.replayUsed) return;
  state.replayUsed = true;
  speakMission();
  hideReplay();
});

$all("[data-jump]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const n = Number(btn.dataset.jump);
    if (n === 2) {
      if (!state.situation) state.situation = "store";
      renderMissions();
    }
    if (n === 0) {
      // Deck nav: first-run create, or verify→change if a PIN already exists
      resetPinSetup(PinStore.hasPin() ? "verify" : "create");
    }
    if (n === 3) {
      if (!state.mission) {
        state.situation = state.situation || "store";
        state.mission = MissionsStore.forPlace(state.situation)[0];
      }
      startSleep();
      return;
    }
    if (n === 4) resetPin();
    if (n === 5) {
      renderCheckinMeta();
      resetCheckinForm();
    }
    if (n === 6) renderAgeSelection();
    showScreen(n);
  });
});

$("#pin-setup-keypad").addEventListener("click", (e) => {
  const key = e.target.closest("[data-setup-key]")?.dataset.setupKey;
  if (!key) return;
  if (key === "del") {
    state.setupPin = state.setupPin.slice(0, -1);
    updateSetupPinDots();
    return;
  }
  if (state.setupPin.length >= 4) return;
  state.setupPin += key;
  updateSetupPinDots();
  if (state.setupPin.length === 4) onSetupPinComplete();
});

$("#change-pin").addEventListener("click", () => {
  // Documented flow: current PIN → new → confirm
  resetPinSetup(PinStore.hasPin() ? "verify" : "create");
  showScreen(0);
});

$("#save-checkin").addEventListener("click", () => {
  const handoff = document.querySelector('input[name="handoff"]:checked')?.value;
  const missionBegun = document.querySelector('input[name="mission"]:checked')?.value;
  const askedAgain = document.querySelector('input[name="again"]:checked')?.value;
  if (!handoff || !missionBegun || !askedAgain) {
    $("#checkin-meta").textContent = "Please answer all three, or skip.";
    return;
  }
  const payload = {
    ...autoSessionMeta(),
    handoff,
    missionBegun,
    askedAgain,
    savedAt: new Date().toISOString(),
    // Pilot sketch: first-party local only — never sent anywhere from this HTML
    storage: "local-device-only",
  };
  appendFeedback(payload);
  renderSessionLog();
  finishToHome();
});

$("#export-feedback")?.addEventListener("click", async () => {
  const list = loadFeedbackLog();
  const text = JSON.stringify(list, null, 2);
  try {
    await navigator.clipboard.writeText(text);
    $("#session-log-count").textContent = `${list.length} saved · copied`;
  } catch {
    // Fallback: select text in the pre for manual copy
    const body = $("#session-log-body");
    if (body) {
      const range = document.createRange();
      range.selectNodeContents(body);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
    $("#session-log-count").textContent = `${list.length} saved · select & copy`;
  }
});

$("#skip-checkin").addEventListener("click", () => {
  finishToHome();
});

$all("[data-age]").forEach((btn) => {
  btn.addEventListener("click", () => {
    localStorage.setItem(AGE_KEY, btn.dataset.age);
    renderAgeSelection();
  });
});

$("#clear-local").addEventListener("click", () => {
  localStorage.removeItem(FEEDBACK_KEY);
  localStorage.removeItem(AGE_KEY);
  renderAgeSelection();
  renderSessionLog();
});

const longPressTarget = $("#long-press-target");
let pressTimer = null;

function startPress(e) {
  e.preventDefault();
  longPressTarget.classList.add("is-pressing");
  pressTimer = window.setTimeout(() => {
    longPressTarget.classList.remove("is-pressing");
    resetPin();
    showScreen(4);
  }, 1000);
}

function endPress() {
  longPressTarget.classList.remove("is-pressing");
  if (pressTimer) {
    clearTimeout(pressTimer);
    pressTimer = null;
  }
}

longPressTarget.addEventListener("pointerdown", startPress);
longPressTarget.addEventListener("pointerup", endPress);
longPressTarget.addEventListener("pointerleave", endPress);
longPressTarget.addEventListener("pointercancel", endPress);

$("#keypad").addEventListener("click", (e) => {
  const key = e.target.closest("[data-key]")?.dataset.key;
  if (!key) return;
  if (key === "del") {
    state.pin = state.pin.slice(0, -1);
    updatePinDots();
    return;
  }
  if (state.pin.length >= 4) return;
  state.pin += key;
  updatePinDots();
  if (state.pin.length === 4) onPinComplete();
});

PlacesStore.load();
MissionsStore.load();
seedRecentIfEmpty();
renderPlaces();
renderRecent();
renderAgeSelection();
renderSessionLog();

if (!PinStore.hasPin()) {
  resetPinSetup("create");
  showScreen(0);
} else {
  showScreen(1);
}
