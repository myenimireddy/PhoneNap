/**
 * Explicit app screens for 1.0.0.
 * A small state machine in App.tsx switches these — Expo Router can replace later if needed.
 */
export type AppScreen =
  | "pinSetup"
  | "home"
  | "mission"
  | "sleep"
  | "unlock"
  | "checkIn"
  | "settings"
  | "onboarding";

export type AppState = {
  screen: AppScreen;
};
