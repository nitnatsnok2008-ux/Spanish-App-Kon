# Learn Spanish 🇪🇸

Eine browserbasierte App, die dir **Spanisch aus Spanien** (Español de España)
Schritt für Schritt und Level für Level beibringt – mit visuellem Lernen,
Vokabeltraining, Hören, Lesen, Schreibaufgaben, interaktiven Spielen und
einem sprechenden **KI-Tutor**.

Im sauberen, aber farbenfrohen Apple-Stil. Läuft direkt im **Brave**-Browser
(oder jedem Chromium-Browser) – ohne Installation, ohne Build-Schritt.

## Starten

**Variante A – einfach öffnen**
Doppelklick auf `index.html` (öffnet im Standardbrowser). Tipp: In Brave
die Datei einfach in ein Brave-Fenster ziehen.

**Variante B – lokaler Server (empfohlen, für Mikrofon nötig)**
```bash
python3 -m http.server 8123
# oder:  npm start
```
Dann im Browser öffnen: <http://localhost:8123>

> Sprachausgabe (Text-to-Speech) und Spracherkennung (Mikrofon) funktionieren
> am zuverlässigsten in **Brave/Chrome** und über `http(s)://` bzw. `localhost`.

## Funktionen

- **Lernpfad mit 5 Leveln** (A1): Begrüßen, Familie & Zahlen, Café & Essen,
  Stadt & Einkaufen, Verben & freies Sprechen. Lektionen schalten sich
  nacheinander frei.
- **8 Übungstypen**: visuelle Vokabelkarten, Multiple-Choice, Hörverstehen,
  Schreiben, Memory/Paare, Satzbau, Aussprache (Mikrofon) und Lese-/Dialogtexte.
- **KI-Tutor „Profe“** mit angenehmer, tiefer männlicher Stimme: Schreib oder
  **sprich** auf Spanisch, er antwortet auf Spanisch mit deutscher Übersetzung,
  korrigiert sanft und stellt Rückfragen.
- **Sprache**: tiefe männliche es-ES-Stimme (Stimmlage/Tempo einstellbar),
  Spracherkennung zum Mitsprechen.
- **Üben-Bereich**: Vokabeltrainer (Karteikarten), Zufalls-Quiz, Hör-Training,
  Ausspracheübungen – dynamisch aus dem gelernten Wortschatz.
- **Fortschritt**: XP, Tages-Streak, gelernte Vokabeln, Level-Fortschritt
  (lokal im Browser gespeichert).
- **Design & Feedback**: Apple-inspiriert, dezente Animationen, sanfte
  generierte Soundeffekte (keine Hintergrundmusik), Konfetti bei Erfolg.
  Hell-/Dunkelmodus automatisch.

## Optional: echtes KI-Sprachmodell

Der Tutor funktioniert vollständig **offline**. Wer möchte, kann unter
**Profil → KI-Tutor** einen eigenen API-Schlüssel hinterlegen
(Anthropic Claude oder OpenAI). Der Schlüssel wird **nur lokal** im Browser
gespeichert und direkt vom Browser an den Anbieter gesendet.

## Projektstruktur

```
index.html        App-Shell (lädt klassische Scripts → funktioniert via file://)
css/styles.css    Designsystem (Apple-Stil, farbig, Hell/Dunkel)
js/audio.js       generierte Soundeffekte (Web Audio API)
js/speech.js      Text-to-Speech (tiefe es-ES-Stimme) + Spracherkennung
js/data.js        Curriculum (Level, Lektionen, Übungen, Vokabular)
js/store.js       Fortschritt & Einstellungen (localStorage)
js/exercises.js   Lektions-Player + alle Übungstypen
js/chat.js        KI-Tutor (Offline-Engine + optionales LLM)
js/app.js         Navigation, Tabs, Profil, UI-Effekte
test/smoke.js     Lade-/Durchlauftest (jsdom) – optional
```

## Entwicklung / Test

```bash
npm install        # nur für den optionalen jsdom-Test nötig
npm test           # lädt die App headless und spielt jede Übung durch
```

Die App selbst benötigt **keine** Abhängigkeiten – einfach im Browser öffnen.
