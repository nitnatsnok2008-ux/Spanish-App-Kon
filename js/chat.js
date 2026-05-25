/* ============================================================
   chat.js — AI Spanish tutor
   • Built-in conversational engine (works fully offline)
   • Optional real LLM (Anthropic Claude or OpenAI) via a local API key
   Always replies in simple Español de España with a German gloss.
   ============================================================ */
(function () {
  const LS = (window.LS = window.LS || {});

  function norm(s) {
    return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[¿¡?.,!;:]/g, "").replace(/\s+/g, " ").trim();
  }
  const has = (t, ...ws) => ws.some(w => t.includes(w));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  /* ---------- mini dictionary for "¿cómo se dice…?" ---------- */
  const dict = {
    haus: "casa", house: "casa", casa: "casa",
    wasser: "agua", water: "agua",
    katze: "gato", cat: "gato",
    hund: "perro", dog: "perro",
    rot: "rojo", red: "rojo",
    auto: "coche", car: "coche",
    buch: "libro", book: "libro",
    freund: "amigo", friend: "amigo",
    liebe: "amor", love: "amor",
    schule: "escuela", school: "escuela",
    arbeit: "trabajo", work: "trabajo",
    morgen: "mañana", tomorrow: "mañana",
    danke: "gracias", thanks: "gracias",
    bitte: "por favor", please: "por favor",
    ja: "sí", yes: "sí", nein: "no"
  };
  LS.data && LS.data.vocab.forEach(v => {
    const k = v.de.toLowerCase().replace(/^(der|die|das|ein|eine)\s+/, "").trim();
    if (k && !dict[k]) dict[k] = v.es;
  });

  /* ============================================================
     Built-in engine
     ============================================================ */
  function builtinReply(text) {
    const t = norm(text);

    if (!t) return { es: "¿Sí? Dime algo.", de: "Ja? Sag mir etwas." };

    // "Wie sagt man X?" / "¿cómo se dice X?"
    if (has(t, "como se dice", "wie sagt man", "how do you say", "que es", "was heisst", "was heißt")) {
      const m = text.match(/['"]([^'"]+)['"]/) || text.match(/(?:dice|sagt man|say|heisst|heißt)\s+(.+?)\??$/i);
      const word = m ? norm(m[1]) : "";
      const found = dict[word];
      if (found) return { es: 'Se dice "' + found + '". ¿Lo repites?', de: 'Man sagt „' + found + '“. Wiederholst du es?' };
      return { es: "Mmm, no lo sé seguro. Pregúntame otra palabra.", de: "Hmm, das weiß ich nicht sicher. Frag mich ein anderes Wort." };
    }

    // greetings
    if (has(t, "hola", "buenos dias", "buenas tardes", "buenas noches", "hallo", "hi")) {
      return { es: pick(["¡Hola! ¿Qué tal estás?", "¡Buenas! ¿Cómo va todo?", "¡Hola! Me alegro de verte. ¿Qué tal?"]),
               de: "Hallo! Wie geht es dir?" };
    }
    // how are you
    if (has(t, "que tal", "como estas", "como va", "wie gehts", "wie geht es")) {
      return { es: "¡Muy bien, gracias! ¿Y tú? ¿Qué has hecho hoy?", de: "Sehr gut, danke! Und du? Was hast du heute gemacht?" };
    }
    if (has(t, "muy bien", "bien", "gut", "fine", "estupendo", "genial")) {
      return { es: "¡Me alegro mucho! Vamos a practicar. ¿De dónde eres?", de: "Das freut mich sehr! Lass uns üben. Woher kommst du?" };
    }
    if (has(t, "mal", "regular", "asi asi", "schlecht", "cansado", "cansada")) {
      return { es: "Vaya… Lo siento. Un poco de español siempre anima. ¿Empezamos?", de: "Oh je… Tut mir leid. Etwas Spanisch muntert immer auf. Fangen wir an?" };
    }
    // name
    if (has(t, "me llamo", "soy ", "mi nombre", "ich heisse", "ich heiße", "my name")) {
      const m = text.match(/(?:me llamo|soy|nombre es|heisse|heiße|name is)\s+([a-záéíóúñ]+)/i);
      const name = m ? m[1] : null;
      if (name) { LS.store.setName(name); return { es: "¡Encantado, " + name + "! Yo soy tu tutor. ¿De dónde eres?", de: "Sehr erfreut, " + name + "! Ich bin dein Tutor. Woher kommst du?" }; }
      return { es: "¡Encantado! ¿Y de dónde eres?", de: "Sehr erfreut! Und woher kommst du?" };
    }
    if (has(t, "como te llamas", "tu nombre", "wie heisst du", "wie heißt du")) {
      return { es: "Me llamo Profe. Soy tu tutor de español. ¿Y tú cómo te llamas?", de: "Ich heiße Profe. Ich bin dein Spanisch-Tutor. Und wie heißt du?" };
    }
    // origin
    if (has(t, "de donde", "soy de", "vivo en", "alemania", "woher", "germany", "deutschland")) {
      return { es: "¡Qué bien! España es preciosa también. ¿Has estado en España?", de: "Wie schön! Spanien ist auch wunderbar. Warst du schon einmal in Spanien?" };
    }
    // ordering / café
    if (has(t, "cafe", "queria", "quiero", "una cana", "cerveza", "comer", "beber", "tengo hambre", "tengo sed")) {
      return { es: "¡Marchando! ¿Algo más? Puedes decir: 'La cuenta, por favor'.", de: "Kommt sofort! Sonst noch etwas? Du kannst sagen: „Die Rechnung, bitte.“" };
    }
    // numbers
    if (/\b(uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\b/.test(t) || has(t, "numero", "cuanto")) {
      return { es: "¡Muy bien con los números! ¿Cuántos años tienes?", de: "Sehr gut mit den Zahlen! Wie alt bist du?" };
    }
    // thanks
    if (has(t, "gracias", "danke", "thank")) {
      return { es: "¡De nada! Estoy aquí para ayudarte. ¿Seguimos?", de: "Gern geschehen! Ich bin hier, um dir zu helfen. Machen wir weiter?" };
    }
    // don't understand
    if (has(t, "no entiendo", "no se", "verstehe nicht", "dont understand", "mas despacio", "langsamer")) {
      return { es: "Tranquilo, lo digo más despacio. Repite conmigo, palabra por palabra.", de: "Keine Sorge, ich sage es langsamer. Wiederhole mit mir, Wort für Wort." };
    }
    // yes/no
    if (has(t, "si", "vale", "claro", "ja", "yes")) {
      return { es: "¡Perfecto! Cuéntame, ¿qué te gusta hacer?", de: "Perfekt! Erzähl mir, was machst du gern?" };
    }
    if (has(t, "no", "nein")) {
      return { es: "Vale, no pasa nada. ¿Quieres practicar saludos o comida?", de: "Okay, kein Problem. Möchtest du Begrüßungen oder Essen üben?" };
    }
    // likes
    if (has(t, "me gusta", "me encanta", "ich mag", "i like")) {
      return { es: "¡A mí también! En español decimos 'me encanta'. ¿Qué más te gusta?", de: "Mir auch! Auf Spanisch sagen wir „me encanta“. Was magst du noch?" };
    }
    // farewell
    if (has(t, "adios", "hasta luego", "chao", "tschuss", "tschüss", "bye", "hasta")) {
      return { es: "¡Hasta luego! Has practicado muy bien. ¡Nos vemos pronto!", de: "Bis später! Du hast sehr gut geübt. Bis bald!" };
    }
    if (has(t, "ayuda", "help", "hilfe")) {
      return { es: "Claro. Escríbeme en español o pulsa el micrófono y habla. Te corrijo con cariño.", de: "Klar. Schreib mir auf Spanisch oder drück das Mikrofon und sprich. Ich korrigiere dich behutsam." };
    }

    // default: encourage + keep the conversation going
    return {
      es: pick([
        "Interesante. Intenta decirlo con una frase corta en español.",
        "Te entiendo. ¿Puedes decirlo en español? Yo te ayudo.",
        "¡Bien! Sigamos en español. Pregúntame algo sencillo.",
        "Vale. ¿Cómo se dice eso en español? Inténtalo."
      ]),
      de: "Versuch es in einem kurzen spanischen Satz – ich helfe dir."
    };
  }

  /* ============================================================
     Optional real LLM
     ============================================================ */
  const SYSTEM = [
    "Du bist 'Profe', ein freundlicher, geduldiger Tutor für Spanisch aus Spanien (Español de España, mit 'vosotros' und typisch spanischem Wortschatz wie 'vale', 'tío', 'guay').",
    "Der Lernende ist Anfänger und Deutsch-Muttersprachler.",
    "Antworte IMMER in sehr einfachem Spanisch (kurze Sätze).",
    "Gib danach in einer neuen Zeile eine deutsche Übersetzung, eingeleitet mit 'DE: '.",
    "Korrigiere Fehler freundlich und kurz. Stelle oft eine kleine Rückfrage, damit das Gespräch weiterläuft.",
    "Halte Antworten kurz (max. 2 Sätze Spanisch)."
  ].join(" ");

  async function anthropicReply(history, key) {
    const messages = history.map(m => ({ role: m.role === "bot" ? "assistant" : "user", content: m.text }));
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 300, system: SYSTEM, messages })
    });
    if (!res.ok) throw new Error("anthropic " + res.status);
    const data = await res.json();
    return (data.content && data.content[0] && data.content[0].text) || "";
  }

  async function openaiReply(history, key) {
    const messages = [{ role: "system", content: SYSTEM }].concat(
      history.map(m => ({ role: m.role === "bot" ? "assistant" : "user", content: m.text }))
    );
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", "authorization": "Bearer " + key },
      body: JSON.stringify({ model: "gpt-4o-mini", max_tokens: 300, messages })
    });
    if (!res.ok) throw new Error("openai " + res.status);
    const data = await res.json();
    return (data.choices && data.choices[0] && data.choices[0].message.content) || "";
  }

  function splitGloss(raw) {
    // expects "<spanish>\nDE: <german>"
    const m = raw.match(/DE:\s*([\s\S]+)$/i);
    if (m) return { es: raw.slice(0, m.index).trim(), de: m[1].trim() };
    return { es: raw.trim(), de: "" };
  }

  /* ---------- public API ---------- */
  LS.tutor = {
    async reply(history) {
      const last = history[history.length - 1];
      const s = LS.store.settings();
      const provider = s.aiProvider;
      const key = (s.aiKey || "").trim();
      if (key && provider !== "builtin") {
        try {
          const raw = provider === "openai" ? await openaiReply(history, key) : await anthropicReply(history, key);
          if (raw) return splitGloss(raw);
        } catch (e) {
          // fall back gracefully to the built-in engine
          const r = builtinReply(last.text);
          r.de = (r.de || "") + "  ⚠︎ (KI-API nicht erreichbar – Offline-Tutor)";
          return r;
        }
      }
      return builtinReply(last.text);
    },
    greeting() {
      const name = LS.store.get().name;
      return { es: "¡Hola" + (name ? ", " + name : "") + "! Soy Profe, tu tutor. ¿Qué tal estás hoy?",
               de: "Hallo" + (name ? ", " + name : "") + "! Ich bin Profe, dein Tutor. Wie geht es dir heute?" };
    }
  };
})();
