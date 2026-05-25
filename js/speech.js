/* ============================================================
   speech.js — Text-to-Speech (deep male es-ES voice) + Speech Recognition
   Uses the browser-native Web Speech API (works great in Brave/Chromium).
   ============================================================ */
(function () {
  const LS = (window.LS = window.LS || {});

  const synth = window.speechSynthesis || null;
  let voices = [];
  let chosenVoiceURI = null;     // user override (saved in store)
  let rate = 0.92;               // slightly slow for learners
  let pitch = 0.8;               // lowered → deeper, pleasant male tone

  // Words that hint a voice is male / deep (varies by platform)
  const MALE_HINTS = ["jorge", "carlos", "diego", "miguel", "pablo", "enrique", "male", "hombre", "juan", "raul", "álvaro", "alvaro"];
  const FEMALE_HINTS = ["mónica", "monica", "marisol", "female", "mujer", "lucia", "lucía", "elena", "paulina", "laura"];

  function loadVoices() {
    if (!synth) return;
    voices = synth.getVoices() || [];
  }
  if (synth) {
    loadVoices();
    synth.onvoiceschanged = loadVoices;
  }

  function spanishVoices() {
    return voices.filter(v => /^es(-|_)?ES/i.test(v.lang) || /^es\b/i.test(v.lang));
  }

  function score(v) {
    const n = (v.name + " " + v.voiceURI).toLowerCase();
    let s = 0;
    if (/es(-|_)es/i.test(v.lang)) s += 50;        // Spain Spanish preferred
    else if (/^es/i.test(v.lang)) s += 20;          // any Spanish
    if (MALE_HINTS.some(h => n.includes(h))) s += 40;
    if (FEMALE_HINTS.some(h => n.includes(h))) s -= 30;
    if (n.includes("google")) s += 8;               // usually higher quality
    if (n.includes("enhanced") || n.includes("premium") || n.includes("siri")) s += 12;
    return s;
  }

  function pickVoice() {
    if (!voices.length) loadVoices();
    if (chosenVoiceURI) {
      const exact = voices.find(v => v.voiceURI === chosenVoiceURI);
      if (exact) return exact;
    }
    const es = spanishVoices();
    const pool = es.length ? es : voices;
    if (!pool.length) return null;
    return pool.slice().sort((a, b) => score(b) - score(a))[0];
  }

  let speaking = false;
  const listeners = new Set();
  function emit(state) { listeners.forEach(fn => { try { fn(state); } catch (e) {} }); }

  function speak(text, opts = {}) {
    if (!synth || !text) return Promise.resolve(false);
    try { synth.cancel(); } catch (e) {}
    return new Promise(resolve => {
      const u = new SpeechSynthesisUtterance(text);
      const v = pickVoice();
      if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = "es-ES"; }
      u.rate = opts.rate != null ? opts.rate : rate;
      u.pitch = opts.pitch != null ? opts.pitch : pitch;
      u.volume = opts.volume != null ? opts.volume : 1;
      u.onstart = () => { speaking = true; emit("start"); };
      u.onend = () => { speaking = false; emit("end"); resolve(true); };
      u.onerror = () => { speaking = false; emit("end"); resolve(false); };
      // Some Chromium builds need a tick after cancel()
      setTimeout(() => { try { synth.speak(u); } catch (e) { resolve(false); } }, 30);
    });
  }

  function stop() { try { synth && synth.cancel(); } catch (e) {} speaking = false; emit("end"); }

  // ---------- Speech recognition ----------
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;

  function listen(opts = {}) {
    return new Promise((resolve, reject) => {
      if (!SR) { reject(new Error("no-recognition")); return; }
      const rec = new SR();
      rec.lang = opts.lang || "es-ES";
      rec.interimResults = !!opts.interim;
      rec.maxAlternatives = 3;
      rec.continuous = false;
      let finished = false;
      rec.onresult = (e) => {
        const alts = [];
        for (let i = 0; i < e.results[0].length; i++) alts.push(e.results[0][i].transcript);
        const best = e.results[0][0].transcript;
        if (opts.onInterim && !e.results[0].isFinal) opts.onInterim(best);
        if (e.results[0].isFinal || !rec.interimResults) {
          finished = true;
          resolve({ transcript: best, alternatives: alts, confidence: e.results[0][0].confidence });
        }
      };
      rec.onerror = (e) => { if (!finished) reject(new Error(e.error || "rec-error")); };
      rec.onend = () => { if (!finished) reject(new Error("no-speech")); };
      if (opts.onStart) rec.onstart = opts.onStart;
      try { rec.start(); } catch (e) { reject(e); }
      // expose a stopper
      opts.attach && opts.attach(() => { try { rec.stop(); } catch (e) {} });
    });
  }

  LS.speech = {
    available: !!synth,
    recognitionAvailable: !!SR,
    speak, stop, listen,
    onState(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    isSpeaking() { return speaking; },
    getVoices() { loadVoices(); return spanishVoices(); },
    getAllVoices() { loadVoices(); return voices.slice(); },
    setVoice(uri) { chosenVoiceURI = uri || null; },
    getVoiceURI() { return chosenVoiceURI; },
    currentVoice() { const v = pickVoice(); return v ? v.name + " (" + v.lang + ")" : "System-Standard"; },
    setRate(r) { rate = r; }, setPitch(p) { pitch = p; },
    getRate() { return rate; }, getPitch() { return pitch; }
  };
})();
