import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { AppHeader, HeaderIconButton } from "../components/AppHeader";
import { Screen } from "../components/Screen";
import { useLayout } from "../layout";
import { FeedbackStore } from "../stores/feedbackStore";
import { SettingsStore, type AgeBand } from "../stores/settingsStore";
import { spacing, type Appearance } from "../theme";
import { useTheme } from "../theme/ThemeContext";

const AGE_OPTIONS: { id: AgeBand; label: string }[] = [
  { id: "3", label: "3" },
  { id: "4", label: "4" },
  { id: "5", label: "5" },
  { id: "prefer-not", label: "Prefer not to say" },
];

const APPEARANCE_OPTIONS: { id: Appearance; label: string }[] = [
  { id: "system", label: "System" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

type Props = {
  onChangePin: () => void;
  onForgotPin: () => void;
  onReviewOnboarding: () => void;
  onBack: () => void;
};

export function SettingsScreen({
  onChangePin,
  onForgotPin,
  onReviewOnboarding,
  onBack,
}: Props) {
  const layout = useLayout();
  const { colors, appearance, setAppearance } = useTheme();
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
    <Screen
      header={
        <AppHeader
          left={
            <HeaderIconButton
              glyph="←"
              label="Back to Home"
              onPress={onBack}
            />
          }
        />
      }
    >
      <Text
        style={[
          styles.pageTitle,
          { fontSize: layout.font(22), color: colors.seaDeep },
        ]}
      >
        Settings
      </Text>

      <Text
        style={[styles.sectionLabel, { fontSize: layout.font(14), color: colors.seaDeep }]}
      >
        Appearance
      </Text>
      <Text
        style={[styles.hint, { fontSize: layout.font(14), color: colors.inkSoft }]}
      >
        Defaults to dark. Light is white; System follows your phone.
      </Text>
      <View style={styles.ageGrid}>
        {APPEARANCE_OPTIONS.map((opt) => {
          const selected = appearance === opt.id;
          return (
            <Pressable
              key={opt.id}
              style={[
                styles.ageBtn,
                {
                  borderColor: selected ? colors.sea : colors.border,
                  backgroundColor: selected ? colors.fog : colors.surface,
                },
              ]}
              onPress={() => void setAppearance(opt.id)}
            >
              <Text
                style={[
                  styles.ageText,
                  {
                    fontSize: layout.font(15),
                    color: selected ? colors.seaDeep : colors.ink,
                  },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View
        style={[
          styles.tipsBox,
          {
            backgroundColor: colors.fog,
            borderColor: colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.sectionLabel,
            { fontSize: layout.font(14), color: colors.seaDeep },
          ]}
        >
          Parent tips
        </Text>
        <Text
          style={[
            styles.privacyCopy,
            {
              fontSize: layout.font(13),
              lineHeight: layout.font(18),
              color: colors.inkSoft,
            },
          ]}
        >
          How to wake after a nap, Guided Access / Screen pinning, and silent
          mode — reread anytime.
        </Text>
        <Pressable
          style={[styles.primary, { backgroundColor: colors.seaDeep }]}
          onPress={onReviewOnboarding}
        >
          <Text style={[styles.primaryText, { color: colors.onPrimary }]}>
            Open parent instructions
          </Text>
        </Pressable>
      </View>

      <Text
        style={[styles.title, { fontSize: layout.font(26), color: colors.seaDeep }]}
      >
        Child’s age band
      </Text>
      <Text
        style={[styles.hint, { fontSize: layout.font(14), color: colors.inkSoft }]}
      >
        Asked once. Used only to group feedback.
      </Text>

      <View style={styles.ageGrid}>
        {AGE_OPTIONS.map((opt) => {
          const selected = age === opt.id;
          return (
            <Pressable
              key={opt.id}
              style={[
                styles.ageBtn,
                opt.id === "prefer-not" && styles.ageWide,
                {
                  borderColor: selected ? colors.sea : colors.border,
                  backgroundColor: selected ? colors.fog : colors.surface,
                },
              ]}
              onPress={() => void selectAge(opt.id)}
            >
              <Text
                style={[
                  styles.ageText,
                  {
                    fontSize: layout.font(15),
                    color: selected ? colors.seaDeep : colors.ink,
                  },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={[styles.primary, { backgroundColor: colors.seaDeep }]}
        onPress={onChangePin}
      >
        <Text style={[styles.primaryText, { color: colors.onPrimary }]}>
          Change unlock PIN
        </Text>
      </Pressable>

      <Pressable style={styles.secondary} onPress={onForgotPin}>
        <Text style={[styles.secondaryText, { color: colors.sea }]}>
          Forgot PIN? Use device unlock
        </Text>
      </Pressable>

      <Text
        style={[
          styles.note,
          {
            fontSize: layout.font(13),
            lineHeight: layout.font(18),
            color: colors.inkSoft,
          },
        ]}
      >
        On iPhone, deleting the app may not clear the PIN (Keychain can survive
        reinstall). Use device unlock to set a new PIN.
      </Text>

      <View style={[styles.privacyBox, { backgroundColor: colors.fog }]}>
        <Text
          style={[
            styles.sectionLabel,
            { fontSize: layout.font(14), color: colors.seaDeep },
          ]}
        >
          Local check-in log
        </Text>
        <Text
          style={[
            styles.privacyCopy,
            {
              fontSize: layout.font(13),
              lineHeight: layout.font(18),
              color: colors.inkSoft,
            },
          ]}
        >
          No microphone, camera, or motion. Feedback stays on this device (no
          accounts, no ads ID, no location).
        </Text>
        <Text style={[styles.logCount, { color: colors.ink }]}>
          {exportHint ?? `${logCount} saved`}
        </Text>
        <Pressable style={styles.secondary} onPress={() => void exportLog()}>
          <Text style={[styles.secondaryText, { color: colors.sea }]}>
            Share / copy all
          </Text>
        </Pressable>
        <Pressable onPress={confirmClear}>
          <Text style={[styles.danger, { color: colors.danger }]}>
            Delete local feedback on this device
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pageTitle: {
    fontWeight: "700",
    marginBottom: spacing.md,
    alignSelf: "stretch",
  },
  tipsBox: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  title: {
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  hint: {
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
    alignItems: "center",
  },
  ageWide: {
    minWidth: "100%",
  },
  ageText: {
    fontWeight: "800",
  },
  primary: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  primaryText: {
    fontWeight: "800",
  },
  secondary: {
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryText: {
    fontWeight: "700",
  },
  note: {
    marginTop: spacing.md,
  },
  privacyBox: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: 14,
  },
  sectionLabel: {
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  privacyCopy: {
    marginBottom: spacing.sm,
  },
  logCount: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  danger: {
    textAlign: "center",
    fontWeight: "700",
    paddingVertical: spacing.sm,
  },
});
