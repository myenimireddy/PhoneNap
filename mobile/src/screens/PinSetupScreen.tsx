import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { PinDots, PinKeypad } from "../components/PinKeypad";
import { PinStore } from "../stores/pinStore";
import { colors, spacing } from "../theme";

export type PinSetupMode = "verify" | "create" | "confirm";

type Props = {
  /** verify = change-PIN gate; create/confirm = first launch or after verify */
  initialMode?: PinSetupMode;
  onDone: () => void;
  onCancel?: () => void;
};

function copyFor(mode: PinSetupMode): { title: string; hint: string } {
  if (mode === "verify") {
    return {
      title: "Enter current PIN",
      hint: "Verify your current PIN before choosing a new one.",
    };
  }
  if (mode === "create") {
    return {
      title: "Create your PIN",
      hint: "4 digits · unlocks after a nap. Kids never see this on the sleep screen.",
    };
  }
  return {
    title: "Confirm your PIN",
    hint: "Enter the same 4 digits again.",
  };
}

export function PinSetupScreen({
  initialMode = "create",
  onDone,
  onCancel,
}: Props) {
  const [mode, setMode] = useState<PinSetupMode>(initialMode);
  const [digits, setDigits] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setDigits("");
    setPending(null);
    setError(null);
  }, [initialMode]);

  async function complete(nextDigits: string) {
    if (busy || nextDigits.length !== 4) return;
    setBusy(true);
    try {
      if (mode === "verify") {
        const ok = await PinStore.verify(nextDigits);
        if (!ok) {
          setError("Current PIN is incorrect. Try again.");
          setDigits("");
          return;
        }
        setError(null);
        setDigits("");
        setMode("create");
        return;
      }

      if (mode === "create") {
        setPending(nextDigits);
        setDigits("");
        setError(null);
        setMode("confirm");
        return;
      }

      // confirm
      if (nextDigits !== pending) {
        setError("PINs didn’t match. Try again.");
        setPending(null);
        setDigits("");
        setMode("create");
        // Keep error visible — do not clear it here
        return;
      }

      const saved = await PinStore.setPin(nextDigits);
      if (!saved) {
        setError("Couldn't save PIN. Try again.");
        setDigits("");
        return;
      }
      setError(null);
      onDone();
    } catch {
      setError("Couldn't access secure storage. Try again.");
      setDigits("");
    } finally {
      setBusy(false);
    }
  }

  function onChange(next: string) {
    setDigits(next);
    if (next.length === 4) {
      void complete(next);
    }
  }

  const { title, hint } = copyFor(mode);

  return (
    <View style={styles.root}>
      <Text style={styles.brand}>PhoneNap</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.hint}>{hint}</Text>
      <PinDots length={4} filled={digits.length} />
      <PinKeypad value={digits} onChange={onChange} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {onCancel ? (
        <Text style={styles.cancel} onPress={onCancel}>
          Cancel
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl * 2,
    alignItems: "center",
  },
  brand: {
    alignSelf: "stretch",
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
    textAlign: "center",
  },
  hint: {
    fontSize: 15,
    color: colors.inkSoft,
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 21,
  },
  error: {
    marginTop: spacing.md,
    color: "#a04545",
    fontWeight: "700",
    textAlign: "center",
  },
  cancel: {
    marginTop: spacing.lg,
    color: colors.sea,
    fontWeight: "700",
  },
});
