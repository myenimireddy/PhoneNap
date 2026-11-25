import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MissionArt } from "../components/MissionArt";
import type { Mission } from "../data/missions";
import {
  invalidateSpeechRuns,
  scheduleSettle,
  speakMission,
} from "../speech/speakMission";
import { colors, spacing } from "../theme";

type Props = {
  mission: Mission;
  onUnlockRequest: () => void;
};

export function SleepScreen({ mission, onUnlockRequest }: Props) {
  const [settled, setSettled] = useState(false);
  const [replayUsed, setReplayUsed] = useState(false);
  const [showReplay, setShowReplay] = useState(true);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearSettleTimer() {
    if (settleTimer.current) {
      clearTimeout(settleTimer.current);
      settleTimer.current = null;
    }
  }

  function beginSettleCountdown() {
    clearSettleTimer();
    settleTimer.current = scheduleSettle(() => {
      setSettled(true);
      setShowReplay(false);
    });
  }

  function startSpeech() {
    clearSettleTimer();
    setSettled(false);
    speakMission(mission.speak, beginSettleCountdown);
  }

  useEffect(() => {
    setReplayUsed(false);
    setShowReplay(true);
    setSettled(false);
    startSpeech();
    return () => {
      invalidateSpeechRuns();
      clearSettleTimer();
      if (pressTimer.current) clearTimeout(pressTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart when mission id changes
  }, [mission.id]);

  function onReplay() {
    if (replayUsed || settled) return;
    setReplayUsed(true);
    setShowReplay(false);
    startSpeech();
  }

  function onPressIn() {
    pressTimer.current = setTimeout(() => {
      onUnlockRequest();
    }, 1000);
  }

  function onPressOut() {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }

  return (
    <View style={[styles.root, settled && styles.rootSettled]}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[styles.phone, settled && styles.phoneSettled]}
      >
        <View style={styles.face}>
          <View style={styles.eye} />
          <View style={styles.eye} />
        </View>
        {!settled ? <Text style={styles.zzz}>z z z</Text> : null}
      </Pressable>
      <Text style={[styles.line, settled && styles.dim]}>The phone is napping</Text>

      <View style={[styles.missionCard, settled && styles.missionDim]}>
        <MissionArt art={mission.art} large />
        <Text style={styles.missionLabel}>Your mission</Text>
        <Text style={styles.missionText}>{mission.text}</Text>
        {showReplay && !settled ? (
          <Pressable style={styles.speakBtn} onPress={onReplay}>
            <Text style={styles.speakIcon}>♪</Text>
            <Text style={styles.speakLabel}>Hear again</Text>
          </Pressable>
        ) : null}
      </View>

      {settled ? (
        <View style={styles.handback}>
          <Text style={styles.handbackLine}>
            Hand the phone back to a grown-up
          </Text>
          <Text style={styles.handbackSub}>Go do your mission</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.dusk,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl * 2,
    paddingBottom: spacing.lg,
    alignItems: "center",
  },
  rootSettled: {
    opacity: 0.95,
  },
  phone: {
    width: 88,
    height: 136,
    borderRadius: 18,
    backgroundColor: "#2f6b66",
    borderWidth: 2,
    borderColor: "rgba(240, 217, 168, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  phoneSettled: {
    transform: [{ scale: 0.85 }],
    opacity: 0.55,
  },
  face: { flexDirection: "row", gap: 16 },
  eye: {
    width: 16,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.moon,
  },
  zzz: {
    position: "absolute",
    top: 12,
    right: -8,
    color: colors.moonGlow,
    fontWeight: "700",
  },
  line: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.moonGlow,
    marginBottom: spacing.md,
  },
  dim: { opacity: 0.45 },
  missionCard: {
    width: "100%",
    borderRadius: 22,
    padding: spacing.md,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(240, 217, 168, 0.28)",
  },
  missionDim: {
    opacity: 0.35,
  },
  missionLabel: {
    marginTop: spacing.sm,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "rgba(240, 217, 168, 0.75)",
  },
  missionText: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: "700",
    color: colors.white,
  },
  speakBtn: {
    marginTop: spacing.md,
    alignSelf: "center",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(240, 217, 168, 0.45)",
    minWidth: 88,
  },
  speakIcon: { fontSize: 22, color: colors.moonGlow },
  speakLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "800",
    color: colors.moonGlow,
  },
  handback: {
    marginTop: "auto",
    width: "100%",
    padding: spacing.md,
    borderRadius: 22,
    backgroundColor: "rgba(15, 30, 34, 0.55)",
    borderWidth: 1,
    borderColor: "rgba(240, 217, 168, 0.22)",
  },
  handbackLine: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.moonGlow,
  },
  handbackSub: {
    marginTop: 6,
    color: "rgba(232, 242, 240, 0.65)",
    fontWeight: "700",
  },
});
