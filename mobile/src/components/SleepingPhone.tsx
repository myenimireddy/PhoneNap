import { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useLayout } from "../layout";
import { useTheme } from "../theme/ThemeContext";

type Props = {
  settled?: boolean;
  pressing?: boolean;
  onPressIn?: () => void;
  onPressOut?: () => void;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/**
 * Sleeping phone — white screen + teal bezel; long-press to unlock.
 * Animates transform/opacity only (native-driver safe).
 */
export function SleepingPhone({
  settled = false,
  pressing = false,
  onPressIn,
  onPressOut,
  compact = false,
  style,
  accessibilityLabel = "Sleeping phone",
}: Props) {
  const layout = useLayout();
  const { colors: themeColors } = useTheme();
  const breathe = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(0)).current;

  const baseW = compact ? 76 : layout.isShort ? 84 : 96;
  const baseH = compact ? 118 : layout.isShort ? 130 : 148;
  const w = layout.space(baseW);
  const h = layout.space(baseH);
  const radius = Math.round(w * 0.22);
  const inset = Math.max(5, Math.round(w * 0.08));
  const screenRadius = Math.max(8, radius - inset);
  const eyeW = Math.max(12, Math.round(w * 0.2));
  const eyeH = Math.max(3, Math.round(h * 0.025));
  const eyeGap = Math.round(w * 0.2);

  useEffect(() => {
    if (settled) {
      breathe.stopAnimation();
      breathe.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [settled, breathe]);

  useEffect(() => {
    Animated.timing(pressAnim, {
      toValue: pressing ? 1 : 0,
      duration: 120,
      useNativeDriver: true,
    }).start();
  }, [pressing, pressAnim]);

  const translateY = breathe.interpolate({
    inputRange: [0, 1],
    outputRange: [0, settled ? 0 : -5],
  });
  const scale = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [settled ? 0.88 : 1, 0.96],
  });

  const body = (
    <View style={[{ width: w, height: h }, style]}>
      <Animated.View
        style={[
          styles.bezel,
          {
            width: w,
            height: h,
            borderRadius: radius,
            opacity: settled ? 0.55 : 1,
            transform: [{ translateY }, { scale }],
            borderColor: pressing
              ? "rgba(240, 217, 168, 0.85)"
              : "rgba(240, 217, 168, 0.4)",
          },
        ]}
      >
        <View style={[styles.bezelShade, { borderRadius: radius }]} />
        <View
          style={[
            styles.screen,
            {
              top: inset,
              left: inset,
              right: inset,
              bottom: inset,
              borderRadius: screenRadius,
              backgroundColor: themeColors.white,
            },
          ]}
        >
          <View style={[styles.notch, { width: w * 0.26 }]} />
          <View style={[styles.face, { gap: eyeGap }]}>
            <View
              style={[
                styles.eye,
                {
                  width: eyeW,
                  height: eyeH,
                  borderRadius: eyeH,
                  backgroundColor: themeColors.seaDeep,
                },
              ]}
            />
            <View
              style={[
                styles.eye,
                {
                  width: eyeW,
                  height: eyeH,
                  borderRadius: eyeH,
                  backgroundColor: themeColors.seaDeep,
                },
              ]}
            />
          </View>
          <View style={styles.homePip} />
        </View>

        {!settled ? (
          <View
            style={[styles.zzz, { right: -Math.round(w * 0.18) }]}
            accessibilityElementsHidden
          >
            <Text style={[styles.z, { fontSize: layout.font(compact ? 11 : 12) }]}>
              z
            </Text>
            <Text
              style={[
                styles.z,
                styles.zMid,
                { fontSize: layout.font(compact ? 13 : 15) },
              ]}
            >
              z
            </Text>
            <Text
              style={[
                styles.z,
                styles.zBig,
                { fontSize: layout.font(compact ? 15 : 18) },
              ]}
            >
              z
            </Text>
          </View>
        ) : null}
      </Animated.View>
    </View>
  );

  if (onPressIn || onPressOut) {
    return (
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Hold about one second to unlock"
        style={[styles.hit, { minWidth: w + 24, minHeight: h + 16 }]}
      >
        {body}
      </Pressable>
    );
  }

  return body;
}

const styles = StyleSheet.create({
  hit: {
    alignItems: "center",
    justifyContent: "center",
  },
  bezel: {
    backgroundColor: "#1f5550",
    borderWidth: 2,
    overflow: "visible",
    shadowColor: "#f0d9a8",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 10,
  },
  bezelShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(10, 30, 34, 0.35)",
  },
  screen: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  notch: {
    position: "absolute",
    top: 8,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(26, 69, 67, 0.2)",
  },
  face: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  eye: {
    opacity: 0.85,
  },
  homePip: {
    position: "absolute",
    bottom: 8,
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(26, 69, 67, 0.18)",
  },
  zzz: {
    position: "absolute",
    top: "8%",
    alignItems: "flex-start",
  },
  z: {
    color: "#ffe8b8",
    fontWeight: "800",
    lineHeight: 16,
    opacity: 0.7,
  },
  zMid: {
    marginLeft: 6,
    opacity: 0.85,
  },
  zBig: {
    marginLeft: 12,
    opacity: 1,
  },
});
