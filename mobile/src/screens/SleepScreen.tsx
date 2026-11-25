import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MissionArt } from "../components/MissionArt";
import { SleepingPhone } from "../components/SleepingPhone";
import type { Mission } from "../data/missions";
import { useLayout } from "../layout";
import {
  invalidateSpeechRuns,
  scheduleSettle,
  speakMission,
} from "../speech/speakMission";
import { spacing } from "../theme";
import { useTheme } from "../theme/ThemeContext";

type Props = {
  mission: Mission;
  onUnlockRequest: () => void;
};

export function SleepScreen({ mission, onUnlockRequest }: Props) {
  const layout = useLayout();
  const { colors } = useTheme();
  const [settled, setSettled] = useState(false);
  const [replayUsed, setReplayUsed] = useState(false);
  const [showReplay, setShowReplay] = useState(true);
  const [pressing, setPressing] = useState(false);
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
    setPressing(false);
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
    setPressing(true);
    pressTimer.current = setTimeout(() => {
      setPressing(false);
      onUnlockRequest();
    }, 1000);
  }

  function onPressOut() {
    setPressing(false);
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }

  const artHeight = layout.vert(layout.isShort ? 88 : 120);

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.dusk,
          paddingHorizontal: layout.pagePad,
          paddingTop: layout.topPad + spacing.md,
          paddingBottom: layout.bottomPad,
        },
      ]}
    >
      <View
        style={[
          styles.top,
          settled && styles.topSettled,
          { maxWidth: layout.contentMax, width: "100%" },
        ]}
      >
        <SleepingPhone
          settled={settled}
          pressing={pressing}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          accessibilityLabel="Sleeping phone"
        />
        <Text
          style={[
            styles.line,
            settled && styles.dim,
            { fontSize: layout.font(18), color: colors.moonGlow },
          ]}
        >
          The phone is napping
        </Text>
      </View>

      <View
        style={[
          styles.missionCard,
          settled && styles.missionDim,
          {
            maxWidth: layout.contentMax,
            width: "100%",
            padding: layout.space(spacing.md),
            borderColor: "rgba(240, 217, 168, 0.28)",
          },
        ]}
      >
        <MissionArt art={mission.art} large light height={artHeight} />
        <Text
          style={[
            styles.missionLabel,
            { fontSize: layout.font(11), color: "rgba(240, 217, 168, 0.75)" },
          ]}
        >
          Your mission
        </Text>
        <Text
          style={[
            styles.missionText,
            { fontSize: layout.font(22), color: colors.white },
          ]}
        >
          {mission.text}
        </Text>
        {showReplay && !settled ? (
          <Pressable style={styles.speakBtn} onPress={onReplay}>
            <Text
              style={[
                styles.speakIcon,
                { fontSize: layout.font(22), color: colors.moonGlow },
              ]}
            >
              ♪
            </Text>
            <Text
              style={[
                styles.speakLabel,
                { fontSize: layout.font(12), color: colors.moonGlow },
              ]}
            >
              Hear again
            </Text>
          </Pressable>
        ) : null}
      </View>

      {settled ? (
        <View
          style={[
            styles.handback,
            {
              maxWidth: layout.contentMax,
              width: "100%",
              padding: layout.space(spacing.md),
            },
          ]}
        >
          <Text
            style={[
              styles.handbackLine,
              { fontSize: layout.font(22), color: colors.moonGlow },
            ]}
          >
            Hand the phone back to a grown-up
          </Text>
          <Text
            style={[
              styles.handbackSub,
              {
                fontSize: layout.font(15),
                color: "rgba(232, 242, 240, 0.65)",
              },
            ]}
          >
            Go do your mission
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
  },
  top: {
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  topSettled: {
    opacity: 0.9,
  },
  line: {
    fontWeight: "700",
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  dim: { opacity: 0.45 },
  missionCard: {
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: StyleSheet.hairlineWidth,
  },
  missionDim: {
    opacity: 0.35,
  },
  missionLabel: {
    marginTop: spacing.sm,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  missionText: {
    marginTop: 6,
    fontWeight: "700",
  },
  speakBtn: {
    marginTop: spacing.md,
    alignSelf: "center",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(240, 217, 168, 0.45)",
    minWidth: 88,
  },
  speakIcon: {},
  speakLabel: {
    marginTop: 4,
    fontWeight: "700",
  },
  handback: {
    marginTop: "auto",
    borderRadius: 16,
    backgroundColor: "rgba(15, 30, 34, 0.55)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(240, 217, 168, 0.22)",
  },
  handbackLine: {
    fontWeight: "700",
  },
  handbackSub: {
    marginTop: 6,
    fontWeight: "700",
  },
});
