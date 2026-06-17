"use strict";

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

// ── Layout Constants ────────────────────────────────────────────────────
// 16:9 slide at 10" × 5.625" (widescreen)
const SLIDE_W = 13.333; // inches  (10 * 96/72)
const SLIDE_H = 7.5;    // inches  (5.625 * 96/72)
const PAD = { x: 0.7, y: 0.5 };
const HEADER_H = 0.65;  // header area height (badge + title)
const BODY_TOP = PAD.y + HEADER_H + 0.18;
const BODY_W = SLIDE_W - PAD.x * 2;
const BODY_H = SLIDE_H - BODY_TOP - PAD.y;

// Gap presets
const GAP = { xs: 0.04, sm: 0.06, md: 0.12, lg: 0.2, xl: 0.3 };

// ── Color Palettes (per theme) ──────────────────────────────────────────
const THEMES = {
  dark: {
    bg: "0D1117", text: "E6EDF3", textSec: "B1BAC4", textMuted: "6E7681",
    blue: "60A5FA", purple: "A78BFA", green: "34D399", orange: "FB923C", red: "F87171",
    glass: "1C2128", border: "2D333B",
  },
  light: {
    bg: "F8FAFC", text: "0F172A", textSec: "475569", textMuted: "94A3B8",
    blue: "2563EB", purple: "7C3AED", green: "059669", orange: "EA580C", red: "DC2626",
    glass: "FFFFFF", border: "E2E8F0",
  },
  formal: {
    bg: "FFFFFF", text: "111827", textSec: "374151", textMuted: "6B7280",
    blue: "1D4ED8", purple: "6D28D9", green: "065F46", orange: "B45309", red: "B91C1C",
    glass: "F9FAFB", border: "D1D5DB",
  },
};

// Active theme colors — set by exportNativePptx() before rendering
let C = THEMES.dark;
let ACCENT, VARIANT;

function applyTheme(name) {
  C = THEMES[name] || THEMES.dark;
  ACCENT = { blue: C.blue, purple: C.purple, green: C.green, orange: C.orange, red: C.red, none: C.border };
  VARIANT = { b1: C.blue, b2: C.purple, b3: C.green, b4: C.orange, b5: C.red };
}

// Initialize default theme
applyTheme("dark");

// ── Font Sizes (pt) ─────────────────────────────────────────────────────
// Optimized for 16:9 projection — compact, readable, hierarchical.
// Title slide uses the biggest sizes; content slides use a clear 3-level
// hierarchy (heading > body > small) with tight line spacing for 16:9.
const F = {
  titleSlide: 36,   // main title on title slide (serif, bold)
  subtitle: 15,     // subtitle on title slide
  h1: 24,           // content slide header (serif, bold)
  heading: 18,      // card heading (sans, bold)
  body: 13,         // body text
  small: 10,        // small / muted text
  label: 11,        // section label (card top-left, uppercase)
  badge: 10,        // badge text
  iconEmoji: 28,    // emoji icon
  iconTitle: 12,    // icon-item title (bold)
  iconBody: 10,     // icon-item body
  progressLabel: 10, // progress bar label
  progressVal: 10,   // progress bar value
};

// ── Main Export ─────────────────────────────────────────────────────────

async function exportNativePptx(yamlPath, outputPath, options = {}) {
  const PptxGenJS = require("pptxgenjs");
  if (!fs.existsSync(yamlPath)) throw new Error(`YAML not found: "${yamlPath}"`);

  // Apply theme
  const theme = options.theme || "dark";
  applyTheme(theme);

  const deck = yaml.load(fs.readFileSync(yamlPath, "utf8"));
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "S16", width: SLIDE_W, height: SLIDE_H });
  pptx.layout = "S16";
  pptx.author = "SlideCraft";
  pptx.title = (deck.meta && deck.meta.title) || "Presentation";

  for (let i = 0; i < (deck.slides || []).length; i++) {
    const def = deck.slides[i];
    const slide = pptx.addSlide();
    slide.background = { color: C.bg };
    try {
      def.layout === "title" ? renderTitle(slide, def, pptx) : renderContent(slide, def, pptx);
    } catch (e) {
      console.warn(`  Slide ${i + 1}: ${e.message}`);
    }
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await pptx.writeFile({ fileName: outputPath });
  console.log(`✓  Native PPTX: ${outputPath}`);
}

// ── Title Slide ─────────────────────────────────────────────────────────

function renderTitle(slide, def, pptx) {
  const { icon, badge, title, subtitle, tags = [] } = def;

  // ── Measure total content height first for vertical centering ──
  const showIcon = icon && C !== THEMES.formal;
  let totalH = 0;
  if (showIcon) totalH += 0.85;           // icon line
  if (badge) totalH += 0.5;              // badge + gap
  if (title) totalH += 2.1;              // title block
  if (subtitle) totalH += 0.65;          // subtitle block
  if (tags.length) totalH += 0.5;        // tag row

  // Start y so content is vertically centered in the slide
  let cy = Math.max(0.4, (SLIDE_H - totalH) / 2);

  if (showIcon) {
    slide.addText(icon, {
      x: 0, y: cy, w: SLIDE_W, h: 0.85,
      fontSize: F.iconEmoji + 14, align: "center", valign: "middle",
    });
    cy += 0.85;
  }

  if (badge) {
    const c = VARIANT[badge.variant] || C.blue;
    const bw = 2.6;
    addBadge(slide, badge.text, c, (SLIDE_W - bw) / 2, cy, bw);
    cy += 0.5;
  }

  if (title) {
    slide.addText(clean(title), {
      x: PAD.x, y: cy, w: BODY_W, h: 2.0,
      fontSize: F.titleSlide, align: "center", valign: "middle",
      color: C.text, bold: true, fontFace: "Microsoft YaHei",
      lineSpacingMultiple: 1.15,
    });
    cy += 2.1;
  }

  if (subtitle) {
    slide.addText(clean(subtitle), {
      x: PAD.x, y: cy, w: BODY_W, h: 0.55,
      fontSize: F.subtitle, align: "center", valign: "middle",
      color: C.textMuted, fontFace: "Microsoft YaHei",
    });
    cy += 0.65;
  }

  if (tags.length) {
    const tw = 1.8, gap = 0.18, total = tags.length * tw + (tags.length - 1) * gap;
    let tx = (SLIDE_W - total) / 2;
    for (const t of tags) {
      const c = VARIANT[t.variant] || C.blue;
      addBadge(slide, t.text, c, tx, cy, tw);
      tx += tw + gap;
    }
  }
}

// ── Content Slide ───────────────────────────────────────────────────────

function renderContent(slide, def, pptx) {
  const { header, body = [] } = def;

  if (header) {
    const { badge, title: ht } = header;
    if (badge) {
      const c = VARIANT[badge.variant] || C.blue;
      addBadge(slide, badge.text, c, PAD.x, PAD.y, 1.6);
    }
    if (ht) {
      slide.addText(clean(ht), {
        x: badge ? PAD.x + 1.75 : PAD.x, y: PAD.y - 0.02, w: BODY_W - 1.8, h: HEADER_H,
        fontSize: F.h1, valign: "middle",
        color: C.text, bold: true, fontFace: "Microsoft YaHei",
      });
    }
  }

  renderNodes(slide, body, { x: PAD.x, y: BODY_TOP, w: BODY_W, h: BODY_H }, pptx);
}

// ── Node Tree Walker ────────────────────────────────────────────────────

function renderNodes(slide, nodes, area, pptx) {
  if (!Array.isArray(nodes)) return area.y;
  let cy = area.y;

  for (const node of nodes) {
    if (!node || !node.type) continue;

    if (node.type === "grid") {
      cy = renderGrid(slide, node, { ...area, y: cy }, pptx);
    } else if (node.type === "callout") {
      cy = renderCallout(slide, node, { ...area, y: cy }, pptx);
    } else if (node.type === "flex") {
      cy = renderFlex(slide, node, { ...area, y: cy }, pptx);
    } else if (node.type === "spacer") {
      cy += rem(node.height);
    } else if (node.type === "divider") {
      slide.addShape(pptx.shapes.RECTANGLE, { x: area.x, y: cy, w: area.w, h: 0.01, fill: { color: C.border } });
      cy += GAP.md;
    } else {
      const h = renderComp(slide, node, area.x, cy, area.w, pptx, {});
      cy += h + GAP.sm;
    }
  }
  return cy;
}

// ── Grid ────────────────────────────────────────────────────────────────

// Parse column definitions into an array of widths (inches).
// Supports: number (equal cols), "1fr auto 1fr", "1fr 1fr", "1.05fr 0.95fr"
function parseColWidths(columns, totalW, gap) {
  if (typeof columns === "number") {
    const w = (totalW - gap * (columns - 1)) / columns;
    return Array(columns).fill(w);
  }
  const str = String(columns).trim();
  // "N" — equal cols
  if (/^\d+$/.test(str)) {
    const n = parseInt(str, 10);
    const w = (totalW - gap * (n - 1)) / n;
    return Array(n).fill(w);
  }
  // "1fr auto 1fr" pattern
  const parts = str.split(/\s+/);
  const AUTO_W = 0.55; // fixed width for auto columns (arrows etc.)
  let autoCount = 0, frTotal = 0;
  const frParts = [];
  for (const p of parts) {
    if (p === "auto") {
      autoCount++;
      frParts.push({ auto: true });
    } else if (p.endsWith("fr")) {
      const v = parseFloat(p) || 1;
      frTotal += v;
      frParts.push({ fr: v });
    } else {
      // fallback: treat as equal
      frParts.push({ fr: 1 });
      frTotal += 1;
    }
  }
  const autoTotal = autoCount * AUTO_W;
  const frSpace = totalW - autoTotal - gap * (parts.length - 1);
  return frParts.map((p) => p.auto ? AUTO_W : (p.fr / frTotal) * frSpace);
}

function renderGrid(slide, node, area, pptx) {
  const { columns = 2, gap = "0.2rem", items = [] } = node;
  const g = rem(gap);
  const colWidths = parseColWidths(columns, area.w, g);
  const cols = colWidths.length;

  // Measure each item with its actual column width
  const heights = items.map((it, i) => measureH(it, colWidths[i % cols] || colWidths[0]));
  const rowH = Math.max(...heights, 0.3);

  let cx = area.x, cy = area.y, ci = 0;

  for (const item of items) {
    const cw = colWidths[ci] || colWidths[0];
    if (item.type === "arrow") {
      slide.addText("→", { x: cx, y: cy + rowH / 2 - 0.2, w: cw, h: 0.45, fontSize: 24, align: "center", color: C.textMuted });
    } else {
      renderComp(slide, item, cx, cy, cw, pptx, {});
    }
    ci++;
    if (ci < cols) {
      cx += cw + g;
    } else {
      ci = 0; cx = area.x; cy += rowH + g;
    }
  }

  return cy + (ci === 0 ? 0 : rowH + g);
}

// ── Card ────────────────────────────────────────────────────────────────

function renderCard(slide, node, x, y, w, pptx) {
  const { accent, children = [] } = node;
  const borderColor = ACCENT[accent] || C.border;
  const padX = 0.18, padY = 0.12;
  const h = measureChildrenH(children, w - padX * 2) + padY * 2;

  // Background
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h,
    fill: { color: C.glass },
    line: { color: C.border, width: 0.5 },
    rectRadius: 0.1,
  });

  // Left accent bar
  if (accent && accent !== "none") {
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: x + 0.015, y: y + 0.18, w: 0.04, h: h - 0.36,
      fill: { color: borderColor },
    });
  }

  // Children
  renderNodes(slide, children, { x: x + padX + 0.05, y: y + padY, w: w - padX * 2 - 0.05, h: h - padY * 2 }, pptx);
  return h;
}

// ── Callout ─────────────────────────────────────────────────────────────

function renderCallout(slide, node, area, pptx) {
  const txt = clean(node.text || "");
  const padX = 0.18, padY = 0.12;
  const h = Math.max(0.55, textH(txt, area.w - padX * 2 - 0.1, F.body) + padY * 2 + 0.03);

  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: area.x, y: area.y, w: area.w, h,
    fill: { color: C.glass },
    line: { color: C.border, width: 0.5 },
    rectRadius: 0.08,
  });
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: area.x + 0.015, y: area.y + 0.14, w: 0.04, h: h - 0.28,
    fill: { color: C.blue },
  });
  slide.addText(txt, {
    x: area.x + padX, y: area.y + padY, w: area.w - padX * 2, h: h - padY * 2,
    fontSize: F.body, valign: "top",
    color: C.textSec, fontFace: "Microsoft YaHei", lineSpacingMultiple: LINE_SP, autoFit: true,
  });

  return area.y + h + GAP.sm;
}

// ── Flex ────────────────────────────────────────────────────────────────

function renderFlex(slide, node, area, pptx) {
  const { direction = "row", gap = "0.15rem", children = [] } = node;
  const g = rem(gap);

  if (direction === "column") return renderNodes(slide, children, area, pptx);

  const colW = (area.w - g * (children.length - 1)) / children.length;
  let cx = area.x, mh = 0;
  for (const ch of children) {
    const h = renderComp(slide, ch, cx, area.y, colW, pptx, {});
    mh = Math.max(mh, h);
    cx += colW + g;
  }
  return area.y + mh + GAP.sm;
}

// ── Component Dispatcher ────────────────────────────────────────────────

function renderComp(slide, node, x, y, w, pptx, ctx) {
  if (!node || !node.type) return 0;
  const t = node.type;

  if (t === "card") return renderCard(slide, node, x, y, w, pptx);
  if (t === "text") return renderText(slide, node, x, y, w);
  if (t === "label") return renderLabel(slide, node, x, y, w);
  if (t === "badge") return renderBadge(slide, node, x, y, w, pptx);
  if (t === "icon-item") return renderIconItem(slide, node, x, y, w);
  if (t === "icon-items-stack") return renderIconItemsStack(slide, node, x, y, w);
  if (t === "level-bar") return renderLevelBar(slide, node, x, y, w, pptx);
  if (t === "level-bars-stack") return renderLevelBarsStack(slide, node, x, y, w, pptx);
  if (t === "progress-bar") return renderProgressBar(slide, node, x, y, w, pptx);
  if (t === "progress-bars-stack") return renderProgressBarsStack(slide, node, x, y, w, pptx);
  if (t === "mini-card") return renderMiniCard(slide, node, x, y, w, pptx);
  if (t === "formula") return renderFormula(slide, node, x, y, w, pptx);
  if (t === "tag-row") return renderTagRow(slide, node, x, y, w, pptx);
  if (t === "arrow") { slide.addText("→", { x, y, w, h: 0.45, fontSize: 24, align: "center", color: C.textMuted }); return 0.45; }
  if (t === "grid") return renderGrid(slide, node, { x, y, w, h: BODY_H }, pptx) - y;
  if (t === "flex") return renderFlex(slide, node, { x, y, w, h: BODY_H }, pptx) - y;
  if (t === "callout") return renderCallout(slide, node, { x, y, w, h: 2 }, pptx) - y;
  if (t === "spacer") return rem(node.height);
  if (t === "divider") return 0.12;
  return 0;
}

// ── Text ────────────────────────────────────────────────────────────────

function renderText(slide, node, x, y, w) {
  const { text = "", style = "body", color: fc } = node;
  const fs = style === "heading" ? F.heading : style === "title" ? F.h1 : style === "small" ? F.small : F.body;
  const c = fc || (style === "heading" ? C.text : C.textSec);
  const h = Math.max(0.35, textH(clean(text), w, fs) + 0.08);

  slide.addText(rich(text), {
    x, y, w, h, fontSize: fs, color: c, fontFace: "Microsoft YaHei",
    lineSpacingMultiple: LINE_SP, valign: "top", autoFit: true,
  });
  return h;
}

// ── Label ───────────────────────────────────────────────────────────────

function renderLabel(slide, node, x, y, w) {
  slide.addText((node.text || "").toUpperCase(), {
    x, y, w, h: 0.35, fontSize: F.label, bold: true,
    color: node.color || C.textMuted, fontFace: "Microsoft YaHei", charSpacing: 2, valign: "top",
  });
  return 0.38;
}

// ── Badge helper ────────────────────────────────────────────────────────

function addBadge(slide, text, color, x, y, w) {
  slide.addShape("roundRect", {
    x, y, w, h: 0.38,
    fill: { color, transparency: 85 },
    line: { color, width: 0.75 },
    rectRadius: 0.16,
  });
  slide.addText(text || "", {
    x, y, w, h: 0.38, fontSize: F.badge, align: "center", valign: "middle",
    color, bold: true, fontFace: "Microsoft YaHei",
  });
}

function renderBadge(slide, node, x, y, w, pptx) {
  const c = VARIANT[node.variant] || C.blue;
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x, y, w: Math.min(w, 1.6), h: 0.38,
    fill: { color: c, transparency: 85 },
    line: { color: c, width: 0.75 },
    rectRadius: 0.16,
  });
  slide.addText(node.text || "", {
    x, y, w: Math.min(w, 1.6), h: 0.38,
    fontSize: F.badge, align: "center", valign: "middle",
    color: c, bold: true, fontFace: "Microsoft YaHei",
  });
  return 0.42;
}

// ── Icon Item ───────────────────────────────────────────────────────────

function renderIconItem(slide, node, x, y, w) {
  const { icon = "✨", title = "", body: bd = "" } = node;
  const noIcon = C === THEMES.formal;
  const iw = noIcon ? 0 : 0.42;
  const tx = x + iw + (noIcon ? 0 : 0.14);
  const tw = w - iw - (noIcon ? 0 : 0.14);

  if (!noIcon) {
    slide.addText(icon, { x, y, w: iw, h: iw, fontSize: F.iconEmoji, align: "center", valign: "middle" });
  }
  slide.addText(clean(title), {
    x: tx, y, w: tw, h: 0.24, fontSize: F.iconTitle, bold: true, color: C.text, fontFace: "Microsoft YaHei", valign: "top",
  });
  const bh = textH(clean(bd), tw, F.iconBody);
  slide.addText(clean(bd), {
    x: tx, y: y + 0.25, w: tw, h: bh + 0.03,
    fontSize: F.iconBody, color: C.textMuted, fontFace: "Microsoft YaHei", lineSpacingMultiple: LINE_SP, valign: "top", autoFit: true,
  });

  return Math.max(iw || 0.25, 0.25 + bh + 0.05);
}

function renderIconItemsStack(slide, node, x, y, w) {
  const g = rem(node.gap, 0.35);
  let cy = y;
  for (const it of (node.items || [])) {
    cy += renderIconItem(slide, it, x, cy, w) + g;
  }
  return cy - y - g;
}

// ── Level Bar ───────────────────────────────────────────────────────────

function renderLevelBar(slide, node, x, y, w, pptx) {
  const c = stripHash(node.color || C.blue);
  const hasText = !!node.text;
  const h = hasText ? 0.6 : 0.42;

  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, fill: { color: c, transparency: 88 }, line: { type: "none" }, rectRadius: 0.07,
  });
  slide.addText(clean(node.label || ""), {
    x: x + 0.18, y, w: w - 0.36, h: hasText ? 0.3 : h,
    fontSize: 11, bold: true, color: c, fontFace: "Microsoft YaHei", valign: "top", autoFit: true,
  });
  if (hasText) {
    slide.addText(clean(node.text), {
      x: x + 0.18, y: y + 0.28, w: w - 0.36, h: 0.3,
      fontSize: 9.5, color: C.textMuted, fontFace: "Microsoft YaHei", valign: "top", autoFit: true,
    });
  }
  return h + 0.08;
}

function renderLevelBarsStack(slide, node, x, y, w, pptx) {
  const g = rem(node.gap, 0.22);
  let cy = y;
  for (const it of (node.items || [])) {
    cy += renderLevelBar(slide, it, x, cy, w, pptx) + g;
  }
  return cy - y - g;
}

// ── Progress Bar ────────────────────────────────────────────────────────

function renderProgressBar(slide, node, x, y, w, pptx) {
  const c = stripHash(node.color || C.blue);
  const pct = Math.min(1, Math.max(0, node.value || 0));
  const barH = 0.08, labelH = 0.28, totalH = labelH + barH + 0.05;

  // Label
  slide.addText(clean(node.label || ""), {
    x, y, w: w - 0.8, h: labelH,
    fontSize: F.progressLabel, bold: true, color: C.text, fontFace: "Microsoft YaHei", valign: "bottom",
  });
  // Value
  slide.addText(pct.toFixed(4), {
    x: x + w - 0.85, y, w: 0.85, h: labelH,
    fontSize: F.progressVal, bold: true, align: "right", color: c, fontFace: "Microsoft YaHei", valign: "bottom",
  });
  // Bar bg
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x, y: y + labelH, w, h: barH, fill: { color: c, transparency: 90 }, line: { type: "none" }, rectRadius: 0.04,
  });
  // Bar fill
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x, y: y + labelH, w: Math.max(0.05, w * pct), h: barH, fill: { color: c }, line: { type: "none" }, rectRadius: 0.04,
  });

  return totalH;
}

function renderProgressBarsStack(slide, node, x, y, w, pptx) {
  const g = rem(node.gap, 0.2);
  let cy = y;
  for (const it of (node.items || [])) {
    cy += renderProgressBar(slide, it, x, cy, w, pptx) + g;
  }
  return cy - y - g;
}

// ── Mini Card ───────────────────────────────────────────────────────────

function renderMiniCard(slide, node, x, y, w, pptx) {
  const c = stripHash(node.color || C.blue);
  const h = 0.62;

  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, fill: { color: c, transparency: 88 }, line: { type: "none" }, rectRadius: 0.07,
  });
  slide.addText(clean(node.label || ""), {
    x: x + 0.14, y: y + 0.08, w: w - 0.28, h: 0.24,
    fontSize: 11, bold: true, color: c, fontFace: "Microsoft YaHei",
  });
  slide.addText(clean(node.text || ""), {
    x: x + 0.14, y: y + 0.32, w: w - 0.28, h: 0.22,
    fontSize: 10, color: C.textMuted, fontFace: "Microsoft YaHei",
  });
  return h;
}

// ── Formula ─────────────────────────────────────────────────────────────

function renderFormula(slide, node, x, y, w, pptx) {
  const txt = clean(node.text || "");
  const padX = 0.18, padY = 0.12;
  const h = Math.max(0.5, textH(txt, w - padX * 2, 11) + padY * 2 + 0.05);

  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, fill: { color: C.blue, transparency: 93 }, line: { color: C.blue, width: 0.5 }, rectRadius: 0.07,
  });
  slide.addText(txt, {
    x: x + padX, y: y + padY, w: w - padX * 2, h: h - padY * 2,
    fontSize: 11, color: C.blue, fontFace: "Microsoft YaHei", lineSpacingMultiple: LINE_SP, valign: "top", autoFit: true,
  });
  return h;
}

// ── Tag Row ─────────────────────────────────────────────────────────────

function renderTagRow(slide, node, x, y, w, pptx) {
  const tw = 1.5, g = 0.14;
  let cx = x;
  for (const t of (node.tags || [])) {
    const c = VARIANT[t.variant] || C.blue;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: cx, y, w: tw, h: 0.38, fill: { color: c, transparency: 85 }, line: { color: c, width: 0.75 }, rectRadius: 0.16,
    });
    slide.addText(t.text || "", {
      x: cx, y, w: tw, h: 0.38, fontSize: F.badge, align: "center", valign: "middle",
      color: c, bold: true, fontFace: "Microsoft YaHei",
    });
    cx += tw + g;
  }
  return 0.42;
}

// ── Utilities ───────────────────────────────────────────────────────────

function clean(s) {
  return String(s).replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").replace(/<[^>]+>/g, "");
}

function rich(s) {
  const str = String(s), parts = [], re = /\*\*(.*?)\*\*/g;
  let last = 0, m;
  while ((m = re.exec(str)) !== null) {
    if (m.index > last) parts.push({ text: str.slice(last, m.index) });
    parts.push({ text: m[1], options: { bold: true } });
    last = re.lastIndex;
  }
  if (last < str.length) parts.push({ text: str.slice(last) });
  return parts.length > 0 ? parts : str;
}

function rem(v, fallback = 0.2) {
  if (v == null) return fallback;
  const s = String(v).trim();
  if (s.endsWith("rem")) return parseFloat(s) * 0.2;
  if (s.endsWith("px")) return parseFloat(s) / 96;
  return parseFloat(s) || fallback;
}

function colCount(v) {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.includes(" ")) return v.split(/\s+/).length;
  return parseInt(v, 10) || 2;
}

function stripHash(c) {
  return c.startsWith("#") ? c.slice(1) : c;
}

// ── Height Estimation ───────────────────────────────────────────────────
//
// Accurately estimating how many lines text will occupy is the single most
// important factor for preventing overflow. The old approach used a single
// average character width (CHAR_W) and the wrong unit conversion (fs/96
// instead of fs/72). Both caused severe underestimation, especially for
// CJK text.
//
// New approach:
//   1. Correct pt→inch conversion: lineH = (fs / 72) * LINE_SP
//   2. Per-character width: CJK ≈ 1.0×fs, Latin ≈ 0.52×fs, space ≈ 0.28×fs
//   3. Iterate character-by-character to count actual line wraps
//   4. Handle explicit newlines (\n)

const SAFETY = 1.1;   // 10% safety margin
const LINE_SP = 1.15;  // line spacing multiplier (compact for 16:9)

// Character width factors (relative to fontSize, in points)
const CW = { cjk: 1.0, latin: 0.52, space: 0.28, punct: 0.55 };

function isCJK(ch) {
  const c = ch.charCodeAt(0);
  return (c >= 0x4E00 && c <= 0x9FFF) ||   // CJK Unified Ideographs
         (c >= 0x3400 && c <= 0x4DBF) ||   // CJK Unified Ext A
         (c >= 0x3000 && c <= 0x303F) ||   // CJK Symbols & Punctuation
         (c >= 0xFF00 && c <= 0xFFEF) ||   // Fullwidth Forms
         (c >= 0x2E80 && c <= 0x2EFF) ||   // CJK Radicals Supplement
         (c >= 0xF900 && c <= 0xFAFF) ||   // CJK Compatibility Ideographs
         (c >= 0xFE30 && c <= 0xFE4F) ||   // CJK Compatibility Forms
         (c >= 0x20000 && c <= 0x2A6DF);   // CJK Unified Ext B
}

function isCJKPunct(ch) {
  const c = ch.charCodeAt(0);
  if ((c >= 0x3000 && c <= 0x303F) ||   // CJK Symbols & Punctuation
      (c >= 0xFF00 && c <= 0xFFEF) ||   // Fullwidth Forms
      (c >= 0x2000 && c <= 0x206F) ||   // General Punctuation
      (c >= 0xFE30 && c <= 0xFE4F))    // CJK Compatibility Forms
    return true;
  // Common CJK punctuation not covered by Unicode ranges above
  return '\uFF0C\u3002\u3001\uFF1B\uFF1A\uFF1F\uFF01\u2018\u2019\u201C\u201D\uFF08\uFF09\u2014\u2026\u00B7\u300A\u300B\u3010\u3011'.includes(ch);
}

/**
 * Estimate the height (in inches) that `text` will occupy in a text box
 * of width `w` (inches) at font size `fs` (points).
 *
 * Uses per-character width estimation for accurate CJK/Latin mixed content.
 * Handles explicit newlines. Applies SAFETY margin.
 */
function textH(text, w, fs) {
  if (!text || text.length === 0 || w <= 0) return 0.22;

  const wPt = w * 72;                            // available width in points
  const lineH = (fs / 72) * LINE_SP;             // one line height in inches

  // Split by explicit newlines first
  const paragraphs = text.split('\n');
  let totalLines = 0;

  for (const para of paragraphs) {
    if (para.length === 0) {
      totalLines += 1;                            // empty line
      continue;
    }

    let curW = 0;
    let paraLines = 1;

    for (let i = 0; i < para.length; i++) {
      const ch = para[i];
      let cw;
      if (ch === ' ' || ch === '\t') {
        cw = fs * CW.space;
      } else if (isCJK(ch)) {
        cw = fs * CW.cjk;
      } else if (isCJKPunct(ch)) {
        cw = fs * CW.punct;
      } else {
        cw = fs * CW.latin;
      }

      curW += cw;
      if (curW > wPt + 0.01) {                   // wrap when exceeding width
        paraLines++;
        curW = cw;                                // new line starts with this char
      }
    }

    totalLines += paraLines;
  }

  return Math.max(0.25, totalLines * lineH) * SAFETY;
}

function measureH(node, w) {
  if (!node || !node.type) return 0.6;
  const t = node.type;
  if (t === "card") {
    const padX = 0.18, padY = 0.12;
    return measureChildrenH(node.children || [], w - padX * 2) + padY * 2;
  }
  if (t === "text") {
    const fs = node.style === "heading" ? F.heading : node.style === "title" ? F.h1 : node.style === "small" ? F.small : F.body;
    return Math.max(0.28, textH(clean(node.text || ""), w - 0.15, fs) + 0.06);
  }
  if (t === "label") return 0.3;
  if (t === "icon-items-stack") {
    const g = rem(node.gap, 0.2);
    let totalH = 0;
    for (const it of (node.items || [])) {
      const bd = clean(it.body || "");
      const bh = textH(bd, w - 0.45, F.iconBody);
      totalH += Math.max(0.35, 0.2 + bh + 0.03) + g;
    }
    return Math.max(0.35, totalH - g);
  }
  if (t === "level-bars-stack") return (node.items || []).length * 0.55 + 0.08;
  if (t === "progress-bars-stack") return (node.items || []).length * 0.42 + 0.08;
  if (t === "mini-card") return 0.52;
  if (t === "callout") {
    const txt = clean(node.text || "");
    return Math.max(0.42, textH(txt, w - 0.28, F.body) + 0.2);
  }
  if (t === "formula") {
    const txt = clean(node.text || "");
    return Math.max(0.4, textH(txt, w - 0.28, 10) + 0.2);
  }
  if (t === "badge") return 0.32;
  if (t === "grid") {
    const colWidths = parseColWidths(node.columns || 2, w, rem(node.gap, 0.18));
    const cols = colWidths.length;
    const rows = Math.ceil((node.items || []).length / cols);
    const g = rem(node.gap, 0.18);
    let totalH = 0;
    for (let r = 0; r < rows; r++) {
      let rowMax = 0;
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        if (idx < (node.items || []).length) {
          rowMax = Math.max(rowMax, measureH(node.items[idx], colWidths[c]));
        }
      }
      totalH += rowMax + (r > 0 ? g : 0);
    }
    return totalH + 0.08;
  }
  if (t === "flex") return 1.1;
  if (t === "arrow") return 0.4;
  return 0.6;
}

function measureChildrenH(children, w) {
  let h = 0.1; // top padding
  for (let i = 0; i < children.length; i++) {
    h += measureH(children[i], w) + (i > 0 ? GAP.sm : 0);
  }
  return Math.max(0.35, h + 0.08); // bottom padding buffer
}

module.exports = { exportNativePptx };
