import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native";
import type { AppScreen } from "./src/navigation/types";
import { PlaceholderScreen } from "./src/screens/PlaceholderScreen";
import { PinSetupScreen, type PinSetupMode } from "./src/screens/PinSetupScreen";
import { UnlockScreen } from "./src/screens/UnlockScreen";
import { PinStore } from "./src/stores/pinStore";
import { colors } from "./src/theme";

/**
 * PhoneNap 1.0.0 — PIN flow (#2) + scaffold placeholders for later issues.
 */
export default function App() {
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<AppScreen>("home");
  const [pinMode, setPinMode] = useState<PinSetupMode>("create");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const has = await PinStore.hasPin();
      if (cancelled) return;
      if (!has) {
        setPinMode("create");
        setScreen("pinSetup");
      } else {
        setScreen("home");
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.seaDeep} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style={screen === "unlock" || screen === "sleep" ? "light" : "dark"} />

      {screen === "pinSetup" && (
        <PinSetupScreen
          initialMode={pinMode}
          onDone={() => setScreen("home")}
          onCancel={
            pinMode === "verify" ? () => setScreen("settings") : undefined
          }
        />
      )}

      {screen === "home" && (
        <PlaceholderScreen
          title="Home"
          subtitle="PIN is ready. Places + missions land in issue #4."
          primaryLabel="Preview Unlock"
          onPrimary={() => setScreen("unlock")}
          secondaryLabel="Settings"
          onSecondary={() => setScreen("settings")}
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
        <UnlockScreen onSuccess={() => setScreen("checkIn")} />
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
          subtitle="Change PIN requires your current PIN first."
          primaryLabel="Change unlock PIN"
          onPrimary={() => {
            setPinMode("verify");
            setScreen("pinSetup");
          }}
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
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.paper,
  },
});
