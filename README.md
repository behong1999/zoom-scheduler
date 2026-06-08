# Zoom Scheduler

Automatically opens a Zoom meeting every **Friday at 9:58am**, skipping German public holidays for **Hessen (HE)**.

## Files

| File | Purpose |
|---|---|
| `scheduler.js` | Core logic — checks day/holiday, opens Zoom |
| `toggle.js` | Enable/disable the scheduler |
| `install.sh` | Registers the job with macOS launchd |
| `config.json` | Configuration (enabled flag, URL, schedule) |

## Requirements

- macOS
- Node.js (via nvm or system install)

## Setup

```bash
cd ~/Projects/zoom-scheduler
chmod +x install.sh
bash install.sh
```

This creates a launchd plist at `~/Library/LaunchAgents/com.honghuynh.zoom-scheduler.plist` and loads it.

## Toggle On/Off

```bash
node toggle.js on      # enable
node toggle.js off     # disable
node toggle.js status  # check current state
```

## Configuration (`config.json`)

```json
{
  "enabled": true,
  "zoomUrl": "https://zoom.us/start/videomeeting",
  "schedule": {
    "dayOfWeek": 5,
    "hour": 9,
    "minute": 58
  },
  "state": "HE"
}
```

- **`zoomUrl`**: Replace with your personal Zoom meeting URL (e.g. `https://zoom.us/j/YOUR_MEETING_ID`)
- **`state`**: German federal state for holiday calculation (currently `HE` = Hessen)

## Logs

- `scheduler.log` — stdout from each run
- `scheduler.error.log` — stderr/errors

## Uninstall

```bash
launchctl unload ~/Library/LaunchAgents/com.honghuynh.zoom-scheduler.plist
rm ~/Library/LaunchAgents/com.honghuynh.zoom-scheduler.plist
```

## Holiday Coverage (Hessen)

The scheduler skips all Hessian public holidays including Easter-based ones (Karfreitag, Ostermontag, Christi Himmelfahrt, Pfingstmontag, Fronleichnam) and fixed-date national holidays.
