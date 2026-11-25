import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useLayout } from "../layout";
import { spacing } from "../theme";
import { useTheme } from "../theme/ThemeContext";
import {
  openStoreListing,
  upgradeCopy,
  type UpgradeOffer,
} from "../version/versionCheck";

type Props = {
  offer: UpgradeOffer;
  onLater: () => void;
};

export function UpgradePrompt({ offer, onLater }: Props) {
  const layout = useLayout();
  const { colors } = useTheme();
  const { title, body } = upgradeCopy(offer);
  const cardMax = Math.min(360, layout.width - layout.pagePad * 2);

  return (
    <Modal transparent animationType="fade" visible>
      <View style={[styles.backdrop, { padding: layout.pagePad }]}>
        <View
          style={[
            styles.card,
            {
              maxWidth: cardMax,
              padding: layout.space(spacing.lg),
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={[styles.title, { fontSize: layout.font(20), color: colors.ink }]}
          >
            {title}
          </Text>
          <Text
            style={[
              styles.body,
              {
                fontSize: layout.font(15),
                lineHeight: layout.font(22),
                color: colors.inkSoft,
              },
            ]}
          >
            {body}
          </Text>
          {offer.force ? (
            <Text
              style={[
                styles.forceHint,
                {
                  fontSize: layout.font(13),
                  lineHeight: layout.font(18),
                  color: colors.inkSoft,
                },
              ]}
            >
              This update is important for PhoneNap. You can continue for today
              and update when you can — naps stay available.
            </Text>
          ) : null}
          <Pressable
            style={[styles.primary, { backgroundColor: colors.ink }]}
            onPress={() => void openStoreListing()}
          >
            <Text style={[styles.primaryText, { color: colors.bg }]}>
              Update
            </Text>
          </Pressable>
          <Pressable onPress={onLater}>
            <Text style={[styles.later, { color: colors.inkSoft }]}>
              {offer.force ? "Continue for today" : "Not now"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontWeight: "700",
    marginBottom: spacing.sm,
    letterSpacing: -0.2,
  },
  body: {
    marginBottom: spacing.md,
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
  later: {
    textAlign: "center",
    fontWeight: "600",
    paddingVertical: spacing.sm,
  },
  forceHint: {
    marginBottom: spacing.md,
  },
});
