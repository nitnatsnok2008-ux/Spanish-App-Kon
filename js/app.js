/* ============================================================
   app.js — navigation, tab screens, settings & UI effects
   ============================================================ */
(function () {
  const LS = (window.LS = window.LS || {});
  const $ = sel => document.querySelector(sel);
  const el = LS.player.el;
  const sfx = () => LS.audio.sfx;

  /* ---------------- UI effects ---------------- */
  const PALETTE = ["#FF375F", "#FF9F0A", "#FFD60A", "#34C759", "#30D5C8", "#0A84FF", "#5E5CE6", "#BF5AF2"];
  let toastT;
  LS.ui = {
    toast(msg) {
      const t = $("#toast");
      t.textContent = msg; t.classList.add("show");
      clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2200);
    },
    xpFloat(n) {
      const f = el("div", "xp-float", "+" + n + " XP");
      const r = $("#xpStat").getBoundingClientRect();
      f.style.left = r.left + "px"; f.style.top = r.bottom + 6 + "px";
      document.body.appendChild(f); setTimeout(() => f.remove(), 1200);
    },
    confetti() {
      for (let i = 0; i < 90; i++) {
        const c = el("div", "confetti");
        c.style.left = Math.random() * 100 + "vw";
        c.style.background = PALETTE[i % PALETTE.length];
        c.style.animationDuration = 1.6 + Math.random() * 1.4 + "s";
        c.style.animationDelay = Math.random() * 0.4 + "s";
        c.style.transform = "rotate(" + Math.random() * 360 + "deg)";
        if (i % 3 === 0) c.style.borderRadius = "50%";
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 3200);
      }
    }
  };

  /* ---------------- header / stats ---------------- */
  function updateStats() {
    const s = LS.store.get();
    $("#xpVal").textContent = s.xp;
    $("#streakVal").textContent = s.streak;
  }

  function setHeader(title, showBack, onBack) {
    $("#topbarTitle").textContent = title;
    const b = $("#backBtn");
    b.hidden = !showBack;
    b.onclick = showBack ? () => { sfx().tap(); onBack && onBack(); } : null;
  }

  /* ---------------- app state ---------------- */
  const App = {
    tab: "learn",

    init() {
      // tab bar
      document.querySelectorAll(".tab").forEach(t => {
        t.addEventListener("click", () => { sfx().tap(); this.go(t.dataset.tab); });
      });
      // apply settings
      const s = LS.store.settings();
      LS.audio.setEnabled(s.sound);
      if (s.voiceURI) LS.speech.setVoice(s.voiceURI);
      LS.speech.setRate(s.rate); LS.speech.setPitch(s.pitch);
      // speaking avatar pulse
      LS.speech.onState(state => {
        const av = $(".tutor-avatar");
        if (av) av.classList.toggle("speaking", state === "start");
      });
      updateStats();
      this.go("learn");
    },

    cleanup() {
      LS.player.cancel && LS.player.cancel();
      LS.speech.stop();
    },

    go(tab) {
      this.cleanup();
      this.tab = tab;
      document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.tab === tab));
      $("#tabbar").style.display = "grid";
      const main = $("#main"); main.scrollTop = 0;
      if (tab === "learn") this.renderLearn();
      else if (tab === "practice") this.renderPractice();
      else if (tab === "chat") this.renderChat();
      else if (tab === "profile") this.renderProfile();
    },

    /* ============================================================
       LEARN
       ============================================================ */
    renderLearn() {
      setHeader("Learn Spanish", false);
      $("#tabbar").style.display = "grid";
      const main = $("#main"); main.innerHTML = "";
      const ov = LS.store.overallProgress();

      const hero = el("div", "hero");
      hero.innerHTML =
        "<h2>¡Hola! 🇪🇸</h2><p>Español de España · Schritt für Schritt</p>" +
        '<div class="progressbar"><i style="width:' + ov.pct + '%"></i></div>' +
        '<p style="margin-top:8px;font-size:13px;font-weight:600;">' + ov.done + " / " + ov.total + " Lektionen · " + ov.pct + "%</p>";
      main.appendChild(hero);

      main.appendChild(el("div", "h2", "Dein Lernpfad"));
      const list = el("div", "level-list");
      LS.data.levels.forEach((lv, i) => {
        const unlocked = LS.store.isLevelUnlocked(i);
        const p = LS.store.levelProgress(lv);
        const row = el("div", "level" + (unlocked ? "" : " locked"));
        row.innerHTML =
          '<div class="level-badge" style="background:' + lv.color + '">' + lv.icon + "</div>" +
          '<div class="level-info"><h3>' + lv.title + "</h3><p>" + lv.subtitle + "</p>" +
            '<div class="level-meta"><div class="minibar"><i style="width:' + p.pct + '%"></i></div>' +
            '<span class="tiny muted">' + p.done + "/" + p.total + "</span></div></div>" +
          (unlocked
            ? '<span class="chev"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'
            : '<span class="lock-icn"><svg viewBox="0 0 24 24" width="20" height="20"><rect x="5" y="11" width="14" height="9" rx="2" fill="currentColor"/><path d="M8 11V8a4 4 0 018 0v3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></span>');
        row.addEventListener("click", () => {
          if (!unlocked) { sfx().wrong(); LS.ui.toast("🔒 Schließe das vorherige Level zuerst ab"); return; }
          sfx().tap(); this.openLevel(i);
        });
        list.appendChild(row);
      });
      main.appendChild(list);
    },

    openLevel(i) {
      const lv = LS.data.levels[i];
      setHeader(lv.title, true, () => this.renderLearn());
      $("#tabbar").style.display = "grid";
      const main = $("#main"); main.innerHTML = ""; main.scrollTop = 0;

      const head = el("div", "hero");
      head.style.background = lv.color;
      const p = LS.store.levelProgress(lv);
      head.innerHTML = "<h2>" + lv.icon + " " + lv.title + "</h2><p>" + lv.subtitle + "</p>" +
        '<div class="progressbar"><i style="width:' + p.pct + '%"></i></div>';
      main.appendChild(head);

      main.appendChild(el("div", "h2", "Lektionen"));
      const grid = el("div", "lesson-grid");
      lv.lessons.forEach((ls, li) => {
        const done = LS.store.isLessonDone(ls.id);
        // a lesson unlocks when the previous lesson in the level is done (first is always open)
        const unlocked = li === 0 || LS.store.isLessonDone(lv.lessons[li - 1].id);
        const card = el("div", "lesson" + (done ? " done" : "") + (unlocked ? "" : " locked"));
        card.innerHTML =
          '<div class="lesson-ico">' + ls.icon + "</div>" +
          "<div><h4>" + ls.title + '</h4><div class="kind">' + ls.kind + "</div></div>" +
          (done ? '<span class="check"><svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="11" fill="currentColor" opacity="0.15"/><path d="M7 12l3 3 7-7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'
                : (unlocked ? "" : '<span class="lockc"><svg viewBox="0 0 24 24" width="18" height="18"><rect x="5" y="11" width="14" height="9" rx="2" fill="currentColor"/><path d="M8 11V8a4 4 0 018 0v3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></span>'));
        card.addEventListener("click", () => {
          if (!unlocked) { sfx().wrong(); LS.ui.toast("🔒 Schließe zuerst die vorherige Lektion ab"); return; }
          sfx().tap(); this.startLesson(i, li);
        });
        grid.appendChild(card);
      });
      main.appendChild(grid);
    },

    startLesson(levelIdx, lessonIdx) {
      const lv = LS.data.levels[levelIdx];
      const lesson = lv.lessons[lessonIdx];
      setHeader(lesson.title, true, () => { this.cleanup(); this.openLevel(levelIdx); });
      $("#tabbar").style.display = "none";
      const main = $("#main"); main.innerHTML = ""; main.scrollTop = 0;
      LS.player.start(lesson, main, (result) => {
        $("#tabbar").style.display = "grid";
        updateStats();
        if (result) { LS.ui.xpFloat(result.xp); LS.ui.toast("🎉 +" + result.xp + " XP!"); }
        this.openLevel(levelIdx);
      });
    },

    /* ============================================================
       PRACTICE
       ============================================================ */
    renderPractice() {
      setHeader("Üben", false);
      $("#tabbar").style.display = "grid";
      const main = $("#main"); main.innerHTML = "";
      main.appendChild(el("div", "h1", "Üben"));
      main.appendChild(el("p", "muted", "Wiederhole und festige, was du gelernt hast."));

      const modes = [
        { id: "flash", icon: "🃏", t: "Vokabeltrainer", d: "Karteikarten zum Wiederholen", c: "linear-gradient(135deg,#0A84FF,#5E5CE6)" },
        { id: "quiz", icon: "⚡", t: "Zufalls-Quiz", d: "Gemischte Schnellfragen", c: "linear-gradient(135deg,#FF9F0A,#FF375F)" },
        { id: "listen", icon: "🎧", t: "Hör-Training", d: "Verstehe gesprochenes Spanisch", c: "linear-gradient(135deg,#34C759,#30D5C8)" },
        { id: "speak", icon: "🎙️", t: "Aussprache", d: "Sprich nach & verbessere dich", c: "linear-gradient(135deg,#BF5AF2,#FF6482)" }
      ];
      const wrap = el("div", "level-list"); wrap.style.marginTop = "16px";
      modes.forEach(m => {
        const row = el("div", "level");
        row.innerHTML = '<div class="level-badge" style="background:' + m.c + '">' + m.icon + "</div>" +
          '<div class="level-info"><h3>' + m.t + "</h3><p>" + m.d + "</p></div>" +
          '<span class="chev"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
        row.addEventListener("click", () => { sfx().tap(); this.startPractice(m.id); });
        wrap.appendChild(row);
      });
      main.appendChild(wrap);
    },

    startPractice(kind) {
      if (kind === "flash") return this.renderFlashcards();
      const lesson = buildQuiz(kind);
      if (!lesson) { LS.ui.toast("Lerne erst ein paar Vokabeln 😊"); return; }
      setHeader(lesson.title, true, () => { this.cleanup(); this.renderPractice(); });
      $("#tabbar").style.display = "none";
      const main = $("#main"); main.innerHTML = "";
      LS.player.start(lesson, main, () => {
        $("#tabbar").style.display = "grid"; updateStats(); this.renderPractice();
      });
    },

    renderFlashcards() {
      setHeader("Vokabeltrainer", true, () => this.renderPractice());
      const main = $("#main"); main.innerHTML = "";
      const deck = LS.player.shuffle(LS.data.vocab.slice());
      let idx = 0, known = 0;

      const counter = el("p", "muted"); counter.style.textAlign = "center";
      const cardWrap = el("div"); cardWrap.style.cssText = "perspective:1000px;margin:18px 0;";
      main.appendChild(counter); main.appendChild(cardWrap);

      const renderCard = () => {
        if (idx >= deck.length) {
          cardWrap.innerHTML = '<div class="complete"><div class="trophy">🎉</div><h2>Fertig!</h2><p class="muted">' + known + " / " + deck.length + " gewusst</p></div>";
          counter.textContent = "";
          ctrls.style.display = "none";
          const again = el("button", "btn", "Nochmal"); again.onclick = () => { sfx().tap(); this.renderFlashcards(); };
          cardWrap.appendChild(again);
          return;
        }
        const v = deck[idx];
        counter.textContent = (idx + 1) + " / " + deck.length;
        let flipped = false;
        const card = el("div", "card vcard");
        card.style.cursor = "pointer"; card.style.minHeight = "260px";
        const face = () => {
          card.innerHTML = flipped
            ? '<div class="es">' + v.es + "</div>" + (v.say ? '<div class="ipa">[' + v.say + "]</div>" : "") + '<div class="de">' + v.de + "</div>"
            : '<div class="emoji">' + v.emoji + '</div><p class="muted" style="margin-top:14px">Tippen zum Umdrehen</p><div class="de">' + v.de + "</div>";
          if (flipped) { const b = LS.player.speakerBtn(v.es); card.appendChild(b); }
        };
        face();
        card.addEventListener("click", (e) => {
          if (e.target.closest(".speaker")) return;
          sfx().pop(); flipped = !flipped; face(); if (flipped) LS.speech.speak(v.es);
        });
        cardWrap.innerHTML = ""; cardWrap.appendChild(card);
      };

      const ctrls = el("div"); ctrls.style.cssText = "display:flex;gap:12px;margin-top:8px;";
      const no = el("button", "btn danger", "✗ Nochmal");
      const yes = el("button", "btn success", "✓ Gewusst");
      no.onclick = () => { sfx().wrong(); idx++; renderCard(); };
      yes.onclick = () => { sfx().correct(); known++; idx++; renderCard(); };
      ctrls.appendChild(no); ctrls.appendChild(yes);
      main.appendChild(ctrls);
      renderCard();
    },

    /* ============================================================
       CHAT / TUTOR
       ============================================================ */
    renderChat() {
      setHeader("KI-Tutor", false);
      const main = $("#main"); main.innerHTML = "";
      const s = LS.store.settings();
      const providerLabel = s.aiProvider === "anthropic" ? "Claude" : s.aiProvider === "openai" ? "OpenAI" : "Offline-Tutor";

      const wrap = el("div", "chat-wrap");
      const intro = el("div", "chat-intro");
      intro.innerHTML = '<div class="tutor-avatar">🧔🏻</div><h3 style="font-weight:800;font-size:18px">Profe</h3>' +
        '<p class="muted tiny">Spricht mit tiefer Stimme · ' + providerLabel + "</p>";
      const feed = el("div", "chat-feed");
      wrap.appendChild(intro); wrap.appendChild(feed);

      // suggestions
      const sug = el("div", "chat-suggest");
      LS.data.chatStarters.forEach(txt => {
        const b = el("button", "suggest", txt);
        b.onclick = () => { sfx().tap(); send(txt); };
        sug.appendChild(b);
      });
      wrap.appendChild(sug);

      // input row
      const row = el("div", "chat-input");
      const input = document.createElement("input");
      input.type = "text"; input.placeholder = "Schreib auf Spanisch…";
      input.autocapitalize = "off"; input.spellcheck = false;
      const mic = el("button", "mic-btn");
      mic.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M6 11a6 6 0 0012 0M12 17v4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
      const sendBtn = el("button", "send-btn");
      sendBtn.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 12l16-8-6 16-3-7-7-1z" fill="currentColor"/></svg>';
      row.appendChild(mic); row.appendChild(input); row.appendChild(sendBtn);
      wrap.appendChild(row);
      main.appendChild(wrap);

      const history = [];
      const addBubble = (who, obj) => {
        const b = el("div", "bubble " + (who === "me" ? "me" : "bot"));
        b.innerHTML = obj.es + (obj.de ? '<span class="b-de">' + obj.de + "</span>" : "");
        if (who === "bot") {
          const say = el("button", "b-say");
          say.innerHTML = '🔊 anhören';
          say.onclick = () => { sfx().tap(); LS.speech.speak(obj.es); };
          b.appendChild(say);
        }
        feed.appendChild(b); feed.scrollTop = feed.scrollHeight;
        return b;
      };

      const typing = () => {
        const t = el("div", "bubble bot");
        t.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
        feed.appendChild(t); feed.scrollTop = feed.scrollHeight;
        return t;
      };

      const greet = LS.tutor.greeting();
      addBubble("bot", greet);
      history.push({ role: "bot", text: greet.es });
      LS.speech.speak(greet.es);

      const send = (txt) => {
        const text = (txt != null ? txt : input.value).trim();
        if (!text) return;
        input.value = "";
        addBubble("me", { es: text });
        history.push({ role: "user", text });
        const t = typing();
        LS.tutor.reply(history).then(resp => {
          t.remove();
          addBubble("bot", resp);
          history.push({ role: "bot", text: resp.es });
          LS.speech.speak(resp.es);
        });
      };

      sendBtn.onclick = () => { sfx().tap(); send(); };
      input.addEventListener("keydown", e => { if (e.key === "Enter") { send(); } });

      // mic dictation
      let recording = false;
      mic.onclick = () => {
        if (!LS.speech.recognitionAvailable) { LS.ui.toast("🎙️ Spracherkennung nur in Brave/Chrome"); return; }
        if (recording) return;
        recording = true; mic.classList.add("recording");
        LS.ui.toast("🎙️ Sprich jetzt…");
        LS.speech.listen({ lang: "es-ES" })
          .then(res => { recording = false; mic.classList.remove("recording"); if (res.transcript) send(res.transcript); })
          .catch(() => { recording = false; mic.classList.remove("recording"); LS.ui.toast("Nichts gehört"); });
      };
    },

    /* ============================================================
       PROFILE
       ============================================================ */
    renderProfile() {
      setHeader("Profil", false);
      const main = $("#main"); main.innerHTML = "";
      const s = LS.store.get();
      const set = LS.store.settings();

      const head = el("div", "profile-head");
      head.innerHTML = '<div class="avatar-big">🦉</div>' +
        '<h2 style="font-weight:800;font-size:22px">' + (s.name || "¡Hola, estudiante!") + "</h2>" +
        '<p class="muted">Nivel ' + (LS.store.overallProgress().done + 1) + " · Aprendiendo español</p>";
      main.appendChild(head);

      const ov = LS.store.overallProgress();
      const grid = el("div", "stat-grid");
      const cards = [
        { big: s.xp, lbl: "XP gesamt", c: "var(--blue)" },
        { big: s.streak + " 🔥", lbl: "Tage-Streak", c: "var(--orange)" },
        { big: LS.store.wordsLearned(), lbl: "Vokabeln gelernt", c: "var(--green)" },
        { big: ov.pct + "%", lbl: "Kurs-Fortschritt", c: "var(--purple)" }
      ];
      cards.forEach(c => {
        const card = el("div", "stat-card");
        card.innerHTML = '<div class="big" style="color:' + c.c + '">' + c.big + '</div><div class="lbl">' + c.lbl + "</div>";
        grid.appendChild(card);
      });
      main.appendChild(grid);

      // Name
      main.appendChild(el("div", "h2", "Dein Name"));
      const nameCard = el("div", "card");
      const nameIn = document.createElement("input");
      nameIn.className = "field"; nameIn.type = "text"; nameIn.placeholder = "Wie heißt du?"; nameIn.value = s.name || "";
      nameIn.addEventListener("change", () => { LS.store.setName(nameIn.value.trim()); LS.ui.toast("Gespeichert ✓"); });
      nameCard.appendChild(nameIn);
      main.appendChild(nameCard);

      // Settings
      main.appendChild(el("div", "h2", "Einstellungen"));
      const sc = el("div", "card");

      // sound toggle
      sc.appendChild(this._toggleRow("Soundeffekte", "Dezente Töne bei Antworten", set.sound, v => {
        LS.store.setSetting("sound", v); LS.audio.setEnabled(v); if (v) sfx().correct();
      }));

      // voice select
      const voiceRow = el("div", "setting-row");
      voiceRow.innerHTML = '<div><div class="lbl">Stimme</div><div class="desc">Tiefe männliche Stimme bevorzugt</div></div>';
      const vsel = el("select", "select");
      const fillVoices = () => {
        const voices = LS.speech.getVoices();
        vsel.innerHTML = "";
        const auto = document.createElement("option"); auto.value = ""; auto.textContent = "Automatisch (empfohlen)"; vsel.appendChild(auto);
        voices.forEach(v => { const o = document.createElement("option"); o.value = v.voiceURI; o.textContent = v.name; if (v.voiceURI === set.voiceURI) o.selected = true; vsel.appendChild(o); });
        if (!voices.length) { const o = document.createElement("option"); o.textContent = "Lade Stimmen…"; vsel.appendChild(o); setTimeout(fillVoices, 500); }
      };
      fillVoices();
      vsel.addEventListener("change", () => {
        LS.store.setSetting("voiceURI", vsel.value || null);
        LS.speech.setVoice(vsel.value || null);
        LS.speech.speak("Hola, soy tu tutor de español.");
      });
      voiceRow.appendChild(vsel);
      sc.appendChild(voiceRow);

      // pitch (depth) slider
      sc.appendChild(this._sliderRow("Stimmlage (Tiefe)", set.pitch, 0.4, 1.2, 0.05, v => {
        LS.store.setSetting("pitch", v); LS.speech.setPitch(v);
      }, () => LS.speech.speak("Hola, hablo en español.")));

      // rate slider
      sc.appendChild(this._sliderRow("Sprechtempo", set.rate, 0.6, 1.2, 0.05, v => {
        LS.store.setSetting("rate", v); LS.speech.setRate(v);
      }, () => LS.speech.speak("Hablo a esta velocidad.")));

      // test voice
      const test = el("button", "btn subtle", "🔊 Stimme testen");
      test.style.marginTop = "12px";
      test.onclick = () => { sfx().tap(); LS.speech.speak("¡Hola! Me llamo Profe y te ayudo a aprender español."); };
      sc.appendChild(test);
      main.appendChild(sc);

      // AI tutor settings
      main.appendChild(el("div", "h2", "KI-Tutor (optional)"));
      const ai = el("div", "card");
      ai.appendChild(el("p", "muted tiny", "Der Tutor funktioniert offline. Für ein echtes KI-Sprachmodell kannst du optional einen API-Schlüssel hinterlegen (wird nur lokal gespeichert)."));
      const provRow = el("div", "setting-row");
      provRow.innerHTML = '<div><div class="lbl">KI-Anbieter</div></div>';
      const psel = el("select", "select");
      [["builtin", "Offline-Tutor"], ["anthropic", "Anthropic (Claude)"], ["openai", "OpenAI (GPT)"]].forEach(([v, t]) => {
        const o = document.createElement("option"); o.value = v; o.textContent = t; if (v === set.aiProvider) o.selected = true; psel.appendChild(o);
      });
      provRow.appendChild(psel); ai.appendChild(provRow);

      const keyIn = document.createElement("input");
      keyIn.className = "field"; keyIn.type = "password"; keyIn.placeholder = "API-Schlüssel (optional)"; keyIn.value = set.aiKey || "";
      keyIn.style.marginTop = "12px";
      keyIn.addEventListener("change", () => { LS.store.setSetting("aiKey", keyIn.value.trim()); LS.ui.toast("Schlüssel gespeichert ✓"); });
      psel.addEventListener("change", () => { LS.store.setSetting("aiProvider", psel.value); LS.ui.toast("Anbieter: " + psel.options[psel.selectedIndex].textContent); });
      ai.appendChild(keyIn);
      main.appendChild(ai);

      // reset
      const resetBtn = el("button", "btn ghost", "Fortschritt zurücksetzen");
      resetBtn.style.marginTop = "20px"; resetBtn.style.color = "var(--rose)";
      resetBtn.onclick = () => {
        if (confirm("Wirklich allen Fortschritt löschen?")) { LS.store.reset(); LS.ui.toast("Zurückgesetzt"); updateStats(); this.renderProfile(); }
      };
      main.appendChild(resetBtn);

      main.appendChild(el("p", "muted tiny", "Learn Spanish · Español de España · v1.0"));
      const credit = el("p", "muted tiny", "Funktioniert am besten in Brave/Chrome (Sprachausgabe & Mikrofon).");
      credit.style.marginBottom = "10px";
      main.appendChild(credit);
    },

    _toggleRow(label, desc, value, onChange) {
      const row = el("div", "setting-row");
      row.innerHTML = '<div><div class="lbl">' + label + '</div><div class="desc">' + desc + "</div></div>";
      const sw = el("div", "switch" + (value ? " on" : "")); sw.innerHTML = "<i></i>";
      sw.addEventListener("click", () => { const on = !sw.classList.contains("on"); sw.classList.toggle("on", on); onChange(on); });
      row.appendChild(sw);
      return row;
    },

    _sliderRow(label, value, min, max, step, onInput, onDone) {
      const row = el("div", "setting-row");
      row.innerHTML = '<div><div class="lbl">' + label + "</div></div>";
      const r = document.createElement("input");
      r.type = "range"; r.min = min; r.max = max; r.step = step; r.value = value;
      r.style.cssText = "max-width:170px;accent-color:var(--blue);";
      r.addEventListener("input", () => onInput(parseFloat(r.value)));
      r.addEventListener("change", () => onDone && onDone());
      row.appendChild(r);
      return row;
    }
  };

  /* ---------------- dynamic quiz builder (Practice) ---------------- */
  function buildQuiz(kind) {
    const vocab = LS.data.vocab.slice();
    if (vocab.length < 4) return null;
    const sh = LS.player.shuffle;
    const pickN = (arr, n, not) => sh(arr.filter(x => x !== not)).slice(0, n);
    const steps = [];
    const pool = sh(vocab).slice(0, 8);

    if (kind === "listen") {
      pool.slice(0, 6).forEach(v => {
        const distract = pickN(vocab, 3, v).map(x => x.de);
        const opts = sh([v.de, ...distract]);
        steps.push({ type: "listen", es: v.es, de: v.de, options: opts, answer: opts.indexOf(v.de) });
      });
      return { id: "practice-listen", title: "Hör-Training", steps };
    }
    if (kind === "speak") {
      pool.slice(0, 6).forEach(v => steps.push({ type: "speak", es: v.es, de: v.de }));
      return { id: "practice-speak", title: "Aussprache", steps };
    }
    // mixed quiz
    pool.forEach((v, i) => {
      const m = i % 3;
      if (m === 0) {
        const distract = pickN(vocab, 3, v).map(x => x.es);
        const opts = sh([v.es, ...distract]).map(t => ({ t }));
        steps.push({ type: "choice", q: "Was heißt „" + v.de + "“?", options: opts, answer: opts.findIndex(o => o.t === v.es) });
      } else if (m === 1) {
        const distract = pickN(vocab, 3, v).map(x => x.de);
        const opts = sh([v.de, ...distract]);
        steps.push({ type: "listen", es: v.es, de: v.de, options: opts, answer: opts.indexOf(v.de) });
      } else {
        steps.push({ type: "write", de: v.de, es: v.es });
      }
    });
    return { id: "practice-quiz", title: "Zufalls-Quiz", steps };
  }

  /* ---------------- boot ---------------- */
  function unlockOnce() {
    LS.audio.unlock();
    // warm up speech synthesis (some browsers require a user gesture)
    try { const u = new SpeechSynthesisUtterance(""); u.volume = 0; speechSynthesis.speak(u); } catch (e) {}
    window.removeEventListener("pointerdown", unlockOnce);
    window.removeEventListener("keydown", unlockOnce);
  }
  window.addEventListener("pointerdown", unlockOnce);
  window.addEventListener("keydown", unlockOnce);

  function boot() {
    App.init();
    const splash = $("#splash");
    setTimeout(() => {
      splash.classList.add("fade");
      $("#app").classList.remove("hidden");
      setTimeout(() => splash.remove(), 650);
    }, 1100);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
