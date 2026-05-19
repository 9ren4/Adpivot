# ⚡ AdRedirect

> Transform YouTube ad time into intentional productive moments.

AdRedirect is a browser extension for **Chrome** and **Microsoft Edge** that detects YouTube advertisements and automatically redirects you to a productive destination — then brings you back when the ad is over.

Instead of staring at an ad, you're in your email, your notes, or your flashcards. When the ad ends, you get a notification and optional auto-return to YouTube.

---

## Features

- **Instant redirect** — switches you to your chosen destination when an ad starts
- **URL library** — save multiple destinations and switch between them in one click
- **Auto-return** — optional automatic focus return to YouTube when the ad ends
- **Notification** — browser alert when the ad finishes
- **Minimal popup** — live status card, master toggle, settings shortcut
- **Zero analytics** — all data stays on your device, nothing is sent anywhere
- **Accessibility-first** — ARIA labels, keyboard navigation, color + text status indicators

---

## Supported Browsers

| Browser | Store | Notes |
|---|---|---|
| Google Chrome | Chrome Web Store | Full support |
| Microsoft Edge | Edge Add-ons | Same build, full support |

---

## Installation

### From a browser store (recommended)
- Chrome: [Chrome Web Store](#) *(link after publish)*
- Edge: [Edge Add-ons](#) *(link after publish)*

### Load unpacked (development)
See [Local Development](#local-development) below.

---

## How It Works

1. Extension injects a lightweight content script into YouTube
2. Three detection layers watch for ad state:
   - **MutationObserver** on `#movie_player` class changes (primary)
   - **`timeupdate` event** on the `<video>` element (secondary)
   - **2-second polling fallback** (activates only if the first two miss an end signal)
3. When an ad is detected → background service worker opens your redirect URL in a new tab
4. When the ad ends → notification fires, redirect tab closes, YouTube tab regains focus (if auto-return is on)

---

## Permissions Explained

| Permission | Why |
|---|---|
| `tabs` | Detect YouTube tabs, switch focus, close the redirect tab |
| `notifications` | Show "ad finished" alert |
| `storage` | Save your URL library and settings — locally only |
| `scripting` | Inject the ad-detection script into YouTube |
| `https://www.youtube.com/*` | Limit content script access to YouTube only |

No access to any other website's content. The extension cannot read what's on your redirect destination.

---

## Local Development

### Requirements
- Node.js 18+
- npm 9+

### Setup

```bash
# Clone the repo
git clone https://github.com/your-username/ad-redirect.git
cd ad-redirect

# Install dependencies
npm install

# Generate placeholder icons (do this once)
npm run icons

# Start dev build with hot reload
npm run dev
```

### Load into Chrome / Edge

1. Go to `chrome://extensions` (Chrome) or `edge://extensions` (Edge)
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `/dist` folder

Changes to source files rebuild automatically. Reload the extension to pick up background worker changes.

---

## Build & Package

```bash
# Type-check + production build
npm run build

# Package /dist into a zip for store submission
npm run zip
```

The zip file is named `ad-redirect-v{version}.zip` and appears in the project root.

---

## Running Tests

```bash
npm test              # single run
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
```

Tests cover: storage abstraction, runtime state, tab manager, notification, all three detection layers, and utility functions.

---

## Publishing

### Chrome Web Store
1. Run `npm run build && npm run zip`
2. Go to [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Click **New Item** → upload the zip
4. Fill in: description, 4 screenshots (1280×800), promotional tile (440×280), privacy policy URL
5. Submit for review (1–3 business days)

### Microsoft Edge Add-ons
1. Use the same zip file — no code changes needed
2. Go to [Edge Partner Center](https://partner.microsoft.com/dashboard/microsoftedge)
3. Click **Create new extension** → upload the zip
4. Fill in store listing details
5. Submit for review (3–7 business days)

**Version:** bump `manifest.json` → `"version"` before each submission.

---

## Roadmap

- [ ] Rotate through URL library per ad (random or round-robin)
- [ ] Time-of-day redirect rules (morning → journal, afternoon → tasks)
- [ ] Pomodoro mode integration
- [ ] Stretch / mindfulness reminders
- [ ] Firefox (WebExtensions API) support
- [ ] Local habit tracking dashboard

---

## Privacy

- **Zero telemetry.** No analytics, no tracking, no crash reporting.
- **Local storage only.** All settings use `chrome.storage.local` — never synced to any server.
- **Minimal permissions.** Only YouTube is accessed; the extension cannot read other pages.
- **No ad blocking.** The extension does not modify, skip, or remove ads — it just redirects your attention.

---

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-feature`
3. Make changes with tests
4. Run `npm test && npm run typecheck && npm run lint`
5. Open a pull request

---

## License

MIT — see [LICENSE](LICENSE).
