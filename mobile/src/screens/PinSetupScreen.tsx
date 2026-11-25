import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { PinDots, PinKeypad } from "../components/PinKeypad";
import { Screen } from "../components/Screen";
import { useLayout } from "../layout";
import { PinStore } from "../stores/pinStore";
import { spacing } from "../theme";
import { useTheme } from "../theme/ThemeContext";

export type PinSetupMode = "verify" | "create" | "confirm";

type Props = {
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
  const layout = useLayout();
  const { colors } = useTheme();
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

      if (nextDigits !== pending) {
        setError("PINs didn’t match. Try again.");
        setPending(null);
        setDigits("");
        setMode("create");
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
    <Screen center header={<AppHeader />}>
      <Text
        style={[styles.title, { fontSize: layout.font(26), color: colors.seaDeep }]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.hint,
          {
            fontSize: layout.font(15),
            color: colors.inkSoft,
            lineHeight: layout.font(21),
          },
        ]}
      >
        {hint}
      </Text>
      <PinDots length={4} filled={digits.length} />
      <PinKeypad value={digits} onChange={onChange} />
      {error ? (
        <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
      ) : null}
      {onCancel ? (
        <Text style={[styles.cancel, { color: colors.sea }]} onPress={onCancel}>
          Cancel
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: "700",
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  hint: {
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  error: {
    marginTop: spacing.md,
    fontWeight: "700",
    textAlign: "center",
  },
  cancel: {
    marginTop: spacing.lg,
    fontWeight: "700",
  },
});
