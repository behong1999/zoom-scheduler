#!/bin/bash
# install.sh — Sets up the Zoom Scheduler as a macOS launchd job
# Runs every Friday at 9:58am via launchd

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLIST_NAME="com.honghuynh.zoom-scheduler"
PLIST_PATH="$HOME/Library/LaunchAgents/${PLIST_NAME}.plist"
NODE_PATH="$(which node)"
LOG_DIR="$SCRIPT_DIR"

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
  <dict>
    <key>Weekday</key>
    <integer>5</integer>
    <key>Hour</key>
    <integer>9</integer>
    <key>Minute</key>
    <integer>58</integer>
  </dict>

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
echo "🎉 Done! The Zoom scheduler will run every Friday at 9:58am."
echo "   To toggle on/off: node $SCRIPT_DIR/toggle.js [on|off|status]"
echo "   To uninstall:     launchctl unload $PLIST_PATH && rm $PLIST_PATH"
