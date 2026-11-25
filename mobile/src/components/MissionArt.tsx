import { StyleSheet, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";

type Props = {
  art: string;
  large?: boolean;
  height?: number;
  /** Sleep screen: keep the light tile kids see on Home / mission pick. */
  light?: boolean;
};

/** Simple literal cues for pre-readers (no emoji). */
export function MissionArt({ art, large, height, light }: Props) {
  const { colors, isDark } = useTheme();
  const size = large ? 22 : 14;
  const tileBg = light
    ? "#e8f2ef"
    : large
      ? "rgba(255,255,255,0.1)"
      : isDark
        ? colors.fog
        : "#e8f2ef";
  const largeStyle = large
    ? [styles.boxLarge, { backgroundColor: tileBg }, height != null ? { height } : null]
    : null;
  const boxBg = large ? undefined : { backgroundColor: tileBg };

  if (art === "three-blue" || art === "three-green") {
    const c = art === "three-blue" ? "#3b82c4" : "#4f9a6f";
    return (
      <View style={[styles.box, boxBg, largeStyle]}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.dot, { width: size, height: size, borderRadius: size / 2, backgroundColor: c }]} />
        ))}
      </View>
    );
  }

  if (art === "one-yellow") {
    return (
      <View style={[styles.box, boxBg, largeStyle]}>
        <View style={[styles.dot, { width: size + 8, height: size + 8, borderRadius: (size + 8) / 2, backgroundColor: "#e6c35c" }]} />
      </View>
    );
  }

  if (art === "five-round" || art === "five-cars") {
    const c = art === "five-cars" ? "#d45b5b" : colors.inkSoft;
    return (
      <View style={[styles.box, boxBg, largeStyle]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={
              art === "five-cars"
                ? [styles.car, large && styles.carLarge]
                : [styles.dot, { width: size - 2, height: size - 2, borderRadius: (size - 2) / 2, backgroundColor: c }]
            }
          />
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.box, boxBg, largeStyle]}>
      <View
        style={[
          styles.block,
          large && styles.blockLarge,
          { backgroundColor: colors.sea },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    padding: 6,
  },
  boxLarge: {
    width: "100%",
    height: 120,
    borderRadius: 16,
    gap: 8,
  },
  dot: {},
  car: {
    width: 22,
    height: 12,
    borderRadius: 3,
    backgroundColor: "#d45b5b",
  },
  carLarge: {
    width: 34,
    height: 16,
  },
  block: {
    width: 28,
    height: 20,
    borderRadius: 4,
    opacity: 0.55,
  },
  blockLarge: {
    width: 48,
    height: 32,
  },
});
