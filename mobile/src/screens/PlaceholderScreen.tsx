import { Pressable, StyleSheet, Text } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { Screen } from "../components/Screen";
import { useLayout } from "../layout";
import { spacing } from "../theme";
import { useTheme } from "../theme/ThemeContext";

type Props = {
  title: string;
  subtitle?: string;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
};

export function PlaceholderScreen({
  title,
  subtitle,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: Props) {
  const layout = useLayout();
  const { colors } = useTheme();
  return (
    <Screen scroll={false} header={<AppHeader />}>
      <Text
        style={[styles.title, { fontSize: layout.font(28), color: colors.ink }]}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={[
            styles.subtitle,
            {
              fontSize: layout.font(16),
              lineHeight: layout.font(22),
              color: colors.inkSoft,
            },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
      {primaryLabel && onPrimary ? (
        <Pressable
          style={[styles.primary, { backgroundColor: colors.ink }]}
          onPress={onPrimary}
        >
          <Text
            style={[
              styles.primaryText,
              { fontSize: layout.font(16), color: colors.bg },
            ]}
          >
            {primaryLabel}
          </Text>
        </Pressable>
      ) : null}
      {secondaryLabel && onSecondary ? (
        <Pressable style={styles.secondary} onPress={onSecondary}>
          <Text
            style={[
              styles.secondaryText,
              { fontSize: layout.font(15), color: colors.sea },
            ]}
          >
            {secondaryLabel}
          </Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: "700",
    marginBottom: spacing.sm,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginBottom: spacing.xl,
  },
  primary: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  primaryText: {
    fontWeight: "700",
  },
  secondary: {
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryText: {
    fontWeight: "600",
  },
});
