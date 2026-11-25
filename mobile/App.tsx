import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet } from "react-native";
import type { AppScreen } from "./src/navigation/types";
import { PlaceholderScreen } from "./src/screens/PlaceholderScreen";
import { colors } from "./src/theme";

/**
 * PhoneNap 1.0.0 scaffold — explicit screen state machine.
 * Real flows land in follow-up issues (#2–#8).
 */
export default function App() {
  const [screen, setScreen] = useState<AppScreen>("home");

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      {screen === "pinSetup" && (
        <PlaceholderScreen
          title="Create your PIN"
          subtitle="Issue #2 — SecureStore create / confirm."
          primaryLabel="Skip to Home (scaffold)"
          onPrimary={() => setScreen("home")}
        />
      )}
      {screen === "home" && (
        <PlaceholderScreen
          title="Home"
          subtitle="1.0.0 scaffold. Places + missions arrive in issue #4."
          primaryLabel="Open Settings"
          onPrimary={() => setScreen("settings")}
          secondaryLabel="Preview Sleep"
          onSecondary={() => setScreen("sleep")}
        />
      )}
      {screen === "mission" && (
        <PlaceholderScreen
          title="Pick a mission"
          subtitle="Issue #4 — MissionsStore.forPlace()."
          primaryLabel="Back to Home"
          onPrimary={() => setScreen("home")}
        />
      )}
      {screen === "sleep" && (
        <PlaceholderScreen
          title="The phone is napping"
          subtitle="Issue #5 — speech, settle, hand-back, inert."
          primaryLabel="Preview Unlock"
          onPrimary={() => setScreen("unlock")}
          secondaryLabel="Back to Home"
          onSecondary={() => setScreen("home")}
        />
      )}
      {screen === "unlock" && (
        <PlaceholderScreen
          title="Wake PhoneNap"
          subtitle="Issue #2 / #6 — PIN unlock then optional check-in."
          primaryLabel="Preview Check-in"
          onPrimary={() => setScreen("checkIn")}
          secondaryLabel="Home"
          onSecondary={() => setScreen("home")}
        />
      )}
      {screen === "checkIn" && (
        <PlaceholderScreen
          title="How did that nap go?"
          subtitle="Issue #6 — local append-only feedback."
          primaryLabel="Done"
          onPrimary={() => setScreen("home")}
        />
      )}
      {screen === "settings" && (
        <PlaceholderScreen
          title="Settings"
          subtitle="Issue #8 — age band. Issue #2 — change PIN."
          primaryLabel="PIN setup placeholder"
          onPrimary={() => setScreen("pinSetup")}
          secondaryLabel="Back to Home"
          onSecondary={() => setScreen("home")}
        />
      )}
      {screen === "onboarding" && (
        <PlaceholderScreen
          title="Before you hand over"
          subtitle="Issue #7 — Guided Access / Screen Pinning / silent mode."
          primaryLabel="Continue"
          onPrimary={() => setScreen("home")}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.paper,
  },
});
