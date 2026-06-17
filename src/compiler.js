"use strict";

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { renderDeck } = require("./renderer");

/**
 * Compile a YAML slide file into an HTML output file.
 *
 * @param {string} inputPath   - Absolute path to the .yaml file
 * @param {string} outputPath  - Absolute path for the .html output
 * @returns {Promise<void>}
 */
async function compile(inputPath, outputPath, options = {}) {
  // Read input
  let raw;
  try {
    raw = fs.readFileSync(inputPath, "utf8");
  } catch (err) {
    throw new Error(`Cannot read input file "${inputPath}": ${err.message}`);
  }

  // Parse YAML
  let deck;
  try {
    deck = yaml.load(raw);
  } catch (err) {
    throw new Error(`YAML parse error in "${inputPath}": ${err.message}`);
  }

  if (!deck || typeof deck !== "object") {
    throw new Error(
      `Invalid deck definition in "${inputPath}": expected a YAML object with "meta" and "slides" keys.`,
    );
  }

  // Render HTML
  let html;
  const baseDir = path.dirname(inputPath);
  try {
    html = renderDeck(deck, { baseDir, theme: options.theme });
  } catch (err) {
    throw new Error(`Render error: ${err.message}`);
  }

  // Ensure output directory exists
  const outDir = path.dirname(outputPath);
  fs.mkdirSync(outDir, { recursive: true });

  // Write output
  try {
    fs.writeFileSync(outputPath, html, "utf8");
  } catch (err) {
    throw new Error(`Cannot write output file "${outputPath}": ${err.message}`);
  }
}

module.exports = { compile };
