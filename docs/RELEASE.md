# PhoneNap · release format

The HTML sketch was labeled **V2.8** only as a design freeze.  
**Public product versions start at `1.0.0`.** Customers never see “V2.8.”

## Version scheme (semver)

```
MAJOR.MINOR.PATCH
  │      │     └── patch  — small fixes, polish, copy, bug fixes
  │      └──────── minor  — new features (new missions, settings, etc.)
  └─────────────── major  — rare; large product or breaking changes
```

| Version | Meaning |
|---|---|
| **1.0.0** | First App Store / Play release — frozen core idea (PIN, places, missions, sleep, unlock, local check-in, Guided Access / pinning onboarding) |
| **1.0.x** | Patch — fixes and small improvements |
| **1.x.0** | Minor — new features worth calling out |
| **2.0.0** | Major — only when the product meaningfully changes |

Examples:

- `1.0.1` — fix sleep settle race, copy tweak  
- `1.1.0` — new mission pack, PIN recovery polish  
- `1.1.1` — crash fix  

Build numbers (iOS `CFBundleVersion` / Android `versionCode`) always increase with every store upload, even when marketing version stays the same only if you re-upload — normally bump patch (or at least build number) every submit.

## What ships in 1.0.0

The approved product (sketch freeze), not the sketch version name:

- Local-only nap flow  
- PlacesStore / MissionsStore / PinStore behavior  
- Guided Access / Screen Pinning taught in onboarding  
- Optional local check-in + share/copy  
- No analytics SDK, no nap backend  

## Upgrade popup (required)

For **each new store version**, the user should see an in-app prompt to update so they get fixes and features.

### Behavior

| Release type | Popup |
|---|---|
| **Patch** (`1.0.x`) | Soft update: “A fix is available” → Update / Later |
| **Minor** (`1.x.0`) | Soft update: “New features available” → Update / Later (optionally list 1–3 bullets) |
| **Major** (`x.0.0`) | Strong update: encourage update; force only if the old build is unsafe or incompatible |

- **Update** opens the App Store / Play Store listing.  
- Do not block the core nap flow on soft updates (parent in a meltdown must still use the app).  
- Force-update only for critical cases (security, broken unlock, store policy).  

### How the app knows a newer version exists

Core nap stays offline. Version check is separate and minimal:

1. **Preferred for early 1.0.x:** on launch (or once per day), compare installed `expo-application` version to the live store version, **or**  
2. **Lightweight first-party JSON** (when needed), e.g. `{ "latest": "1.1.0", "min": "1.0.0", "notes": "…" }` — no accounts, no device fingerprint, short cache.  

Avoid third-party feedback/analytics vendors for this. Do not use Formspree/Basin-style tools for version checks.

### Copy tone

Calm, parent-facing, feature-honest:

> **PhoneNap 1.1.0 is available**  
> New missions and a clearer handoff.  
> [Update]  [Not now]

## Store submissions

| Artifact | Store |
|---|---|
| `.ipa` | App Store Connect |
| `.aab` | Google Play |

Same Expo project (`eas build` / `eas submit`).  
Bump `version` in `app.json` / `app.config` for every customer-visible release; bump native build number every upload.

Step-by-step credentials, listing prep, and submit tracks: **[STORE.md](./STORE.md)**.

## Changelog discipline

Keep a short `CHANGELOG.md` (or store “What’s New”) per version:

```
## 1.0.0
- First release: put the phone to sleep and hand off a real-world mission.

## 1.0.1
- Fix …

## 1.1.0
- Add …
```

## Mapping (internal only)

| Internal | Customer-facing |
|---|---|
| Sketch design freeze “V2.8” | **1.0.0** |
| Small fix after launch | **1.0.1**, **1.0.2**, … |
| Feature drop | **1.1.0**, **1.2.0**, … |
