"use strict";

const fs = require("fs");
const path = require("path");

/**
 * Export an HTML slide deck to PPTX via Puppeteer screenshots.
 *
 * @param {string} htmlPath  - Absolute path to the compiled .html file
 * @param {string} outputPath - Absolute path for the .pptx output
 * @param {object} options    - { width, height, delay }
 */
async function exportPptx(htmlPath, outputPath, options = {}) {
  const puppeteer = require("puppeteer");
  const PptxGenJS = require("pptxgenjs");

  const width = options.width || 1920;
  const height = options.height || 1080;
  const delay = options.delay || 600; // ms to wait after slide transition

  if (!fs.existsSync(htmlPath)) {
    throw new Error(`HTML file not found: "${htmlPath}"`);
  }

  const fileUrl = `file:///${htmlPath.replace(/\\/g, "/")}`;

  // ── Launch browser ─────────────────────────────────────────────────
  console.log("  Launching browser...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });

  // ── Load HTML ──────────────────────────────────────────────────────
  console.log("  Loading slides...");
  await page.goto(fileUrl, { waitUntil: "networkidle0", timeout: 30000 });

  // Wait a bit for fonts and animations to settle
  await page.waitForTimeout(1500);

  // ── Count slides ───────────────────────────────────────────────────
  const totalSlides = await page.evaluate(() => {
    return document.querySelectorAll(".slide").length;
  });

  if (totalSlides === 0) {
    await browser.close();
    throw new Error("No slides found in the HTML file.");
  }

  console.log(`  Found ${totalSlides} slide(s). Capturing...`);

  // ── Capture each slide ─────────────────────────────────────────────
  const screenshots = [];

  for (let i = 1; i <= totalSlides; i++) {
    // Navigate to slide i
    await page.evaluate((n) => {
      window.goToSlide(n);
    }, i);

    // Wait for transition animation
    await page.waitForTimeout(delay);

    // Hide nav controls for clean screenshot
    await page.evaluate(() => {
      const nav = document.querySelector(".nav-controls");
      if (nav) nav.style.display = "none";
    });

    // Screenshot the slide
    const slideEl = await page.$(`.slide[data-slide="${i}"]`);
    if (slideEl) {
      const buf = await slideEl.screenshot({ type: "png" });
      screenshots.push(buf);
      console.log(`    ✓ Slide ${i}/${totalSlides}`);
    }

    // Restore nav controls
    await page.evaluate(() => {
      const nav = document.querySelector(".nav-controls");
      if (nav) nav.style.display = "";
    });
  }

  await browser.close();

  // ── Build PPTX ─────────────────────────────────────────────────────
  console.log("  Building PPTX...");
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "CUSTOM", width: width / 96, height: height / 96 });
  pptx.layout = "CUSTOM";

  for (let i = 0; i < screenshots.length; i++) {
    const slide = pptx.addSlide();
    slide.addImage({
      data: `data:image/png;base64,${screenshots[i].toString("base64")}`,
      x: 0,
      y: 0,
      w: width / 96,
      h: height / 96,
    });
  }

  // ── Write file ─────────────────────────────────────────────────────
  const outDir = path.dirname(outputPath);
  fs.mkdirSync(outDir, { recursive: true });
  await pptx.writeFile({ fileName: outputPath });
  console.log(`✓  Exported: ${outputPath}`);
}

module.exports = { exportPptx };
