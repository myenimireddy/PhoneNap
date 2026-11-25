#!/usr/bin/env node
/**
 * Lightweight gate for CI / local: eas.json + app store identifiers look sane.
 * Does not call the Expo API (no login required).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const app = JSON.parse(readFileSync(join(root, "app.json"), "utf8"));
const eas = JSON.parse(readFileSync(join(root, "eas.json"), "utf8"));

const errors = [];

const expo = app.expo;
if (!expo) errors.push("app.json missing expo");
if (expo?.version !== "1.0.0") {
  // Allow future bumps but warn via stdout; 1.0.0 is current public target.
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

const projectId = expo?.extra?.eas?.projectId;
if (!projectId) {
  errors.push("extra.eas.projectId missing");
} else if (projectId === "RUN_eas_init") {
  console.log(
    "note: extra.eas.projectId is still RUN_eas_init — run npx eas-cli init --force before cloud builds"
  );
} else {
  console.log("EAS projectId linked:", projectId);
}

if (errors.length) {
  console.error("EAS config check failed:");
  for (const e of errors) console.error(" -", e);
  process.exit(1);
}

console.log("EAS config check passed.");
