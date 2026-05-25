/* ============================================================
   audio.js — gentle, generated sound effects (Web Audio API)
   No files, no background music. Volume is kept low on purpose.
   ============================================================ */
(function () {
  const LS = (window.LS = window.LS || {});

  let ctx = null;
  let master = null;
  let enabled = true;
  let volume = 0.5; // 0..1, master scaling — kept gentle

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.18 * volume; // intentionally quiet
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  // A single soft tone with an envelope
  function tone(freq, start, dur, type = "sine", peak = 1) {
    const c = ensure();
    if (!c) return;
    const t0 = c.currentTime + start;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  const SFX = {
    tap()    { if (enabled) tone(420, 0, 0.05, "sine", 0.5); },
    select() { if (enabled) tone(540, 0, 0.07, "triangle", 0.6); },
    correct() {
      if (!enabled) return;
      tone(659.25, 0, 0.12, "sine", 0.9);   // E5
      tone(987.77, 0.10, 0.18, "sine", 0.8); // B5
    },
    wrong() {
      if (!enabled) return;
      tone(196, 0, 0.18, "sine", 0.7);  // soft low G3
      tone(155.56, 0.08, 0.22, "sine", 0.6);
    },
    levelup() {
      if (!enabled) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C
      notes.forEach((n, i) => tone(n, i * 0.11, 0.22, "triangle", 0.8));
    },
    complete() {
      if (!enabled) return;
      const notes = [523.25, 659.25, 783.99, 987.77, 1318.5];
      notes.forEach((n, i) => tone(n, i * 0.09, 0.25, "sine", 0.75));
    },
    pop() { if (enabled) tone(880, 0, 0.06, "sine", 0.5); },
    swipe() { if (enabled) tone(300, 0, 0.04, "sine", 0.3); }
  };

  LS.audio = {
    sfx: SFX,
    setEnabled(v) { enabled = !!v; },
    isEnabled() { return enabled; },
    setVolume(v) { volume = Math.max(0, Math.min(1, v)); if (master) master.gain.value = 0.18 * volume; },
    // must be called from a user gesture to unlock audio on mobile
    unlock() { ensure(); }
  };
})();
