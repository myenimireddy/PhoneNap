/** Minimal semver compare for x.y.z (ignores pre-release / build metadata). */

function parts(v: string): [number, number, number] {
  const clean = v.trim().replace(/^v/i, "").split("-")[0]?.split("+")[0] ?? "0";
  const [a, b, c] = clean.split(".").map((n) => parseInt(n, 10));
  return [Number.isFinite(a) ? a : 0, Number.isFinite(b) ? b : 0, Number.isFinite(c) ? c : 0];
}

export function compareSemver(a: string, b: string): number {
  const pa = parts(a);
  const pb = parts(b);
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}

export function isNewer(latest: string, installed: string): boolean {
  return compareSemver(latest, installed) > 0;
}

/** Patch vs minor vs major relative to installed → latest. */
export function bumpKind(
  installed: string,
  latest: string
): "none" | "patch" | "minor" | "major" {
  const [ia, ib] = parts(installed);
  const [la, lb] = parts(latest);
  if (compareSemver(latest, installed) <= 0) return "none";
  if (la !== ia) return "major";
  if (lb !== ib) return "minor";
  return "patch";
}
