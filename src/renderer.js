"use strict";

const { getStyles } = require("./styles");
const { renderSlide } = require("./components");

/**
 * Render a complete HTML deck from a parsed slide definition.
 *
 * @param {object} deck  - The parsed YAML object with `meta` and `slides` fields.
 * @returns {string}     - Complete HTML string ready to write to a file.
 */
function renderDeck(deck, options = {}) {
  const { TAILWIND_THEME, CUSTOM_CSS, RUNTIME_JS, palette } = getStyles(options.theme || 'dark');
  const ctx = { baseDir: options.baseDir || process.cwd(), palette };
  const meta = deck.meta || {};
  const slides = Array.isArray(deck.slides) ? deck.slides : [];

  if (slides.length === 0) {
    console.warn(
      "[slidecraft] Warning: No slides found in the deck definition.",
    );
  }

  const title = meta.title || "Presentation";
  const lang = meta.lang || "en";

  // Render each slide
  const slidesHtml = slides
    .map((slide, i) => renderSlide(slide, i, ctx))
    .join("\n\n");

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="generator" content="slidecraft">
  <title>${escapeHtml(title)}</title>
  <link rel="preconnect" href="https://fonts.font.im">
  <link rel="preconnect" href="https://fonts.font.im" crossorigin>
  <link href="https://fonts.font.im/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <style type="text/tailwindcss">
    ${TAILWIND_THEME}
  </style>
  <style>${CUSTOM_CSS}
  </style>
</head>
<body>
<div class="mouse-spotlight"></div>
<div class="deck">

${slidesHtml}

</div>
<div class="nav-controls">
  <button class="nav-btn" onclick="changeSlide(-1)">&#8249;</button>
  <div class="slide-dots" id="dots"></div>
  <button class="nav-btn" onclick="changeSlide(1)">&#8250;</button>
  <span class="slide-counter" id="counter">1 / ${slides.length}</span>
</div>
<script>
${RUNTIME_JS}
</script>
</body>
</html>`;
}

/**
 * Escape HTML special characters in text content (for meta fields only).
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

module.exports = { renderDeck };
