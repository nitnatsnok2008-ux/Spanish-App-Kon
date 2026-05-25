/* ============================================================
   data.js — Curriculum for "Learn Spanish" (Español de España)
   Level-based path. Each lesson is a sequence of typed steps.

   Step types (rendered by exercises.js):
     intro    { emoji, es, de, say?, ex?, exDe? }   visual vocab card
     choice   { q, qSub?, de?, options:[{t,emoji?}], answer }
     listen   { es, de, options:[de...], answer }    hear & pick meaning
     write    { de, es, alt?:[...] }                 type the Spanish
     match    { pairs:[{es,de}] }                    matching game
     build    { es, de, extra?:[words] }             build sentence
     speak    { es, de }                             say it (speech recognition)
     reading  { title, lines:[{es,de}], q? }         read a short text
     dialogue { lines:[{who,es,de}] }                listen to a mini dialogue
   ============================================================ */
(function () {
  const LS = (window.LS = window.LS || {});

  const levels = [
    /* ============================ LEVEL 1 ============================ */
    {
      id: "l1", title: "Primeros pasos", subtitle: "Begrüßen & Vorstellen",
      icon: "👋", color: "linear-gradient(135deg,#FF375F,#FF9F0A)",
      lessons: [
        {
          id: "l1a", title: "Hola y adiós", icon: "👋", kind: "Begrüßung",
          steps: [
            { type: "intro", emoji: "👋", es: "Hola", de: "Hallo", say: "OH-la", ex: "¡Hola! ¿Qué tal?", exDe: "Hallo! Wie geht's?" },
            { type: "intro", emoji: "☀️", es: "Buenos días", de: "Guten Morgen", say: "BUE-nos DI-as", ex: "Buenos días, señora.", exDe: "Guten Morgen, gnädige Frau." },
            { type: "intro", emoji: "🌆", es: "Buenas tardes", de: "Guten Tag / Nachmittag", say: "BUE-nas TAR-des" },
            { type: "intro", emoji: "🌙", es: "Buenas noches", de: "Guten Abend / Gute Nacht", say: "BUE-nas NO-tches" },
            { type: "intro", emoji: "👋", es: "Adiós", de: "Tschüss / Auf Wiedersehen", say: "a-di-OS" },
            { type: "intro", emoji: "🤝", es: "Hasta luego", de: "Bis später", say: "AS-ta lu-E-go" },
            { type: "choice", q: "Wie sagt man „Guten Morgen“?", options: [{ t: "Buenas noches" }, { t: "Buenos días", emoji: "☀️" }, { t: "Adiós" }, { t: "Hasta luego" }], answer: 1 },
            { type: "listen", es: "Buenas noches", de: "Gute Nacht", options: ["Guten Morgen", "Hallo", "Gute Nacht", "Bis später"], answer: 2 },
            { type: "match", pairs: [{ es: "Hola", de: "Hallo" }, { es: "Adiós", de: "Tschüss" }, { es: "Buenos días", de: "Guten Morgen" }, { es: "Hasta luego", de: "Bis später" }] },
            { type: "speak", es: "Hola", de: "Hallo" },
            { type: "write", de: "Auf Wiedersehen", es: "Adiós", alt: ["adios"] }
          ]
        },
        {
          id: "l1b", title: "¿Qué tal?", icon: "🙂", kind: "Befinden",
          steps: [
            { type: "intro", emoji: "🙂", es: "¿Qué tal?", de: "Wie geht's?", say: "ke tal", ex: "Hola, ¿qué tal?", exDe: "Hallo, wie geht's?" },
            { type: "intro", emoji: "😀", es: "Muy bien", de: "Sehr gut", say: "muy bien" },
            { type: "intro", emoji: "😐", es: "Así así", de: "So lala", say: "a-SI a-SI" },
            { type: "intro", emoji: "🙏", es: "Gracias", de: "Danke", say: "GRA-thias", ex: "Muy bien, gracias.", exDe: "Sehr gut, danke." },
            { type: "intro", emoji: "😊", es: "De nada", de: "Gern geschehen", say: "de NA-da" },
            { type: "intro", emoji: "🙇", es: "Por favor", de: "Bitte (Aufforderung)", say: "por fa-VOR" },
            { type: "listen", es: "Muy bien, gracias", de: "Sehr gut, danke", options: ["So lala", "Sehr gut, danke", "Bis später", "Gute Nacht"], answer: 1 },
            { type: "build", es: "Hola, ¿qué tal?", de: "Hallo, wie geht's?", extra: ["adiós"] },
            { type: "choice", q: "Jemand sagt „Gracias“. Du antwortest:", options: [{ t: "De nada", emoji: "😊" }, { t: "Por favor" }, { t: "Adiós" }, { t: "Así así" }], answer: 0 },
            { type: "speak", es: "Muy bien, gracias", de: "Sehr gut, danke" },
            { type: "write", de: "Danke", es: "Gracias", alt: ["gracias"] }
          ]
        },
        {
          id: "l1c", title: "Me llamo…", icon: "🪪", kind: "Vorstellen",
          steps: [
            { type: "intro", emoji: "🗣️", es: "¿Cómo te llamas?", de: "Wie heißt du?", say: "KO-mo te YA-mas" },
            { type: "intro", emoji: "🪪", es: "Me llamo…", de: "Ich heiße…", say: "me YA-mo", ex: "Me llamo Ana.", exDe: "Ich heiße Ana." },
            { type: "intro", emoji: "😍", es: "Encantado", de: "Sehr erfreut (Mann)", say: "en-kan-TA-do" },
            { type: "intro", emoji: "🥰", es: "Encantada", de: "Sehr erfreut (Frau)", say: "en-kan-TA-da" },
            { type: "intro", emoji: "🌍", es: "¿De dónde eres?", de: "Woher kommst du?", say: "de DON-de E-res" },
            { type: "intro", emoji: "🇩🇪", es: "Soy de Alemania", de: "Ich komme aus Deutschland", say: "soy de a-le-MA-nia" },
            { type: "dialogue", lines: [
              { who: "A", es: "¡Hola! ¿Cómo te llamas?", de: "Hallo! Wie heißt du?" },
              { who: "B", es: "Me llamo Marco. ¿Y tú?", de: "Ich heiße Marco. Und du?" },
              { who: "A", es: "Soy Lucía. Encantada.", de: "Ich bin Lucía. Sehr erfreut." }
            ] },
            { type: "choice", q: "Eine Frau stellt sich vor: „Sehr erfreut.“", options: [{ t: "Encantado" }, { t: "Encantada" }, { t: "Me llamo" }, { t: "De nada" }], answer: 1 },
            { type: "build", es: "Me llamo Ana", de: "Ich heiße Ana", extra: ["soy", "tú"] },
            { type: "write", de: "Woher kommst du?", es: "¿De dónde eres?", alt: ["de donde eres", "¿de donde eres?"] },
            { type: "speak", es: "Me llamo", de: "Ich heiße…" }
          ]
        }
      ]
    },

    /* ============================ LEVEL 2 ============================ */
    {
      id: "l2", title: "Yo y los demás", subtitle: "Menschen, Familie & Zahlen",
      icon: "👨‍👩‍👧", color: "linear-gradient(135deg,#5E5CE6,#BF5AF2)",
      lessons: [
        {
          id: "l2a", title: "Números 0–10", icon: "🔢", kind: "Zahlen",
          steps: [
            { type: "intro", emoji: "0️⃣", es: "cero", de: "null", say: "THE-ro" },
            { type: "intro", emoji: "1️⃣", es: "uno", de: "eins", say: "U-no" },
            { type: "intro", emoji: "2️⃣", es: "dos", de: "zwei", say: "dos" },
            { type: "intro", emoji: "3️⃣", es: "tres", de: "drei", say: "tres" },
            { type: "intro", emoji: "4️⃣", es: "cuatro", de: "vier", say: "KUA-tro" },
            { type: "intro", emoji: "5️⃣", es: "cinco", de: "fünf", say: "THIN-ko" },
            { type: "intro", emoji: "🔟", es: "diez", de: "zehn", say: "dieth" },
            { type: "match", pairs: [{ es: "uno", de: "1" }, { es: "tres", de: "3" }, { es: "cinco", de: "5" }, { es: "diez", de: "10" }] },
            { type: "listen", es: "cuatro", de: "vier", options: ["zwei", "vier", "fünf", "drei"], answer: 1 },
            { type: "choice", q: "Was ist „dos + tres“?", options: [{ t: "cuatro" }, { t: "cinco" }, { t: "diez" }, { t: "uno" }], answer: 1 },
            { type: "write", de: "fünf", es: "cinco", alt: ["cinco"] },
            { type: "speak", es: "tres", de: "drei" }
          ]
        },
        {
          id: "l2b", title: "La familia", icon: "👨‍👩‍👧", kind: "Familie",
          steps: [
            { type: "intro", emoji: "👨", es: "el padre", de: "der Vater", say: "el PA-dre" },
            { type: "intro", emoji: "👩", es: "la madre", de: "die Mutter", say: "la MA-dre" },
            { type: "intro", emoji: "👦", es: "el hijo", de: "der Sohn", say: "el I-cho" },
            { type: "intro", emoji: "👧", es: "la hija", de: "die Tochter", say: "la I-cha" },
            { type: "intro", emoji: "👴", es: "el abuelo", de: "der Großvater", say: "el a-BUE-lo" },
            { type: "intro", emoji: "👵", es: "la abuela", de: "die Großmutter", say: "la a-BUE-la" },
            { type: "intro", emoji: "🐶", es: "el perro", de: "der Hund", say: "el PE-rro" },
            { type: "match", pairs: [{ es: "el padre", de: "der Vater" }, { es: "la madre", de: "die Mutter" }, { es: "el hijo", de: "der Sohn" }, { es: "la hija", de: "die Tochter" }] },
            { type: "choice", q: "Welcher Artikel passt zu „madre“?", qSub: "Weibliche Wörter → meist „la“.", options: [{ t: "el" }, { t: "la" }, { t: "los" }, { t: "un" }], answer: 1 },
            { type: "build", es: "Esta es mi madre", de: "Das ist meine Mutter", extra: ["padre", "el"] },
            { type: "write", de: "der Hund", es: "el perro", alt: ["perro"] },
            { type: "speak", es: "la familia", de: "die Familie" }
          ]
        },
        {
          id: "l2c", title: "Ser & tener", icon: "✨", kind: "Grammatik",
          steps: [
            { type: "intro", emoji: "✨", es: "soy", de: "ich bin", say: "soy", ex: "Soy alemán.", exDe: "Ich bin Deutscher." },
            { type: "intro", emoji: "✨", es: "eres", de: "du bist", say: "E-res" },
            { type: "intro", emoji: "✨", es: "es", de: "er/sie ist", say: "es" },
            { type: "intro", emoji: "🎂", es: "tengo", de: "ich habe", say: "TEN-go", ex: "Tengo dos hijos.", exDe: "Ich habe zwei Kinder." },
            { type: "intro", emoji: "🎂", es: "tienes", de: "du hast", say: "TIE-nes" },
            { type: "reading", title: "Una familia", lines: [
              { es: "Hola, me llamo Pablo.", de: "Hallo, ich heiße Pablo." },
              { es: "Soy de Madrid y tengo una hermana.", de: "Ich bin aus Madrid und habe eine Schwester." },
              { es: "Mi madre es profesora.", de: "Meine Mutter ist Lehrerin." }
            ], q: { q: "Woher ist Pablo?", options: [{ t: "Barcelona" }, { t: "Madrid" }, { t: "Sevilla" }], answer: 1 } },
            { type: "choice", q: "„___ de Alemania.“ (Ich bin aus Deutschland)", options: [{ t: "Soy" }, { t: "Eres" }, { t: "Tengo" }, { t: "Es" }], answer: 0 },
            { type: "build", es: "Tengo dos hermanos", de: "Ich habe zwei Geschwister", extra: ["soy", "es"] },
            { type: "write", de: "Ich bin aus Madrid", es: "Soy de Madrid", alt: ["soy de madrid"] },
            { type: "speak", es: "Tengo una familia grande", de: "Ich habe eine große Familie" }
          ]
        }
      ]
    },

    /* ============================ LEVEL 3 ============================ */
    {
      id: "l3", title: "La vida diaria", subtitle: "Essen, Café & Alltag",
      icon: "🍽️", color: "linear-gradient(135deg,#34C759,#30D5C8)",
      lessons: [
        {
          id: "l3a", title: "En el café", icon: "☕", kind: "Bestellen",
          steps: [
            { type: "intro", emoji: "☕", es: "un café con leche", de: "ein Milchkaffee", say: "un ka-FE kon LE-tche" },
            { type: "intro", emoji: "🥐", es: "un cruasán", de: "ein Croissant", say: "un krua-SAN" },
            { type: "intro", emoji: "🥤", es: "una caña", de: "ein kleines Bier", say: "U-na KA-nya", ex: "Una caña, por favor.", exDe: "Ein kleines Bier, bitte." },
            { type: "intro", emoji: "💶", es: "La cuenta, por favor", de: "Die Rechnung, bitte", say: "la KUEN-ta por fa-VOR" },
            { type: "intro", emoji: "🙋", es: "Quería…", de: "Ich hätte gern…", say: "ke-RI-a", ex: "Quería un café.", exDe: "Ich hätte gern einen Kaffee." },
            { type: "dialogue", lines: [
              { who: "Camarero", es: "Hola, ¿qué quería?", de: "Hallo, was hätten Sie gern?" },
              { who: "Tú", es: "Un café con leche, por favor.", de: "Einen Milchkaffee, bitte." },
              { who: "Camarero", es: "¿Algo más?", de: "Sonst noch etwas?" },
              { who: "Tú", es: "No, gracias. La cuenta.", de: "Nein, danke. Die Rechnung." }
            ] },
            { type: "choice", q: "Du möchtest zahlen. Du sagst:", options: [{ t: "Quería un café" }, { t: "La cuenta, por favor", emoji: "💶" }, { t: "Buenos días" }, { t: "¿Algo más?" }], answer: 1 },
            { type: "build", es: "Quería un café con leche", de: "Ich hätte gern einen Milchkaffee", extra: ["caña"] },
            { type: "listen", es: "¿Algo más?", de: "Sonst noch etwas?", options: ["Die Rechnung", "Sonst noch etwas?", "Was kostet das?", "Guten Tag"], answer: 1 },
            { type: "write", de: "Die Rechnung, bitte", es: "La cuenta, por favor", alt: ["la cuenta por favor"] },
            { type: "speak", es: "Un café con leche, por favor", de: "Einen Milchkaffee, bitte" }
          ]
        },
        {
          id: "l3b", title: "La comida", icon: "🍽️", kind: "Essen",
          steps: [
            { type: "intro", emoji: "🍞", es: "el pan", de: "das Brot", say: "el pan" },
            { type: "intro", emoji: "🧀", es: "el queso", de: "der Käse", say: "el KE-so" },
            { type: "intro", emoji: "🍎", es: "la manzana", de: "der Apfel", say: "la man-THA-na" },
            { type: "intro", emoji: "🥘", es: "la paella", de: "die Paella", say: "la pa-E-ya" },
            { type: "intro", emoji: "💧", es: "el agua", de: "das Wasser", say: "el A-gua" },
            { type: "intro", emoji: "🍷", es: "el vino", de: "der Wein", say: "el VI-no" },
            { type: "match", pairs: [{ es: "el pan", de: "das Brot" }, { es: "el queso", de: "der Käse" }, { es: "el agua", de: "das Wasser" }, { es: "el vino", de: "der Wein" }] },
            { type: "choice", q: "Was ist „la manzana“?", options: [{ t: "Brot", emoji: "🍞" }, { t: "Apfel", emoji: "🍎" }, { t: "Käse", emoji: "🧀" }, { t: "Wasser", emoji: "💧" }], answer: 1 },
            { type: "build", es: "Quería pan y queso", de: "Ich hätte gern Brot und Käse", extra: ["vino"] },
            { type: "write", de: "das Wasser", es: "el agua", alt: ["agua"] },
            { type: "speak", es: "Me gusta la paella", de: "Ich mag Paella" }
          ]
        },
        {
          id: "l3c", title: "Me gusta", icon: "❤️", kind: "Vorlieben",
          steps: [
            { type: "intro", emoji: "❤️", es: "me gusta", de: "ich mag / mir gefällt", say: "me GUS-ta", ex: "Me gusta el café.", exDe: "Ich mag Kaffee." },
            { type: "intro", emoji: "💕", es: "me encanta", de: "ich liebe (es)", say: "me en-KAN-ta" },
            { type: "intro", emoji: "👎", es: "no me gusta", de: "ich mag nicht", say: "no me GUS-ta" },
            { type: "intro", emoji: "🤔", es: "¿Te gusta?", de: "Magst du?", say: "te GUS-ta" },
            { type: "reading", title: "Mis gustos", lines: [
              { es: "Me encanta la comida española.", de: "Ich liebe spanisches Essen." },
              { es: "Me gusta mucho la paella.", de: "Ich mag Paella sehr." },
              { es: "Pero no me gusta el café solo.", de: "Aber ich mag keinen schwarzen Kaffee." }
            ], q: { q: "Was mag die Person NICHT?", options: [{ t: "Paella" }, { t: "schwarzen Kaffee" }, { t: "spanisches Essen" }], answer: 1 } },
            { type: "choice", q: "„___ la paella.“ (Ich liebe Paella)", options: [{ t: "Me encanta" }, { t: "No me gusta" }, { t: "Tengo" }, { t: "Soy" }], answer: 0 },
            { type: "build", es: "No me gusta el vino", de: "Ich mag keinen Wein", extra: ["encanta"] },
            { type: "write", de: "Ich mag Kaffee", es: "Me gusta el café", alt: ["me gusta el cafe"] },
            { type: "speak", es: "Me encanta la comida española", de: "Ich liebe spanisches Essen" }
          ]
        }
      ]
    },

    /* ============================ LEVEL 4 ============================ */
    {
      id: "l4", title: "En la ciudad", subtitle: "Orientierung & Einkaufen",
      icon: "🏙️", color: "linear-gradient(135deg,#0A84FF,#30D5C8)",
      lessons: [
        {
          id: "l4a", title: "¿Dónde está…?", icon: "🧭", kind: "Wegbeschreibung",
          steps: [
            { type: "intro", emoji: "🧭", es: "¿Dónde está…?", de: "Wo ist…?", say: "DON-de es-TA" },
            { type: "intro", emoji: "➡️", es: "a la derecha", de: "rechts", say: "a la de-RE-tcha" },
            { type: "intro", emoji: "⬅️", es: "a la izquierda", de: "links", say: "a la ith-KIER-da" },
            { type: "intro", emoji: "⬆️", es: "todo recto", de: "geradeaus", say: "TO-do REK-to" },
            { type: "intro", emoji: "🚉", es: "la estación", de: "der Bahnhof", say: "la es-ta-THION" },
            { type: "intro", emoji: "🏧", es: "el banco", de: "die Bank", say: "el BAN-ko" },
            { type: "dialogue", lines: [
              { who: "Tú", es: "Perdón, ¿dónde está la estación?", de: "Entschuldigung, wo ist der Bahnhof?" },
              { who: "Local", es: "Todo recto y a la derecha.", de: "Geradeaus und dann rechts." },
              { who: "Tú", es: "Muchas gracias.", de: "Vielen Dank." }
            ] },
            { type: "choice", q: "„a la izquierda“ bedeutet:", options: [{ t: "rechts", emoji: "➡️" }, { t: "links", emoji: "⬅️" }, { t: "geradeaus", emoji: "⬆️" }, { t: "Bahnhof" }], answer: 1 },
            { type: "build", es: "¿Dónde está el banco?", de: "Wo ist die Bank?", extra: ["estación"] },
            { type: "listen", es: "Todo recto y a la derecha", de: "Geradeaus und rechts", options: ["Links und geradeaus", "Geradeaus und rechts", "Rechts und links", "Beim Bahnhof"], answer: 1 },
            { type: "write", de: "Wo ist der Bahnhof?", es: "¿Dónde está la estación?", alt: ["donde esta la estacion"] },
            { type: "speak", es: "¿Dónde está la estación?", de: "Wo ist der Bahnhof?" }
          ]
        },
        {
          id: "l4b", title: "De compras", icon: "🛍️", kind: "Einkaufen",
          steps: [
            { type: "intro", emoji: "💰", es: "¿Cuánto cuesta?", de: "Was kostet das?", say: "KUAN-to KUES-ta" },
            { type: "intro", emoji: "💶", es: "el euro", de: "der Euro", say: "el E-u-ro" },
            { type: "intro", emoji: "👕", es: "la camiseta", de: "das T-Shirt", say: "la ka-mi-SE-ta" },
            { type: "intro", emoji: "👟", es: "los zapatos", de: "die Schuhe", say: "los tha-PA-tos" },
            { type: "intro", emoji: "🛒", es: "el supermercado", de: "der Supermarkt", say: "el su-per-mer-KA-do" },
            { type: "intro", emoji: "🤏", es: "barato", de: "billig", say: "ba-RA-to" },
            { type: "intro", emoji: "💸", es: "caro", de: "teuer", say: "KA-ro" },
            { type: "match", pairs: [{ es: "barato", de: "billig" }, { es: "caro", de: "teuer" }, { es: "el euro", de: "der Euro" }, { es: "los zapatos", de: "die Schuhe" }] },
            { type: "choice", q: "Du willst den Preis wissen:", options: [{ t: "¿Dónde está?" }, { t: "¿Cuánto cuesta?", emoji: "💰" }, { t: "¿Qué tal?" }, { t: "¿Cómo te llamas?" }], answer: 1 },
            { type: "build", es: "¿Cuánto cuesta la camiseta?", de: "Was kostet das T-Shirt?", extra: ["caro"] },
            { type: "write", de: "Was kostet das?", es: "¿Cuánto cuesta?", alt: ["cuanto cuesta"] },
            { type: "speak", es: "¿Cuánto cuesta esto?", de: "Was kostet das hier?" }
          ]
        }
      ]
    },

    /* ============================ LEVEL 5 ============================ */
    {
      id: "l5", title: "Conversación", subtitle: "Verben, Zeit & freies Sprechen",
      icon: "💬", color: "linear-gradient(135deg,#FF9F0A,#FF375F)",
      lessons: [
        {
          id: "l5a", title: "Verbos del día", icon: "🏃", kind: "Verben",
          steps: [
            { type: "intro", emoji: "🍴", es: "comer", de: "essen", say: "ko-MER" },
            { type: "intro", emoji: "🥤", es: "beber", de: "trinken", say: "be-BER" },
            { type: "intro", emoji: "🏠", es: "vivir", de: "wohnen / leben", say: "vi-VIR", ex: "Vivo en Berlín.", exDe: "Ich wohne in Berlin." },
            { type: "intro", emoji: "💼", es: "trabajar", de: "arbeiten", say: "tra-ba-CHAR" },
            { type: "intro", emoji: "🗣️", es: "hablar", de: "sprechen", say: "a-BLAR", ex: "Hablo un poco de español.", exDe: "Ich spreche ein wenig Spanisch." },
            { type: "reading", title: "Mi día", lines: [
              { es: "Vivo en Valencia y trabajo en una oficina.", de: "Ich wohne in Valencia und arbeite in einem Büro." },
              { es: "Por la mañana como tostadas y bebo café.", de: "Morgens esse ich Toast und trinke Kaffee." },
              { es: "Hablo español e inglés.", de: "Ich spreche Spanisch und Englisch." }
            ], q: { q: "Was trinkt die Person morgens?", options: [{ t: "Wein" }, { t: "Wasser" }, { t: "Kaffee" }], answer: 2 } },
            { type: "choice", q: "„Yo ___ en Madrid.“ (Ich wohne in Madrid)", options: [{ t: "vivo" }, { t: "vives" }, { t: "comer" }, { t: "trabajas" }], answer: 0 },
            { type: "build", es: "Hablo un poco de español", de: "Ich spreche ein wenig Spanisch", extra: ["comer"] },
            { type: "write", de: "Ich arbeite in Valencia", es: "Trabajo en Valencia", alt: ["trabajo en valencia"] },
            { type: "speak", es: "Hablo un poco de español", de: "Ich spreche ein wenig Spanisch" }
          ]
        },
        {
          id: "l5b", title: "La hora", icon: "🕐", kind: "Uhrzeit & Tage",
          steps: [
            { type: "intro", emoji: "🕐", es: "¿Qué hora es?", de: "Wie spät ist es?", say: "ke O-ra es" },
            { type: "intro", emoji: "🕐", es: "Es la una", de: "Es ist ein Uhr", say: "es la U-na" },
            { type: "intro", emoji: "🕑", es: "Son las dos", de: "Es ist zwei Uhr", say: "son las dos" },
            { type: "intro", emoji: "📅", es: "hoy", de: "heute", say: "oy" },
            { type: "intro", emoji: "🌅", es: "mañana", de: "morgen", say: "ma-NYA-na" },
            { type: "intro", emoji: "🗓️", es: "el lunes", de: "der Montag", say: "el LU-nes" },
            { type: "choice", q: "„Wie spät ist es?“ heißt:", options: [{ t: "¿Qué tal?" }, { t: "¿Qué hora es?", emoji: "🕐" }, { t: "¿Dónde está?" }, { t: "¿Cuánto cuesta?" }], answer: 1 },
            { type: "listen", es: "Son las dos", de: "Es ist zwei Uhr", options: ["Es ist ein Uhr", "Es ist zwei Uhr", "Heute", "Morgen"], answer: 1 },
            { type: "build", es: "¿Qué hora es?", de: "Wie spät ist es?", extra: ["hoy"] },
            { type: "write", de: "heute", es: "hoy", alt: ["hoy"] },
            { type: "speak", es: "¿Qué hora es?", de: "Wie spät ist es?" }
          ]
        },
        {
          id: "l5c", title: "Charla libre", icon: "💬", kind: "Freies Gespräch",
          steps: [
            { type: "intro", emoji: "💬", es: "No entiendo", de: "Ich verstehe nicht", say: "no en-TIEN-do" },
            { type: "intro", emoji: "🐢", es: "Más despacio, por favor", de: "Langsamer, bitte", say: "mas des-PA-thio" },
            { type: "intro", emoji: "❓", es: "¿Cómo se dice…?", de: "Wie sagt man…?", say: "KO-mo se DI-the" },
            { type: "intro", emoji: "👍", es: "Vale", de: "Okay / In Ordnung", say: "BA-le", ex: "Vale, perfecto.", exDe: "Okay, perfekt." },
            { type: "dialogue", lines: [
              { who: "A", es: "¿Hablas español?", de: "Sprichst du Spanisch?" },
              { who: "B", es: "Un poco. Más despacio, por favor.", de: "Ein bisschen. Langsamer, bitte." },
              { who: "A", es: "Vale. ¿De dónde eres?", de: "Okay. Woher kommst du?" },
              { who: "B", es: "Soy de Alemania.", de: "Ich komme aus Deutschland." }
            ] },
            { type: "choice", q: "Du verstehst etwas nicht. Du sagst:", options: [{ t: "Vale" }, { t: "No entiendo", emoji: "💬" }, { t: "Gracias" }, { t: "Hoy" }], answer: 1 },
            { type: "build", es: "Más despacio, por favor", de: "Langsamer, bitte", extra: ["vale"] },
            { type: "write", de: "Wie sagt man…?", es: "¿Cómo se dice?", alt: ["como se dice"] },
            { type: "speak", es: "No entiendo, más despacio por favor", de: "Ich verstehe nicht, langsamer bitte" }
          ]
        }
      ]
    }
  ];

  // Flat vocabulary bank (built from all intro cards) — used by Practice/Review
  const vocab = [];
  levels.forEach(lv => lv.lessons.forEach(ls => ls.steps.forEach(st => {
    if (st.type === "intro" && st.es && st.de) {
      vocab.push({ es: st.es, de: st.de, emoji: st.emoji || "📘", say: st.say || "", level: lv.id });
    }
  })));

  // Conversation suggestion starters per progress (used by the Tutor tab)
  const chatStarters = [
    "Hola", "¿Qué tal?", "Me llamo …", "Soy de Alemania",
    "¿Cómo se dice 'house'?", "Quería un café", "¿Dónde está la estación?", "No entiendo"
  ];

  LS.data = { levels, vocab, chatStarters };
})();
