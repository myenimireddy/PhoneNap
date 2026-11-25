# PhoneNap · data & setup flow

No accounts. Everything below lives **on device** for V1.

```
First launch                 Everyday nap
─────────────                ────────────
Create PIN                   Home
Confirm PIN ──→ Home         ├─ Recent → Sleep
                             └─ Place → Mission → Sleep
Age band lives in Settings        │
(not required before Home)   long-press + PIN
                                  │
                             Check-in (optional)
```

---

## 1. How the parent picks the lock PIN

PIN is **parent setup**, never shown on child screens.

### First launch (matches sketch)

1. **Create PIN** — enter 4 digits.
2. **Confirm PIN** — enter again; must match.
3. Save to `PinStore` (on device).
4. Land on Home.

Age band is optional in **Settings**, not a gate before Home.

### Change PIN later

Settings → Change PIN → **current PIN** → new → confirm.  
Bypassing current PIN is not allowed.

### Unlock after a nap

Sleep screen → long-press sleeping phone → keypad → `PinStore.verify(digits)`.  
If no PIN is stored, verify fails (no demo fallback).

| Rule | Why |
|---|---|
| 4 digits | Fast under stress |
| Confirm on create | Avoid lockout from typos |
| Verify current before change | Settings alone must not replace the PIN |
| Stored only on device | No account / cloud PIN |
| Failed attempts: shake + clear | No lockout timer in V1 (keep simple) |
| Teach unlock in onboarding + Settings only | Never on child UI |

**Native V1:** store PIN in Keychain / EncryptedSharedPreferences; never log it.

---

## 2. How places load from the places store

**Place** = situation on Home (Store, Car, …).

```
places.json (bundled)  →  PlacesStore.list()  →  Home grid
```

### Shape

```json
{
  "id": "car",
  "label": "Car",
  "sort": 3,
  "enabled": true
}
```

### Load rules

1. App start: `PlacesStore.load()` reads the **bundled catalog** (shipped with the app).
2. Home renders `PlacesStore.listEnabled()` sorted by `sort`.
3. Tap place → `selectedPlaceId` → open mission list for that place.
4. **Anytime** is just another place id (`anytime`), not a special code path.

V1 does **not** need a network “places API.” The store is a local module over a static list.  
Later (optional): parent can hide a place in Settings; that writes a small overlay in local prefs, still no server.

```
PlacesStore
  .list()           → all places
  .listEnabled()    → home grid
  .get(id)          → one place
```

---

## 3. How missions load from the mission store

**Mission** = offline task tied to one or more places.

```
missions.json (bundled)  →  MissionsStore.forPlace(placeId)  →  Mission list
```

### Shape

```json
{
  "id": "car-red",
  "placeIds": ["car"],
  "text": "Look out the window and spot five red cars",
  "speak": "Look out your window and find five red cars. Now hand the phone back to a grown-up.",
  "art": "five-cars",
  "class": "count",
  "sort": 40
}
```

`class`: `action` | `search` | `count` — order simpler → harder inside a place.

### Load rules

1. App start: `MissionsStore.load()` reads the bundled catalog.
2. After place tap: `MissionsStore.forPlace(placeId)`  
   - filter `placeIds` contains place  
   - sort by `class` weight then `sort`
3. Tap mission → **sleep starts immediately** (no extra Sleep tap).
4. Recent naps store `{ placeId, missionId }` only; resolve labels via the stores at display time.

```
MissionsStore
  .forPlace(placeId)  → ordered missions for that place
  .get(missionId)     → one mission (recents, check-in meta)
```

Same as places: **no server in V1.** Content updates ship with the app. Custom typing stays out of the meltdown path.

---

## 4. End-to-end nap (who talks to what)

```
Home
  PlacesStore.listEnabled()     → place buttons
  RecentsStore.list()           → resolve via PlacesStore + MissionsStore

Tap place
  MissionsStore.forPlace(id)    → mission rows

Tap mission
  Session: path, timer, missionClass
  Sleep UI + speech(mission.speak)
  RecentsStore.push({ placeId, missionId })

Long-press + PIN
  PinStore.verify()
  → optional check-in (parent answers)
  → Home
```

---

## 5. What lives where (V1)

| Data | Store | Source |
|---|---|---|
| PIN | `PinStore` | Parent create/confirm; device secure storage |
| Age band | `SettingsStore` | Parent, once |
| Places | `PlacesStore` | Bundled catalog |
| Missions | `MissionsStore` | Bundled catalog |
| Recents | `RecentsStore` | Last 3 `{ placeId, missionId }` |
| Last check-in | `FeedbackStore` | Parent answers; local / opt-in pilot only |

---

## 6. Sketch vs native

| | HTML sketch now | Native V1 |
|---|---|---|
| PIN | `PinStore` + first-run create/confirm | Keychain / encrypted prefs |
| Places / missions | JS modules over bundled arrays | Same idea; JSON or codegen |
| Recents / age / feedback | `localStorage` | UserDefaults / DataStore |
| Network | None | None for core nap |
