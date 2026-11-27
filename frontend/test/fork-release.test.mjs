import assert from "node:assert/strict";
import test from "node:test";

import { isNewerVersion, parseVersion, pickLatestRelease } from "../src/lib/forkRelease.ts";

test("parses fork versions with track, re-release and local build suffix", () => {
  assert.deepEqual(parseVersion("v2.39.1-lampame-lp.2"), { major: 2, minor: 39, patch: 1, track: "lampame-lp", rev: 2 });
  assert.deepEqual(parseVersion("2.39.1-lampame"), { major: 2, minor: 39, patch: 1, track: "lampame", rev: 1 });
  assert.deepEqual(parseVersion("2.24.0-lampame.2+3.abc1234"), { major: 2, minor: 24, patch: 0, track: "lampame", rev: 2 });
  assert.equal(parseVersion("dev"), null);
});

test("compares patch and re-release numbers (the old check saw NaN here)", () => {
  assert.equal(isNewerVersion("2.39.2-lampame", "2.39.1-lampame"), true);
  assert.equal(isNewerVersion("2.39.1-lampame.2", "2.39.1-lampame"), true);
  assert.equal(isNewerVersion("2.39.1-lampame", "2.39.1-lampame"), false);
  assert.equal(isNewerVersion("2.39.1-lampame", "2.40.0-lampame"), false);
});

const releases = [
  { tag_name: "v2.40.0-lampame-lp", html_url: "lp-240" },
  { tag_name: "v2.39.1-lampame-lp", html_url: "lp-2391" },
  { tag_name: "v2.39.1-lampame.2", html_url: "std-2391-2" },
  { tag_name: "v2.39.1-lampame", html_url: "std-2391" },
  { tag_name: "v2.41.0-lampame", html_url: "draft", draft: true },
];

test("picks the newest release of the same track only", () => {
  assert.deepEqual(pickLatestRelease(releases, "2.39.1-lampame"), { version: "2.39.1-lampame.2", url: "std-2391-2" });
  assert.deepEqual(pickLatestRelease(releases, "2.39.1-lampame-lp"), { version: "2.40.0-lampame-lp", url: "lp-240" });
});

test("falls back to all releases for a version without a fork suffix", () => {
  assert.deepEqual(pickLatestRelease(releases, "2.39.1"), { version: "2.40.0-lampame-lp", url: "lp-240" });
  assert.equal(pickLatestRelease([], "2.39.1-lampame"), null);
});
