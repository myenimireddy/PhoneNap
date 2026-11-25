---
name: phonenap-context
description: >-
  PhoneNap product and code context for any agent implementing features.
  Use when working in the PhoneNap repo, implementing 1.0.0 issues, editing
  mobile/ or sketches/, or when the user asks how PhoneNap works.
---

# PhoneNap code & product context

## One-liner

Parent opens PhoneNap → phone “naps” → child sees a simple real-world mission → hand phone back → parent unlocks with PIN.

## Audience & positioning

- Parents of children **~3–5** (guide, not guarantee)
- Calm transition cue; parent owns the boundary
- **Not** a fake battery / system-update prank
- **Not** a true device lock without Guided Access (iOS) / Screen Pinning (Android)

## Versioning

| Label | Meaning |
|---|---|
| Sketch “V2.8” | Internal design freeze only |
| **`1.0.0`** | First App Store / Play release |
| `1.0.x` | Patches |
| `1.x.0` | New features |

See `docs/RELEASE.md` for upgrade popups.

## Repo map

```
PhoneNap/
  mobile/           # Expo + TypeScript app (source of truth for 1.0.0)
    App.tsx         # Explicit screen state machine
    src/
      theme.ts
      navigation/types.ts
      components/
      screens/
      stores/       # pinStore, places, missions (as implemented)
  sketches/         # HTML prototype — reference only, not shipped
  docs/             # STACK, FLOW, RELEASE, PILOT
  .cursor/skills/   # Agent skills (this folder)
  AGENTS.md         # Entry point for any AI agent
```

## Approved stack (`docs/STACK.md`)

- Expo + TypeScript
- Navigation: **explicit state machine** (Expo Router optional later)
- PIN: `expo-secure-store` (+ `expo-local-authentication` for recovery — issue #3)
- Prefs/recents/check-ins: AsyncStorage (not MMKV for 1.0.0)
- Speech: `expo-speech`
- Feedback export: Share / clipboard
- Backend: none · Analytics SDKs: none

## Core flows

**First launch:** Create PIN → Confirm → Home  

**Nap:** Place → Mission tap starts sleep immediately → speak (mission then hand-back) → picture → settle → inert → long-press + PIN → optional check-in  

**Change PIN:** Current PIN → new → confirm  

**Timing metric:** Home visible → sleep screen  

## Stores (conceptual)

| Store | Persistence | Notes |
|---|---|---|
| PinStore | SecureStore | No `1234` fallback |
| PlacesStore | Bundled TS/JSON | Home grid |
| MissionsStore | Bundled TS/JSON | `forPlace(id)`, action→search→count |
| Recents | AsyncStorage | `{ placeId, missionId }`, empty at first install |
| Feedback | AsyncStorage | Append-only log |
| Age band | AsyncStorage | 3 / 4 / 5 / Prefer not to say |

## Milestone work

All release work is under GitHub milestone **1.0.0**:

1. Scaffold Expo (done)  
2. PinStore create/confirm/unlock/change  
3. PIN recovery (biometrics)  
4. Places + Missions + Home flow  
5. Sleep screen  
6. Check-in + export  
7. Onboarding (Guided Access / pinning / silent mode)  
8. Settings age band  
9. Upgrade popup  
10. EAS / store submit  

## Implementation rules

1. Prefer small PRs that close one issue.  
2. Do **not** merge unless the user explicitly asks.  
3. Read Expo docs for the installed SDK major — do not trust training data for Expo APIs.  
4. Use `npx expo install <pkg>` for native-compatible versions.  
5. For PR review, load skill `phonenap-pr-review`.

## Sketches

`sketches/index.html` is the interactive design reference. Port behavior into `mobile/`; do not ship the HTML app.
