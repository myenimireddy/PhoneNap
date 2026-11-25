import { StyleSheet, View } from "react-native";
import { colors } from "../theme";

type Props = { art: string; large?: boolean };

/** Simple literal cues for pre-readers (no emoji). */
export function MissionArt({ art, large }: Props) {
  const size = large ? 22 : 14;

  if (art === "three-blue" || art === "three-green") {
    const c = art === "three-blue" ? "#3b82c4" : "#4f9a6f";
    return (
      <View style={[styles.box, large && styles.boxLarge]}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.dot, { width: size, height: size, borderRadius: size / 2, backgroundColor: c }]} />
        ))}
      </View>
    );
  }

  if (art === "one-yellow") {
    return (
      <View style={[styles.box, large && styles.boxLarge]}>
        <View style={[styles.dot, { width: size + 8, height: size + 8, borderRadius: (size + 8) / 2, backgroundColor: "#e6c35c" }]} />
      </View>
    );
  }

  if (art === "five-round" || art === "five-cars") {
    const c = art === "five-cars" ? "#d45b5b" : colors.inkSoft;
    return (
      <View style={[styles.box, large && styles.boxLarge]}>
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

  // Generic fallback block for cart/truck/etc.
  return (
    <View style={[styles.box, large && styles.boxLarge]}>
      <View style={[styles.block, large && styles.blockLarge]} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#e8f2ef",
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
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
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
    backgroundColor: colors.sea,
    opacity: 0.55,
  },
  blockLarge: {
    width: 48,
    height: 32,
  },
});
