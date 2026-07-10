---
name: powerpoint-praesentation
description: >
  Erstellt hochwertige, professionell designte PowerPoint-Präsentationen (.pptx),
  indem jede Folie zuerst als präzises HTML/CSS-Layout gebaut und dann in eine
  echte, editierbare .pptx-Datei konvertiert wird (Text bleibt in PowerPoint
  anklickbar und bearbeitbar, Design bleibt pixelgenau wie im HTML). Nutze diesen
  Skill IMMER, wenn eine gute/schöne/professionelle Präsentation, ein Pitch Deck,
  eine Business-Präsentation oder ein Vortrag als PowerPoint gewünscht ist —
  besonders wenn Design-Qualität wichtig ist und nicht nur schnelle Standard-Folien.
  Ergänzt den generischen pptx-Skill (der auf pptxgenjs/direkte XML-Bearbeitung
  setzt) um einen spezialisierten Web-Design-Workflow für visuell hochwertigere
  Ergebnisse. Trigger-Beispiele: "erstelle mir eine PowerPoint-Präsentation über X",
  "mach mir ein Pitch Deck", "ich brauche Folien für einen Vortrag", "kannst du
  eine professionelle Präsentation zu Y bauen".
license: Proprietary. LICENSE.txt has complete terms
---

# PowerPoint-Präsentation (HTML/CSS → editierbare .pptx)

## Warum dieser Umweg über HTML/CSS?

Programmatisch gebaute PowerPoint-Folien (Shapes einzeln per Koordinaten platziert)
sehen fast immer generisch aus, weil präzises Grid-Layout, Typografie-Kontrolle und
Weißraum-Gefühl in der PowerPoint-Shape-API mühsam sind. HTML/CSS ist dagegen ein
Werkzeug, mit dem hochwertiges visuelles Design tatsächlich gut geht — Flexbox/Grid,
echte Typografie-Skalen, sauberes Spacing. Dieser Skill nutzt das aus, indem er jede
Folie als HTML-Datei designt, sie mit einem echten Browser rendert und daraus eine
.pptx baut, in der der Text weiterhin normale, editierbare PowerPoint-Textboxen sind.

**Der Kompromiss:** Alles, was als Text markiert wird (`data-pptx`), wird zu einer
echten, bearbeitbaren Textbox. Alles andere (Hintergründe, Karten, Icons, Bilder,
Formen, Farbverläufe) wird als Bild in den Folienhintergrund gebacken — pixelgenau,
aber in PowerPoint nicht mehr einzeln verschiebbar. Für die meisten Business-/Pitch-
Präsentationen ist das der richtige Kompromiss: Der Text (das, was Nutzer typischerweise
noch anpassen wollen) bleibt editierbar, das Design bleibt exakt wie designt.

## Workflow

### 1. Inhalt & Design planen

Bevor du HTML schreibst:
- Kläre (falls nicht klar aus dem Auftrag): Thema, Zielgruppe, ungefähre Foliezahl,
  Sprache (Standard: Deutsch, falls User auf Deutsch schreibt), ob es ein bestehendes
  Corporate-Farbschema/Logo gibt.
- Lies **[references/design-prinzipien.md](references/design-prinzipien.md)** und
  triff die Design-Entscheidungen (Farbpalette, Motiv, Hell/Dunkel-Struktur) EINMAL
  vorab — nicht folienweise improvisieren, sonst wirkt das Deck inkonsistent.
- Skizziere kurz eine Gliederung (eine Zeile pro Folie reicht) und was die eine
  Kernaussage jeder Folie ist. Jede Folie sollte in einem Satz zusammenfassbar sein.

### 2. Folien als HTML bauen

- Arbeitsordner anlegen, z. B. `slides/`, darin `slide-1.html`, `slide-2.html`, ...
  (Dateiname exakt `slide-N.html`, N fortlaufend ab 1 — das Render-Skript sortiert danach).
- **[assets/slide-template.html](assets/slide-template.html) als Startpunkt kopieren** —
  enthält bereits das nötige Setup: 1920×1080px-Canvas (= 13.333in × 7.5in Folienformat),
  CSS-Reset, sichere Schriftart, Beispiel für `data-pptx`-Markierung inkl. Bulletliste
  und Inline-Hervorhebung.
- Jede Folie ist eine eigenständige HTML-Datei (kein gemeinsames externes CSS/JS nötig,
  Inline-`<style>` pro Datei ist am robustesten fürs Rendering).
- **Nur Text mit `data-pptx` markieren**, alles Dekorative bleibt unmarkiert. Details
  und Regeln dazu (Listen, verschachtelte Hervorhebungen, was zu vermeiden ist) stehen
  in Abschnitt 5 von `references/design-prinzipien.md` — das ist der Teil, der über
  Erfolg oder Frust bei der Konvertierung entscheidet, unbedingt vorher lesen.
- Folge den Design-Prinzipien aus Schritt 1: pro Folie ein visuelles Element, Layouts
  abwechseln, sichere Schriften für `data-pptx`-Text, keine Akzentstreifen.

### 3. Rendern: HTML → Hintergrundbild + Text-Layout

```bash
node scripts/render_slides.js <slides-dir> <output-dir>
```

Voraussetzung einmalig: `cd scripts && npm install` (installiert Playwright; Chromium-
Binary ggf. zusätzlich mit `npx playwright install chromium`, falls dieser Schritt
mit einem Hinweis auf fehlenden Browser fehlschlägt).

Das Skript öffnet jede `slide-N.html` headless, misst Position/Schriftgröße/Farbe/
Ausrichtung jedes `data-pptx`-Elements, macht diese Elemente unsichtbar (Layout bleibt
erhalten) und rendert den Rest als `bg-N.png`. Zusätzlich wird `ref-N.png` (mit
sichtbarem Text) für die spätere QA gespeichert. Alles zusammen landet in
`<output-dir>/manifest.json`.

### 4. Bauen: Manifest → .pptx

```bash
python scripts/build_pptx.py <output-dir>/manifest.json <output.pptx>
```

Benötigt `python-pptx` (`pip install python-pptx`, falls nicht vorhanden). Baut eine
Präsentation im 16:9-Format, legt pro Folie das Hintergrundbild randlos darunter und
setzt für jedes `data-pptx`-Element eine echte Textbox mit passender Position, Größe,
Absatzstruktur (inkl. Bullet-Listen), Zeilen-/Absatzabstand und Formatierung pro Run
(fett/kursiv/Farbe/Schriftart aus dem CSS übernommen).

### 5. Visuelle QA (nicht überspringen)

Chromium und PowerPoint rendern Schrift nicht immer exakt gleich (Font-Fallbacks,
Sub-Pixel-Unterschiede) — deshalb kurz gegenprüfen, bevor die Datei als fertig gilt:

- **Unter Windows mit installiertem PowerPoint:**
  ```powershell
  powershell -File scripts/export_slides.ps1 -PptxPath <output.pptx> -OutDir <qa-dir>
  ```
  Das exportiert jede Folie als PNG über PowerPoint-COM-Automatisierung — das ist die
  *tatsächliche* Wiedergabe, die der Nutzer später sieht.
- Diese Bilder gegen die `ref-N.png` aus Schritt 3 vergleichen (beide anschauen, am
  besten mit dem Bild-Lesewerkzeug). Wonach suchen:
  - Text, der über seine Box hinausläuft oder abgeschnitten wirkt (häufigstes Problem,
    meist durch eine Schrift außerhalb der sicheren Liste verursacht — siehe
    `references/design-prinzipien.md` Abschnitt 2)
  - Verschobene oder überlappende Elemente
  - Falsche Zeilenumbrüche in Titeln/Bullet-Punkten
- Gefundene Probleme beheben (meist: Schriftgröße/Boxgröße im HTML anpassen, dann
  Schritt 3+4 für die betroffene Folie wiederholen) und **einmal** nachprüfen — nicht
  endlos an Sub-Pixel-Details weiterfeilen.
- Kein PowerPoint verfügbar: ersatzweise `ref-N.png` als Stand-in für die Layout-Prüfung
  nutzen und dem Nutzer transparent sagen, dass die PowerPoint-eigene Schrift-Wiedergabe
  ungeprüft ist.

## Dateien in diesem Skill

| Datei | Zweck |
|---|---|
| `scripts/render_slides.js` | HTML → Hintergrundbild(er) + Text-Manifest (Playwright) |
| `scripts/build_pptx.py` | Manifest → editierbare .pptx (python-pptx) |
| `scripts/export_slides.ps1` | .pptx → PNG je Folie via PowerPoint-COM, für QA |
| `assets/slide-template.html` | Startpunkt für neue Folien mit korrektem Setup |
| `references/design-prinzipien.md` | Farbpalette, Typografie, Layout-Regeln, `data-pptx`-Regeln |

## Grenzen (bewusst so gelöst, nicht vergessen zu erwähnen)

- Nicht-Text-Elemente sind nach der Konvertierung nicht mehr einzeln editierbar
  (sie sind Teil des Hintergrundbilds). Wenn der Nutzer ausdrücklich frei verschiebbare
  Formen/Bilder braucht, das vorab klären — dann ist ggf. der generische `pptx`-Skill
  (pptxgenjs-basiert) die bessere Wahl.
- Ein `<br>` innerhalb eines `data-pptx`-Elements wird ignoriert (siehe Design-Regeln) —
  für Zeilenumbrüche echte Absatz-/Listenelemente verwenden.
- Sehr komplexe verschachtelte Formatierung (z. B. Text mit wechselnder Hintergrundfarbe
  innerhalb eines Wortes) wird nicht 1:1 abgebildet — für Business-/Pitch-Decks i. d. R.
  irrelevant.
