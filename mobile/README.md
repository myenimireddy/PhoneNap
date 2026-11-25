# PhoneNap mobile (`1.0.0`)

Expo + TypeScript app. Product docs live in `/docs`.

## Run

```bash
cd mobile
npm install
npx expo start
```

Then press `i` (iOS simulator), `a` (Android), or scan with Expo Go.

## Layout

```
mobile/
  App.tsx                 # explicit screen state machine
  src/
    theme.ts
    navigation/types.ts
    screens/              # placeholders → real screens in later PRs
    stores/               # PinStore, PlacesStore, MissionsStore (upcoming)
```

## Issues

Scaffold closes [#1](https://github.com/myenimireddy/PhoneNap/issues/1).  
Next: PIN (#2), places/missions (#4), sleep (#5), …
