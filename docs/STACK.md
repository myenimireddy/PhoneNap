# PhoneNap · V1 tech stack (approved)

**First public release:** `1.0.0` (product intent from the design freeze; customers never see “V2.8”).  
**Versioning & upgrade popups:** [RELEASE.md](./RELEASE.md).  
**Framework:** Expo + React Native + TypeScript.  
**Backend:** None. **Analytics SDKs:** None.

## Stack

| Need | Choice |
|---|---|
| App framework | Expo + TypeScript |
| Navigation | Expo Router **or** a small explicit state machine |
| PIN | `expo-secure-store` |
| Optional PIN recovery | `expo-local-authentication` (Face ID / Touch ID / device credentials → set new PIN) |
| Preferences and recents | AsyncStorage |
| Bundled places / missions | Typed TypeScript **or** local JSON |
| Speech | `expo-speech` |
| Feedback export | Native share sheet or clipboard |
| Backend | None |
| Analytics SDK | None |

AsyncStorage is enough for tiny non-secret prefs. **Skip MMKV** for V1.

## Not a true device lock

Expo cannot replace system lock features.

| Platform | Parent must do before handover |
|---|---|
| iPhone | Start **Guided Access** (Settings → Accessibility). Programmatic Single App Mode is MDM/supervised only. |
| Android | Start **Screen pinning**. Full lock-task is for managed/dedicated devices. |

**Onboarding must teach this.** The app may hide system bars and block its own back stack, but must **never** claim a child cannot leave without Guided Access / Screen Pinning.

## PIN

- Store with `expo-secure-store`.
- Change PIN: verify **current** PIN → new → confirm.
- Forgotten PIN: device owner biometrics / device credentials → create new PIN.
- Do **not** assume delete/reinstall clears the PIN on **iOS** (Keychain can survive). Android typically clears on uninstall.

## Speech

- `expo-speech` supports completion/error callbacks for the V2.8 settle sequence.
- **iPhone silent mode:** no audible speech — picture + text must still carry the mission.
- Mention silent mode in onboarding.
- Keep fallback timer + speech-run ID guard (stale `onend` / `onerror`).

## Feedback

- V1: append-only **local** check-ins + Share / Copy all.
- Better than store reviews for mission class, age band, timing, handoff.
- **Avoid** Formspree / Basin (extra processors, IP/logs).
- If a production endpoint is needed later: explicit opt-in, first-party, no persistent device ID, minimal logs, short retention, deletion, privacy review.

## Observation window (instructions)

Score “asked again” as Yes only within **five minutes** of handoff (tester/parent instruction; not enforced in UI).

## Launch order

1. Build **1.0.0** in Expo (frozen core idea).  
2. Dev builds on real iPhone + Android.  
3. TestFlight / internal testing.  
4. Submit separately to App Store Connect + Google Play (`eas build` / `eas submit` → `.ipa` + `.aab`).  
5. Ship patches as `1.0.x` with an in-app upgrade popup; features as `1.x.0`.  
6. Feedback / version endpoint only after proving it is necessary.

One codebase, two store listings — not two apps.
