import type { ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useLayout } from "../layout";
import { useTheme } from "../theme/ThemeContext";

type Props = {
  children: ReactNode;
  header?: ReactNode;
  scroll?: boolean;
  /** Sleep / unlock night surface. */
  night?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  center?: boolean;
};

/**
 * Page chrome: white or black from appearance. Sticky IG-style header.
 */
export function Screen({
  children,
  header,
  scroll = true,
  night = false,
  style,
  contentStyle,
  center = false,
}: Props) {
  const layout = useLayout();
  const { colors } = useTheme();
  const bg = night ? colors.dusk : colors.bg;

  const padStyle = {
    paddingHorizontal: layout.pagePad,
    paddingTop: header ? spacingTop : layout.topPad,
    paddingBottom: layout.bottomPad,
    width: "100%" as const,
    maxWidth: layout.contentMax + layout.pagePad * 2,
    alignSelf: "center" as const,
  };

  const headerWrap = header ? (
    <View
      style={[
        styles.header,
        {
          backgroundColor: bg,
          borderBottomColor: night ? "rgba(255,255,255,0.08)" : colors.border,
          paddingHorizontal: layout.pagePad,
          maxWidth: layout.contentMax + layout.pagePad * 2,
          width: "100%",
          alignSelf: "center",
        },
      ]}
    >
      {header}
    </View>
  ) : null;

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        styles.grow,
        padStyle,
        center && styles.center,
        contentStyle,
      ]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[styles.grow, padStyle, center && styles.center, contentStyle]}
    >
      {children}
    </View>
  );

  return (
    <View style={[styles.flex, { backgroundColor: bg }, style]}>
      {headerWrap}
      {body}
    </View>
  );
}

const spacingTop = 8;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  grow: { flexGrow: 1 },
  center: { justifyContent: "center", alignItems: "center" },
  header: {
    zIndex: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
