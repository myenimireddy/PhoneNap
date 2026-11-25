import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { Mission } from "../data/missions";
import {
  FeedbackStore,
  type HandoffAnswer,
  type YesNo,
} from "../stores/feedbackStore";
import { SettingsStore } from "../stores/settingsStore";
import { colors, spacing } from "../theme";

type Props = {
  path: "new" | "recent";
  secondsToSleep: number | null;
  mission: Mission | null;
  placeId: string | null;
  onDone: () => void;
};

type ChoiceProps<T extends string> = {
  legend: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
};

function ChoiceGroup<T extends string>({
  legend,
  options,
  value,
  onChange,
}: ChoiceProps<T>) {
  return (
    <View style={styles.group}>
      <Text style={styles.legend}>{legend}</Text>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            style={[styles.option, selected && styles.optionSelected]}
            onPress={() => onChange(opt.value)}
          >
            <Text
              style={[styles.optionText, selected && styles.optionTextSelected]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function formatMeta(
  path: "new" | "recent",
  secondsToSleep: number | null,
  missionClass: string | null | undefined,
  ageBand: string | null
): string {
  const secs = secondsToSleep == null ? "—" : `${secondsToSleep}`;
  const klass = missionClass ?? "—";
  const agePart = ageBand ? ` · age ${ageBand}` : "";
  return `Auto: ${path} path · ${secs}s · ${klass} class${agePart}`;
}

export function CheckInScreen({
  path,
  secondsToSleep,
  mission,
  placeId,
  onDone,
}: Props) {
  const [handoff, setHandoff] = useState<HandoffAnswer | null>(null);
  const [missionBegun, setMissionBegun] = useState<YesNo | null>(null);
  const [askedAgain, setAskedAgain] = useState<YesNo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [metaLine, setMetaLine] = useState(
    formatMeta(path, secondsToSleep, mission?.class, null)
  );

  useEffect(() => {
    let cancelled = false;
    void SettingsStore.getAgeBand().then((age) => {
      if (cancelled) return;
      setMetaLine(formatMeta(path, secondsToSleep, mission?.class, age));
    });
    return () => {
      cancelled = true;
    };
  }, [path, secondsToSleep, mission]);

  async function save() {
    if (!handoff || !missionBegun || !askedAgain) {
      setError("Please answer all three, or skip.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const ageBand = await SettingsStore.getAgeBand();
      await FeedbackStore.append({
        path,
        secondsToSleep,
        missionClass: mission?.class ?? null,
        missionId: mission?.id ?? null,
        placeId,
        ageBand,
        handoff,
        missionBegun,
        askedAgain,
        savedAt: new Date().toISOString(),
        storage: "local-device-only",
      });
      onDone();
    } catch {
      setError("Couldn't save locally—try again or skip.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <Text style={styles.brand}>PhoneNap</Text>
      <Text style={styles.title}>How did that nap go?</Text>
      <Text style={styles.hint}>{metaLine}</Text>

      <ChoiceGroup
        legend="Handoff"
        value={handoff}
        onChange={setHandoff}
        options={[
          { value: "none", label: "No cue" },
          { value: "one", label: "One cue" },
          { value: "negotiate", label: "Negotiation" },
        ]}
      />

      <ChoiceGroup
        legend="Mission started"
        value={missionBegun}
        onChange={setMissionBegun}
        options={[
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ]}
      />

      <ChoiceGroup
        legend="Did the child ask for the phone again?"
        value={askedAgain}
        onChange={setAskedAgain}
        options={[
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ]}
      />
      <Text style={styles.observe}>
        Pilot: leave this form open while you observe. Count “asked again” as
        Yes only within five minutes of handoff (instruction only — not timed
        in the app).
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.primary, busy && styles.disabled]}
        disabled={busy}
        onPress={() => void save()}
      >
        <Text style={styles.primaryText}>Save</Text>
      </Pressable>
      <Pressable onPress={onDone} disabled={busy}>
        <Text style={styles.skip}>Skip</Text>
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
    fontSize: 14,
  },
  group: {
    marginBottom: spacing.md,
  },
  legend: {
    fontWeight: "800",
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(26, 69, 67, 0.14)",
    backgroundColor: colors.white,
    marginBottom: spacing.xs,
  },
  optionSelected: {
    borderColor: colors.sea,
    backgroundColor: "#eef8f6",
  },
  optionText: {
    fontWeight: "700",
    color: colors.ink,
  },
  optionTextSelected: {
    color: colors.seaDeep,
  },
  observe: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.inkSoft,
    marginBottom: spacing.md,
  },
  error: {
    color: "#9b2c2c",
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  primary: {
    backgroundColor: colors.seaDeep,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  disabled: {
    opacity: 0.6,
  },
  primaryText: {
    color: colors.white,
    fontWeight: "800",
  },
  skip: {
    textAlign: "center",
    color: colors.inkSoft,
    fontWeight: "700",
    paddingVertical: spacing.sm,
  },
});
