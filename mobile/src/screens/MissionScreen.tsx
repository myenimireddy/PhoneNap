import { Pressable, StyleSheet, Text } from "react-native";
import { AppHeader, HeaderIconButton } from "../components/AppHeader";
import { MissionArt } from "../components/MissionArt";
import { Screen } from "../components/Screen";
import type { Mission } from "../data/missions";
import { useLayout } from "../layout";
import { MissionsStore } from "../stores/missionsStore";
import { PlacesStore } from "../stores/placesStore";
import { spacing } from "../theme";
import { useTheme } from "../theme/ThemeContext";

type Props = {
  placeId: string;
  onSelectMission: (mission: Mission) => void;
  onBack: () => void;
};

export function MissionScreen({ placeId, onSelectMission, onBack }: Props) {
  const layout = useLayout();
  const { colors } = useTheme();
  const missions = MissionsStore.forPlace(placeId);

  return (
    <Screen
      header={
        <AppHeader
          left={
            <HeaderIconButton glyph="←" label="Back to Home" onPress={onBack} />
          }
        />
      }
    >
      <Text style={[styles.chip, { fontSize: layout.font(11), color: colors.sea }]}>
        {PlacesStore.label(placeId)}
      </Text>
      <Text
        style={[styles.title, { fontSize: layout.font(26), color: colors.seaDeep }]}
      >
        Pick a mission
      </Text>
      <Text
        style={[styles.hint, { fontSize: layout.font(14), color: colors.inkSoft }]}
      >
        Tap one — phone goes to sleep right away.
      </Text>
      {missions.map((m) => (
        <Pressable
          key={m.id}
          style={[
            styles.row,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
          onPress={() => onSelectMission(m)}
        >
          <MissionArt art={m.art} />
          <Text
            style={[styles.rowText, { fontSize: layout.font(15), color: colors.ink }]}
          >
            {m.text}
          </Text>
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chip: {
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  title: { fontWeight: "700" },
  hint: {
    marginBottom: spacing.md,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  rowText: {
    flex: 1,
    fontWeight: "700",
  },
});
