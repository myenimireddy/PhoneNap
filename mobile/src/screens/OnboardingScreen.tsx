import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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

      <Text style={styles.section}>Unlock tip (parents only)</Text>
      <Text style={styles.body}>
        After a nap, long-press the sleeping phone, then enter your PhoneNap
        PIN. Kids never see that tip on the sleep screen.
      </Text>

      <Pressable style={styles.primary} onPress={onContinue}>
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
  primary: {
    marginTop: spacing.lg,
    backgroundColor: colors.seaDeep,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryText: {
    color: colors.white,
    fontWeight: "800",
  },
});
