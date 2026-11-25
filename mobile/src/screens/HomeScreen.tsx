import { useCallback, useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MissionArt } from "../components/MissionArt";
import { MissionsStore } from "../stores/missionsStore";
import { PlacesStore } from "../stores/placesStore";
import { RecentsStore, type RecentNap } from "../stores/recentsStore";
import { colors, spacing } from "../theme";

type Props = {
  onSelectPlace: (placeId: string) => void;
  onSelectRecent: (placeId: string, missionId: string) => void;
  onSleepRecent: () => void;
  selectedRecent: { placeId: string; missionId: string } | null;
  onOpenSettings: () => void;
  /** Called when Home becomes visible — start timing metric */
  onHomeVisible: () => void;
};

export function HomeScreen({
  onSelectPlace,
  onSelectRecent,
  onSleepRecent,
  selectedRecent,
  onOpenSettings,
  onHomeVisible,
}: Props) {
  const [recents, setRecents] = useState<
    Array<RecentNap & { label: string; text: string; art: string }>
  >([]);
  const places = PlacesStore.listEnabled();

  const refresh = useCallback(async () => {
    const list = await RecentsStore.list();
    setRecents(
      list
        .map((r) => {
          const m = MissionsStore.get(r.missionId);
          if (!m) return null;
          return {
            ...r,
            label: PlacesStore.label(r.placeId),
            text: m.text,
            art: m.art,
          };
        })
        .filter(Boolean) as Array<
        RecentNap & { label: string; text: string; art: string }
      >
    );
  }, []);

  useEffect(() => {
    onHomeVisible();
    void refresh();
  }, [onHomeVisible, refresh]);

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <View style={styles.top}>
        <View style={styles.brandRow}>
          <Image
            source={require("../../assets/icon.png")}
            style={styles.logo}
            accessibilityLabel="PhoneNap logo"
          />
          <Text style={styles.brand}>PhoneNap</Text>
        </View>
        <Pressable
          style={styles.settingsBtn}
          onPress={onOpenSettings}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Open settings and parent tips"
        >
          <Text style={styles.settingsText}>Settings</Text>
        </Pressable>
      </View>

      {recents.length > 0 ? (
        <View style={styles.recentBlock}>
          <Text style={styles.section}>Recent naps</Text>
          <Text style={styles.hint}>Tap one, then Sleep — two taps.</Text>
          {recents.map((r) => {
            const selected =
              selectedRecent?.placeId === r.placeId &&
              selectedRecent?.missionId === r.missionId;
            return (
              <Pressable
                key={`${r.placeId}-${r.missionId}`}
                style={[styles.recentCard, selected && styles.selected]}
                onPress={() => onSelectRecent(r.placeId, r.missionId)}
              >
                <MissionArt art={r.art} />
                <View style={styles.recentCopy}>
                  <Text style={styles.recentSit}>{r.label}</Text>
                  <Text style={styles.recentMis} numberOfLines={2}>
                    {r.text}
                  </Text>
                </View>
              </Pressable>
            );
          })}
          {selectedRecent ? (
            <Pressable style={styles.sleepBtn} onPress={onSleepRecent}>
              <Text style={styles.sleepText}>Put Phone to Sleep</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <Text style={styles.title}>Where are you?</Text>
      <Text style={styles.hint}>Tap a place. Missions open next.</Text>

      <View style={styles.grid}>
        {places.map((p, i) => (
          <Pressable
            key={p.id}
            style={[
              styles.place,
              i === places.length - 1 && places.length % 2 === 1 && styles.placeWide,
            ]}
            onPress={() => onSelectPlace(p.id)}
          >
            <Text style={styles.placeText}>{p.label}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl * 2,
    paddingBottom: spacing.xl,
    backgroundColor: colors.paper,
    flexGrow: 1,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },
  brand: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.seaDeep,
  },
  settingsBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.fog,
  },
  settingsText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.seaDeep,
  },
  recentBlock: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(26, 69, 67, 0.1)",
  },
  section: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.sea,
  },
  hint: {
    color: colors.inkSoft,
    marginBottom: spacing.md,
    marginTop: 4,
  },
  recentCard: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    padding: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(26, 69, 67, 0.14)",
    backgroundColor: colors.white,
    marginBottom: 8,
  },
  selected: {
    borderColor: colors.sea,
    backgroundColor: "#eef8f6",
  },
  recentCopy: { flex: 1 },
  recentSit: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.sea,
    textTransform: "uppercase",
  },
  recentMis: { fontWeight: "700", color: colors.ink, marginTop: 2 },
  sleepBtn: {
    marginTop: 8,
    backgroundColor: colors.seaDeep,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  sleepText: { color: colors.white, fontWeight: "800" },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.seaDeep,
    marginBottom: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  place: {
    width: "48%",
    flexGrow: 1,
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(26, 69, 67, 0.14)",
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  placeWide: { width: "100%" },
  placeText: { fontWeight: "800", color: colors.ink, fontSize: 16 },
});
