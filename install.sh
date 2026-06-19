#!/bin/bash
# install.sh — Sets up the Zoom Scheduler as a macOS launchd job
# Schedule is read from config.json (schedule.hour / schedule.minute / schedule.dayOfWeek)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLIST_NAME="com.honghuynh.zoom-scheduler"
PLIST_PATH="$HOME/Library/LaunchAgents/${PLIST_NAME}.plist"
NODE_PATH="$(which node)"
LOG_DIR="$SCRIPT_DIR"
CONFIG_PATH="$SCRIPT_DIR/config.json"

INTERVAL_XML=$("$NODE_PATH" -e "
const cfg = require('$CONFIG_PATH');
const schedules = Array.isArray(cfg.schedule) ? cfg.schedule : [cfg.schedule];
const dict = s =>
  '  <dict>\n' +
  '    <key>Weekday</key>\n    <integer>' + s.dayOfWeek + '</integer>\n' +
  '    <key>Hour</key>\n    <integer>' + s.hour + '</integer>\n' +
  '    <key>Minute</key>\n    <integer>' + s.minute + '</integer>\n' +
  '  </dict>';
if (schedules.length === 1) {
  process.stdout.write(dict(schedules[0]));
} else {
  process.stdout.write('  <array>\n' + schedules.map(dict).join('\n') + '\n  </array>');
}
")

SCHEDULE_SUMMARY=$("$NODE_PATH" -e "
const cfg = require('$CONFIG_PATH');
const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const schedules = Array.isArray(cfg.schedule) ? cfg.schedule : [cfg.schedule];
console.log(schedules.map(s => days[s.dayOfWeek] + ' at ' + s.hour + ':' + String(s.minute).padStart(2,'0')).join(', '));
")

echo "📦 Zoom Scheduler Installer"
echo "Script dir : $SCRIPT_DIR"
echo "Node path  : $NODE_PATH"
echo "Plist path : $PLIST_PATH"
echo ""

# Create LaunchAgents dir if needed
mkdir -p "$HOME/Library/LaunchAgents"

# Write the plist
cat > "$PLIST_PATH" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${PLIST_NAME}</string>

  <key>ProgramArguments</key>
  <array>
    <string>${NODE_PATH}</string>
    <string>${SCRIPT_DIR}/scheduler.js</string>
  </array>

  <key>StartCalendarInterval</key>
${INTERVAL_XML}

  <key>StandardOutPath</key>
  <string>${LOG_DIR}/scheduler.log</string>

  <key>StandardErrorPath</key>
  <string>${LOG_DIR}/scheduler.error.log</string>

  <key>RunAtLoad</key>
  <false/>
</dict>
</plist>
EOF

echo "✅ Plist written to $PLIST_PATH"

# Unload if already loaded
launchctl unload "$PLIST_PATH" 2>/dev/null || true

# Load the job
launchctl load "$PLIST_PATH"
echo "✅ LaunchAgent loaded"

echo ""
echo "🎉 Done! The Zoom scheduler will run: ${SCHEDULE_SUMMARY}."
echo "   To toggle on/off: node $SCRIPT_DIR/toggle.js [on|off|status]"
echo "   To uninstall:     launchctl unload $PLIST_PATH && rm $PLIST_PATH"
