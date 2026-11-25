import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native";
import type { AppScreen } from "./src/navigation/types";
import { PlaceholderScreen } from "./src/screens/PlaceholderScreen";
import { PinSetupScreen, type PinSetupMode } from "./src/screens/PinSetupScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { UnlockScreen } from "./src/screens/UnlockScreen";
import { authenticateDeviceOwner } from "./src/stores/pinRecovery";
import { PinStore } from "./src/stores/pinStore";
import { colors } from "./src/theme";

/**
 * PhoneNap — stacked on #2 PinStore.
 * This layer: #3 PIN recovery + #8 Settings age band.
 */
export default function App() {
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<AppScreen>("home");
  const [pinMode, setPinMode] = useState<PinSetupMode>("create");
  const [pinCancelTo, setPinCancelTo] = useState<AppScreen | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const has = await PinStore.hasPin();
      if (cancelled) return;
      if (!has) {
        setPinMode("create");
        setPinCancelTo(null);
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

  const startForgotPin = useCallback(async (returnTo: AppScreen) => {
    const result = await authenticateDeviceOwner();
    if (!result.ok) {
      Alert.alert("Could not verify", result.error ?? "Try again.");
      return;
    }
    setPinCancelTo(returnTo);
    setPinMode("create");
    setScreen("pinSetup");
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
          onDone={() => {
            setPinCancelTo(null);
            setScreen("home");
          }}
          onCancel={
            pinCancelTo
              ? () => {
                  const dest = pinCancelTo;
                  setPinCancelTo(null);
                  setScreen(dest);
                }
              : undefined
          }
        />
      )}

      {screen === "home" && (
        <PlaceholderScreen
          title="Home"
          subtitle="PIN + settings ready. Places + missions land in the next stacked PR (#4)."
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
        <UnlockScreen
          onSuccess={() => setScreen("checkIn")}
          onForgotPin={() => void startForgotPin("unlock")}
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
        <SettingsScreen
          onChangePin={() => {
            setPinCancelTo("settings");
            setPinMode("verify");
            setScreen("pinSetup");
          }}
          onForgotPin={() => void startForgotPin("settings")}
          onBack={() => setScreen("home")}
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
