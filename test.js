#!/usr/bin/env node

/**
 * test.js — Manually test the Zoom scheduler with a countdown.
 *
 * Usage:
 *   node test.js          # opens Zoom immediately
 *   node test.js 10       # 10-second countdown, then opens Zoom
 *   node test.js 30       # 30-second countdown, then opens Zoom
 */

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const CONFIG_PATH = path.join(__dirname, "config.json");

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
}

function openZoom(url) {
  console.log(`\n🚀 Opening Zoom: ${url}`);
  try {
    execSync(`open "${url}"`);
    console.log("✅ Zoom opened successfully.");
  } catch (err) {
    console.error(`❌ Error opening Zoom: ${err.message}`);
    process.exit(1);
  }
}

function countdown(seconds, url) {
  console.log(`⏳ Opening Zoom in ${seconds} second(s)... (Ctrl+C to cancel)\n`);

  let remaining = seconds;

  const interval = setInterval(() => {
    process.stdout.write(`\r   ${remaining}s remaining...`);
    remaining--;

    if (remaining < 0) {
      clearInterval(interval);
      process.stdout.write("\r                        \r");
      openZoom(url);
    }
  }, 1000);
}

const config = loadConfig();
const seconds = parseInt(process.argv[2], 10);

if (process.argv[2] !== undefined && (isNaN(seconds) || seconds < 0)) {
  console.error("Usage: node test.js [seconds]");
  console.error("  seconds must be a non-negative number");
  process.exit(1);
}

console.log(`📋 Zoom URL : ${config.zoomUrl}`);
console.log(`🔧 Enabled  : ${config.enabled}`);

if (!isNaN(seconds) && seconds > 0) {
  countdown(seconds, config.zoomUrl);
} else {
  openZoom(config.zoomUrl);
}
