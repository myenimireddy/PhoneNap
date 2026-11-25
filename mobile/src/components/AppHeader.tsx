import type { ReactNode } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useLayout } from "../layout";
import { spacing } from "../theme";
import { useTheme } from "../theme/ThemeContext";

type Props = {
  left?: ReactNode;
  right?: ReactNode;
  night?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Instagram-inspired top bar: brand left, actions right.
 * No scroll-linked layout animation (avoids native-driver console errors).
 */
export function AppHeader({ left, right, night = false, style }: Props) {
  const layout = useLayout();
  const { colors } = useTheme();
  const logo = layout.space(28);
  const titleColor = night ? colors.moonGlow : colors.ink;

  return (
    <View style={[styles.row, style]}>
      <View style={styles.leftCluster}>
        {left}
        <Image
          source={require("../../assets/icon.png")}
          style={{
            width: logo,
            height: logo,
            borderRadius: layout.space(8),
          }}
          accessibilityLabel="PhoneNap logo"
        />
        <Text
          style={[styles.title, { fontSize: layout.font(20), color: titleColor }]}
        >
          PhoneNap
        </Text>
      </View>
      <View style={styles.rightCluster}>
        {right}
      </View>
    </View>
  );
}

type IconBtnProps = {
  label: string;
  onPress: () => void;
  glyph: string;
  night?: boolean;
};

export function HeaderIconButton({
  label,
  onPress,
  glyph,
  night = false,
}: IconBtnProps) {
  const layout = useLayout();
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.iconBtn}
    >
      <Text
        style={[
          styles.iconGlyph,
          {
            fontSize: layout.font(22),
            color: night ? colors.moon : colors.ink,
          },
        ]}
      >
        {glyph}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    minHeight: 44,
    paddingVertical: spacing.xs,
  },
  leftCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexShrink: 1,
  },
  rightCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  title: {
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  iconGlyph: {
    fontWeight: "600",
    lineHeight: 26,
  },
});
