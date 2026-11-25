import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { Screen } from "../components/Screen";
import { SleepingPhone } from "../components/SleepingPhone";
import { useLayout } from "../layout";
import { spacing } from "../theme";
import { useTheme } from "../theme/ThemeContext";

type Props = {
  onContinue: () => void;
};

const IOS_STEPS = [
  "Open Settings → Accessibility → Guided Access and turn it on.",
  "In PhoneNap, triple-click the side (or Home) button to start Guided Access before you hand the phone over.",
  "Set a Guided Access passcode that only you know — separate from the PhoneNap unlock PIN.",
];

const ANDROID_STEPS = [
  "Open Settings and turn on Screen pinning (often under Security or Display).",
  "Open PhoneNap, then use Overview / Recents and tap the pin icon on this app.",
  "Ask for your device PIN or pattern when unpinning so a child cannot leave alone.",
];

export function OnboardingScreen({ onContinue }: Props) {
  const layout = useLayout();
  const { colors } = useTheme();
  const [knowsUnlock, setKnowsUnlock] = useState(false);
  const [demoPressing, setDemoPressing] = useState(false);
  const isIos = Platform.OS === "ios";
  const steps = isIos ? IOS_STEPS : ANDROID_STEPS;
  const lockName = isIos ? "Guided Access" : "Screen pinning";

  return (
    <Screen header={<AppHeader />}>
      <Text
        style={[styles.title, { fontSize: layout.font(26), color: colors.seaDeep }]}
      >
        Before you hand over
      </Text>
      <Text
        style={[
          styles.lead,
          {
            fontSize: layout.font(16),
            lineHeight: layout.font(22),
            color: colors.inkSoft,
          },
        ]}
      >
        PhoneNap cannot stop a child from leaving the app by itself. You still
        need {lockName} from the system.
      </Text>

      <Text
        style={[styles.section, { fontSize: layout.font(15), color: colors.ink }]}
      >
        {lockName}
      </Text>
      {steps.map((step, i) => (
        <View key={step} style={styles.stepRow}>
          <Text
            style={[
              styles.stepNum,
              {
                fontSize: layout.font(13),
                backgroundColor: colors.fog,
                color: colors.seaDeep,
              },
            ]}
          >
            {i + 1}
          </Text>
          <Text
            style={[
              styles.stepText,
              {
                fontSize: layout.font(15),
                lineHeight: layout.font(22),
                color: colors.ink,
              },
            ]}
          >
            {step}
          </Text>
        </View>
      ))}

      <Text
        style={[styles.section, { fontSize: layout.font(15), color: colors.ink }]}
      >
        Silent mode
      </Text>
      <Text
        style={[
          styles.body,
          {
            fontSize: layout.font(15),
            lineHeight: layout.font(22),
            color: colors.inkSoft,
          },
        ]}
      >
        If the phone is silent, speech may not play. The mission picture and
        text still work — show those to your child.
      </Text>

      <Text
        style={[styles.section, { fontSize: layout.font(15), color: colors.ink }]}
      >
        How you wake PhoneNap (parents only)
      </Text>
      <Text
        style={[
          styles.body,
          {
            fontSize: layout.font(15),
            lineHeight: layout.font(22),
            color: colors.inkSoft,
          },
        ]}
      >
        After a nap, long-press the sleeping phone icon, then enter your PIN.
        Kids never see this tip on the sleep screen.
      </Text>

      <View
        style={[styles.unlockDemo, { backgroundColor: colors.dusk }]}
        accessibilityLabel="Sleeping phone to long-press"
      >
        <SleepingPhone
          compact
          pressing={demoPressing}
          onPressIn={() => setDemoPressing(true)}
          onPressOut={() => setDemoPressing(false)}
          accessibilityLabel="Practice long-press on sleeping phone"
        />
        <Text
          style={[
            styles.unlockLabel,
            { fontSize: layout.font(16), color: colors.moonGlow },
          ]}
        >
          Long-press this icon
        </Text>
        <Text
          style={[
            styles.unlockHint,
            { fontSize: layout.font(13), color: "rgba(232, 242, 240, 0.7)" },
          ]}
        >
          Hold about one second → enter PIN
        </Text>
      </View>

      <Pressable
        style={styles.checkRow}
        onPress={() => setKnowsUnlock((v) => !v)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: knowsUnlock }}
      >
        <View
          style={[
            styles.checkbox,
            {
              borderColor: colors.sea,
              backgroundColor: knowsUnlock ? colors.seaDeep : colors.surface,
            },
          ]}
        >
          {knowsUnlock ? (
            <Text style={[styles.checkMark, { color: colors.onPrimary }]}>✓</Text>
          ) : null}
        </View>
        <Text
          style={[
            styles.checkText,
            {
              fontSize: layout.font(15),
              lineHeight: layout.font(22),
              color: colors.ink,
            },
          ]}
        >
          I know to long-press the sleeping phone to unlock with my PIN
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.primary,
          { backgroundColor: colors.seaDeep },
          !knowsUnlock && styles.primaryDisabled,
        ]}
        disabled={!knowsUnlock}
        onPress={onContinue}
      >
        <Text style={[styles.primaryText, { color: colors.onPrimary }]}>
          Got it — continue
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  lead: {
    marginBottom: spacing.lg,
  },
  section: {
    fontWeight: "800",
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  stepRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: "hidden",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "800",
  },
  stepText: {
    flex: 1,
  },
  body: {
    marginBottom: spacing.md,
  },
  unlockDemo: {
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  unlockLabel: {
    fontWeight: "800",
  },
  unlockHint: {
    fontWeight: "600",
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkMark: {
    fontWeight: "900",
    fontSize: 14,
    lineHeight: 16,
  },
  checkText: {
    flex: 1,
    fontWeight: "700",
  },
  primary: {
    marginTop: spacing.sm,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryDisabled: {
    opacity: 0.4,
  },
  primaryText: {
    fontWeight: "800",
  },
});
