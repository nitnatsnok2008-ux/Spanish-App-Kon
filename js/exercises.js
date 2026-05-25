/* ============================================================
   exercises.js — lesson player + all exercise renderers
   ============================================================ */
(function () {
  const LS = (window.LS = window.LS || {});
  const sfx = () => LS.audio.sfx;

  /* ---------- text helpers ---------- */
  function stripAccents(s) { return s.normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function norm(s) {
    return (s || "").toLowerCase().trim()
      .replace(/[¿¡?.,!;:"']/g, "")
      .replace(/\s+/g, " ");
  }
  function normLoose(s) { return stripAccents(norm(s)); }
  function wordOverlap(a, b) {
    const A = normLoose(a).split(" ").filter(Boolean);
    const B = new Set(normLoose(b).split(" ").filter(Boolean));
    if (!A.length) return 0;
    return A.filter(w => B.has(w)).length / A.length;
  }
  function shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  const SPK_ICON = '<svg viewBox="0 0 24 24"><path d="M11 5L6 9H3v6h3l5 4V5z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 010 7M18 6a8 8 0 010 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  const MIC_ICON = '<svg viewBox="0 0 24 24" width="22" height="22"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M6 11a6 6 0 0012 0M12 17v4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

  function speakerBtn(text, label) {
    const b = el("button", "speaker", SPK_ICON + "<span>" + (label || "Anhören") + "</span>");
    b.addEventListener("click", () => {
      sfx().tap();
      b.classList.add("playing");
      LS.speech.speak(text).then(() => b.classList.remove("playing"));
    });
    return b;
  }

  /* ============================================================
     Player
     ============================================================ */
  const Player = {
    start(lesson, mountEl, onComplete) {
      this.lesson = lesson;
      this.mount = mountEl;
      this.onComplete = onComplete;
      this.index = 0;
      this.correct = 0;
      this.graded = 0;
      this.locked = false;
      this.buildUI();
      this.renderStep();
    },

    buildUI() {
      this.mount.innerHTML = "";
      const wrap = el("div", "player");

      const top = el("div", "player-top");
      const back = el("button", "icon-btn");
      back.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
      back.addEventListener("click", () => { this.teardown(); this.onComplete && this.onComplete(null); });
      const prog = el("div", "player-progress"); prog.appendChild(el("i"));
      top.appendChild(back); top.appendChild(prog);
      this.progFill = prog.querySelector("i");

      this.stage = el("div", "player-stage");
      wrap.appendChild(top); wrap.appendChild(this.stage);
      this.mount.appendChild(wrap);

      // feedback footer (fixed)
      this.fb = el("div", "feedback");
      this.fb.innerHTML =
        '<div class="feedback-row"><div class="feedback-icn"></div><div class="feedback-txt"><b></b><span></span></div></div>' +
        '<button class="btn"></button>';
      document.body.appendChild(this.fb);
      this.fbBtn = this.fb.querySelector(".btn");
      this.fbIcn = this.fb.querySelector(".feedback-icn");
      this.fbTitle = this.fb.querySelector(".feedback-txt b");
      this.fbSub = this.fb.querySelector(".feedback-txt span");
    },

    teardown() { if (this._poll) clearInterval(this._poll); if (this.fb) this.fb.remove(); LS.speech.stop(); },

    setProgress() {
      const total = this.lesson.steps.length;
      this.progFill.style.width = Math.round((this.index / total) * 100) + "%";
    },

    renderStep() {
      this.locked = false;
      this.hideFeedback();
      this.setProgress();
      const step = this.lesson.steps[this.index];
      if (!step) return this.finish();
      this.stage.innerHTML = "";
      this.stage.style.animation = "none"; void this.stage.offsetWidth; this.stage.style.animation = "";
      const fn = this["render_" + step.type];
      if (fn) fn.call(this, step);
      else this.renderContinue(el("div", "card", "Unbekannter Schritt"));
    },

    next() {
      this.index++;
      this.progFill.style.width = Math.round((this.index / this.lesson.steps.length) * 100) + "%";
      this.renderStep();
    },

    grade(ok, opts = {}) {
      if (this.locked) return;
      this.locked = true;
      this.graded++;
      if (ok) { this.correct++; sfx().correct(); } else { sfx().wrong(); }
      this.showFeedback(ok, opts.correctText, opts.note);
    },

    showFeedback(ok, correctText, note) {
      this.fb.classList.remove("ok", "no");
      this.fb.classList.add(ok ? "ok" : "no");
      this.fbIcn.innerHTML = ok
        ? '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M5 13l4 4 10-11" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        : '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>';
      this.fbTitle.textContent = ok ? "¡Correcto!" : "Casi…";
      this.fbSub.textContent = ok ? (note || "Sehr gut gemacht.") : (correctText ? "Richtig: " + correctText : (note || "Weiter so!"));
      this.fbBtn.className = "btn " + (ok ? "success" : "danger");
      this.fbBtn.textContent = "Weiter";
      this.fbBtn.onclick = () => { sfx().tap(); this.next(); };
      requestAnimationFrame(() => this.fb.classList.add("show"));
    },

    hideFeedback() { this.fb.classList.remove("show"); },

    // a footer "Continue" with no grading (intro/reading text/dialogue)
    showContinue(label) {
      this.fb.classList.remove("ok", "no");
      this.fbIcn.innerHTML = "";
      this.fbTitle.textContent = "";
      this.fbSub.textContent = "";
      this.fbBtn.className = "btn";
      this.fbBtn.textContent = label || "Weiter";
      this.fbBtn.onclick = () => { sfx().tap(); this.next(); };
      requestAnimationFrame(() => this.fb.classList.add("show"));
    },

    finish() {
      LS.speech.stop();
      this.setProgress();
      const total = Math.max(1, this.graded);
      const pct = Math.round((this.correct / total) * 100);
      const xp = 10 + this.correct * 5 + (pct === 100 ? 10 : 0);
      LS.store.completeLesson(this.lesson.id, this.correct, this.graded);
      const newXp = LS.store.addXp(xp);

      sfx().complete();
      LS.ui.confetti();

      this.stage.innerHTML = "";
      const c = el("div", "complete");
      c.innerHTML =
        '<div class="trophy">🏆</div>' +
        '<h2>¡Lección completada!</h2>' +
        '<p class="muted">' + this.lesson.title + "</p>" +
        '<div class="stats">' +
          '<div class="statbox"><b>' + this.correct + "/" + this.graded + '</b><span>Richtig</span></div>' +
          '<div class="statbox"><b>+' + xp + '</b><span>XP</span></div>' +
          '<div class="statbox"><b>' + pct + '%</b><span>Score</span></div>' +
        "</div>";
      const btn = el("button", "btn success", "Fertig");
      btn.addEventListener("click", () => { sfx().tap(); this.teardown(); this.onComplete && this.onComplete({ xp, pct }); });
      c.appendChild(btn);
      this.stage.appendChild(c);
      this.hideFeedback();
    },

    /* ============================================================
       Renderers
       ============================================================ */
    render_intro(step) {
      const v = el("div", "card vcard");
      v.innerHTML =
        '<div class="emoji">' + (step.emoji || "📘") + "</div>" +
        '<div class="es">' + step.es + "</div>" +
        (step.say ? '<div class="ipa">[' + step.say + "]</div>" : "") +
        '<div class="de">' + step.de + "</div>" +
        (step.ex ? '<div class="ex">„' + step.ex + "“<br><span class=muted>" + (step.exDe || "") + "</span></div>" : "");
      v.appendChild(speakerBtn(step.es));
      this.stage.appendChild(el("div", "q-prompt", "Neue Vokabel"));
      this.stage.appendChild(v);
      LS.speech.speak(step.es);
      this.showContinue("Verstanden");
    },

    render_choice(step) {
      this.stage.appendChild(el("div", "q-prompt", "Wähle die richtige Antwort"));
      this.stage.appendChild(el("h2", "q-title", step.q));
      if (step.qSub) this.stage.appendChild(el("p", "q-sub", step.qSub));
      this._renderOptions(step.options, step.answer, (correct, chosenEl, opts) => {
        const right = step.options[step.answer].t;
        this.grade(correct, { correctText: correct ? null : right });
      });
    },

    render_listen(step) {
      this.stage.appendChild(el("div", "q-prompt", "Hören & verstehen"));
      this.stage.appendChild(el("h2", "q-title", "Was bedeutet das?"));
      const sb = speakerBtn(step.es, "Nochmal hören");
      sb.style.margin = "18px auto 0"; sb.style.display = "flex";
      this.stage.appendChild(sb);
      LS.speech.speak(step.es);
      const opts = step.options.map(t => ({ t }));
      this._renderOptions(opts, step.answer, (correct) => {
        this.grade(correct, { correctText: correct ? null : step.options[step.answer] + " — „" + step.es + "“" });
      });
    },

    _renderOptions(options, answerIdx, done) {
      const box = el("div", "options");
      let chosen = null;
      options.forEach((o, i) => {
        const b = el("button", "opt");
        b.innerHTML = (o.emoji ? '<span class="opt-emoji">' + o.emoji + "</span>" : "") + "<span>" + o.t + "</span>";
        b.addEventListener("click", () => {
          if (this.locked) return;
          sfx().select();
          chosen = i;
          box.querySelectorAll(".opt").forEach(x => x.classList.remove("selected"));
          b.classList.add("selected");
          // immediate evaluation feels snappier
          const correct = i === answerIdx;
          box.querySelectorAll(".opt").forEach((x, xi) => {
            x.classList.add("muted-opt");
            if (xi === answerIdx) { x.classList.remove("muted-opt"); x.classList.add("correct"); }
          });
          if (!correct) { b.classList.remove("muted-opt"); b.classList.add("wrong"); }
          done(correct, b, options);
        });
        box.appendChild(b);
      });
      this.stage.appendChild(box);
    },

    render_write(step) {
      this.stage.appendChild(el("div", "q-prompt", "Schreibe auf Spanisch"));
      this.stage.appendChild(el("h2", "q-title", step.de));
      const input = el("input", "field");
      input.type = "text"; input.placeholder = "Tippe hier…";
      input.autocapitalize = "off"; input.autocomplete = "off"; input.spellcheck = false;
      this.stage.appendChild(input);

      const chips = el("div", "hintchips");
      ["¿", "¡", "ñ", "á", "é", "í", "ó", "ú"].forEach(ch => {
        const c = el("button", "chip", ch);
        c.addEventListener("click", () => { sfx().tap(); input.value += ch; input.focus(); });
        chips.appendChild(c);
      });
      this.stage.appendChild(chips);
      setTimeout(() => input.focus(), 60);

      this.showCheck(() => {
        const val = input.value;
        const targets = [step.es, ...(step.alt || [])];
        const ok = targets.some(t => norm(t) === norm(val)) ||
                   targets.some(t => normLoose(t) === normLoose(val) && normLoose(val).length > 1);
        input.classList.add(ok ? "correct" : "wrong");
        input.disabled = true;
        this.grade(ok, { correctText: ok ? null : step.es });
      }, () => input.value.trim().length > 0, input);
    },

    render_match(step) {
      this.stage.appendChild(el("div", "q-prompt", "Spiel: Finde die Paare"));
      this.stage.appendChild(el("h2", "q-title", "Verbinde Spanisch & Deutsch"));
      const grid = el("div", "match-grid");
      const left = shuffle(step.pairs.map((p, i) => ({ t: p.es, key: i, side: "es", say: p.es })));
      const right = shuffle(step.pairs.map((p, i) => ({ t: p.de, key: i, side: "de" })));
      const cells = [];
      function mk(item) {
        const c = el("div", "match-cell", item.t);
        c.dataset.key = item.key; c.dataset.side = item.side;
        cells.push({ item, node: c });
        return c;
      }
      // interleave columns
      for (let i = 0; i < step.pairs.length; i++) { grid.appendChild(mk(left[i])); grid.appendChild(mk(right[i])); }
      this.stage.appendChild(grid);

      let sel = null, remaining = step.pairs.length, mistakes = 0;
      const self = this;
      cells.forEach(({ item, node }) => {
        node.addEventListener("click", () => {
          if (node.classList.contains("matched")) return;
          if (item.side === "es") LS.speech.speak(item.t);
          if (!sel) { sfx().select(); sel = { item, node }; node.classList.add("sel"); return; }
          if (sel.node === node) { sel.node.classList.remove("sel"); sel = null; return; }
          // attempt match
          if (sel.item.key === item.key && sel.item.side !== item.side) {
            sfx().pop();
            node.classList.add("matched"); sel.node.classList.remove("sel"); sel.node.classList.add("matched");
            setTimeout(() => { node.classList.add("gone"); sel && sel.node && sel.node.classList.add("gone"); }, 350);
            sel = null; remaining--;
            if (remaining === 0) { self.grade(mistakes === 0, { note: mistakes === 0 ? "Perfekt – alle Paare!" : "Alle gefunden." }); }
          } else {
            sfx().wrong(); mistakes++;
            const a = sel.node, b = node;
            a.classList.add("err"); b.classList.add("err");
            setTimeout(() => { a.classList.remove("err", "sel"); b.classList.remove("err"); }, 450);
            sel = null;
          }
        });
      });
    },

    render_build(step) {
      this.stage.appendChild(el("div", "q-prompt", "Baue den Satz"));
      this.stage.appendChild(el("h2", "q-title", step.de));
      const sb = speakerBtn(step.es, "Lösung hören"); sb.style.cssText = "margin:14px auto 0;display:flex;";
      this.stage.appendChild(sb);

      const area = el("div", "build-area");
      const bank = el("div", "bank");
      this.stage.appendChild(area); this.stage.appendChild(bank);

      const tokens = step.es.split(/\s+/);
      const distract = step.extra || [];
      const pool = shuffle(tokens.concat(distract).map((w, i) => ({ w, id: i })));
      const placed = [];

      pool.forEach(p => {
        const t = el("button", "tile", p.w);
        t.addEventListener("click", () => {
          if (this.locked) return;
          sfx().tap();
          t.classList.add("used");
          placed.push({ p, node: t });
          const bt = el("button", "tile", p.w);
          bt.addEventListener("click", () => {
            if (this.locked) return;
            sfx().swipe();
            bt.remove(); t.classList.remove("used");
            const idx = placed.findIndex(x => x.bt === bt); if (idx >= 0) placed.splice(idx, 1);
          });
          placed[placed.length - 1].bt = bt;
          area.appendChild(bt);
        });
        bank.appendChild(t);
      });

      this.showCheck(() => {
        const built = placed.map(x => x.p.w).join(" ");
        const ok = norm(built) === norm(step.es) || normLoose(built) === normLoose(step.es);
        this.grade(ok, { correctText: ok ? null : step.es });
      }, () => placed.length > 0);
    },

    render_speak(step) {
      this.stage.appendChild(el("div", "q-prompt", "Sprechen – sag es laut"));
      const card = el("div", "card vcard");
      card.innerHTML = '<div class="es">' + step.es + "</div><div class=de>" + step.de + "</div>";
      card.appendChild(speakerBtn(step.es, "Vorhören"));
      this.stage.appendChild(card);

      const status = el("p", "q-sub"); status.style.textAlign = "center";
      this.stage.appendChild(status);

      if (!LS.speech.recognitionAvailable) {
        status.innerHTML = "🎙️ Spracherkennung ist in diesem Browser nicht verfügbar.<br>In <b>Brave/Chrome</b> funktioniert sie. Du kannst trotzdem weitermachen.";
        this.showContinue("Überspringen");
        return;
      }

      const mic = el("button", "btn", MIC_ICON + " Aufnehmen & sprechen");
      mic.style.marginTop = "20px";
      let busy = false;
      mic.addEventListener("click", () => {
        if (busy || this.locked) return;
        busy = true; mic.classList.add("danger"); mic.innerHTML = MIC_ICON + " Höre zu… sprich jetzt";
        status.textContent = "";
        LS.speech.listen({ lang: "es-ES" })
          .then(res => {
            busy = false; mic.classList.remove("danger"); mic.innerHTML = MIC_ICON + " Nochmal versuchen";
            const heard = res.transcript || "";
            status.innerHTML = "Gehört: „<b>" + heard + "</b>“";
            const all = [step.es, ...(step.alt || [])];
            const exact = all.some(t => normLoose(t) === normLoose(heard));
            const close = all.some(t => wordOverlap(t, heard) >= 0.6) || res.alternatives.some(a => all.some(t => normLoose(t) === normLoose(a)));
            this.grade(exact || close, { correctText: (exact || close) ? null : step.es, note: (exact || close) ? "Gut gesprochen!" : "Versuch es nochmal." });
          })
          .catch(err => {
            busy = false; mic.classList.remove("danger"); mic.innerHTML = MIC_ICON + " Nochmal versuchen";
            status.innerHTML = (err && err.message === "not-allowed")
              ? "🎙️ Bitte Mikrofon-Zugriff erlauben."
              : "Nichts gehört – bitte nochmal.";
          });
      });
      this.stage.appendChild(mic);

      const skip = el("button", "btn ghost", "Überspringen"); skip.style.marginTop = "10px";
      skip.addEventListener("click", () => { if (!this.locked) { this.graded++; this.next(); } });
      this.stage.appendChild(skip);
    },

    render_reading(step) {
      this.stage.appendChild(el("div", "q-prompt", "Lesen & verstehen"));
      this.stage.appendChild(el("h2", "q-title", step.title));
      const sb = speakerBtn(step.lines.map(l => l.es).join(". "), "Text vorlesen");
      sb.style.cssText = "margin:14px 0;display:flex;";
      this.stage.appendChild(sb);

      const reader = el("div", "card reader");
      step.lines.forEach(line => {
        const p = el("p");
        line.es.split(/\s+/).forEach((w, i) => {
          const span = el("span", "word", (i ? " " : "") + w);
          span.addEventListener("click", () => { sfx().tap(); LS.speech.speak(w.replace(/[¿¡?.,!]/g, "")); });
          p.appendChild(span);
        });
        const tr = el("div", "trans", line.de);
        reader.appendChild(p); reader.appendChild(tr);
      });
      this.stage.appendChild(reader);

      if (step.q) {
        const qWrap = el("div"); qWrap.style.marginTop = "22px";
        qWrap.appendChild(el("div", "q-prompt", "Frage zum Text"));
        qWrap.appendChild(el("h2", "q-title", step.q.q));
        this.stage.appendChild(qWrap);
        const box = el("div", "options");
        step.q.options.forEach((o, i) => {
          const b = el("button", "opt", "<span>" + o.t + "</span>");
          b.addEventListener("click", () => {
            if (this.locked) return;
            sfx().select();
            const correct = i === step.q.answer;
            box.querySelectorAll(".opt").forEach((x, xi) => {
              x.classList.add("muted-opt");
              if (xi === step.q.answer) { x.classList.remove("muted-opt"); x.classList.add("correct"); }
            });
            if (!correct) { b.classList.remove("muted-opt"); b.classList.add("wrong"); }
            this.grade(correct, { correctText: correct ? null : step.q.options[step.q.answer].t });
          });
          box.appendChild(b);
        });
        qWrap.appendChild(box);
      } else {
        this.showContinue("Weiter");
      }
    },

    render_dialogue(step) {
      this.stage.appendChild(el("div", "q-prompt", "Dialog – hör gut zu"));
      this.stage.appendChild(el("h2", "q-title", "Mini-diálogo"));
      const wrap = el("div"); wrap.style.marginTop = "16px";
      step.lines.forEach((line, i) => {
        const row = el("div", "bubble " + (i % 2 ? "me" : "bot"));
        row.style.marginBottom = "10px";
        row.innerHTML = "<b style='font-size:12px;opacity:.6;display:block;'>" + (line.who || "") + "</b>" +
          line.es + '<span class="b-de">' + line.de + "</span>";
        const say = el("button", "b-say", SPK_ICON + " anhören");
        say.addEventListener("click", () => { sfx().tap(); LS.speech.speak(line.es); });
        row.appendChild(say);
        wrap.appendChild(row);
      });
      this.stage.appendChild(wrap);

      // auto play the whole dialogue, line by line
      let i = 0;
      const playNext = () => {
        if (i >= step.lines.length) return;
        LS.speech.speak(step.lines[i].es).then(() => { i++; setTimeout(playNext, 350); });
      };
      setTimeout(playNext, 300);

      const replay = el("button", "btn subtle", "▶︎ Ganzen Dialog anhören");
      replay.style.marginTop = "8px";
      replay.addEventListener("click", () => { sfx().tap(); i = 0; playNext(); });
      this.stage.appendChild(replay);
      this.showContinue("Weiter");
    },

    // generic check button in footer that becomes active when `valid()` is true
    showCheck(onCheck, valid, watchEl) {
      this.fb.classList.remove("ok", "no");
      this.fbIcn.innerHTML = "";
      this.fbTitle.textContent = "";
      this.fbSub.textContent = "";
      this.fbBtn.className = "btn";
      this.fbBtn.textContent = "Überprüfen";
      const refresh = () => { this.fbBtn.disabled = valid ? !valid() : false; };
      refresh();
      if (watchEl) {
        watchEl.addEventListener("input", refresh);
        watchEl.addEventListener("keydown", e => { if (e.key === "Enter" && (!valid || valid())) onCheck(); });
      } else {
        // poll lightly for tile-based widgets
        clearInterval(this._poll); this._poll = setInterval(refresh, 200);
      }
      this.fbBtn.onclick = () => { if (this.fbBtn.disabled) return; clearInterval(this._poll); sfx().tap(); onCheck(); };
      requestAnimationFrame(() => this.fb.classList.add("show"));
    }
  };

  LS.player = {
    start(lesson, mountEl, onComplete) { Player.start(lesson, mountEl, onComplete); },
    cancel() { if (Player._poll) clearInterval(Player._poll); if (Player.fb) Player.fb.remove(); LS.speech.stop(); },
    // expose helpers for the practice tab
    speakerBtn, shuffle, norm, normLoose, el
  };
})();
