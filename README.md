# Zoom Scheduler

Automatically opens a Zoom meeting on a configurable schedule, skipping German public holidays for **Hessen (HE)**. The day and time are set in `config.json` — re-run `install.sh` after any change to apply it.

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
  "schedule": [
    { "dayOfWeek": 1, "hour": 9, "minute": 0 },
    { "dayOfWeek": 5, "hour": 10, "minute": 13 }
  ],
  "state": "HE"
}
```

- **`zoomUrl`**: Replace with your personal Zoom meeting URL (e.g. `https://zoom.us/j/YOUR_MEETING_ID`)
- **`schedule`**: Array of one or more entries — add as many day/time combinations as needed
  - **`dayOfWeek`**: `0` = Sunday, `1` = Monday, `2` = Tuesday, `3` = Wednesday, `4` = Thursday, `5` = Friday, `6` = Saturday
  - **`hour`** / **`minute`**: 24-hour time
- Re-run `install.sh` after any schedule change to apply it
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
