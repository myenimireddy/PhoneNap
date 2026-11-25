import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Appearance } from "../theme";

const AGE_KEY = "phonenap-age-band";
const ONBOARDING_KEY = "phonenap-onboarding-done";
const APPEARANCE_KEY = "phonenap-appearance";

export type AgeBand = "3" | "4" | "5" | "prefer-not";

export const SettingsStore = {
  async getAgeBand(): Promise<AgeBand | null> {
    const v = await AsyncStorage.getItem(AGE_KEY);
    if (v === "3" || v === "4" || v === "5" || v === "prefer-not") return v;
    return null;
  },

  async setAgeBand(band: AgeBand): Promise<void> {
    await AsyncStorage.setItem(AGE_KEY, band);
  },

  async getAppearance(): Promise<Appearance> {
    const v = await AsyncStorage.getItem(APPEARANCE_KEY);
    if (v === "system" || v === "light" || v === "dark") return v;
    // First launch / unset: dark canvas (user can switch in Settings).
    return "dark";
  },

  async setAppearance(mode: Appearance): Promise<void> {
    await AsyncStorage.setItem(APPEARANCE_KEY, mode);
  },

  async isOnboardingDone(): Promise<boolean> {
    return (await AsyncStorage.getItem(ONBOARDING_KEY)) === "1";
  },

  async setOnboardingDone(): Promise<void> {
    await AsyncStorage.setItem(ONBOARDING_KEY, "1");
  },
};
