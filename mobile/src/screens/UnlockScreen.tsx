import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { PinDots, PinKeypad } from "../components/PinKeypad";
import { PinStore } from "../stores/pinStore";
import { colors, spacing } from "../theme";

type Props = {
  onSuccess: () => void;
};

export function UnlockScreen({ onSuccess }: Props) {
  const [digits, setDigits] = useState("");
  const [shake, setShake] = useState(false);
  const [busy, setBusy] = useState(false);

  async function tryUnlock(next: string) {
    if (busy || next.length !== 4) return;
    setBusy(true);
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
});
