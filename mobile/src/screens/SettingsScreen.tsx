import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { FeedbackStore } from "../stores/feedbackStore";
import {
  SettingsStore,
  type AgeBand,
} from "../stores/settingsStore";
import { colors, spacing } from "../theme";

const AGE_OPTIONS: { id: AgeBand; label: string }[] = [
  { id: "3", label: "3" },
  { id: "4", label: "4" },
  { id: "5", label: "5" },
  { id: "prefer-not", label: "Prefer not to say" },
];

type Props = {
  onChangePin: () => void;
  onForgotPin: () => void;
  onBack: () => void;
};

export function SettingsScreen({ onChangePin, onForgotPin, onBack }: Props) {
  const [age, setAge] = useState<AgeBand | null>(null);
  const [logCount, setLogCount] = useState(0);
  const [exportHint, setExportHint] = useState<string | null>(null);

  const refreshCount = useCallback(async () => {
    setLogCount(await FeedbackStore.count());
  }, []);

  useEffect(() => {
    void SettingsStore.getAgeBand().then(setAge);
    void refreshCount();
  }, [refreshCount]);

  async function selectAge(band: AgeBand) {
    await SettingsStore.setAgeBand(band);
    setAge(band);
  }

  async function exportLog() {
    const result = await FeedbackStore.shareAll();
    const n = await FeedbackStore.count();
    setLogCount(n);
    setExportHint(
      result === "shared"
        ? `${n} saved · shared`
        : `${n} saved · copied to clipboard`
    );
  }

  function confirmClear() {
    Alert.alert(
      "Delete local feedback?",
      "Removes the append-only check-in log on this device. Cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void (async () => {
              await FeedbackStore.clear();
              setLogCount(0);
              setExportHint(null);
            })();
          },
        },
      ]
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <Text style={styles.brand}>Settings</Text>
      <Text style={styles.title}>Child’s age band</Text>
      <Text style={styles.hint}>Asked once. Used only to group feedback.</Text>

      <View style={styles.ageGrid}>
        {AGE_OPTIONS.map((opt) => (
          <Pressable
            key={opt.id}
            style={[
              styles.ageBtn,
              opt.id === "prefer-not" && styles.ageWide,
              age === opt.id && styles.ageSelected,
            ]}
            onPress={() => void selectAge(opt.id)}
          >
            <Text
              style={[
                styles.ageText,
                age === opt.id && styles.ageTextSelected,
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.primary} onPress={onChangePin}>
        <Text style={styles.primaryText}>Change unlock PIN</Text>
      </Pressable>

      <Pressable style={styles.secondary} onPress={onForgotPin}>
        <Text style={styles.secondaryText}>Forgot PIN? Use device unlock</Text>
      </Pressable>

      <Text style={styles.note}>
        On iPhone, deleting the app may not clear the PIN (Keychain can survive
        reinstall). Use device unlock to set a new PIN.
      </Text>

      <View style={styles.privacyBox}>
        <Text style={styles.sectionLabel}>Local check-in log</Text>
        <Text style={styles.privacyCopy}>
          No microphone, camera, or motion. Feedback stays on this device (no
          accounts, no ads ID, no location).
        </Text>
        <Text style={styles.logCount}>
          {exportHint ?? `${logCount} saved`}
        </Text>
        <Pressable style={styles.secondary} onPress={() => void exportLog()}>
          <Text style={styles.secondaryText}>Share / copy all</Text>
        </Pressable>
        <Pressable onPress={confirmClear}>
          <Text style={styles.danger}>Delete local feedback on this device</Text>
        </Pressable>
      </View>

      <Pressable onPress={onBack}>
        <Text style={styles.back}>Back to Home</Text>
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
  hint: {
    color: colors.inkSoft,
    marginBottom: spacing.md,
  },
  ageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  ageBtn: {
    minWidth: "30%",
    flexGrow: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(26, 69, 67, 0.14)",
    backgroundColor: colors.white,
    alignItems: "center",
  },
  ageWide: {
    minWidth: "100%",
  },
  ageSelected: {
    borderColor: colors.sea,
    backgroundColor: "#eef8f6",
  },
  ageText: {
    fontWeight: "800",
    color: colors.ink,
  },
  ageTextSelected: {
    color: colors.seaDeep,
  },
  primary: {
    backgroundColor: colors.seaDeep,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  primaryText: {
    color: colors.white,
    fontWeight: "800",
  },
  secondary: {
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryText: {
    color: colors.sea,
    fontWeight: "700",
  },
  note: {
    marginTop: spacing.md,
    fontSize: 13,
    lineHeight: 18,
    color: colors.inkSoft,
  },
  privacyBox: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.fog,
  },
  sectionLabel: {
    fontWeight: "800",
    color: colors.seaDeep,
    marginBottom: spacing.xs,
  },
  privacyCopy: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.inkSoft,
    marginBottom: spacing.sm,
  },
  logCount: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  danger: {
    textAlign: "center",
    color: "#9b2c2c",
    fontWeight: "700",
    paddingVertical: spacing.sm,
  },
  back: {
    marginTop: spacing.xl,
    textAlign: "center",
    color: colors.inkSoft,
    fontWeight: "700",
  },
});
