"use strict";

const { BLOB_ANCHORS, DEFAULT_BLOBS } = require("./defaults");
const katex = require("katex");

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse inline markdown: **bold** and *italic*.
 * Intentionally minimal — allows raw HTML to pass through unchanged.
 */
function md(text) {
  if (text == null) return "";
  let s = String(text);
  // Inline math: $...$  (process before bold/italic to avoid conflicts)
  s = s.replace(/\$([^$]+?)\$/g, (_, tex) => {
    try {
      return katex.renderToString(tex, { throwOnError: false, displayMode: false });
    } catch (_) {
      return `<code class="inline-math">${tex}</code>`;
    }
  });
  return s
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--color-text)">$1</strong>')
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

/**
 * Convert a hex color and alpha to an rgba() CSS value.
 */
function hexToRgba(hex, alpha) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!r) return `rgba(255,255,255,${alpha})`;
  return `rgba(${parseInt(r[1], 16)},${parseInt(r[2], 16)},${parseInt(r[3], 16)},${alpha})`;
}

/**
 * Resolve a `columns` spec into a CSS grid-template-columns string.
 *   2           → "repeat(2, 1fr)"
 *   [1.05,0.95] → "1.05fr .95fr"
 *   "1fr auto 1fr" → passed through unchanged
 */
function resolveColumns(columns) {
  if (columns == null) return "repeat(2, 1fr)";
  if (typeof columns === "number") return `repeat(${columns}, 1fr)`;
  if (Array.isArray(columns)) return columns.map((c) => `${c}fr`).join(" ");
  return String(columns);
}

/**
 * Convert a gap/margin value: number → "{n}rem", string → unchanged.
 */
function cssVal(v, defaultVal = "0") {
  if (v == null) return defaultVal;
  if (typeof v === "number") return `${v}rem`;
  return String(v);
}

// ─────────────────────────────────────────────────────────────────────────────
// Component Registry
// ─────────────────────────────────────────────────────────────────────────────

const RENDERERS = {};

function register(type, fn) {
  RENDERERS[type] = fn;
}

/**
 * Main render dispatcher.
 * @param {object|object[]|string} node  - Component node, array of nodes, or raw string
 * @param {object} ctx                   - Rendering context (inGrid, inCard, etc.)
 * @returns {string} HTML fragment
 */
function render(node, ctx = {}) {
  if (node == null) return "";
  if (typeof node === "string") return md(node);
  if (Array.isArray(node)) return node.map((n) => render(n, ctx)).join("\n");

  const { type } = node;
  if (!type) {
    console.warn(
      '[slidecraft] Component missing "type" field:',
      JSON.stringify(node),
    );
    return "<!-- missing type -->";
  }

  const fn = RENDERERS[type];
  if (!fn) {
    console.warn(`[slidecraft] Unknown component type: "${type}"`);
    return `<!-- unknown component: ${type} -->`;
  }

  return fn(node, ctx);
}

// ─────────────────────────────────────────────────────────────────────────────
// Primitive Components
// ─────────────────────────────────────────────────────────────────────────────

/**
 * text — Renders a <p> with optional styling presets.
 *
 * Properties:
 *   text        {string}  Content (supports **bold** / *italic*)
 *   style       {string}  "body" | "small" | "heading" | "title" | "default"
 *   color       {string}  CSS color
 *   weight      {string}  font-weight value
 *   margin      {string}  CSS margin shorthand
 *   extra_style {string}  Additional raw CSS
 */
register("text", (node) => {
  const {
    text = "",
    style: textStyle = "body",
    color,
    weight,
    margin,
    extra_style = "",
  } = node;

  let cls = "";
  let inlineStyle = "";

  switch (textStyle) {
    case "body":
      cls = "body";
      inlineStyle = `margin:${margin != null ? margin : "0"};`;
      break;
    case "small":
      cls = "small";
      inlineStyle = `margin:${margin != null ? margin : "0"};`;
      break;
    case "heading":
      cls = "text-heading";
      inlineStyle = `font-size:.78rem;font-weight:700;color:${color || "var(--color-text)"};margin:${margin != null ? margin : "0 0 .25rem"};`;
      break;
    case "title":
      inlineStyle = `font-family:'Instrument Serif',serif;font-size:clamp(1.45rem,3vw,2.15rem);font-weight:600;line-height:1.2;margin:${margin != null ? margin : "0"};`;
      break;
    default:
      inlineStyle = margin != null ? `margin:${margin};` : "";
  }

  if (color && textStyle !== "heading") inlineStyle += `color:${color};`;
  if (weight) inlineStyle += `font-weight:${weight};`;
  if (extra_style) inlineStyle += extra_style;

  const classAttr = cls ? ` class="${cls}"` : "";
  const styleAttr = inlineStyle ? ` style="${inlineStyle}"` : "";

  return `<p${classAttr}${styleAttr}>${md(text)}</p>`;
});

/**
 * label — Renders a .section-label element (small uppercase label).
 *
 * Properties:
 *   text  {string}  Label text (displayed uppercase via CSS)
 *   color {string}  Optional accent color
 */
register("label", (node) => {
  const { text = "", color } = node;
  const styleAttr = color ? ` style="color:${color}"` : "";
  return `<div class="section-label"${styleAttr}>${text}</div>`;
});

/**
 * badge — Renders a colored badge chip.
 *
 * Properties:
 *   text    {string}  Badge text
 *   variant {string}  "b1" | "b2" | "b3" | "b4" | "b5"
 */
register("badge", (node) => {
  const { text = "", variant = "b1" } = node;
  return `<span class="badge ${variant}">${text}</span>`;
});

/**
 * formula — Renders a monospace formula/code block using KaTeX.
 *
 * Properties:
 *   text       {string}  Formula content (LaTeX format)
 *   note       {string}  Optional description text shown below
 *   margin     {string}  CSS margin
 *   extra_style {string} Extra CSS for the formula box
 */
register("formula", (node) => {
  const { text = "", note, margin, extra_style = "" } = node;
  let styleStr = extra_style;
  if (margin) styleStr = `margin:${margin};${styleStr}`;
  const styleAttr = styleStr ? ` style="${styleStr}"` : "";
  let renderedFormula = text;
  try {
    renderedFormula = katex.renderToString(text, {
      throwOnError: false,
      displayMode: true,
    });
  } catch (e) {
    console.error("[slidecraft] KaTeX error:", e);
  }
  let html = `<div class="formula"${styleAttr}>\n${renderedFormula}</div>`;
  if (note) {
    html += `\n<p class="small" style="margin:.5rem 0 0">${md(note)}</p>`;
  }
  return html;
});

/**
 * code — Renders a monospace code block.
 *
 * Properties:
 *   text       {string}  Code content
 *   note       {string}  Optional description text shown below
 *   margin     {string}  CSS margin
 *   extra_style {string} Extra CSS for the code box
 */
register("code", (node) => {
  const { text = "", note, margin, extra_style = "" } = node;
  let styleStr = extra_style;
  if (margin) styleStr = `margin:${margin};${styleStr}`;
  const styleAttr = styleStr ? ` style="${styleStr}"` : "";
  const escapedText = String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  let html = `<div class="formula"${styleAttr}><pre style="margin:0;white-space:pre-wrap;"><code>${escapedText}</code></pre></div>`;
  if (note) {
    html += `\n<p class="small" style="margin:.5rem 0 0">${md(note)}</p>`;
  }
  return html;
});

/**
 * image — Renders an image inside a white card.
 *
 * Properties:
 *   src    {string} Image filename (e.g. "my-image.png") inside the fig/ folder.
 *   accent {string} Accent color for the card border (e.g., "blue").
 */
register("image", (node) => {
  const { src = "", accent = "blue" } = node;
  const accentClass = accent ? ` card-${accent}` : "";
  const styleStr = `background:#ffffff;padding:.5rem;display:flex;justify-content:center;align-items:center;width:100%;flex:1;min-height:0;margin-top:auto;`;
  return `<div class="card reveal${accentClass}" style="${styleStr}">
  <img src="fig/${src}" alt="${src}" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:8px;" />
</div>`;
});

/**
 * arrow — Renders a centered story arrow.
 *
 * Properties:
 *   text {string}  Arrow character (default: "⟶")
 */
register("arrow", (node) => {
  const { text = "⟶" } = node;
  return `<div class="story-arrow">${text}</div>`;
});

/**
 * bar — Renders the gradient memory bar with optional labels.
 *
 * Properties:
 *   labels {string[]}  Labels displayed below the bar (left to right)
 */
register("bar", (node) => {
  const { labels = [] } = node;
  let html = `<div class="memory-bar"></div>`;
  if (labels.length > 0) {
    const labelsHtml = labels
      .map((l) => `<span class="small">${l}</span>`)
      .join("");
    html += `\n<div style="display:flex;justify-content:space-between;margin-top:.35rem">${labelsHtml}</div>`;
  }
  return html;
});

/**
 * emoji — Renders a large centered emoji (for title slides).
 *
 * Properties:
 *   icon    {string}   The emoji character
 *   animate {boolean}  Float animation (default: true)
 *   size    {string}   Font size (default: "78px")
 *   margin  {string}   Bottom margin (default: ".8rem")
 */
register("emoji", (node) => {
  const { icon = "✨", animate = true, size = "78px", margin = ".8rem" } = node;
  const animStyle = animate ? "animation:float 3.5s ease-in-out infinite;" : "";
  return `<div class="reveal" style="font-size:${size};margin-bottom:${margin};${animStyle}">${icon}</div>`;
});

/**
 * spacer — Renders an invisible height spacer.
 *
 * Properties:
 *   height {string}  CSS height value (default: "0.8rem")
 */
register("spacer", (node) => {
  const { height = "0.8rem" } = node;
  return `<div style="height:${height}"></div>`;
});

/**
 * divider — Renders a thin horizontal divider line.
 */
register("divider", () => {
  return `<div class="divider"></div>`;
});

/**
 * raw — Renders raw HTML content (escape hatch for advanced use).
 *
 * Properties:
 *   html {string}  Raw HTML to inject
 */
register("raw", (node) => {
  return node.html || "";
});

// ─────────────────────────────────────────────────────────────────────────────
// Composite Components
// ─────────────────────────────────────────────────────────────────────────────

/**
 * card — Glass card with optional left-border accent.
 *
 * Properties:
 *   accent      {string}    "blue"|"purple"|"green"|"orange"|"red"|"none"
 *   children    {node[]}    Child components
 *   reveal      {boolean}   Add .reveal class (default: true in grid context)
 *   height      {string}    CSS height (e.g., "100%")
 *   margin_top  {string}    CSS margin-top
 *   extra_style {string}    Additional CSS
 */
register("card", (node, ctx = {}) => {
  const {
    accent,
    children = [],
    reveal: revealOverride,
    height,
    margin_top,
    extra_style = "",
  } = node;

  // Default: reveal when inside a grid, skip otherwise
  const shouldReveal =
    revealOverride !== false && (revealOverride === true || ctx.inGrid);
  const revealClass = shouldReveal ? " reveal" : "";
  const accentClass = accent ? ` card-${accent}` : "";

  let styleStr = extra_style;
  if (height) styleStr = `height:${height};${styleStr}`;
  if (margin_top) styleStr = `margin-top:${margin_top};${styleStr}`;

  const styleAttr = styleStr ? ` style="${styleStr}"` : "";
  const childrenHtml = render(children, {
    ...ctx,
    inCard: true,
    inGrid: false,
  });

  return `<div class="card${accentClass}${revealClass}"${styleAttr}>${childrenHtml}</div>`;
});

/**
 * mini-card — Small colored content block (used inside nested grids).
 * Produces a colored-background box, lighter than a full card.
 *
 * Properties:
 *   color   {string}  Hex accent color (e.g., "#60a5fa")
 *   label   {string}  Bold label text
 *   text    {string}  Body text
 *   align   {string}  Text alignment (default: "left")
 *   padding {string}  CSS padding (default: ".6rem")
 */
register("mini-card", (node) => {
  const {
    color = "#60a5fa",
    label = "",
    text = "",
    align = "left",
    padding = ".6rem",
  } = node;
  const bg = hexToRgba(color, 0.07);
  return `<div style="background:${bg};padding:${padding};border-radius:10px;text-align:${align}">
  <p style="font-size:.7rem;font-weight:700;color:${color};margin:0 0 .2rem">${md(label)}</p>
  <p class="small" style="margin:0">${md(text)}</p>
</div>`;
});

/**
 * level-bar — Colored horizontal bar with label + text (like the layer stacks in slides 7/9).
 *
 * Properties:
 *   color   {string}  Hex accent color
 *   label   {string}  Bold label
 *   text    {string}  Description text
 *   padding {string}  CSS padding (default: ".55rem .75rem")
 */
register("level-bar", (node) => {
  const {
    color = "#60a5fa",
    label = "",
    text = "",
    padding = ".55rem .75rem",
  } = node;
  const bg = hexToRgba(color, 0.07);
  return `<div style="background:${bg};padding:${padding};border-radius:8px">
  <p style="font-size:.7rem;color:${color};font-weight:700;margin:0">${md(label)}</p>
  <p class="small" style="margin:0">${md(text)}</p>
</div>`;
});

/**
 * icon-item — An icon circle paired with a title and body text.
 * Used frequently in lists inside cards.
 *
 * Properties:
 *   icon      {string}  Emoji or symbol
 *   title     {string}  Bold title
 *   body      {string}  Description text
 *   body_size {string}  "small" | "body" (default: "small")
 *   gap       {string}  Gap between icon and text (default: ".6rem")
 */
register("icon-item", (node) => {
  const {
    icon = "✨",
    title = "",
    body = "",
    body_size = "small",
    gap = ".6rem",
  } = node;
  const bodyClass = body_size === "body" ? "body" : "small";
  return `<div style="display:flex;gap:${gap};align-items:flex-start">
  <div class="icon-circle">${icon}</div>
  <div>
    <p style="font-size:.75rem;font-weight:700;color:var(--color-text);margin:0 0 .15rem">${md(title)}</p>
    <p class="${bodyClass}" style="margin:0">${md(body)}</p>
  </div>
</div>`;
});

/**
 * icon-card — A centered card with a large emoji, title, and subtitle.
 * Used for icon grid rows (e.g., the 5-cell memory spectrum in slide 10).
 *
 * Properties:
 *   icon     {string}  Emoji
 *   title    {string}  Bold title
 *   subtitle {string}  Smaller description
 */
register("icon-card", (node) => {
  const { icon = "✨", title = "", subtitle = "" } = node;
  return `<div class="card reveal" style="text-align:center">
  <p class="icon-card-icon" style="font-size:1rem;margin:0 0 .15rem">${icon}</p>
  <p style="font-size:.66rem;color:var(--color-text);font-weight:700;margin:0 0 .1rem">${md(title)}</p>
  <p class="small" style="margin:0">${md(subtitle)}</p>
</div>`;
});

/**
 * callout — Bottom summary box with accent styling.
 *
 * Properties:
 *   text     {string}  Shorthand text content (supports **bold**)
 *   children {node[]}  OR use children for complex content
 *   icon     {string}  Optional icon emoji (default: 💡)
 *   extra_style {string} Extra CSS
 */
register("callout", (node, ctx) => {
  const { text, children = [], icon = "💡", extra_style = "" } = node;
  const inner = text
    ? `<p class="callout-text">${md(text)}</p>`
    : render(children, ctx);
  const styleAttr = extra_style ? ` style="${extra_style}"` : "";
  return `<div class="reveal callout"${styleAttr}><span class="callout-icon">${icon}</span><div class="callout-body">${inner}</div></div>`;
});

/**
 * tag-row — A horizontal row of badge chips.
 *
 * Properties:
 *   tags       {Array}   Array of {text, variant} objects
 *   justify    {string}  "center" | "start" | "end" | "flex-start" (default: "center")
 *   wrap       {boolean} Allow wrapping (default: true)
 *   gap        {string}  Gap between tags (default: ".7rem")
 *   margin_top {string}  Top margin
 */
register("tag-row", (node) => {
  const {
    tags = [],
    justify = "center",
    wrap = true,
    gap = ".7rem",
    margin_top,
  } = node;
  const wrapStyle = wrap ? "flex-wrap:wrap;" : "";
  const marginStyle = margin_top ? `margin-top:${margin_top};` : "";
  const tagsHtml = tags
    .map(
      (t) => `<span class="badge ${t.variant || "b1"}">${t.text || ""}</span>`,
    )
    .join("");
  return `<div class="reveal" style="display:flex;gap:${gap};justify-content:${justify};${wrapStyle}${marginStyle}">${tagsHtml}</div>`;
});

/**
 * icon-items-stack — A vertical stack of icon-item rows inside a card.
 * Shorthand for a flex-column layout of icon-items.
 *
 * Properties:
 *   items {Array}  Array of {icon, title, body} objects
 *   gap   {string} Gap between items (default: ".6rem")
 */
register("icon-items-stack", (node) => {
  const { items = [], gap = ".6rem", margin_top = ".5rem" } = node;
  const itemsHtml = items
    .map((item) => render({ type: "icon-item", ...item }))
    .join("\n");
  return `<div style="display:flex;flex-direction:column;gap:${gap};margin-top:${cssVal(margin_top)}">${itemsHtml}</div>`;
});

/**
 * level-bars-stack — A vertical stack of level-bar rows.
 * Shorthand for a flex-column layout of level-bars (like the layer diagrams).
 *
 * Properties:
 *   items {Array}  Array of {color, label, text} objects
 *   gap   {string} Gap between bars (default: ".45rem")
 */
register("level-bars-stack", (node) => {
  const { items = [], gap = ".45rem", margin_top = ".4rem" } = node;
  const itemsHtml = items
    .map((item) => render({ type: "level-bar", ...item }))
    .join("\n");
  return `<div style="display:flex;flex-direction:column;gap:${gap};margin-top:${cssVal(margin_top)}">${itemsHtml}</div>`;
});

/**
 * progress-bar — Horizontal progress bar with label and numeric value.
 * Great for visualizing scores, AUC, percentages, etc.
 *
 * Properties:
 *   value   {number}  0–1 value controlling bar width
 *   label   {string}  Left-aligned label text
 *   color   {string}  Hex accent color (default: "#60a5fa")
 */
register("progress-bar", (node) => {
  const { value = 0, label = "", color = "#60a5fa" } = node;
  const pct = Math.min(100, Math.max(0, Math.round(value * 100)));
  const bg = hexToRgba(color, 0.07);
  return `<div class="reveal" style="margin-bottom:.4rem">
    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:.2rem">
      <span class="small" style="font-weight:600;color:var(--color-text)">${md(label)}</span>
      <span class="small" style="color:${color};font-weight:700">${value.toFixed(4)}</span>
    </div>
    <div style="height:8px;border-radius:4px;background:${bg};overflow:hidden">
      <div style="height:100%;width:${pct}%;border-radius:4px;background:${color}"></div>
    </div>
  </div>`;
});

/**
 * progress-bars-stack — A vertical stack of progress-bar rows.
 *
 * Properties:
 *   items {Array}  Array of {value, label, color} objects
 *   gap   {string} Gap between bars (default: ".35rem")
 */
register("progress-bars-stack", (node) => {
  const { items = [], gap = ".35rem", margin_top = ".4rem" } = node;
  const itemsHtml = items
    .map((item) => render({ type: "progress-bar", ...item }))
    .join("\n");
  return `<div style="display:flex;flex-direction:column;gap:${gap};margin-top:${cssVal(margin_top)}">${itemsHtml}</div>`;
});

// ─────────────────────────────────────────────────────────────────────────────
// Layout Components
// ─────────────────────────────────────────────────────────────────────────────

/**
 * grid — CSS grid layout container.
 *
 * Properties:
 *   columns    {number|string|number[]}  Column spec (see resolveColumns)
 *   gap        {string|number}           Grid gap (default: "0.75rem")
 *   align      {string}                 align-items value (default: "start")
 *   margin_top {string|number}          Top margin
 *   reveal     {boolean}                Animate the whole grid as one unit (default: false)
 *   items      {node[]}                 Child components
 */
register("grid", (node, ctx = {}) => {
  const {
    columns = 2,
    gap = "0.75rem",
    align = "stretch",
    margin_top,
    reveal: gridReveal = false,
    items = [],
  } = node;

  const colsStr = resolveColumns(columns);
  const gapStr = cssVal(gap, "0.75rem");
  let styleStr = `display:grid;grid-template-columns:${colsStr};gap:${gapStr};align-items:${align};`;
  if (margin_top != null) styleStr += `margin-top:${cssVal(margin_top)};`;

  const classes = gridReveal ? "reveal" : "";
  const classAttr = classes ? ` class="${classes}"` : "";
  const itemsHtml = render(items, { ...ctx, inGrid: true });

  return `<div${classAttr} style="${styleStr}">${itemsHtml}</div>`;
});

/**
 * flex — Flexbox layout container.
 *
 * Properties:
 *   direction  {string}  "row" | "column" (default: "row")
 *   gap        {string}  Gap (default: ".6rem")
 *   align      {string}  align-items value (default: "center")
 *   justify    {string}  justify-content value (default: "flex-start")
 *   wrap       {boolean} flex-wrap (default: false)
 *   margin_top {string}  Top margin
 *   children   {node[]}  Child components
 */
register("flex", (node, ctx = {}) => {
  const {
    direction = "row",
    gap = ".6rem",
    align = "center",
    justify = "flex-start",
    wrap = false,
    margin_top,
    children = [],
  } = node;

  let styleStr = `display:flex;flex-direction:${direction};gap:${cssVal(gap, ".6rem")};align-items:${align};justify-content:${justify};`;
  if (wrap) styleStr += "flex-wrap:wrap;";
  if (margin_top != null) styleStr += `margin-top:${cssVal(margin_top)};`;

  const childrenHtml = render(children, ctx);
  return `<div style="${styleStr}">${childrenHtml}</div>`;
});

/**
 * data-table — Academic three-line (booktabs) table for slide presentations.
 *
 * Properties:
 *   caption        {string}   Table caption (rendered above by default)
 *   caption_side   {string}   "top" | "bottom" (default: "top")
 *   columns        {Array}    Column definitions:
 *                               label          {string}   Header text (markdown OK)
 *                               key            {string}   Matching key in each row object
 *                               align          {string}   "left"|"center"|"right" (default: "center"; first col defaults "left")
 *                               decimals       {number}   Decimal places for numeric display
 *                               heatmap        {boolean}  Enable value-based color gradient
 *                               heatmap_color  {string}   "a1"–"a5" or "#rrggbb" (default: "a1")
 *                               heatmap_low    {number}   Value mapped to min opacity (default: column min)
 *                               heatmap_high   {number}   Value mapped to max opacity (default: column max)
 *                               heatmap_reverse {boolean} Reverse gradient direction (default: false)
 *   rows           {Array}    Row data objects. Keys match column `key` fields.
 *                             Special row key: _highlight {boolean} — visually emphasise entire row
 *                             Cell values may be plain scalars or objects:
 *                               {v, bold, underline, accent, color}
 *   margin_top     {string}   CSS margin-top
 *   font_size      {string}   Override table font-size
 */
register("data-table", (node, ctx = {}) => {
  const {
    caption,
    caption_side = "top",
    columns = [],
    rows = [],
    margin_top,
    font_size,
  } = node;

  const p = ctx.palette || {};

  // ── Helper: resolve heatmap color spec → "R,G,B" string ───────────────
  function resolveHeatRgb(spec) {
    const map = {
      a1: p.a1Rgb || "96,165,250",
      a2: p.a2Rgb || "167,139,250",
      a3: p.a3Rgb || "52,211,153",
      a4: p.a4Rgb || "251,146,60",
      a5: p.a5Rgb || "248,113,113",
    };
    if (!spec) return map.a1;
    if (map[spec]) return map[spec];
    // Hex "#rrggbb"
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(spec);
    if (r) return `${parseInt(r[1], 16)},${parseInt(r[2], 16)},${parseInt(r[3], 16)}`;
    return map.a1;
  }

  // ── Helper: parse a cell value ─────────────────────────────────────────
  function parseCell(raw) {
    if (raw == null) return { value: "", bold: false, underline: false, accent: false, color: null };
    if (typeof raw === "object" && !Array.isArray(raw)) {
      return {
        value: raw.v ?? raw.value ?? "",
        bold: raw.bold || false,
        underline: raw.underline || false,
        accent: raw.accent || false,
        color: raw.color || null,
      };
    }
    return { value: raw, bold: false, underline: false, accent: false, color: null };
  }

  // ── Helper: compute unique sorted values for markings ─────────────────
  function computeMarkings(vals, order) {
    const sorted = [...new Set(vals)].sort((a, b) => order === "asc" ? a - b : b - a);
    return { best: sorted[0], second: sorted[1] };
  }

  // ── Precompute column heatmap ranges ─────────────────────────────────
  const colHeatmap = {};
  columns.forEach((col) => {
    if (!col.heatmap) return;
    const key = col.key;
    const vals = rows
      .map((r) => parseFloat(parseCell(r[key]).value))
      .filter((v) => !isNaN(v));
    if (!vals.length) return;
    const lo = col.heatmap_low  != null ? col.heatmap_low  : Math.min(...vals);
    const hi = col.heatmap_high != null ? col.heatmap_high : Math.max(...vals);
    const rgb = resolveHeatRgb(col.heatmap_color);
    const [aMin, aMax] = Array.isArray(p.tableHeatAlpha) ? p.tableHeatAlpha : [0.06, 0.35];
    colHeatmap[key] = { lo, hi, rgb, reverse: col.heatmap_reverse || false, aMin, aMax };
  });

  // ── Precompute column markings ───────────────────────────────────────
  const colMarkings = {};
  columns.forEach((col) => {
    if (!col.markings) return;
    const key = col.key;
    const vals = rows
      .map((r) => parseFloat(parseCell(r[key]).value))
      .filter((v) => !isNaN(v));
    if (!vals.length) return;
    colMarkings[key] = computeMarkings(vals, col.markings_order || "desc");
  });

  // ── Precompute row heatmap ───────────────────────────────────────────
  const rowHeatmap = {};
  rows.forEach((row, ri) => {
    if (!row._row_heatmap) return;
    const vals = columns
      .map((col) => parseFloat(parseCell(row[col.key]).value))
      .filter((v) => !isNaN(v));
    if (!vals.length) return;
    const lo = row._row_heatmap_low  != null ? row._row_heatmap_low  : Math.min(...vals);
    const hi = row._row_heatmap_high != null ? row._row_heatmap_high : Math.max(...vals);
    const rgb = resolveHeatRgb(row._row_heatmap_color);
    const [aMin, aMax] = Array.isArray(p.tableHeatAlpha) ? p.tableHeatAlpha : [0.06, 0.35];
    rowHeatmap[ri] = { lo, hi, rgb, reverse: row._row_heatmap_reverse || false, aMin, aMax };
  });

  // ── Precompute row markings ──────────────────────────────────────────
  const rowMarkings = {};
  rows.forEach((row, ri) => {
    if (!row._row_markings) return;
    const vals = columns
      .map((col) => parseFloat(parseCell(row[col.key]).value))
      .filter((v) => !isNaN(v));
    if (!vals.length) return;
    rowMarkings[ri] = computeMarkings(vals, row._row_markings_order || "desc");
  });

  // ── Build <thead> ──────────────────────────────────────────────────────
  const thHtml = columns
    .map((col, ci) => {
      const defaultAlign = ci === 0 ? "left" : "center";
      const align = col.align || defaultAlign;
      const label = col.label ?? col.key ?? "";
      return `<th style="text-align:${align}">${md(String(label))}</th>`;
    })
    .join("");

  // ── Build <tbody> ──────────────────────────────────────────────────────
  const tbodyHtml = rows
    .map((row, ri) => {
      const isHlRow = row._highlight === true;
      const rowClass = isHlRow ? ' class="sc-row-hl"' : "";

      const tdHtml = columns
        .map((col, ci) => {
          const key = col.key;
          const parsed = parseCell(row[key]);
          let { value, accent, color } = parsed;
          let bold = parsed.bold;
          let underline = parsed.underline;

          // Format numeric value
          const numVal = parseFloat(value);
          let displayText;
          if (value !== "" && !isNaN(numVal)) {
            displayText =
              col.decimals != null ? numVal.toFixed(col.decimals) : String(value);
          } else {
            displayText = String(value ?? "");
          }
          displayText = md(displayText);

          // Apply column markings (auto bold/underline)
          const cm = colMarkings[key];
          if (cm && !isNaN(numVal) && value !== "") {
            if (numVal === cm.best) bold = true;
            else if (cm.second != null && numVal === cm.second) underline = true;
          }

          // Apply row markings (auto bold/underline)
          const rm = rowMarkings[ri];
          if (rm && !isNaN(numVal) && value !== "") {
            if (numVal === rm.best) bold = true;
            else if (rm.second != null && numVal === rm.second) underline = true;
          }

          // Compute heatmap background (column or row, row takes priority)
          let bgStyle = "";
          const chm = colHeatmap[key];
          if (chm && !isNaN(numVal) && value !== "") {
            let t = chm.hi > chm.lo ? (numVal - chm.lo) / (chm.hi - chm.lo) : 0.5;
            if (chm.reverse) t = 1 - t;
            t = Math.max(0, Math.min(1, t));
            const alpha = (chm.aMin + t * (chm.aMax - chm.aMin)).toFixed(3);
            bgStyle = `background:rgba(${chm.rgb},${alpha});`;
          }
          const rhm = rowHeatmap[ri];
          if (rhm && !isNaN(numVal) && value !== "") {
            let t = rhm.hi > rhm.lo ? (numVal - rhm.lo) / (rhm.hi - rhm.lo) : 0.5;
            if (rhm.reverse) t = 1 - t;
            t = Math.max(0, Math.min(1, t));
            const alpha = (rhm.aMin + t * (rhm.aMax - rhm.aMin)).toFixed(3);
            bgStyle = `background:rgba(${rhm.rgb},${alpha});`;
          }

          // Build CSS classes
          const cls = [
            bold ? "sc-cell-bold" : "",
            underline ? "sc-cell-ul" : "",
            accent ? "sc-cell-accent" : "",
          ]
            .filter(Boolean)
            .join(" ");

          const defaultAlign = ci === 0 ? "left" : "center";
          const align = col.align || defaultAlign;
          let tdStyle = `text-align:${align};`;
          if (bgStyle) tdStyle += bgStyle;
          if (color) tdStyle += `color:${color};`;

          const classAttr = cls ? ` class="${cls}"` : "";
          return `<td${classAttr} style="${tdStyle}">${displayText}</td>`;
        })
        .join("");

      return `<tr${rowClass}>${tdHtml}</tr>`;
    })
    .join("");

  // ── Caption ───────────────────────────────────────────────────────────
  const capClass = caption_side === "bottom" ? " cap-bottom" : "";
  const captionHtml = caption
    ? `<caption class="sc-cap${capClass}" style="caption-side:${caption_side}">${md(String(caption))}</caption>`
    : "";

  // ── Wrapper style ─────────────────────────────────────────────────────
  let wrapStyle = "";
  if (margin_top) wrapStyle += `margin-top:${cssVal(margin_top)};`;
  if (font_size) wrapStyle += `font-size:${font_size};`;
  const wrapStyleAttr = wrapStyle ? ` style="${wrapStyle}"` : "";

  return `<div class="sc-table reveal"${wrapStyleAttr}>
<table>
  ${captionHtml}
  <thead><tr>${thHtml}</tr></thead>
  <tbody>${tbodyHtml}</tbody>
</table>
</div>`;
});

// ─────────────────────────────────────────────────────────────────────────────
// Slide-Level Rendering
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Render the background gradient mesh (blobs).
 * @param {object} background  - { blobs: [...] }
 */
function renderBackground(background) {
  const blobs =
    background && background.blobs ? background.blobs : DEFAULT_BLOBS;
  const blobsHtml = blobs
    .map((blob) => {
      const {
        color = "#60a5fa",
        size = 350,
        opacity = 0.08,
        anchor,
        top,
        right,
        bottom,
        left,
      } = blob;
      let posStyle;
      if (anchor) {
        posStyle = BLOB_ANCHORS[anchor] || BLOB_ANCHORS["top-right"];
      } else {
        posStyle = [
          top != null
            ? `top:${typeof top === "number" ? top + "px" : top}`
            : "",
          right != null
            ? `right:${typeof right === "number" ? right + "px" : right}`
            : "",
          bottom != null
            ? `bottom:${typeof bottom === "number" ? bottom + "px" : bottom}`
            : "",
          left != null
            ? `left:${typeof left === "number" ? left + "px" : left}`
            : "",
        ]
          .filter(Boolean)
          .join(";");
      }
      return `<div class="blob" style="width:${size}px;height:${size}px;${posStyle};background:${color};opacity:${opacity}"></div>`;
    })
    .join("\n");

  return `<div class="gradient-mesh">${blobsHtml}</div>`;
}

/**
 * Render the particle canvas element (if particles are enabled).
 * @param {string|boolean} particles - "interactive" | "ambient" | false
 */
function renderParticles(particles) {
  if (!particles || particles === false || particles === "none") return "";
  const cls =
    particles === "ambient" ? "particle-canvas-ambient" : "particle-canvas";
  return `<canvas class="${cls}" style="position:absolute;inset:0;width:100%;height:100%;z-index:1"></canvas>`;
}

/**
 * Render a slide header (badge + h2 title).
 * @param {object} header  - { badge: {text, variant}, title }
 */
function renderHeader(header) {
  if (!header) return "";
  const { badge, title = "" } = header;
  const badgeHtml = badge
    ? `<span class="badge ${badge.variant || "b1"}">${badge.text || ""}</span>`
    : "";
  return `<div class="reveal" style="display:flex;align-items:center;gap:.6rem;margin-bottom:.75rem">
  ${badgeHtml}
  <h2 class="title">${md(title)}</h2>
</div>`;
}

/**
 * Render a TITLE slide (centered, full-screen).
 *
 * Slide YAML fields:
 *   layout:       title
 *   background:   { blobs: [...] }
 *   particles:    interactive | ambient | false
 *   icon:         "🧠"
 *   icon_animate: true
 *   icon_size:    "78px"
 *   badge:        { text, variant }
 *   title:        "Main Title"
 *   title_gradient: true   (default: true — gradient text)
 *   subtitle:     "Subtitle text"
 *   tags:         [{text, variant}, ...]
 *   extra_content: []      (additional nodes below tags)
 */
function renderTitleSlide(slide, index, ctx = {}) {
  const {
    background,
    particles = "interactive",
    icon,
    icon_animate = true,
    icon_size = "78px",
    badge,
    title = "",
    title_gradient = true,
    subtitle,
    tags = [],
    extra_content = [],
  } = slide;

  const bgHtml = renderBackground(background);
  const particlesHtml = renderParticles(particles);

  const iconHtml = icon
    ? `<div class="reveal title-icon" style="font-size:${icon_size};margin-bottom:.8rem;${icon_animate ? "animation:float 3.5s ease-in-out infinite" : ""}">${icon}</div>`
    : "";

  const badgeHtml = badge
    ? `<div class="reveal" style="margin-bottom:.6rem"><span class="badge ${badge.variant || "b4"}">${badge.text || ""}</span></div>`
    : "";

  const titleStyle = title_gradient
    ? `font-family:'Instrument Serif',serif;font-size:clamp(2rem,5vw,3.8rem);font-weight:700;line-height:1.1;margin:0 0 .7rem;background:linear-gradient(135deg,#60a5fa,#a78bfa,#34d399);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text`
    : `font-family:'Instrument Serif',serif;font-size:clamp(2rem,5vw,3.8rem);font-weight:700;line-height:1.1;margin:0 0 .7rem;color:var(--color-text)`;

  const titleHtml = `<h1 class="reveal" style="${titleStyle}">${md(title)}</h1>`;

  const subtitleHtml = subtitle
    ? `<p class="reveal" style="font-size:.92rem;color:var(--color-text-muted);letter-spacing:.05em;margin:0 0 1.2rem">${md(subtitle)}</p>`
    : "";

  const tagsHtml =
    tags.length > 0
      ? `<div class="reveal" style="display:flex;gap:.7rem;justify-content:center;flex-wrap:wrap">${tags.map((t) => `<span class="badge ${t.variant || "b1"}">${t.text || ""}</span>`).join("")}</div>`
      : "";

  const extraHtml = extra_content.length > 0 ? render(extra_content, ctx) : "";

  return `<div class="slide${index === 0 ? ' active' : ''}" data-slide="${index + 1}">
  ${bgHtml}
  ${particlesHtml}
  <div class="content" style="text-align:center">
    ${iconHtml}
    ${badgeHtml}
    ${titleHtml}
    ${subtitleHtml}
    ${tagsHtml}
    ${extraHtml}
  </div>
</div>`;
}

/**
 * Render a CONTENT slide (header + body sections).
 *
 * Slide YAML fields:
 *   layout:     content
 *   background: { blobs: [...] }
 *   particles:  false | ambient
 *   header:     { badge: {text, variant}, title }
 *   body:       []   (array of component nodes)
 */
function renderContentSlide(slide, index, ctx = {}) {
  const { background, particles = false, header, body = [] } = slide;

  const bgHtml = renderBackground(background);
  const particlesHtml = renderParticles(particles);
  const headerHtml = renderHeader(header);
  const bodyHtml = render(body, { ...ctx, inGrid: false });

  const hasImage = JSON.stringify(body).includes('"type":"image"');
  const contentStyle = hasImage
    ? ' style="height: 100%; display: flex; flex-direction: column;"'
    : "";
  const innerStyle = hasImage
    ? ' style="display:flex;flex-direction:column;gap:1rem;flex:1;min-height:0;"'
    : ' style="display:flex;flex-direction:column;gap:1rem;"';

  return `<div class="slide${index === 0 ? " active" : ""}" data-slide="${index + 1}">
  ${bgHtml}
  ${particlesHtml}
  <div class="content"${contentStyle}>
    ${headerHtml}
    <div${innerStyle}>
      ${bodyHtml}
    </div>
  </div>
</div>`;
}

/**
 * Render a single slide by dispatching to the appropriate layout renderer.
 * @param {object} slide   - Slide definition from YAML
 * @param {number} index   - 0-based slide index
 */
function renderSlide(slide, index, ctx = {}) {
  const layout = slide.layout || "content";
  switch (layout) {
    case "title":
      return renderTitleSlide(slide, index, ctx);
    case "content":
      return renderContentSlide(slide, index, ctx);
    default:
      console.warn(
        `[slidecraft] Unknown slide layout: "${layout}", defaulting to "content"`,
      );
      return renderContentSlide(slide, index, ctx);
  }
}

module.exports = {
  render,
  renderSlide,
  renderBackground,
  renderParticles,
  renderHeader,
  md,
  hexToRgba,
};
