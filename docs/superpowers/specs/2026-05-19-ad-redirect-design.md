# AdRedirect — Design Spec

**Date:** 2026-05-19
**Status:** Approved
**Platform:** Chrome + Microsoft Edge (Manifest V3, single codebase)

---

## 1. Overview

AdRedirect is a browser extension that detects YouTube advertisements and automatically redirects the user to a pre-configured productive destination. When the ad ends, it notifies the user and optionally returns focus to the original YouTube tab. The extension repurposes passive ad-watching time into intentional micro-actions.

**Core user flow:**
1. User watches YouTube → ad starts → extension detects it
2. Extension opens the user's configured destination in a new tab and focuses it
3. Ad ends → browser notification fires: "Ad finished — your video is ready."
4. If auto-return is enabled → focus returns to YouTube tab automatically
5. Redirect tab is closed

---

## 2. Target Users

- Productivity-focused users
- ADHD and neurodivergent users
- Students and developers
- People reducing doomscrolling and attention fragmentation

---

## 3. Architecture

### Pattern: Thin Content Script + Fat Background Worker

The content script does exactly one thing: detect ad state changes and report them to the background service worker via `chrome.runtime.sendMessage`. All side effects (tab management, notifications, storage) live in the background worker which has full API access.

### Component Map

```
YouTube Tab (content script)
  └── Ad Detection Engine
        ├── Layer 1: MutationObserver (#movie_player class changes)
        ├── Layer 2: video timeupdate event listener
        └── Layer 3: polling fallback (2s, activates only after 90s uncertainty)
              │
              │ chrome.runtime.sendMessage
              ▼
Background Service Worker
  ├── Tab Manager       (open, focus, close redirect tab)
  ├── Notification      (chrome.notifications wrapper)
  ├── State Manager     (adActive, ytTabId, redirectTabId — in-memory only)
  └── Storage Abstraction (chrome.storage.local — typed wrapper)
              │
              ├── chrome.runtime.sendMessage ──► Popup UI (React)
              └── chrome.storage              ──► Settings Page (React)
                                              ──► Onboarding Page (React)
```

### Message Protocol

```ts
type Message =
  | { type: 'ad-started'; tabId: number }
  | { type: 'ad-ended';   tabId: number }
  | { type: 'get-status' }
  | { type: 'status-response'; enabled: boolean; adActive: boolean }
```

All messages are validated on receipt. Unknown shapes are silently dropped.

---

## 4. Ad Detection Engine

Three layers run concurrently. A shared `lastEmittedState` variable and 300ms debounce prevent duplicate messages.

### Layer 1 — MutationObserver (primary)
- Observes `#movie_player` for `class` attribute mutations
- `.ad-showing` present → emit `ad-started`
- `.ad-showing` absent → emit `ad-ended`
- Lowest latency, fires on DOM change

### Layer 2 — Video `timeupdate` Event (secondary)
- Listens to `<video>` element `timeupdate`
- Cross-checks: is `.ad-showing` on player? Is `video.duration < 60s`?
- Catches transitions Layer 1 misses during YouTube SPA navigation

### Layer 3 — Polling Fallback (tertiary)
- Activates only when `ad-started` was emitted but no `ad-ended` arrives within 90 seconds
- Polls DOM every 2 seconds
- Clears itself immediately on resolution
- Prevents zombie states after navigation events

---

## 5. Background Worker Logic

### On `ad-started`
1. Check `settings.enabled` — if false, abort
2. Check `settings.activeUrlId` — if null, abort (no destination configured)
3. Record `ytTabId` from message sender
4. Set `adActive = true`
5. Call `tab-manager.openRedirect(url)` → open URL in new tab, store `redirectTabId`
6. Focus the new tab

### On `ad-ended`
1. Set `adActive = false`
2. If `settings.notifyOnEnd` → fire notification: "Ad finished — your video is ready."
3. If `settings.autoReturn` → focus original YouTube tab
4. Close redirect tab if still open
5. Clear `redirectTabId` and `ytTabId` from runtime state

### Edge Cases
| Scenario | Handling |
|---|---|
| YouTube tab closed before ad ends | Catch `chrome.tabs.update` error, clear state gracefully |
| Redirect tab manually closed by user | `chrome.tabs.onRemoved` listener clears `redirectTabId` |
| Multiple YouTube tabs open simultaneously | Only the tab that triggered the active session is tracked; new ads in other tabs ignored while session active |
| Service worker restart mid-ad | `adActive` resets to false; Layer 3 polling re-detects and re-emits within 2s |

---

## 6. Data Model

### Persisted (`chrome.storage.local`)

```ts
interface UrlEntry {
  id: string;        // uuid
  label: string;     // e.g. "Gmail"
  url: string;       // e.g. "https://mail.google.com"
  createdAt: number; // unix timestamp
}

interface Settings {
  enabled: boolean;
  activeUrlId: string | null;
  urls: UrlEntry[];
  autoReturn: boolean;
  notifyOnEnd: boolean;
  onboardingComplete: boolean;
}
```

**Defaults on first install:**
```ts
{
  enabled: true,
  activeUrlId: null,
  urls: [],
  autoReturn: true,
  notifyOnEnd: true,
  onboardingComplete: false,
}
```

### Runtime State (in-memory, background worker only)

```ts
interface RuntimeState {
  adActive: boolean;
  ytTabId: number | null;
  redirectTabId: number | null;
}
```

Resets on service worker restart. Never persisted.

---

## 7. Folder Structure

```
ad-redirect/
├── src/
│   ├── background/
│   │   ├── index.ts
│   │   ├── tab-manager.ts
│   │   ├── notification.ts
│   │   └── state.ts
│   ├── content/
│   │   ├── index.ts
│   │   ├── detector/
│   │   │   ├── mutation.ts
│   │   │   ├── video-events.ts
│   │   │   └── polling.ts
│   │   └── messenger.ts
│   ├── storage/
│   │   └── index.ts
│   ├── types/
│   │   ├── messages.ts
│   │   └── settings.ts
│   ├── ui/
│   │   ├── popup/
│   │   │   ├── Popup.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── ToggleSwitch.tsx
│   │   │   └── popup.html
│   │   ├── settings/
│   │   │   ├── Settings.tsx
│   │   │   ├── UrlLibrary.tsx
│   │   │   ├── Toggles.tsx
│   │   │   └── settings.html
│   │   └── onboarding/
│   │       ├── Onboarding.tsx
│   │       └── onboarding.html
│   └── utils/
│       ├── youtube.ts
│       └── debounce.ts
├── public/
│   └── icons/
├── manifest.json
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 8. UI Design

### Popup (280px wide status card)

Three states:
- **Watching:** green badge, active URL label shown
- **Ad detected:** amber badge, "Redirecting..."
- **No YouTube tab:** neutral, prompt to open YouTube
- **No destination set:** neutral, prompt to open settings

Controls: master enable/disable toggle, link to settings page.

### Settings Page

Four sections:
1. **Redirect Destination** — dropdown of active URL, URL library (add/edit/delete/select)
2. **Behaviour** — auto-return toggle, notification toggle
3. **Extension** — master enable/disable toggle
4. **About** — version, GitHub link, issue tracker

### Onboarding Page (shown once on install)

Single page: brief value proposition, label + URL input fields, "Get Started" button. Sets `onboardingComplete: true` on submit. Full keyboard navigation, ARIA labels.

---

## 9. Permissions

| Permission | Reason |
|---|---|
| `tabs` | Detect YouTube tabs, switch focus, close redirect tab |
| `notifications` | Show ad-ended alert |
| `storage` | Persist settings and URL library locally |
| `scripting` | Inject content script into YouTube |
| `host_permissions: ["https://www.youtube.com/*"]` | Scope content script to YouTube only |

No broad `<all_urls>`. No access to content of redirect destinations.

---

## 10. Security

- **URL validation:** Only `https://` URLs accepted. Validated with `URL` constructor before saving.
- **CSP:** MV3 default strict CSP — no eval, no inline scripts, no remote code.
- **Message validation:** Background worker validates all message shapes before acting.
- **Zero network requests:** Extension makes no external requests. All data stays local.
- **Storage:** `chrome.storage.local` only. Never reads content of any other page.

---

## 11. Performance

- MutationObserver scoped to `#movie_player` only — not `document.body`
- Detection events debounced at 300ms
- Layer 3 polling only activates under uncertainty; self-clears on resolution
- MV3 service worker is event-driven — no persistent background CPU usage
- Settings cached in module scope after first read — no repeated async storage reads on hot path
- React UI chunks split per entry point; popup target < 50KB gzipped

---

## 12. Build System

**Toolchain:** Vite + `@crxjs/vite-plugin`

**Scripts:**
- `npm run dev` — hot-reload dev build, load unpacked from `/dist`
- `npm run build` — production build
- `npm run zip` — packages `/dist` as `ad-redirect-v{version}.zip`
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint + Prettier

---

## 13. Publishing

### Chrome Web Store
- Upload `ad-redirect-v{version}.zip` to Chrome Developer Dashboard
- Required: 4 screenshots (1280×800), promotional tile (440×280), privacy policy URL
- Review time: 1–3 business days

### Microsoft Edge Add-ons
- Same zip file — identical build artifact
- Upload to Edge Partner Center
- Review time: 3–7 business days

Version source of truth: `manifest.json` version field.

---

## 14. Future Roadmap

| Feature | Priority |
|---|---|
| Rotate through URL library per ad | High |
| Time-of-day redirect rules | High |
| Pomodoro integration | High |
| Firefox (WebExtensions API) support | Medium |
| Habit tracking (local only) | Medium |
| Stretch / mindfulness reminders | Medium |
| AI-suggested redirect | Low |
| Distraction score dashboard | Low |

---

## 15. Non-Goals (v1)

- No analytics or telemetry of any kind
- No cloud sync
- No ad blocking (extension does not modify or remove ads)
- No reading of video metadata, titles, or user account info
- No access to any page other than YouTube's player element
