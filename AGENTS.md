# AGENTS.md — PhoneNap

Instructions for **any** AI coding agent (Cursor, Codex, Copilot, Claude, etc.) working in this repository.

## Read first

1. [README.md](README.md) — current plan (`1.0.0` App Store path)  
2. [docs/STACK.md](docs/STACK.md) — approved tech stack  
3. [docs/FLOW.md](docs/FLOW.md) — PIN, places, missions  
4. [docs/RELEASE.md](docs/RELEASE.md) — semver + upgrade popup  

## Cursor skills (preferred)

If your environment supports Agent Skills, load:

| Skill | Path | Use when |
|---|---|---|
| `phonenap-context` | `.cursor/skills/phonenap-context/SKILL.md` | Implementing features, exploring the codebase |
| `phonenap-pr-review` | `.cursor/skills/phonenap-pr-review/SKILL.md` | Reviewing or writing PR checklists |

## Non‑negotiables

- Public version starts at **`1.0.0`** (sketch “V2.8” is internal only).  
- No nap backend; no analytics SDKs for 1.0.0.  
- No mic/camera/motion to infer child behavior.  
- Do not claim the app alone device-locks a child — teach Guided Access / Screen Pinning.  
- Change PIN requires verifying the **current** PIN.  
- Do **not** merge PRs unless the human explicitly asks to merge.  
- Work under GitHub milestone **1.0.0**.

## Code layout

- Ship code lives in **`mobile/`** (Expo + TypeScript).  
- **`sketches/`** is design reference only.  
- Navigation for 1.0.0: **explicit screen state machine** in `mobile/App.tsx` (not Expo Router unless a dedicated issue changes that).

## Commands

```bash
cd mobile
npm install
npx expo start
npx tsc --noEmit
npx expo install <package>   # prefer over npm install for Expo modules
```

## PR workflow

1. Branch from `main` (or the previous stacked PR branch): `feat/<issue>-short-name`
2. One **coherent change** per PR (may close related issues together); include `Closes #N`
3. Open PR for **human review** — do not auto-merge
4. Use `phonenap-pr-review` skill for the review checklist
5. Stacked PRs: set base to the previous feature branch; review each against that base, and the tip against `main`

