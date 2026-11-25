import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import {
  openStoreListing,
  upgradeCopy,
  type UpgradeOffer,
} from "../version/versionCheck";
import { colors, spacing } from "../theme";

type Props = {
  offer: UpgradeOffer;
  onLater: () => void;
};

export function UpgradePrompt({ offer, onLater }: Props) {
  const { title, body } = upgradeCopy(offer);

  return (
    <Modal transparent animationType="fade" visible>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
          {offer.force ? (
            <Text style={styles.forceHint}>
              This update is important for PhoneNap. You can still start one nap
              now — please update when you can.
            </Text>
          ) : null}
          <Pressable
            style={styles.primary}
            onPress={() => void openStoreListing()}
          >
            <Text style={styles.primaryText}>Update</Text>
          </Pressable>
          <Pressable onPress={onLater}>
            <Text style={styles.later}>
              {offer.force ? "Continue to Home" : "Not now"}
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
    backgroundColor: "rgba(15, 42, 50, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.seaDeep,
    marginBottom: spacing.sm,
  },
  body: {
    color: colors.inkSoft,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  primary: {
    backgroundColor: colors.seaDeep,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  primaryText: {
    color: colors.white,
    fontWeight: "800",
  },
  later: {
    textAlign: "center",
    color: colors.inkSoft,
    fontWeight: "700",
    paddingVertical: spacing.sm,
  },
  forceHint: {
    color: colors.inkSoft,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
});
