#!/usr/bin/env node
/**
 * Rendert HTML-Folien mit Playwright und extrahiert:
 *  1. Ein Hintergrundbild pro Folie (alles außer editierbarem Text) als PNG
 *  2. Ein Referenzbild pro Folie (mit Text sichtbar) zur späteren QA
 *  3. Position, Größe und Formatierung jedes mit data-pptx markierten Textelements
 *
 * Usage: node render_slides.js <slides-dir> <output-dir>
 *   <slides-dir> enthält slide-1.html, slide-2.html, ... (numerisch sortiert)
 *   <output-dir> wird mit bg-N.png, ref-N.png und manifest.json befüllt
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SLIDE_WIDTH_IN = 13.333;
const SLIDE_HEIGHT_IN = 7.5;
const VIEWPORT_W = 1920;
const VIEWPORT_H = 1080;
const PX_TO_IN = SLIDE_WIDTH_IN / VIEWPORT_W;

// Läuft im Browser-Kontext (über page.evaluate). Läuft durch den DOM-Baum
// eines [data-pptx]-Elements und baut eine Liste von Absätzen mit Runs
// (Text-Fragmenten, die jeweils ihren eigenen Stil tragen können).
function extractParagraphsInBrowser({ idx, pxToIn }) {
  function styleOf(el) {
    const cs = window.getComputedStyle(el);
    const fontFamily = cs.fontFamily.split(',')[0].trim().replace(/['"]/g, '');
    const fontSizePx = parseFloat(cs.fontSize);
    const lineHeightPx = cs.lineHeight === 'normal' ? fontSizePx * 1.2 : parseFloat(cs.lineHeight);
    return {
      fontFamily,
      fontSizePt: Math.round(fontSizePx * pxToIn * 72 * 100) / 100,
      bold: parseInt(cs.fontWeight, 10) >= 600,
      italic: cs.fontStyle === 'italic',
      underline: cs.textDecorationLine.includes('underline'),
      color: cs.color,
      uppercase: cs.textTransform === 'uppercase',
      align: cs.textAlign,
      lineHeightPt: Math.round(lineHeightPx * pxToIn * 72 * 100) / 100,
    };
  }

  function isBlockContainer(el) {
    return ['P', 'LI', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE'].includes(el.tagName);
  }

  function getParagraphElements(container) {
    if (container.tagName === 'UL' || container.tagName === 'OL') {
      return Array.from(container.children).filter((c) => c.tagName === 'LI');
    }
    const directBlocks = Array.from(container.children).filter(isBlockContainer);
    if (directBlocks.length === 0) return [container];
    const expanded = [];
    for (const el of directBlocks) {
      if (el.tagName === 'UL' || el.tagName === 'OL') {
        expanded.push(...Array.from(el.children).filter((c) => c.tagName === 'LI'));
      } else {
        expanded.push(el);
      }
    }
    return expanded.length > 0 ? expanded : [container];
  }

  function runsFromNode(node, inheritedStyle, runs) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue.replace(/\s+/g, ' ');
      if (text.trim().length === 0) return;
      runs.push({ text, style: inheritedStyle });
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    if (node.tagName === 'BR') return; // Zeilenumbrüche innerhalb eines Runs ignorieren wir bewusst (siehe SKILL.md)
    const ownStyle = styleOf(node);
    const merged = Object.assign({}, inheritedStyle, {
      bold: ownStyle.bold || inheritedStyle.bold,
      italic: ownStyle.italic || inheritedStyle.italic,
      underline: ownStyle.underline || inheritedStyle.underline,
      color: ownStyle.color,
      fontFamily: ownStyle.fontFamily,
      fontSizePt: ownStyle.fontSizePt,
      uppercase: ownStyle.uppercase || inheritedStyle.uppercase,
    });
    for (const child of node.childNodes) runsFromNode(child, merged, runs);
  }

  const root = document.querySelectorAll('[data-pptx]')[idx];
  if (!root) return [];

  const listType = root.tagName === 'OL' ? 'ol' : root.tagName === 'UL' ? 'ul' : null;
  const paragraphElements = getParagraphElements(root);

  const paragraphs = paragraphElements.map((pEl) => {
    const pStyle = styleOf(pEl);
    const runs = [];
    for (const child of pEl.childNodes) runsFromNode(child, pStyle, runs);
    const isListItem = pEl.tagName === 'LI';
    const r = pEl.getBoundingClientRect();
    return {
      align: pStyle.align,
      lineHeightPt: pStyle.lineHeightPt,
      isListItem,
      listType: isListItem ? listType : null,
      runs,
      topPx: r.top,
      bottomPx: r.bottom,
    };
  });

  return paragraphs.filter((p) => p.runs.length > 0);
}

async function extractSlide(page, outDir, slideNum) {
  // 1. Referenzbild (mit sichtbarem Text) für spätere visuelle QA
  await page.screenshot({ path: path.join(outDir, `ref-${slideNum}.png`) });

  // 2. Geometrie + Formatierung aller [data-pptx]-Elemente einsammeln
  const count = await page.evaluate(() => document.querySelectorAll('[data-pptx]').length);

  const textElements = [];
  for (let i = 0; i < count; i++) {
    const bbox = await page.evaluate((idx) => {
      const el = document.querySelectorAll('[data-pptx]')[idx];
      const r = el.getBoundingClientRect();
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    }, i);

    const paragraphs = await page.evaluate(extractParagraphsInBrowser, { idx: i, pxToIn: PX_TO_IN });

    // Absatzabstand aus dem tatsächlichen gemessenen Zwischenraum ableiten (deckt
    // z. B. CSS flex/grid `gap` zwischen <li>-Elementen ab, das line-height nicht abbildet).
    for (let p = 0; p < paragraphs.length; p++) {
      const cur = paragraphs[p];
      const next = paragraphs[p + 1];
      cur.spaceAfterPt = next ? Math.round(Math.max(0, next.topPx - cur.bottomPx) * PX_TO_IN * 72 * 100) / 100 : 0;
      delete cur.topPx;
      delete cur.bottomPx;
    }

    textElements.push({
      x: bbox.x * PX_TO_IN,
      y: bbox.y * PX_TO_IN,
      w: bbox.w * PX_TO_IN,
      h: bbox.h * PX_TO_IN,
      paragraphs,
    });
  }

  // 3. Text unsichtbar machen (Layout bleibt erhalten, kein Reflow) und Hintergrund rendern
  await page.evaluate(() => {
    document.querySelectorAll('[data-pptx]').forEach((el) => {
      el.style.visibility = 'hidden';
    });
  });
  await page.screenshot({ path: path.join(outDir, `bg-${slideNum}.png`) });

  return textElements;
}

async function main() {
  const [, , slidesDir, outDir] = process.argv;
  if (!slidesDir || !outDir) {
    console.error('Usage: node render_slides.js <slides-dir> <output-dir>');
    process.exit(1);
  }
  fs.mkdirSync(outDir, { recursive: true });

  const files = fs
    .readdirSync(slidesDir)
    .filter((f) => /^slide-\d+\.html$/.test(f))
    .sort((a, b) => parseInt(a.match(/\d+/)[0], 10) - parseInt(b.match(/\d+/)[0], 10));

  if (files.length === 0) {
    console.error(`Keine slide-N.html Dateien gefunden in ${slidesDir}`);
    process.exit(1);
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: VIEWPORT_W, height: VIEWPORT_H } });

  const manifest = { slideWidthIn: SLIDE_WIDTH_IN, slideHeightIn: SLIDE_HEIGHT_IN, slides: [] };

  for (let idx = 0; idx < files.length; idx++) {
    const slideNum = idx + 1;
    const filePath = path.join(slidesDir, files[idx]);
    await page.goto('file://' + path.resolve(filePath));
    await page.waitForTimeout(50);
    const textElements = await extractSlide(page, outDir, slideNum);
    manifest.slides.push({
      slideNum,
      bg: `bg-${slideNum}.png`,
      ref: `ref-${slideNum}.png`,
      textElements,
    });
    console.log(`Folie ${slideNum}/${files.length} gerendert (${textElements.length} Textblöcke)`);
  }

  await browser.close();
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`Fertig. Manifest: ${path.join(outDir, 'manifest.json')}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
