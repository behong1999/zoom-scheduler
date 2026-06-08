#!/usr/bin/env node

/**
 * scheduler.js — Opens a Zoom meeting every Friday at 9:58am
 * Skips German public holidays for Hessen (HE).
 *
 * Run via launchd (installed by install.sh) or manually:
 *   node scheduler.js
 */

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const CONFIG_PATH = path.join(__dirname, "config.json");
const LOG_PATH = path.join(__dirname, "scheduler.log");

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(LOG_PATH, line);
  process.stdout.write(line);
}

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
}

// Public holidays for Hessen (HE) — updated yearly as needed.
// Format: "MM-DD" for fixed holidays, full "YYYY-MM-DD" for Easter-based ones.
function getHessianHolidays(year) {
  // Easter Sunday calculation (Anonymous Gregorian algorithm)
  const f = Math.floor;
  const G = year % 19;
  const C = f(year / 100);
  const H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30;
  const I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11));
  const J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7;
  const L = I - J;
  const easterMonth = 3 + f((L + 40) / 44);
  const easterDay = L + 28 - 31 * f(easterMonth / 4);
  const easter = new Date(year, easterMonth - 1, easterDay);

  const addDays = (d, n) => {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
  };

  const fmt = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

  return new Set([
    `${year}-01-01`, // Neujahr
    `${year}-01-06`, // Heilige Drei Könige (not HE, but harmless)
    fmt(addDays(easter, -2)), // Karfreitag
    fmt(easter), // Ostersonntag
    fmt(addDays(easter, 1)), // Ostermontag
    `${year}-05-01`, // Tag der Arbeit
    fmt(addDays(easter, 39)), // Christi Himmelfahrt
    fmt(addDays(easter, 49)), // Pfingstsonntag
    fmt(addDays(easter, 50)), // Pfingstmontag
    fmt(addDays(easter, 60)), // Fronleichnam (HE)
    `${year}-10-03`, // Tag der Deutschen Einheit
    `${year}-12-25`, // 1. Weihnachtstag
    `${year}-12-26`, // 2. Weihnachtstag
  ]);
}

function isHoliday(date) {
  const year = date.getFullYear();
  const holidays = getHessianHolidays(year);
  const key = `${year}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
  return holidays.has(key);
}

function main() {
  const config = loadConfig();

  if (!config.enabled) {
    log("Scheduler is disabled. Exiting.");
    return;
  }

  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 5=Fri

  if (dayOfWeek !== config.schedule.dayOfWeek) {
    log(`Today is not Friday (day=${dayOfWeek}). Skipping.`);
    return;
  }

  if (isHoliday(now)) {
    log(`Today (${now.toDateString()}) is a Hessian public holiday. Skipping.`);
    return;
  }

  log(`Opening Zoom meeting: ${config.zoomUrl}`);
  try {
    execSync(`open "${config.zoomUrl}"`);
    log("Zoom opened successfully.");
  } catch (err) {
    log(`Error opening Zoom: ${err.message}`);
  }
}

main();
