#!/usr/bin/env node

/**
 * toggle.js — Enable or disable the Zoom scheduler
 *
 * Usage:
 *   node toggle.js on     → enables the scheduler
 *   node toggle.js off    → disables the scheduler
 *   node toggle.js status → shows current state
 */

const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "config.json");

const arg = process.argv[2];

if (!arg || !["on", "off", "status"].includes(arg)) {
  console.log("Usage: node toggle.js [on|off|status]");
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));

if (arg === "status") {
  console.log(`Zoom scheduler is currently: ${config.enabled ? "ON ✅" : "OFF 🔴"}`);
  process.exit(0);
}

config.enabled = arg === "on";
fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
console.log(`Zoom scheduler turned ${arg === "on" ? "ON ✅" : "OFF 🔴"}`);
