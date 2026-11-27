// Перевірка оновлень для форку trigor74/scrob.
//
// Форк випускає дві версії продукту з різними тегами:
//   vX.Y.Z-lampame[.N]    — звичайна
//   vX.Y.Z-lampame-lp[.N] — levende (на GitHub позначена «Latest»)
// Тому /releases/latest не годиться: звичайна версія порівнювалась би з lp.
// Беремо список релізів і шукаємо найновіший у своєму треку.

/** Репозиторій форку — для посилань і перевірки оновлень. */
export const FORK_REPO = "trigor74/scrob";
/** Оригінальний проєкт, від якого зроблено форк. */
export const UPSTREAM_REPO = "ellite/scrob";

export interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
  /** "lampame" | "lampame-lp" | null (версія без суфікса форку) */
  track: string | null;
  /** Номер повторного релізу на тій самій базі (.N); без суфікса — 1. */
  rev: number;
}

// 2.39.1, v2.39.1-lampame, 2.39.1-lampame-lp.2, 2.39.1-lampame.2+3.abc1234 (локальна збірка між релізами)
const VERSION_RE = /^v?(\d+)\.(\d+)\.(\d+)(?:-(lampame(?:-lp)?)(?:\.(\d+))?)?(?:\+.*)?$/;

export function parseVersion(v: string | null | undefined): ParsedVersion | null {
  const m = VERSION_RE.exec((v ?? "").trim());
  if (!m) return null;
  return {
    major: Number(m[1]),
    minor: Number(m[2]),
    patch: Number(m[3]),
    track: m[4] ?? null,
    rev: m[5] ? Number(m[5]) : 1,
  };
}

function compare(a: ParsedVersion, b: ParsedVersion): number {
  return a.major - b.major || a.minor - b.minor || a.patch - b.patch || a.rev - b.rev;
}

/** true, якщо latest новіша за current (обидві мають розпізнаватися). */
export function isNewerVersion(latest: string, current: string): boolean {
  const l = parseVersion(latest);
  const c = parseVersion(current);
  if (!l || !c) return false;
  return compare(l, c) > 0;
}

export interface GitHubRelease {
  tag_name?: string;
  html_url?: string;
  draft?: boolean;
  prerelease?: boolean;
}

/**
 * Найновіший опублікований реліз того самого треку, що й current.
 * Якщо current без суфікса форку — серед усіх релізів.
 */
export function pickLatestRelease(
  releases: GitHubRelease[],
  current: string,
): { version: string; url: string | null } | null {
  const cur = parseVersion(current);
  let best: { parsed: ParsedVersion; version: string; url: string | null } | null = null;
  for (const r of releases) {
    if (r.draft || r.prerelease || !r.tag_name) continue;
    const parsed = parseVersion(r.tag_name);
    if (!parsed) continue;
    if (cur?.track && parsed.track !== cur.track) continue;
    if (!best || compare(parsed, best.parsed) > 0) {
      best = { parsed, version: r.tag_name.replace(/^v/, ""), url: r.html_url ?? null };
    }
  }
  return best ? { version: best.version, url: best.url } : null;
}
