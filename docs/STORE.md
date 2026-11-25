# PhoneNap · store listing prep (1.0.0)

One Expo project → two listings (App Store + Play). Core nap stays offline; no analytics SDK.

## Before first build

1. Create an [Expo](https://expo.dev) account and run from `mobile/`:

   ```bash
   npx eas-cli login
   npx eas-cli init --force
   ```

   Commit the real `extra.eas.projectId` written into `app.json`.

2. Apple Developer Program + App Store Connect app with bundle id `app.phonenap`.
3. Google Play Console app with package `app.phonenap`.
4. After listings exist, set in `mobile/app.json` → `extra`:

   - `iosAppStoreUrl` — App Store product URL  
   - `androidPlayStoreUrl` — Play Store details URL  
   - `versionManifestUrl` — optional first-party `{ "latest", "min?", "notes?" }` JSON  

5. Replace `ascAppId` in `mobile/eas.json` → `submit.production.ios` with the App Store Connect numeric app id.

## Credentials (EAS)

```bash
cd mobile
npx eas-cli credentials   # interactive: Apple + Google signing
```

- **iOS:** distribution cert + provisioning profile (EAS can manage).  
- **Android:** upload keystore (EAS can generate; keep a backup).  
- **Submit:** App Store Connect API key (recommended) and Play service-account JSON.

## Build artifacts

| Profile | iOS | Android |
|---|---|---|
| `development` | Simulator / dev client | APK |
| `preview` | Internal device build | APK |
| `production` | `.ipa` (TestFlight / App Store) | `.aab` (Play) |

```bash
cd mobile
npx eas-cli build --platform ios --profile production
npx eas-cli build --platform android --profile production
```

Production uses `cli.appVersionSource: remote` + `autoIncrement` so native build numbers stay monotonic without hand-editing every upload.

## Submit

```bash
cd mobile
npx eas-cli submit --platform ios --profile production
npx eas-cli submit --platform android --profile production
```

Play track defaults to `internal` + `draft` until you promote in Console.

## Listing copy (suggested)

| Field | Suggestion |
|---|---|
| Name | PhoneNap |
| Subtitle / short | Put the phone to sleep. Play somewhere else. |
| Age | Parents of kids ~3–5 (guide, not guarantee) |
| Privacy | No account; PIN on device; optional local check-in only; no mic/camera/motion inference |
| Age rating | Follow store questionnaires; child-directed / Kids category may apply — legal review before release |

## Privacy / Kids notes

- Do not ship third-party analytics in 1.0.0.  
- COPPA / Apple Kids / Play Families may apply even when parents operate PIN UI — counsel review before store release.  
- See root `README.md` and `docs/RELEASE.md`.

## CI (optional)

`.github/workflows/eas-build.yml` can dispatch production builds when the repo secret `EXPO_TOKEN` is set (Expo → Access Token).
