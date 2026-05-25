/* jsdom smoke test: loads the app, renders every tab, and drives a full
   lesson through every exercise type, failing on any runtime error. */
const fs = require("fs");
const path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");

const ROOT = path.join(__dirname, "..");
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");
const sleep = ms => new Promise(r => setTimeout(r, ms));

const errors = [];
const vc = new VirtualConsole();
vc.on("jsdomError", e => errors.push("jsdomError: " + (e.detail ? e.detail.stack || e.detail : e.message)));
vc.on("error", (...a) => errors.push("console.error: " + a.join(" ")));

const html = read("index.html");
const dom = new JSDOM(html, {
  url: "http://localhost/",
  runScripts: "outside-only",
  pretendToBeVisual: true,
  virtualConsole: vc
});
const win = dom.window;
win.addEventListener("error", e => errors.push("window.error: " + (e.error && e.error.stack || e.message)));

/* ---- stub browser APIs jsdom lacks ---- */
win.structuredClone = global.structuredClone || (x => JSON.parse(JSON.stringify(x)));
win.fetch = () => Promise.reject(new Error("no-net-in-test"));
win.confirm = () => false;
win.alert = () => {};
class FakeUtter { constructor(t) { this.text = t; this.onend = null; this.onstart = null; this.onerror = null; } }
win.SpeechSynthesisUtterance = FakeUtter;
win.speechSynthesis = {
  _q: [],
  speak(u) { setTimeout(() => { u.onstart && u.onstart(); u.onend && u.onend(); }, 0); },
  cancel() {}, pause() {}, resume() {},
  getVoices() { return []; },
  set onvoiceschanged(fn) { this._v = fn; }, get onvoiceschanged() { return this._v; }
};
class FakeAC {
  constructor() { this.state = "running"; this.currentTime = 0; this.destination = {}; }
  createGain() { return { gain: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} }; }
  createOscillator() { return { type: "", frequency: { setValueAtTime() {} }, connect() {}, start() {}, stop() {} }; }
  resume() {}
}
win.AudioContext = FakeAC; win.webkitAudioContext = FakeAC;
// no SpeechRecognition → app uses the graceful "skip" path

/* ---- load app scripts in order ---- */
["js/audio.js", "js/speech.js", "js/data.js", "js/store.js", "js/exercises.js", "js/chat.js", "js/app.js"]
  .forEach(f => { try { win.eval(read(f)); } catch (e) { errors.push("eval " + f + ": " + e.stack); } });

const doc = win.document;
const $ = s => doc.querySelector(s);
const $$ = s => [...doc.querySelectorAll(s)];

function solveMatch() {
  const byKey = {};
  $$(".match-cell").forEach(c => { if (!c.classList.contains("matched")) (byKey[c.dataset.key] = byKey[c.dataset.key] || []).push(c); });
  Object.values(byKey).forEach(pair => { if (pair.length === 2) { pair[0].click(); pair[1].click(); } });
}

async function driveLesson(label) {
  const seen = new Set();
  for (let i = 0; i < 160; i++) {
    if ($(".complete")) { const b = $(".complete .btn"); if (b) b.click(); return label + ": completed [" + [...seen].join(",") + "]"; }
    const fb = $(".feedback");
    const shown = fb && fb.classList.contains("show");
    const btn = fb && fb.querySelector(".btn");
    const txt = btn ? btn.textContent.trim() : "";

    if (shown && txt === "Überprüfen") {
      // a check button waiting for input (write / build)
      const field = $("input.field");
      if (field && !field.disabled) {
        seen.add("write"); field.value = "hola"; field.dispatchEvent(new win.Event("input"));
        if (!btn.disabled) btn.click();
      } else if ($(".bank")) {
        seen.add("build"); const tile = $(".bank .tile:not(.used)"); if (tile) tile.click();
        btn.disabled = false; btn.click();
      } else if (!btn.disabled) { btn.click(); }
    } else if (shown && btn && !btn.disabled) {
      seen.add("continue"); btn.click();              // Weiter / Verstanden / Überspringen
    } else if ($(".match-grid")) {
      seen.add("match"); solveMatch();
    } else if ($(".options .opt")) {
      seen.add("choice/listen/reading"); const opt = $(".options .opt"); if (opt) opt.click();
    }
    await sleep(45);
  }
  return label + ": TIMEOUT [" + [...seen].join(",") + "]";
}

const results = [];
function report(code) {
  console.log("\n=== SMOKE RESULTS ===");
  results.forEach(x => console.log(" •", x));
  try { console.log(" • final XP:", win.LS.store.get().xp); } catch (e) {}
  console.log("=== ERRORS:", errors.length, "===");
  errors.slice(0, 40).forEach(e => console.log("  ✗", e));
  process.exit(code != null ? code : (errors.length ? 1 : 0));
}

(async () => {
  await sleep(1400); // splash timer

  // 1) sanity: data + boot
  const LS = win.LS;
  if (!LS || !LS.data || !LS.data.levels.length) errors.push("LS.data.levels missing");
  results.push("levels=" + LS.data.levels.length + " vocab=" + LS.data.vocab.length);
  if ($("#app").classList.contains("hidden")) errors.push("app still hidden after splash");

  // validate every step has a known type and required fields
  const KNOWN = new Set(["intro", "choice", "listen", "write", "match", "build", "speak", "reading", "dialogue"]);
  LS.data.levels.forEach(lv => lv.lessons.forEach(ls => ls.steps.forEach(st => {
    if (!KNOWN.has(st.type)) errors.push("unknown step type: " + st.type + " in " + ls.id);
    if (st.type === "choice" && (st.answer == null || !st.options[st.answer])) errors.push("bad choice answer in " + ls.id);
    if (st.type === "listen" && st.options[st.answer] == null) errors.push("bad listen answer in " + ls.id);
  })));

  // 2) tabs render without error
  for (const tab of ["practice", "chat", "profile", "learn"]) {
    $(".tab[data-tab='" + tab + "']").click();
    await sleep(60);
    results.push("tab:" + tab + " main-children=" + $("#main").children.length);
  }

  // 3) tutor engine (builtin) returns es+de
  const r = await LS.tutor.reply([{ role: "user", text: "Hola, me llamo Kon" }]);
  if (!r.es || !r.de) errors.push("tutor reply missing es/de");
  results.push("tutor:" + JSON.stringify(r.es).slice(0, 40));

  // 3b) chat tab interaction: clicking a suggestion must add bubbles & a tutor reply
  $(".tab[data-tab='chat']").click(); await sleep(80);
  const beforeBubbles = $$(".bubble").length;
  const sug = $(".suggest"); if (sug) sug.click();
  await sleep(150);
  const afterBubbles = $$(".bubble").length;
  if (afterBubbles <= beforeBubbles) errors.push("chat: suggestion click produced no new bubbles");
  results.push("chat suggestion: bubbles " + beforeBubbles + " -> " + afterBubbles);

  // 4) drive every lesson of level 1 (covers intro/choice/listen/match/speak/write/build/dialogue)
  $(".tab[data-tab='learn']").click(); await sleep(60);
  results.push("learn .level count=" + $$(".level").length);
  $$(".level")[0].click(); await sleep(60);            // open level 1
  const lessonCount = $$(".lesson").length;
  results.push("level1 lessons=" + lessonCount);
  for (let li = 0; li < lessonCount; li++) {
    // re-open level (we return to it after each lesson) and click the next lesson
    const lessons = $$(".lesson");
    if (!lessons[li]) { results.push("L1.lesson" + li + ": NO lesson card (count=" + lessons.length + ", in-player=" + !!$(".player") + ")"); break; }
    lessons[li].click(); await sleep(80);
    if (!$(".player")) { results.push("lesson " + li + " did not open (locked?)"); break; }
    results.push(await driveLesson("L1.lesson" + li));
    await sleep(80);
  }

  // 5) drive a Practice quiz (dynamic) — exercises write/choice/listen generation
  $(".tab[data-tab='practice']").click(); await sleep(60);
  $$(".level")[1].click(); await sleep(80); // "Zufalls-Quiz"
  if ($(".player")) results.push(await driveLesson("practice-quiz"));

  // 6) reading step (level 2 has it) — open level 2 lesson with reading after unlocking
  $(".tab[data-tab='learn']").click(); await sleep(60);
  const lv2 = $$(".level")[1];
  lv2.click(); await sleep(80);
  if ($(".lesson")) {
    // drive each lesson of level 2 to reach the reading step (l2c) and l2a/b
    const n2 = $$(".lesson").length;
    for (let li = 0; li < n2; li++) {
      const ls = $$(".lesson");
      ls[li].click(); await sleep(80);
      if (!$(".player")) break;
      results.push(await driveLesson("L2.lesson" + li));
      await sleep(80);
    }
  }

  // 7) navigation: leaving a lesson must restore the tabbar & remove the feedback footer
  const tabbarVisible = () => $("#tabbar").style.display !== "none";
  const strayFeedback = () => doc.body.querySelectorAll(".feedback").length;

  $(".tab[data-tab='learn']").click(); await sleep(60);
  $$(".level")[0].click(); await sleep(60);
  $$(".lesson")[0].click(); await sleep(80);            // enter player (tabbar hidden)
  if (!$(".player")) errors.push("nav: player did not open");
  if (tabbarVisible()) errors.push("nav: tabbar should be hidden inside a lesson");
  $("#backBtn").click(); await sleep(80);               // topbar back
  if (!tabbarVisible()) errors.push("nav: tabbar NOT restored after topbar-back");
  if (strayFeedback()) errors.push("nav: stray feedback footer after topbar-back");
  results.push("nav topbar-back ok: tabbar=" + tabbarVisible() + " stray=" + strayFeedback());

  $$(".lesson")[0].click(); await sleep(80);            // enter player again
  const x = $(".player .player-top .icon-btn"); if (x) x.click(); await sleep(80); // player X
  if (!tabbarVisible()) errors.push("nav: tabbar NOT restored after player-X");
  if (strayFeedback()) errors.push("nav: stray feedback footer after player-X");
  results.push("nav player-X ok: tabbar=" + tabbarVisible() + " stray=" + strayFeedback());

  report();
})().catch(e => { errors.push("HARNESS CRASH @ " + (e.stack || e)); report(2); });
