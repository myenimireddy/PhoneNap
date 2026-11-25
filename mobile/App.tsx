import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native";
import type { Mission } from "./src/data/missions";
import type { AppScreen } from "./src/navigation/types";
import { HomeScreen } from "./src/screens/HomeScreen";
import { MissionScreen } from "./src/screens/MissionScreen";
import { CheckInScreen } from "./src/screens/CheckInScreen";
import { PlaceholderScreen } from "./src/screens/PlaceholderScreen";
import { PinSetupScreen, type PinSetupMode } from "./src/screens/PinSetupScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { SleepScreen } from "./src/screens/SleepScreen";
import { UnlockScreen } from "./src/screens/UnlockScreen";
import { MissionsStore } from "./src/stores/missionsStore";
import { authenticateDeviceOwner } from "./src/stores/pinRecovery";
import { PinStore } from "./src/stores/pinStore";
import { RecentsStore } from "./src/stores/recentsStore";
import { colors } from "./src/theme";

/**
 * Stack tip: sleep (#5) ← this check-in (#6).
 */
export default function App() {
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<AppScreen>("home");
  const [pinMode, setPinMode] = useState<PinSetupMode>("create");
  const [pinCancelTo, setPinCancelTo] = useState<AppScreen | null>(null);

  const [placeId, setPlaceId] = useState<string | null>(null);
  const [mission, setMission] = useState<Mission | null>(null);
  const [path, setPath] = useState<"new" | "recent">("new");
  const [selectedRecent, setSelectedRecent] = useState<{
    placeId: string;
    missionId: string;
  } | null>(null);
  const homeVisibleAt = useRef<number | null>(null);
  const [secondsToSleep, setSecondsToSleep] = useState<number | null>(null);

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

  const onHomeVisible = useCallback(() => {
    homeVisibleAt.current = performance.now();
  }, []);

  const startSleep = useCallback(
    async (nextMission: Mission, nextPlaceId: string, nextPath: "new" | "recent") => {
      const started = homeVisibleAt.current;
      const secs =
        started == null
          ? 0
          : Math.max(0, Math.round((performance.now() - started) / 100) / 10);
      setSecondsToSleep(secs);
      setMission(nextMission);
      setPlaceId(nextPlaceId);
      setPath(nextPath);
      await RecentsStore.push({
        placeId: nextPlaceId,
        missionId: nextMission.id,
      });
      setScreen("sleep");
    },
    []
  );

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
        <HomeScreen
          onHomeVisible={onHomeVisible}
          selectedRecent={selectedRecent}
          onSelectPlace={(id) => {
            setPath("new");
            setPlaceId(id);
            setSelectedRecent(null);
            setScreen("mission");
          }}
          onSelectRecent={(p, m) => {
            setPath("recent");
            setSelectedRecent({ placeId: p, missionId: m });
          }}
          onSleepRecent={() => {
            if (!selectedRecent) return;
            const m = MissionsStore.get(selectedRecent.missionId);
            if (!m) return;
            void startSleep(m, selectedRecent.placeId, "recent");
          }}
          onOpenSettings={() => setScreen("settings")}
        />
      )}

      {screen === "mission" && placeId && (
        <MissionScreen
          placeId={placeId}
          onBack={() => setScreen("home")}
          onSelectMission={(m) => {
            void startSleep(m, placeId, "new");
          }}
        />
      )}

      {screen === "sleep" && mission && (
        <SleepScreen
          mission={mission}
          onUnlockRequest={() => setScreen("unlock")}
        />
      )}

      {screen === "unlock" && (
        <UnlockScreen
          onSuccess={() => setScreen("checkIn")}
          onForgotPin={() => void startForgotPin("unlock")}
        />
      )}

      {screen === "checkIn" && (
        <CheckInScreen
          path={path}
          secondsToSleep={secondsToSleep}
          mission={mission}
          placeId={placeId}
          onDone={() => setScreen("home")}
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
