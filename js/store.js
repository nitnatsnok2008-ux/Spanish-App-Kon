/* ============================================================
   store.js — progress, XP, streak & settings (localStorage)
   ============================================================ */
(function () {
  const LS = (window.LS = window.LS || {});
  const KEY = "learnspanish.v1";

  const defaults = {
    name: "",
    xp: 0,
    streak: 0,
    lastDay: null,           // ISO date string of last active day
    completed: {},           // { lessonId: { score, total, ts } }
    settings: {
      sound: true,
      voiceURI: null,
      rate: 0.92,
      pitch: 0.8,
      aiKey: "",             // optional LLM key (stored locally only)
      aiProvider: "builtin"  // 'builtin' | 'anthropic' | 'openai'
    }
  };

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return structuredClone(defaults);
      const parsed = JSON.parse(raw);
      return {
        ...structuredClone(defaults),
        ...parsed,
        settings: { ...defaults.settings, ...(parsed.settings || {}) }
      };
    } catch (e) {
      return structuredClone(defaults);
    }
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function today() { return new Date().toISOString().slice(0, 10); }

  function touchStreak() {
    const t = today();
    if (state.lastDay === t) return;
    const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (state.lastDay === y) state.streak += 1;
    else state.streak = 1;
    state.lastDay = t;
    save();
  }

  LS.store = {
    get() { return state; },
    settings() { return state.settings; },

    addXp(n) { state.xp += n; touchStreak(); save(); return state.xp; },

    completeLesson(lessonId, score, total) {
      const prev = state.completed[lessonId];
      const best = prev ? Math.max(prev.score, score) : score;
      state.completed[lessonId] = { score: best, total, ts: Date.now() };
      touchStreak();
      save();
    },

    isLessonDone(id) { return !!state.completed[id]; },
    lessonScore(id) { return state.completed[id] || null; },

    // a level unlocks when the previous level has at least one finished lesson
    isLevelUnlocked(levelIndex) {
      if (levelIndex === 0) return true;
      const prev = LS.data.levels[levelIndex - 1];
      return prev.lessons.some(l => this.isLessonDone(l.id));
    },

    levelProgress(level) {
      const total = level.lessons.length;
      const done = level.lessons.filter(l => this.isLessonDone(l.id)).length;
      return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
    },

    overallProgress() {
      let total = 0, done = 0;
      LS.data.levels.forEach(lv => lv.lessons.forEach(l => { total++; if (this.isLessonDone(l.id)) done++; }));
      return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
    },

    wordsLearned() {
      const ids = Object.keys(state.completed);
      let count = 0;
      LS.data.levels.forEach(lv => lv.lessons.forEach(l => {
        if (ids.includes(l.id)) count += l.steps.filter(s => s.type === "intro").length;
      }));
      return count;
    },

    setName(n) { state.name = n; save(); },

    setSetting(k, v) { state.settings[k] = v; save(); },

    reset() { state = structuredClone(defaults); save(); }
  };
})();
