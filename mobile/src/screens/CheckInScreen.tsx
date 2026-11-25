import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { Screen } from "../components/Screen";
import type { Mission } from "../data/missions";
import { useLayout } from "../layout";
import {
  FeedbackStore,
  type HandoffAnswer,
  type YesNo,
} from "../stores/feedbackStore";
import { PlacesStore } from "../stores/placesStore";
import { SettingsStore } from "../stores/settingsStore";
import { spacing } from "../theme";
import { useTheme } from "../theme/ThemeContext";

type Props = {
  path: "new" | "recent";
  secondsToSleep: number | null;
  mission: Mission | null;
  placeId: string | null;
  onDone: () => void;
};

type ChoiceProps<T extends string> = {
  question: string;
  help?: string;
  options: { value: T; label: string; detail?: string }[];
  value: T | null;
  onChange: (v: T) => void;
};

function ChoiceGroup<T extends string>({
  question,
  help,
  options,
  value,
  onChange,
}: ChoiceProps<T>) {
  const layout = useLayout();
  const { colors } = useTheme();
  return (
    <View style={styles.group}>
      <Text
        style={[
          styles.question,
          { fontSize: layout.font(16), color: colors.ink },
        ]}
      >
        {question}
      </Text>
      {help ? (
        <Text
          style={[
            styles.help,
            {
              fontSize: layout.font(13),
              lineHeight: layout.font(18),
              color: colors.inkSoft,
            },
          ]}
        >
          {help}
        </Text>
      ) : null}
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            style={[
              styles.option,
              {
                borderColor: selected ? colors.sea : colors.border,
                backgroundColor: selected ? colors.fog : colors.surface,
              },
            ]}
            onPress={() => onChange(opt.value)}
          >
            <Text
              style={[
                styles.optionText,
                {
                  fontSize: layout.font(15),
                  color: selected ? colors.seaDeep : colors.ink,
                },
              ]}
            >
              {opt.label}
            </Text>
            {opt.detail ? (
              <Text
                style={[
                  styles.optionDetail,
                  {
                    fontSize: layout.font(13),
                    color: colors.inkSoft,
                  },
                ]}
              >
                {opt.detail}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export function CheckInScreen({
  path,
  secondsToSleep,
  mission,
  placeId,
  onDone,
}: Props) {
  const layout = useLayout();
  const { colors } = useTheme();
  const [handoff, setHandoff] = useState<HandoffAnswer | null>(null);
  const [missionBegun, setMissionBegun] = useState<YesNo | null>(null);
  const [askedAgain, setAskedAgain] = useState<YesNo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ageBand, setAgeBand] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void SettingsStore.getAgeBand().then((age) => {
      if (!cancelled) setAgeBand(age);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function save() {
    if (!handoff || !missionBegun || !askedAgain) {
      setError("Answer all three questions, or skip for now.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const band = ageBand ?? (await SettingsStore.getAgeBand());
      await FeedbackStore.append({
        path,
        secondsToSleep,
        missionClass: mission?.class ?? null,
        missionId: mission?.id ?? null,
        placeId,
        ageBand: band,
        handoff,
        missionBegun,
        askedAgain,
        savedAt: new Date().toISOString(),
        storage: "local-device-only",
      });
      onDone();
    } catch {
      setError("Couldn't save on this phone — try again or skip.");
    } finally {
      setBusy(false);
    }
  }

  const placeLabel = placeId ? PlacesStore.label(placeId) : null;
  const summaryBits = [
    placeLabel,
    mission?.text,
    secondsToSleep != null ? `${secondsToSleep}s to sleep` : null,
  ].filter(Boolean);

  return (
    <Screen header={<AppHeader />}>
      <Text
        style={[styles.title, { fontSize: layout.font(26), color: colors.ink }]}
      >
        Quick check-in
      </Text>
      <Text
        style={[
          styles.lead,
          {
            fontSize: layout.font(15),
            lineHeight: layout.font(22),
            color: colors.inkSoft,
          },
        ]}
      >
        Optional — three short questions about that nap. Stays on this phone
        only. Skip anytime.
      </Text>

      {summaryBits.length > 0 ? (
        <View style={[styles.summary, { backgroundColor: colors.fog }]}>
          <Text
            style={[
              styles.summaryLabel,
              { fontSize: layout.font(11), color: colors.sea },
            ]}
          >
            This nap
          </Text>
          <Text
            style={[
              styles.summaryText,
              {
                fontSize: layout.font(14),
                lineHeight: layout.font(20),
                color: colors.ink,
              },
            ]}
          >
            {summaryBits.join(" · ")}
          </Text>
        </View>
      ) : null}

      <ChoiceGroup
        question="How did handing the phone over go?"
        help="When you took the phone back after the nap."
        value={handoff}
        onChange={setHandoff}
        options={[
          {
            value: "none",
            label: "Smooth",
            detail: "They handed it over without a reminder",
          },
          {
            value: "one",
            label: "One reminder",
            detail: "Needed a single cue from you",
          },
          {
            value: "negotiate",
            label: "Back-and-forth",
            detail: "Took some negotiating",
          },
        ]}
      />

      <ChoiceGroup
        question="Did they start the mission?"
        help="The activity on the sleep screen — looking for cars, counting, and so on."
        value={missionBegun}
        onChange={setMissionBegun}
        options={[
          { value: "yes", label: "Yes — they started" },
          { value: "no", label: "No — not yet" },
        ]}
      />

      <ChoiceGroup
        question="Did they ask for the phone again?"
        help="Only count the next few minutes after you took the phone back (about five minutes)."
        value={askedAgain}
        onChange={setAskedAgain}
        options={[
          { value: "yes", label: "Yes, they asked" },
          { value: "no", label: "No, they moved on" },
        ]}
      />

      {error ? (
        <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
      ) : null}

      <Pressable
        style={[
          styles.primary,
          { backgroundColor: colors.ink },
          busy && styles.disabled,
        ]}
        disabled={busy}
        onPress={() => void save()}
      >
        <Text style={[styles.primaryText, { color: colors.bg }]}>Save</Text>
      </Pressable>
      <Pressable onPress={onDone} disabled={busy}>
        <Text style={[styles.skip, { color: colors.inkSoft }]}>
          Skip for now
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: "700",
    marginBottom: spacing.sm,
    letterSpacing: -0.3,
  },
  lead: {
    marginBottom: spacing.md,
  },
  summary: {
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryLabel: {
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  summaryText: {
    fontWeight: "600",
  },
  group: {
    marginBottom: spacing.lg,
  },
  question: {
    fontWeight: "700",
    marginBottom: 4,
  },
  help: {
    marginBottom: spacing.sm,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.xs,
  },
  optionText: {
    fontWeight: "700",
  },
  optionDetail: {
    marginTop: 2,
    fontWeight: "500",
  },
  error: {
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  primary: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  disabled: {
    opacity: 0.6,
  },
  primaryText: {
    fontWeight: "700",
  },
  skip: {
    textAlign: "center",
    fontWeight: "600",
    paddingVertical: spacing.sm,
  },
});
