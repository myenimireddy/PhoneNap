import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import Constants from "expo-constants";
import { Linking, Platform } from "react-native";
import { bumpKind, compareSemver, isNewer } from "./semver";

const LATER_KEY = "phonenap-upgrade-later-day";

export type VersionManifest = {
  latest: string;
  /** Force update if installed is below this (critical only). */
  min?: string;
  notes?: string;
};

export type UpgradeOffer = {
  installed: string;
  latest: string;
  notes: string | null;
  kind: "patch" | "minor" | "major";
  force: boolean;
};

type Extra = {
  versionManifestUrl?: string;
  /** Dev / test override when no URL is configured. */
  latestVersionOverride?: string;
  iosAppStoreUrl?: string;
  androidPlayStoreUrl?: string;
};

function extra(): Extra {
  return (Constants.expoConfig?.extra ?? {}) as Extra;
}

export function installedVersion(): string {
  return (
    Application.nativeApplicationVersion ??
    Constants.expoConfig?.version ??
    "0.0.0"
  );
}

async function fetchManifest(): Promise<VersionManifest | null> {
  const { versionManifestUrl, latestVersionOverride } = extra();
  const url = versionManifestUrl?.trim();
  if (url) {
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return null;
      const data = (await res.json()) as VersionManifest;
      if (!data?.latest || typeof data.latest !== "string") return null;
      return data;
    } catch {
      return null;
    }
  }
  const override = latestVersionOverride?.trim();
  if (override) {
    return { latest: override };
  }
  return null;
}

async function laterDay(): Promise<string | null> {
  return AsyncStorage.getItem(LATER_KEY);
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function dismissUpgradeForToday(): Promise<void> {
  await AsyncStorage.setItem(LATER_KEY, todayKey());
}

/**
 * Soft check once per day. Never blocks when offline / fetch fails.
 * Force only when installed < min (critical).
 */
export async function checkForUpgrade(): Promise<UpgradeOffer | null> {
  const installed = installedVersion();
  const manifest = await fetchManifest();
  if (!manifest) return null;

  const force =
    typeof manifest.min === "string" &&
    compareSemver(installed, manifest.min) < 0;

  if (!force) {
    const later = await laterDay();
    if (later === todayKey()) return null;
  }

  if (!isNewer(manifest.latest, installed) && !force) return null;

  const kind = bumpKind(installed, manifest.latest);
  if (kind === "none" && !force) return null;

  return {
    installed,
    latest: manifest.latest,
    notes: manifest.notes ?? null,
    kind: kind === "none" ? "patch" : kind,
    force,
  };
}

export async function openStoreListing(): Promise<void> {
  const { iosAppStoreUrl, androidPlayStoreUrl } = extra();
  const fallbackAndroid = `https://play.google.com/store/apps/details?id=${
    Application.applicationId ?? "app.phonenap"
  }`;
  const ios = iosAppStoreUrl?.trim();
  const android = androidPlayStoreUrl?.trim();
  const url =
    Platform.OS === "ios"
      ? ios || "https://apps.apple.com/app/phonenap"
      : android || fallbackAndroid;
  await Linking.openURL(url);
}

export function upgradeCopy(offer: UpgradeOffer): {
  title: string;
  body: string;
} {
  const title = `PhoneNap ${offer.latest} is available`;
  if (offer.notes) return { title, body: offer.notes };
  if (offer.kind === "patch") {
    return { title, body: "A fix is available." };
  }
  if (offer.kind === "minor") {
    return { title, body: "New features are available." };
  }
  return {
    title,
    body: "A new version is ready. Please update when you can.",
  };
}
