import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MissionArt } from "../components/MissionArt";
import type { Mission } from "../data/missions";
import { MissionsStore } from "../stores/missionsStore";
import { PlacesStore } from "../stores/placesStore";
import { colors, spacing } from "../theme";

type Props = {
  placeId: string;
  onSelectMission: (mission: Mission) => void;
  onBack: () => void;
};

export function MissionScreen({ placeId, onSelectMission, onBack }: Props) {
  const missions = MissionsStore.forPlace(placeId);

  return (
    <View style={styles.root}>
      <View style={styles.top}>
        <Pressable onPress={onBack} hitSlop={12}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Text style={styles.brand}>PhoneNap</Text>
        <Text style={styles.chip}>{PlacesStore.label(placeId)}</Text>
      </View>
      <Text style={styles.title}>Pick a mission</Text>
      <Text style={styles.hint}>Tap one — phone goes to sleep right away.</Text>
      <ScrollView contentContainerStyle={styles.list}>
        {missions.map((m) => (
          <Pressable
            key={m.id}
            style={styles.row}
            onPress={() => onSelectMission(m)}
          >
            <MissionArt art={m.art} />
            <Text style={styles.rowText}>{m.text}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl * 2,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  back: {
    width: 32,
    fontSize: 22,
    color: colors.seaDeep,
    fontWeight: "700",
  },
  brand: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: colors.seaDeep,
  },
  chip: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.sea,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.seaDeep,
  },
  hint: {
    color: colors.inkSoft,
    marginBottom: spacing.md,
    marginTop: 4,
  },
  list: { paddingBottom: spacing.xl, gap: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(26, 69, 67, 0.14)",
    backgroundColor: colors.white,
  },
  rowText: {
    flex: 1,
    fontWeight: "700",
    color: colors.ink,
    fontSize: 15,
  },
});
