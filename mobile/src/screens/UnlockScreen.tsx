import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { PinDots, PinKeypad } from "../components/PinKeypad";
import { Screen } from "../components/Screen";
import { useLayout } from "../layout";
import { PinStore } from "../stores/pinStore";
import { spacing } from "../theme";
import { useTheme } from "../theme/ThemeContext";

type Props = {
  onSuccess: () => void;
  onForgotPin?: () => void;
};

export function UnlockScreen({ onSuccess, onForgotPin }: Props) {
  const layout = useLayout();
  const { colors } = useTheme();
  const [digits, setDigits] = useState("");
  const [shake, setShake] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function tryUnlock(next: string) {
    if (busy || next.length !== 4) return;
    setBusy(true);
    setError(null);
    try {
      const ok = await PinStore.verify(next);
      if (ok) {
        setDigits("");
        onSuccess();
        return;
      }
      setShake(true);
      setDigits("");
      setTimeout(() => setShake(false), 350);
    } catch {
      setDigits("");
      setError("Couldn't verify PIN. Try again.");
    } finally {
      setBusy(false);
    }
  }

  function onChange(next: string) {
    setDigits(next);
    if (next.length === 4) void tryUnlock(next);
  }

  return (
    <Screen night center scroll={false} header={<AppHeader night />}>
      <Text
        style={[
          styles.kicker,
          { fontSize: layout.font(12), color: colors.moon },
        ]}
      >
        Parent only
      </Text>
      <Text
        style={[
          styles.title,
          { fontSize: layout.font(26), color: colors.white },
        ]}
      >
        Wake PhoneNap
      </Text>
      <Text
        style={[
          styles.hint,
          { fontSize: layout.font(15), color: "rgba(232, 242, 240, 0.65)" },
        ]}
      >
        Enter PIN
      </Text>
      <View style={shake ? styles.shake : undefined}>
        <PinDots length={4} filled={digits.length} dark />
      </View>
      <PinKeypad value={digits} onChange={onChange} dark />
      {error ? (
        <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
      ) : null}
      {onForgotPin ? (
        <Text
          style={[styles.forgot, { color: colors.moonGlow }]}
          onPress={onForgotPin}
        >
          Forgot PIN? Use device unlock
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  title: {
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  hint: {
    marginBottom: spacing.lg,
  },
  shake: {
    transform: [{ translateX: -4 }],
  },
  error: {
    marginTop: spacing.md,
    fontWeight: "700",
    textAlign: "center",
  },
  forgot: {
    marginTop: spacing.lg,
    fontWeight: "700",
  },
});
