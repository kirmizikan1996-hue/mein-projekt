# Design-Prinzipien für hochwertige Folien

Diese Datei bündelt Design-Entscheidungen, bevor die erste Zeile HTML geschrieben wird.
Lies sie vor Slide 1, nicht während der Umsetzung — Design-Entscheidungen, die mitten
in der Arbeit fallen, führen zu inkonsistenten Decks.

## 0. Corporate Branding (Pflicht)

**Das Raiffeisen-Logo gehört auf jede einzelne Folie** — Titelfolie, Inhaltsfolien,
Schlussfolie, hell wie dunkel. Datei: `bilder/Raiffeisen_Österreich_logo.svg.webp`
(relativ zu diesem Skill-Ordner; 120×120px, transparenter Hintergrund, schwarzes
Giebelkreuz auf gelbem Grund).

- Position: oben rechts, konsistent auf jeder Folie an derselben Stelle
  (siehe `.brand-logo` in `assets/slide-template.html`: `top:56px; right:64px;`,
  Höhe ca. 72px). Nicht pro Folie neu positionieren — Konsistenz ist hier wichtiger
  als individuelle Anpassung.
- Vor dem Rendern in den Arbeitsordner mit den `slide-N.html`-Dateien kopieren, damit
  ein einfacher relativer Pfad (`logo-raiffeisen.webp`) funktioniert, unabhängig davon,
  wo der Skill-Ordner selbst liegt.
- **Kein `data-pptx`** auf dem `<img>`-Tag — das Logo ist Bildmaterial und soll im
  gerenderten Hintergrundbild landen, nicht als eigene PowerPoint-Textbox.
- Der gelbe Logo-Hintergrund braucht auf dunklen Folien (Titel, Fazit) keinen
  zusätzlichen Rahmen — er hat genug Eigenkontrast. Auf sehr hellen Folienbereichen
  trotzdem kurz prüfen, ob das Logo sich klar vom Hintergrund abhebt.

## 1. Vor dem Start festlegen

- **Farbpalette, die zum Thema passt.** Nicht Standard-Blau. Die Palette soll sich
  anfühlen, als sei sie für GENAU dieses Thema gewählt worden — wenn sie 1:1 in eine
  völlig andere Präsentation passen würde, ist sie nicht spezifisch genug.
- **Eine Farbe dominiert** (60–70% der Fläche), 1–2 Nebentöne, ein scharfer Akzent.
  Nie alle Farben gleich gewichten.
- **Hell/Dunkel-Kontrast bewusst einsetzen:** Dunkler Hintergrund für Titel- und
  Schlussfolie, hell für Inhaltsfolien ("Sandwich"-Struktur) — oder konsequent durchgehend
  dunkel für einen Premium-Look.
- **Ein visuelles Motiv durchziehen:** z. B. abgerundete Bildrahmen oder Icons in
  farbigen Kreisen, auf jeder Folie wiederholt. Kein Farbbalken/Akzentstreifen als Motiv
  (siehe Vermeiden-Liste unten — das ist der klassische "KI-generiert"-Look).

### Beispiel-Paletten (als Ausgangspunkt, nicht als Pflicht)

| Thema | Primär | Sekundär | Akzent |
|---|---|---|---|
| Midnight Executive | `#1E2761` | `#CADCFC` | `#FFFFFF` |
| Forest & Moss | `#2C5F2D` | `#97BC62` | `#F5F5F5` |
| Coral Energy | `#F96167` | `#F9E795` | `#2F3C7E` |
| Ocean Gradient | `#065A82` | `#1C7293` | `#21295C` |
| Charcoal Minimal | `#36454F` | `#F2F2F2` | `#212121` |
| Teal Trust | `#028090` | `#00A896` | `#02C39A` |

## 2. Typografie: sichere Schriften verwenden

Der `render_slides.js`-Schritt rendert mit Chromium, das fertige `.pptx` wird aber später
in echtem PowerPoint geöffnet, das andere Schriften installiert hat. Wenn die Chromium-Vorschau
eine Schrift zeigt, die PowerPoint nicht hat, ersetzt PowerPoint sie lautlos — und die
Zeilenumbrüche, auf die die Positionierung kalibriert wurde, verschieben sich.

**Deshalb: für `data-pptx`-Elemente nur Schriften aus dieser Liste verwenden** (sie sind
sowohl in Chromium als auch in Office metrisch identisch, damit die Vorschau stimmt):

Calibri, Arial, Cambria, Times New Roman, Courier New, Bookman Old Style, Century Schoolbook

Für dekorative Überschriften mit mehr Charakter: Serife (Cambria, Bookman Old Style) mit
serifenloser Fließtext-Schrift (Calibri, Arial) kombinieren. Schriften außerhalb der Liste
sind nur für rein dekorative Elemente ohne `data-pptx` (also im Hintergrundbild) unbedenklich.

**Nie `Aptos` verwenden** — kein zuverlässiges Font-Fallback in älteren PowerPoint-Versionen.

| Element | Größe |
|---|---|
| Folientitel | 40–56px (≈ 30–42pt nach Skalierung) |
| Abschnittsüberschrift | 26–32px |
| Fließtext | 22–26px |
| Bildunterschriften | 16–18px, gedämpfte Farbe |

(Die px-Werte gelten für das 1920×1080-Viewport der Slide-Vorlage; die Skalierung zu pt
übernimmt `render_slides.js` automatisch.)

## 3. Layout

- **Jede Folie braucht ein visuelles Element** — Bild, Diagramm, Icon oder Form.
  Reine Text-Folien wirken vergessen.
- Layouts abwechseln: Zweispaltig, Icon+Text-Zeilen, 2×2-Raster, halbflächiges Bild
  mit Text-Overlay, große Zahlen-Callouts. Nicht jede Folie gleich aufbauen.
- Mindestabstand zum Folienrand: 0.5in (≈ 48px bei 96px/in). Abstand zwischen
  Inhaltsblöcken: 0.3–0.5in, konsistent gewählt.
- Linksbündiger Fließtext, nur Titel zentrieren.
- Titel deutlich größer als Fließtext (mind. 1.5× Größenunterschied), damit die
  Hierarchie sofort sichtbar ist.

## 4. Vermeiden

- Farbbalken/Akzentstreifen (Header-Leiste, Seitenstreifen, einseitige Rahmen) —
  klassisches Erkennungsmerkmal von KI-generierten Folien.
- Unterstreichungen unter Titeln als Deko-Element — stattdessen Weißraum oder
  Hintergrundfarbe zur Abgrenzung nutzen.
- Creme-/Beige-Hintergründe ohne Grund — Weiß oder die gewählte Markenfarbe.
- Text, der über seine Box hinausläuft. Lieber Schriftgröße reduzieren, Inhalt kürzen
  oder die Box vergrößern, als Overflow zu riskieren.
- Niedriger Kontrast (helle Schrift auf hellem Grund, Icons ohne Kontrastkreis).
- Dasselbe Layout auf jeder Folie wiederholen.

## 5. Technische Regeln für `data-pptx`-Elemente

Diese Regeln bestimmen, wie sauber die HTML→PPTX-Konvertierung wird:

- **`data-pptx` nur auf das äußerste Element eines Textblocks setzen**, nicht auf
  jedes Kind einzeln. Bei einer Liste: `data-pptx` auf das `<ul>`/`<ol>`, nicht auf
  jedes `<li>` — sonst entstehen viele einzelne Textboxen statt einer zusammenhängenden.
- **Für Checklisten/wiederholte Kurzpunkte (z. B. Vorteile/Nachteile mit einem Icon
  pro Zeile) NICHT jede Zeile als eigene unabhängige `data-pptx`-Textbox anlegen.**
  Mehrere einzeilige, unabhängig positionierte Textboxen können in echtem PowerPoint
  durch Zeilenabstand-Eigenheiten optisch zusammenrutschen, obwohl ihre in Chromium
  gemessenen Positionen korrekt mit Abstand zueinander waren (die Boxen selbst sitzen
  richtig, aber der Text läuft über den unteren Rand der kurzen Box hinaus und wirkt
  dadurch enger an der nächsten Box als beabsichtigt). Zuverlässig ist stattdessen
  **eine gemeinsame Liste** (`<ul data-pptx>` mit mehreren `<li>`) — dort wird der
  tatsächlich gemessene Abstand zwischen den Zeilen als `space_after` je Absatz in
  einer einzigen Textbox übernommen, was in jedem bisher getesteten Fall zuverlässig
  aussah. Ein farbiges Icon direkt neben jeder Zeile lässt sich damit nicht mehr
  umsetzen (das Icon würde wie oben beschrieben beim Hintergrund-Rendering mit
  verschwinden) — Vor-/Nachteile stattdessen über die Kartenhintergrundfarbe
  (z. B. helles Grün/Rot) unterscheiden, nicht über einzelne Icon-Marker.
- Innerhalb eines `data-pptx`-Blocks sind `<strong>`, `<em>`, `<span style="color:...">`
  erlaubt und werden als einzelne formatierte Runs übernommen (z. B. eine fett hervorgehobene
  Zahl mitten im Satz).
- Kein `<br>` innerhalb eines `data-pptx`-Elements verwenden, wenn ein echter Zeilenumbruch
  gebraucht wird — stattdessen mehrere `<p>`- oder `<li>`-Elemente nutzen, die werden als
  eigene Absätze übernommen. `<br>` selbst wird von der Konvertierung ignoriert.
- Icons, Formen, Bilder, Farbverläufe, Karten-Hintergründe: **kein** `data-pptx` — die
  landen im Hintergrundbild und werden dadurch pixelgenau übernommen, sind aber danach
  nicht mehr einzeln in PowerPoint bearbeitbar. Das ist der bewusste Kompromiss dieses
  Skills: Text bleibt editierbar, Gestaltung bleibt exakt.
- `box-sizing: border-box` und `margin: 0` global setzen (siehe `assets/slide-template.html`)
  — Standard-Browserabstände auf `h1`/`p`/`ul` würden sonst die Position leicht verschieben.
- **`data-pptx` nie auf ein `inline`-Element ohne eigene Breite setzen** (z. B. ein `<span>`
  in einer zentrierten Flexbox). `getBoundingClientRect()` misst bei `inline`-Elementen nur
  die exakte Textbreite — ohne jede Toleranz. Da PowerPoint dieselbe Schrift minimal anders
  misst als Chromium, bricht der Text dann in der echten .pptx um, obwohl die Chromium-Vorschau
  perfekt aussah. Lösung: das `data-pptx`-Element `display:block; width:100%` innerhalb seines
  Containers geben (siehe `assets/slide-template.html`, `.stat-number`/`.stat-label`), damit
  die gemessene Box die volle Containerbreite hat und Luft für Font-Abweichungen bleibt. Bei
  kurzen Diagramm-Labels in festen Boxen (Icon-Kreise, Knoten, Karten) gilt dieselbe Regel.
- **`data-pptx` nie auf ein Element setzen, das selbst eine Hintergrundfarbe, einen
  Rahmen oder dekorative Kind-Elemente (z. B. `::before`-Bullets, Icons) trägt, die im
  Bild erhalten bleiben sollen.** Der Render-Schritt blendet `data-pptx`-Elemente vor dem
  Hintergrund-Screenshot per `visibility:hidden` aus — und `visibility` vererbt sich auf
  ALLE Nachfahren inklusive Pseudo-Elemente. Eine farbige Tabellenzelle mit `data-pptx`
  direkt auf der Zelle verliert dadurch ihre komplette Hintergrundfarbe im fertigen Bild,
  nicht nur ihren Text (in der Chromium-Vorschau sieht man das nicht, da dort nichts
  ausgeblendet wird — der Fehler zeigt sich erst im echten PowerPoint-Export). Lösung: die
  Hintergrundfarbe/Deko bleibt auf einem äußeren Element OHNE `data-pptx`, der Text wandert
  in ein schlichtes inneres `<div>` (kein `<span>`, siehe Regel oben) MIT `data-pptx`, das
  selbst keine eigene Hintergrundfarbe hat. Aus demselben Grund werden benutzerdefinierte
  `::before`/`::after`-Bullets auf `<li>`-Elementen innerhalb eines `data-pptx`-`<ul>`
  ebenfalls unsichtbar — verlasse dich hier nicht auf eigene Bullet-Gestaltung; das
  Build-Skript setzt ohnehin automatisch ein einfaches "•"/"N." davor.
- **Nach dem Bauen einmal den echten PowerPoint-Export prüfen** (`scripts/export_slides.ps1`),
  nicht nur die Chromium-Referenzbilder — genau diese Klasse von Fehlern (verschwundene
  Hintergründe/Deko) ist in der Chromium-Vorschau unsichtbar und fällt nur im tatsächlichen
  PowerPoint-Rendering auf.
