import { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, spacing } from "../theme";

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
  const [knowsUnlock, setKnowsUnlock] = useState(false);
  const isIos = Platform.OS === "ios";
  const steps = isIos ? IOS_STEPS : ANDROID_STEPS;
  const lockName = isIos ? "Guided Access" : "Screen pinning";

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <Text style={styles.brand}>PhoneNap</Text>
      <Text style={styles.title}>Before you hand over</Text>
      <Text style={styles.lead}>
        PhoneNap cannot stop a child from leaving the app by itself. You still
        need {lockName} from the system.
      </Text>

      <Text style={styles.section}>{lockName}</Text>
      {steps.map((step, i) => (
        <View key={step} style={styles.stepRow}>
          <Text style={styles.stepNum}>{i + 1}</Text>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}

      <Text style={styles.section}>Silent mode</Text>
      <Text style={styles.body}>
        If the phone is silent, speech may not play. The mission picture and
        text still work — show those to your child.
      </Text>

      <Text style={styles.section}>How you wake PhoneNap (parents only)</Text>
      <Text style={styles.body}>
        After a nap, long-press the sleeping phone icon, then enter your PIN.
        Kids never see this tip on the sleep screen.
      </Text>

      <View style={styles.unlockDemo} accessibilityLabel="Sleeping phone to long-press">
        <View style={styles.phone}>
          <View style={styles.face}>
            <View style={styles.eye} />
            <View style={styles.eye} />
          </View>
          <Text style={styles.zzz}>z z z</Text>
        </View>
        <Text style={styles.unlockLabel}>Long-press this icon</Text>
        <Text style={styles.unlockHint}>Hold about one second → enter PIN</Text>
      </View>

      <Pressable
        style={styles.checkRow}
        onPress={() => setKnowsUnlock((v) => !v)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: knowsUnlock }}
      >
        <View style={[styles.checkbox, knowsUnlock && styles.checkboxOn]}>
          {knowsUnlock ? <Text style={styles.checkMark}>✓</Text> : null}
        </View>
        <Text style={styles.checkText}>
          I know to long-press the sleeping phone to unlock with my PIN
        </Text>
      </Pressable>

      <Pressable
        style={[styles.primary, !knowsUnlock && styles.primaryDisabled]}
        disabled={!knowsUnlock}
        onPress={onContinue}
      >
        <Text style={styles.primaryText}>Got it — continue</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    backgroundColor: colors.paper,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl * 2,
    paddingBottom: spacing.xl,
  },
  brand: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.seaDeep,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.seaDeep,
    marginBottom: spacing.sm,
  },
  lead: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.inkSoft,
    marginBottom: spacing.lg,
  },
  section: {
    fontWeight: "800",
    color: colors.ink,
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
    backgroundColor: colors.fog,
    color: colors.seaDeep,
    fontWeight: "800",
    fontSize: 13,
  },
  stepText: {
    flex: 1,
    color: colors.ink,
    lineHeight: 22,
  },
  body: {
    color: colors.inkSoft,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  unlockDemo: {
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.dusk,
    marginBottom: spacing.md,
  },
  phone: {
    width: 72,
    height: 112,
    borderRadius: 16,
    backgroundColor: "#2f6b66",
    borderWidth: 2,
    borderColor: "rgba(240, 217, 168, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  face: { flexDirection: "row", gap: 14 },
  eye: {
    width: 14,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.moon,
  },
  zzz: {
    position: "absolute",
    top: 10,
    right: -6,
    color: colors.moonGlow,
    fontWeight: "700",
    fontSize: 12,
  },
  unlockLabel: {
    color: colors.moonGlow,
    fontWeight: "800",
    fontSize: 16,
  },
  unlockHint: {
    marginTop: 4,
    color: "rgba(232, 242, 240, 0.7)",
    fontWeight: "600",
    fontSize: 13,
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
    borderColor: colors.sea,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    backgroundColor: colors.white,
  },
  checkboxOn: {
    backgroundColor: colors.seaDeep,
    borderColor: colors.seaDeep,
  },
  checkMark: {
    color: colors.white,
    fontWeight: "900",
    fontSize: 14,
    lineHeight: 16,
  },
  checkText: {
    flex: 1,
    color: colors.ink,
    fontWeight: "700",
    lineHeight: 22,
  },
  primary: {
    marginTop: spacing.sm,
    backgroundColor: colors.seaDeep,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryDisabled: {
    opacity: 0.4,
  },
  primaryText: {
    color: colors.white,
    fontWeight: "800",
  },
});
