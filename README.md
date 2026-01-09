# Flash FM — Vice City (Neon Music Player UI)

A fan-made, **GTA Vice City–inspired** neon music player interface built with **HTML + CSS + JavaScript**.  
It features a track list panel, cover preview, and a bottom “mini player” with an animated wave + blue visualizer bars while music plays.

## Features

- **Vice City / neon UI theme**
  - Pink/purple/cyan palette
  - Sharp corners, heavy glow, arcade-style typography
- **Track list**
  - Hover a track to preview cover + metadata
  - Click to expand details (mobile-friendly)
  - “PLAY” button per track
- **Cover panel**
  - Cover sheen effect
  - EQ bars overlay while playing
  - Optional tilt animation (GSAP-enhanced)
- **Mini player**
  - Slide-up animation
  - Progress bar
  - Prev / Play-Pause / Next
  - Volume slider + mute toggle
  - Animated **cyan “wave” visualizer bars** while playing
- **Keyboard shortcuts**
  - `Space`: Play/Pause
  - `←` / `→`: Previous / Next
- **Graceful fallback**
  - Works without GSAP (animations are reduced/disabled)
  - Track list has fallback HTML if JS fails

## Project Structure (example)

```text
.
├── flash-fm-vice-city.html
├── styles.css                # your final CSS file (or styles-hero.css etc.)
├── app.js                    # your final JS file
├── bg.jpg                    # background image (optional)
├── sc.webp                   # cover image examples (optional)
├── cm.jpg
├── dh.jpg
├── ot.jpg
├── bj.jpg
└── README.md
```

## Setup

1. Put the files in one folder.
2. Make sure your HTML links to the correct CSS/JS:

```html
<link rel="stylesheet" href="./styles.css" />
<script src="./app.js"></script>
```

3. Run with any static server (recommended):

- VS Code extension: **Live Server**
- or:

```bash
python3 -m http.server 5500
```

Then open:

```text
http://localhost:5500/flash-fm-vice-city.html
```

## Notes / Common Issues

### 1) Duplicate IDs break the UI
Make sure you only have **one** mini player and only one element per ID:
- `mini`, `bar`, `miniImg`, `miniTitle`, `prev`, `next`, `toggle`, `volume`, `muteBtn`
- and only **one** `id="list"`

### 2) Audio URLs must be direct audio files
The `<audio>` tag cannot play normal YouTube links.  
Use direct `.mp3/.ogg/.wav` URLs (or host your own).

### 3) Covers
If you reference local covers like `sc.webp`, the files must exist next to the HTML.  
If you don’t have local images yet, use placeholder URLs (e.g. `https://picsum.photos/...`).

## Credits / Disclaimer

This is a **fan-made UI concept** inspired by the aesthetic of 1980s neon and classic game menus.  
Not affiliated with Rockstar Games or GTA.

## License

Choose any license you want (MIT is common). If you want, tell me which license you prefer and I’ll add it.
