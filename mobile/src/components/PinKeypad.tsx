import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { colors, spacing } from "../theme";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"] as const;

type Props = {
  value: string;
  onChange: (next: string) => void;
  dark?: boolean;
  maxLength?: number;
};

export function PinDots({
  length,
  filled,
  dark,
}: {
  length: number;
  filled: number;
  dark?: boolean;
}) {
  return (
    <View style={styles.dots}>
      {Array.from({ length }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            dark ? styles.dotDark : styles.dotLight,
            i < filled && (dark ? styles.dotFilledDark : styles.dotFilledLight),
          ]}
        />
      ))}
    </View>
  );
}

function useKeypadMetrics() {
  const { width } = useWindowDimensions();
  // Leave screen padding; grow on large phones, stay thumb-friendly on small ones.
  const padWidth = Math.min(360, Math.max(260, width - spacing.lg * 2));
  const gap = Math.round(padWidth * 0.04);
  const keySize = Math.floor((padWidth - gap * 2) / 3);
  return { padWidth, gap, keySize };
}

export function PinKeypad({ value, onChange, dark = false, maxLength = 4 }: Props) {
  const { padWidth, gap, keySize } = useKeypadMetrics();

  function press(key: (typeof KEYS)[number]) {
    if (key === "") return;
    if (key === "del") {
      onChange(value.slice(0, -1));
      return;
    }
    if (value.length >= maxLength) return;
    onChange(value + key);
  }

  const keyStyle = {
    width: keySize,
    height: keySize,
    borderRadius: keySize / 2,
  };

  return (
    <View style={[styles.pad, { width: padWidth, gap }]}>
      {KEYS.map((key, i) => {
        if (key === "") {
          return <View key={`empty-${i}`} style={keyStyle} />;
        }
        return (
          <Pressable
            key={key === "del" ? "del" : key}
            style={[styles.key, keyStyle, dark ? styles.keyDark : styles.keyLight]}
            onPress={() => press(key)}
          >
            <Text
              style={[
                styles.keyText,
                { fontSize: Math.round(keySize * 0.33) },
                dark && styles.keyTextDark,
              ]}
            >
              {key === "del" ? "⌫" : key}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: {
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  dotLight: {
    borderColor: "rgba(26, 69, 67, 0.35)",
  },
  dotDark: {
    borderColor: "rgba(240, 217, 168, 0.55)",
  },
  dotFilledLight: {
    backgroundColor: colors.seaDeep,
    borderColor: colors.seaDeep,
  },
  dotFilledDark: {
    backgroundColor: colors.moon,
    borderColor: colors.moon,
  },
  pad: {
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  key: {
    alignItems: "center",
    justifyContent: "center",
  },
  keyLight: {
    backgroundColor: "rgba(26, 69, 67, 0.08)",
  },
  keyDark: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  keyText: {
    fontWeight: "700",
    color: colors.seaDeep,
  },
  keyTextDark: {
    color: colors.white,
  },
});
