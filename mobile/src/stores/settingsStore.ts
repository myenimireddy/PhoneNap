import AsyncStorage from "@react-native-async-storage/async-storage";

const AGE_KEY = "phonenap-age-band";
const ONBOARDING_KEY = "phonenap-onboarding-done";

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

  async isOnboardingDone(): Promise<boolean> {
    return (await AsyncStorage.getItem(ONBOARDING_KEY)) === "1";
  },

  async setOnboardingDone(): Promise<void> {
    await AsyncStorage.setItem(ONBOARDING_KEY, "1");
  },
};
