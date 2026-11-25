# PhoneNap

Put the phone to sleep and play somewhere else.

**Primary audience:** parents of children ages **3–5** (developmental guide, not a guarantee).

PhoneNap gives the parent a **calm transition cue**. The parent still owns the boundary.

## Screen sketches

```bash
open -a Safari sketches/index.html
```

## Measurement (V1 design)

| Metric | Collection |
|---|---|
| New / recent path | Automatic event |
| Seconds to sleep screen | Automatic timer |
| Mission class | Automatic event |
| Child age band | Parent selects once (3 / 4 / 5 / Prefer not to say) |
| Handoff result | Parent answers after unlock |
| Mission begun | Parent answers |
| Asked for phone again | Parent answers (after observing) |

**Do not** use microphone, camera, or motion sensors to infer handoff or mission start.

### After unlock — optional check-in

*How did that nap go?*

- Handoff: No cue / One cue / Negotiation  
- Mission started: Yes / No  
- Did the child ask for the phone again?: Yes / No  

**Tester instruction (not enforced in UI):** treat “asked again” as Yes only within **five minutes** of handoff, so answers stay comparable across families.

Age band lives in parent settings only — no name, birthday, profile, or free-text notes.  
Check-ins append to a local log (Copy all to export). Seconds to sleep = Home visible → sleep screen.

## Release format

| | |
|---|---|
| First App Store / Play version | **`1.0.0`** (the basic idea) |
| Small fixes | **`1.0.1`**, `1.0.2`, … (patch) |
| New features | **`1.1.0`**, `1.2.0`, … (minor) |
| Upgrade UX | In-app popup when a newer store version exists → Update / Later |

Sketch label “V2.8” was design-only. Customers see semver starting at 1.0.0.  
Full policy (including upgrade popup rules): [docs/RELEASE.md](docs/RELEASE.md).

## Native V1 stack

Approved: **Expo + TypeScript**, SecureStore PIN, AsyncStorage prefs, expo-speech, no backend, no analytics SDKs.  
Guided Access (iOS) / Screen Pinning (Android) are an **explicit product requirement** in onboarding.  
Full detail: [docs/STACK.md](docs/STACK.md).

### Early pilot (5–8 families)

- Explicit parent opt-in  
- No production analytics — consented beta + optional in-app / form feedback  
- Sketch stores answers **locally on device only**  
- No accounts, advertising ID, device fingerprint, location, audio, or persistent third-party ID  
- Short retention + in-app delete/disable before any production collection  
- Aggregate reporting only; children’s-privacy counsel review before store release  

COPPA can apply to child-directed apps; parent operation of part of the UI does not automatically clear that. Apple Kids / App Review and Google Play Families add further limits on third-party analytics and identifiable child/device data.

## Product flows

- **First launch:** Create PIN → Confirm PIN → Home (see `docs/FLOW.md`)  
- **Returning (2 taps):** Recent → Sleep  
- **New (2 taps):** Place (PlacesStore) → Mission (MissionsStore; sleep starts immediately)  
- Sleep: speak → picture → settle → hand phone back → inert  
- Unlock (PinStore) → optional check-in → home  

### Data stores (on device)

| Store | Role |
|---|---|
| `PlacesStore` | Home places (Store, Car, …) from bundled catalog |
| `MissionsStore` | `forPlace(id)` → missions, simpler first |
| `PinStore` | Parent create / confirm / verify unlock PIN |

Details: [docs/FLOW.md](docs/FLOW.md)
