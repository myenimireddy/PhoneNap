#!/usr/bin/env node
/**
 * Gate for CI / local: eas.json + app identifiers look sane.
 * Does not call the Expo API (no login required).
 *
 * Usage:
 *   node scripts/verify-eas-config.mjs           # default (allows placeholders)
 *   node scripts/verify-eas-config.mjs --strict  # require real projectId + ascAppId
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const strict = process.argv.includes("--strict");
const mobileRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = join(mobileRoot, "..");

const app = JSON.parse(readFileSync(join(mobileRoot, "app.json"), "utf8"));
const eas = JSON.parse(readFileSync(join(mobileRoot, "eas.json"), "utf8"));
const pkg = JSON.parse(readFileSync(join(mobileRoot, "package.json"), "utf8"));

const IOS_RESOURCE_CLASSES = new Set(["default", "medium", "large"]);
const PLACEHOLDER_PROJECT = "RUN_eas_init";
const PLACEHOLDER_ASC = "REPLACE_AFTER_APP_STORE_CONNECT";

const errors = [];
const deps = { ...pkg.dependencies, ...pkg.devDependencies };

const expo = app.expo;
if (!expo) errors.push("app.json missing expo");
if (expo?.version !== "1.0.0") {
  console.log(`note: expo.version is ${expo?.version}`);
}
if (expo?.ios?.bundleIdentifier !== "app.phonenap") {
  errors.push('ios.bundleIdentifier must be "app.phonenap"');
}
if (expo?.android?.package !== "app.phonenap") {
  errors.push('android.package must be "app.phonenap"');
}
if (!expo?.ios?.buildNumber) errors.push("ios.buildNumber required");
if (typeof expo?.android?.versionCode !== "number") {
  errors.push("android.versionCode required");
}

for (const name of ["development", "preview", "production"]) {
  if (!eas.build?.[name]) errors.push(`eas.json missing build.${name}`);
}
if (!eas.submit?.production) errors.push("eas.json missing submit.production");
if (eas.cli?.appVersionSource !== "remote") {
  errors.push('eas.json cli.appVersionSource should be "remote" for autoIncrement');
}

let needsDevClient = false;
for (const [name, profile] of Object.entries(eas.build ?? {})) {
  if (profile?.developmentClient) needsDevClient = true;
  const rc = profile?.ios?.resourceClass;
  if (rc != null && !IOS_RESOURCE_CLASSES.has(rc)) {
    errors.push(
      `build.${name}.ios.resourceClass "${rc}" is invalid (allowed: default, medium, large)`
    );
  }
}

if (needsDevClient && !deps["expo-dev-client"]) {
  errors.push(
    "eas.json enables developmentClient but expo-dev-client is not installed (npx expo install expo-dev-client)"
  );
}

if (!existsSync(join(repoRoot, ".easignore"))) {
  errors.push("missing repo-root .easignore (EAS reads it from the git root, not mobile/)");
}
if (existsSync(join(mobileRoot, ".easignore"))) {
  errors.push(
    "mobile/.easignore should be removed — place ignore rules in /.easignore instead"
  );
}

const projectId = expo?.extra?.eas?.projectId;
if (!projectId) {
  errors.push("extra.eas.projectId missing");
} else if (projectId === PLACEHOLDER_PROJECT) {
  if (strict) {
    errors.push(
      `strict: extra.eas.projectId is still ${PLACEHOLDER_PROJECT} — run npx eas-cli init --force`
    );
  } else {
    console.log(
      `note: extra.eas.projectId is still ${PLACEHOLDER_PROJECT} — run npx eas-cli@latest init --force before cloud builds`
    );
  }
} else {
  console.log("EAS projectId linked:", projectId);
}

const ascAppId = eas.submit?.production?.ios?.ascAppId;
if (!ascAppId) {
  errors.push("submit.production.ios.ascAppId missing");
} else if (ascAppId === PLACEHOLDER_ASC) {
  if (strict) {
    errors.push(
      `strict: ascAppId is still ${PLACEHOLDER_ASC} — set the App Store Connect numeric id`
    );
  } else {
    console.log(
      `note: ascAppId is still ${PLACEHOLDER_ASC} — fill after App Store Connect app exists`
    );
  }
}

const scripts = pkg.scripts ?? {};
for (const key of [
  "eas:build:ios",
  "eas:build:android",
  "eas:submit:ios",
  "eas:submit:android",
]) {
  const cmd = scripts[key] ?? "";
  if (cmd && !cmd.includes("eas-cli")) {
    errors.push(
      `${key} should invoke npx eas-cli (got bare "eas", which fails after clean npm ci)`
    );
  }
}

if (errors.length) {
  console.error("EAS config check failed:");
  for (const e of errors) console.error(" -", e);
  process.exit(1);
}

console.log(strict ? "EAS config check passed (strict)." : "EAS config check passed.");
