import { Pressable, StyleSheet, Text, View } from "react-native";
import { useLayout } from "../layout";
import { spacing } from "../theme";
import { useTheme } from "../theme/ThemeContext";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"] as const;

type Props = {
  value: string;
  onChange: (next: string) => void;
  /** Night chrome (unlock / sleep-adjacent). */
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
  const { colors } = useTheme();
  return (
    <View style={styles.dots}>
      {Array.from({ length }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              borderColor: dark
                ? "rgba(240, 217, 168, 0.55)"
                : colors.border,
              backgroundColor:
                i < filled
                  ? dark
                    ? colors.moon
                    : colors.seaDeep
                  : "transparent",
            },
            i < filled && dark
              ? { borderColor: colors.moon }
              : i < filled
                ? { borderColor: colors.seaDeep }
                : null,
          ]}
        />
      ))}
    </View>
  );
}

function useKeypadMetrics() {
  const layout = useLayout();
  const avail = layout.width - layout.pagePad * 2;
  const maxPad = layout.isShort ? 300 : 360;
  const minPad = layout.isNarrow ? 240 : 260;
  const padWidth = Math.min(maxPad, Math.max(minPad, avail));
  const gap = Math.round(padWidth * (layout.isShort ? 0.032 : 0.04));
  const keySize = Math.floor((padWidth - gap * 2) / 3);
  return { padWidth, gap, keySize };
}

export function PinKeypad({
  value,
  onChange,
  dark = false,
  maxLength = 4,
}: Props) {
  const { colors } = useTheme();
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
            style={[
              styles.key,
              keyStyle,
              {
                backgroundColor: dark
                  ? "rgba(255, 255, 255, 0.08)"
                  : colors.fog,
              },
            ]}
            onPress={() => press(key)}
          >
            <Text
              style={[
                styles.keyText,
                {
                  fontSize: Math.round(keySize * 0.33),
                  color: dark ? colors.white : colors.seaDeep,
                },
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
  keyText: {
    fontWeight: "700",
  },
});
