#!/usr/bin/env node
"use strict";

const path = require("path");
const { compile } = require("../src/compiler");
const { exportPptx } = require("../src/pptx-export");
const { exportNativePptx } = require("../src/pptx-native");

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
  console.log(`
slidecraft — YAML to HTML slide builder

Usage:
  slidecraft <input_dir> [options]

Arguments:
  input_dir    Path to the directory containing layout.yaml and fig/

Options:
  --theme <name> Color theme: "dark" (default), "light", or "formal"
  --pptx         Export PPTX via screenshot (requires puppeteer + pptxgenjs)
  --pptx-native  Export editable PPTX with native elements (requires pptxgenjs)
  --out <path>   Output HTML file path (default: index.html inside input_dir)

Examples:
  slidecraft my-presentation/
  slidecraft my-presentation/ --theme light
  slidecraft my-presentation/ --theme formal
  slidecraft my-presentation/ --pptx
  slidecraft my-presentation/ --pptx-native
  slidecraft my-presentation/ --out dist/index.html

`);
  process.exit(0);
}

// ── Parse arguments ─────────────────────────────────────────────────────
let inputDir = null;
let outputPath = null;
let pptxMode = null; // "screenshot" | "native" | null
let theme = "dark";  // "dark" | "light"

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--pptx") {
    pptxMode = "screenshot";
  } else if (arg === "--pptx-native") {
    pptxMode = "native";
  } else if (arg === "--theme" && i + 1 < args.length) {
    theme = args[++i];
  } else if (arg === "--out" && i + 1 < args.length) {
    outputPath = path.resolve(args[++i]);
  } else if (!arg.startsWith("-") && !inputDir) {
    inputDir = path.resolve(arg);
  }
}

if (!inputDir) {
  console.error("✗  Error: No input directory specified.");
  process.exit(1);
}

const inputPath = path.join(inputDir, "layout.yaml");
if (!outputPath) {
  outputPath = path.join(inputDir, "index.html");
}

// ── Compile HTML ────────────────────────────────────────────────────────
compile(inputPath, outputPath, { theme })
  .then(() => {
    console.log(`✓  Built: ${outputPath}`);

    // ── Optional PPTX export ──────────────────────────────────────────
    if (pptxMode === "screenshot") {
      const pptxPath = outputPath.replace(/\.html$/, ".pptx");
      console.log("Exporting PPTX (screenshot mode)...");
      return exportPptx(outputPath, pptxPath);
    } else if (pptxMode === "native") {
      const suffix = theme !== "dark" ? "." + theme : "";
      const pptxPath = outputPath.replace(/\.html$/, suffix + ".editable.pptx");
      console.log("Exporting PPTX (native/editable mode, theme: " + theme + ")...");
      return exportNativePptx(inputPath, pptxPath, { theme });
    }
  })
  .catch((err) => {
    console.error(`✗  Error: ${err.message}`);
    if (process.env.DEBUG) console.error(err.stack);
    process.exit(1);
  });
