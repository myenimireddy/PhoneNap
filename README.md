# PhoneNap

Put the phone to sleep and play somewhere else.

**Audience:** parents of children ages **3–5** (guide, not a guarantee).  
PhoneNap is a calm transition cue — the parent still owns the boundary.

## Current plan

Ship **`1.0.0`** to the App Store and Google Play from one Expo codebase, then improve from live customer feedback (in-app check-in, reviews, support). No private tester lab required.

| | |
|---|---|
| Product | Local-only nap flow (no nap backend, no analytics SDKs) |
| Stack | Expo + React Native + TypeScript |
| Versioning | Semver — `1.0.0` first release; patches `1.0.x`; features `1.x.0` |
| Upgrade UX | In-app popup when a newer store version is available |
| Stores | One app, two listings (`.ipa` + `.aab`) |

## Repo

| Path | Purpose |
|---|---|
| [`mobile/`](mobile/) | Expo app (`1.0.0`) |
| [`sketches/`](sketches/) | HTML design prototype (reference only) |
| [`docs/`](docs/) | Flow, stack, release, pilot notes |

**GitHub:** [myenimireddy/PhoneNap](https://github.com/myenimireddy/PhoneNap)  
**Milestone:** [1.0.0](https://github.com/myenimireddy/PhoneNap/milestone/1) — all release issues  
**Open PRs:** review before merge (do not auto-merge)

## Run the app

```bash
cd mobile
npm install
npx expo start
```

## Product flow (`1.0.0`)

1. **First launch:** Create PIN → Confirm PIN → Home  
2. **New nap (2 taps):** Place → Mission (sleep starts immediately)  
3. **Returning:** Recent → Sleep  
4. **Sleep:** speak mission → picture → settle → hand phone back → inert  
5. **Unlock:** long-press + PIN → optional check-in → Home  

Before handover, parent starts **Guided Access** (iPhone) or **Screen Pinning** (Android). The app must not claim it alone locks the child in.

## Data (on device)

| Store | Role |
|---|---|
| `PinStore` | SecureStore PIN — create / confirm / verify / change |
| `PlacesStore` | Bundled places (Store, Car, …) |
| `MissionsStore` | Missions by place, simpler first |
| AsyncStorage | Age band, recents, local check-in log |

## Feedback (customer)

After unlock, optional check-in:

- Handoff: No cue / One cue / Negotiation  
- Mission started: Yes / No  
- Did the child ask for the phone again?: Yes / No  

Use a **five-minute** observation window for “asked again” (instruction in copy; not enforced in UI).  
Export via Share / Copy all. No Formspree/Basin. No mic/camera/motion inference.

## Docs

- [docs/STACK.md](docs/STACK.md) — approved tech stack  
- [docs/RELEASE.md](docs/RELEASE.md) — semver + upgrade popup  
- [docs/FLOW.md](docs/FLOW.md) — PIN, places, missions  
- [docs/PILOT.md](docs/PILOT.md) — observation notes  

## Development

Work lands as **PRs against issues** under milestone **1.0.0**. Open PRs for review — merge only when explicitly asked.

### Agent skills & context

| Path | Purpose |
|---|---|
| [AGENTS.md](AGENTS.md) | Entry point for any AI agent |
| [.cursor/skills/phonenap-context/](.cursor/skills/phonenap-context/) | Product + code map when implementing |
| [.cursor/skills/phonenap-pr-review/](.cursor/skills/phonenap-pr-review/) | PR review checklist and hard gates |
