import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native";
import type { Mission } from "./src/data/missions";
import type { AppScreen } from "./src/navigation/types";
import { HomeScreen } from "./src/screens/HomeScreen";
import { MissionScreen } from "./src/screens/MissionScreen";
import { CheckInScreen } from "./src/screens/CheckInScreen";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { PinSetupScreen, type PinSetupMode } from "./src/screens/PinSetupScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { SleepScreen } from "./src/screens/SleepScreen";
import { UnlockScreen } from "./src/screens/UnlockScreen";
import { MissionsStore } from "./src/stores/missionsStore";
import { authenticateDeviceOwner } from "./src/stores/pinRecovery";
import { PinStore } from "./src/stores/pinStore";
import { RecentsStore } from "./src/stores/recentsStore";
import { SettingsStore } from "./src/stores/settingsStore";
import { colors, spacing } from "./src/theme";

/**
 * Stack tip: check-in (#6) ← this onboarding (#7).
 */
export default function App() {
  const [ready, setReady] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);
  const [bootNonce, setBootNonce] = useState(0);
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
    setReady(false);
    setBootError(null);
    (async () => {
      try {
        const has = await PinStore.hasPin();
        if (cancelled) return;
        if (!has) {
          setPinMode("create");
          setPinCancelTo(null);
          setScreen("pinSetup");
        } else if (!(await SettingsStore.isOnboardingDone())) {
          setScreen("onboarding");
        } else {
          setScreen("home");
        }
      } catch {
        if (cancelled) return;
        setBootError(
          "Couldn't access secure storage. Check device lock settings and try again."
        );
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bootNonce]);

  const retryBoot = useCallback(() => {
    setBootNonce((n) => n + 1);
  }, []);

  const finishOnboarding = useCallback(async () => {
    try {
      await SettingsStore.setOnboardingDone();
      setScreen("home");
    } catch {
      Alert.alert(
        "Couldn't save",
        "Onboarding progress wasn't saved. You can continue, or try again from Settings."
      );
      setScreen("home");
    }
  }, []);

  const afterPinSetup = useCallback(async () => {
    setPinCancelTo(null);
    try {
      if (!(await SettingsStore.isOnboardingDone())) {
        setScreen("onboarding");
        return;
      }
    } catch {
      // Prefer teaching locks once over blocking after PIN create.
      setScreen("onboarding");
      return;
    }
    setScreen("home");
  }, []);

  const startForgotPin = useCallback(async (returnTo: AppScreen) => {
    try {
      const result = await authenticateDeviceOwner();
      if (!result.ok) {
        Alert.alert("Could not verify", result.error ?? "Try again.");
        return;
      }
      setPinCancelTo(returnTo);
      setPinMode("create");
      setScreen("pinSetup");
    } catch {
      Alert.alert("Could not verify", "Try again.");
    }
  }, []);

  const onHomeVisible = useCallback(() => {
    homeVisibleAt.current = performance.now();
  }, []);

  const startSleep = useCallback(
    (nextMission: Mission, nextPlaceId: string, nextPath: "new" | "recent") => {
      const started = homeVisibleAt.current;
      const secs =
        started == null
          ? 0
          : Math.max(0, Math.round((performance.now() - started) / 100) / 10);
      setSecondsToSleep(secs);
      setMission(nextMission);
      setPlaceId(nextPlaceId);
      setPath(nextPath);
      // Meltdown path must not wait on optional persistence.
      setScreen("sleep");
      void RecentsStore.push({
        placeId: nextPlaceId,
        missionId: nextMission.id,
      }).catch(() => {
        // Optional persistence failed; nap flow continues.
      });
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

  if (bootError) {
    return (
      <View style={styles.boot}>
        <Text style={styles.bootError}>{bootError}</Text>
        <Pressable style={styles.retry} onPress={retryBoot}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style={screen === "unlock" || screen === "sleep" ? "light" : "dark"} />

      {screen === "pinSetup" && (
        <PinSetupScreen
          initialMode={pinMode}
          onDone={() => void afterPinSetup()}
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
            startSleep(m, selectedRecent.placeId, "recent");
          }}
          onOpenSettings={() => setScreen("settings")}
        />
      )}

      {screen === "mission" && placeId && (
        <MissionScreen
          placeId={placeId}
          onBack={() => setScreen("home")}
          onSelectMission={(m) => {
            startSleep(m, placeId, "new");
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
          onReviewOnboarding={() => setScreen("onboarding")}
          onBack={() => setScreen("home")}
        />
      )}

      {screen === "onboarding" && (
        <OnboardingScreen onContinue={() => void finishOnboarding()} />
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
    paddingHorizontal: spacing.lg,
  },
  bootError: {
    color: colors.inkSoft,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  retry: {
    backgroundColor: colors.seaDeep,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
  },
  retryText: {
    color: colors.white,
    fontWeight: "800",
  },
});
