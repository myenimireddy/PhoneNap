---
name: phonenap-pr-review
description: >-
  Reviews PhoneNap pull requests against product freeze, stack, release, and
  privacy rules. Use when reviewing a PR, opening a PR checklist, doing code
  review, Bugbot-style review, or when the user mentions PR review for PhoneNap.
---

# PhoneNap PR review

## When to use

Any PR against [myenimireddy/PhoneNap](https://github.com/myenimireddy/PhoneNap), especially issues under milestone **1.0.0**.

## How to review

1. Read the PR description and linked issue (`Closes #N` / `Fixes #N`).
2. Confirm the change belongs to milestone **1.0.0** scope (see issue list).
3. Diff against `main` and check the gates below.
4. Output a short review: **Approve** / **Request changes** / **Comment**, with findings only (no filler).

## Hard gates (request changes if violated)

| Gate | Rule |
|---|---|
| Product | Do not reinvent the nap flow; follow `docs/FLOW.md` and the design freeze intent |
| Version | Customer-facing version starts at `1.0.0` — never ship “V2.8” as a product version |
| Lock claim | Must not promise the app alone prevents leaving; Guided Access / Screen Pinning required |
| Privacy | No mic/camera/motion to infer handoff or mission; no analytics SDKs in 1.0.0 |
| Backend | No nap backend; no Formspree/Basin for feedback |
| PIN | Change PIN requires **current** PIN first; no demo `1234` fallback |
| Speech | Mission spoken before hand-back; settle after `onend` + fallback; speech-run ID guard |
| Silent mode | Picture + text must work without audio |
| Feedback | Check-ins append-only; five-minute “asked again” window is instruction/copy, not a hard UI timer |
| Merge | Do not merge unless the user explicitly asks to merge |

## Soft gates (comment)

- Prefer AsyncStorage for non-secrets; SecureStore for PIN only
- Prefer explicit screen state machine unless a PR intentionally adopts Expo Router
- Keep missions ordered action → search → count
- Upgrade popup must not block a soft update during an active nap
- New store versions: patch = `1.0.x`, features = `1.x.0` per `docs/RELEASE.md`

## Review output format

```markdown
## Verdict
Approve | Request changes | Comment

## Findings
- [blocking] …
- [nit] …

## Checklist
- [ ] Matches linked 1.0.0 issue
- [ ] No privacy / lock-claim regressions
- [ ] PIN / speech / handoff rules intact (if touched)
```

## References

- `docs/STACK.md`
- `docs/RELEASE.md`
- `docs/FLOW.md`
- `docs/PILOT.md`
- Root `AGENTS.md`
- Skill `phonenap-context` for architecture map
