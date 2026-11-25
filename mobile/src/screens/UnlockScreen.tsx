import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { PinDots, PinKeypad } from "../components/PinKeypad";
import { PinStore } from "../stores/pinStore";
import { colors, spacing } from "../theme";

type Props = {
  onSuccess: () => void;
  /** Parent-only forgot path — never shown on sleep UI itself */
  onForgotPin?: () => void;
};

export function UnlockScreen({ onSuccess, onForgotPin }: Props) {
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
    <View style={styles.root}>
      <Text style={styles.kicker}>Parent only</Text>
      <Text style={styles.title}>Wake PhoneNap</Text>
      <Text style={styles.hint}>Enter PIN</Text>
      <View style={shake ? styles.shake : undefined}>
        <PinDots length={4} filled={digits.length} dark />
      </View>
      <PinKeypad value={digits} onChange={onChange} dark />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {onForgotPin ? (
        <Text style={styles.forgot} onPress={onForgotPin}>
          Forgot PIN? Use device unlock
        </Text>
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
    alignItems: "center",
  },
  kicker: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: colors.moon,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.white,
    marginBottom: spacing.sm,
  },
  hint: {
    color: "rgba(232, 242, 240, 0.65)",
    marginBottom: spacing.lg,
  },
  shake: {
    transform: [{ translateX: -4 }],
  },
  error: {
    marginTop: spacing.md,
    color: "#f0b4b4",
    fontWeight: "700",
    textAlign: "center",
  },
  forgot: {
    marginTop: spacing.lg,
    color: colors.moonGlow,
    fontWeight: "700",
  },
});
