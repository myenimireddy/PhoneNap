import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppHeader, HeaderIconButton } from "../components/AppHeader";
import { MissionArt } from "../components/MissionArt";
import { Screen } from "../components/Screen";
import { useLayout } from "../layout";
import { MissionsStore } from "../stores/missionsStore";
import { PlacesStore } from "../stores/placesStore";
import { RecentsStore, type RecentNap } from "../stores/recentsStore";
import { spacing } from "../theme";
import { useTheme } from "../theme/ThemeContext";

type Props = {
  onSelectPlace: (placeId: string) => void;
  onSelectRecent: (placeId: string, missionId: string) => void;
  onSleepRecent: () => void;
  selectedRecent: { placeId: string; missionId: string } | null;
  onOpenSettings: () => void;
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
  const layout = useLayout();
  const { colors } = useTheme();
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

  const placeMin = layout.vert(layout.isShort ? 48 : 56);

  return (
    <Screen
      header={
        <AppHeader
          right={
            <HeaderIconButton
              glyph="⚙"
              label="Open settings and parent tips"
              onPress={onOpenSettings}
            />
          }
        />
      }
    >
      {recents.length > 0 ? (
        <View
          style={[
            styles.recentBlock,
            {
              marginBottom: layout.space(spacing.lg),
              borderBottomColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.section, { color: colors.sea }]}>
            Recent naps
          </Text>
          <Text style={[styles.hint, { fontSize: layout.font(14), color: colors.inkSoft }]}>
            Tap one, then Sleep — two taps.
          </Text>
          {recents.map((r) => {
            const selected =
              selectedRecent?.placeId === r.placeId &&
              selectedRecent?.missionId === r.missionId;
            return (
              <Pressable
                key={`${r.placeId}-${r.missionId}`}
                style={[
                  styles.recentCard,
                  {
                    borderColor: selected ? colors.sea : colors.border,
                    backgroundColor: selected ? colors.fog : colors.surface,
                  },
                ]}
                onPress={() => onSelectRecent(r.placeId, r.missionId)}
              >
                <MissionArt art={r.art} />
                <View style={styles.recentCopy}>
                  <Text style={[styles.recentSit, { color: colors.sea }]}>
                    {r.label}
                  </Text>
                  <Text
                    style={[
                      styles.recentMis,
                      { fontSize: layout.font(15), color: colors.ink },
                    ]}
                    numberOfLines={2}
                  >
                    {r.text}
                  </Text>
                </View>
              </Pressable>
            );
          })}
          {selectedRecent ? (
            <Pressable
              style={[styles.sleepBtn, { backgroundColor: colors.seaDeep }]}
              onPress={onSleepRecent}
            >
              <Text style={[styles.sleepText, { color: colors.onPrimary }]}>
                Put Phone to Sleep
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <Text
        style={[
          styles.title,
          { fontSize: layout.font(26), color: colors.seaDeep },
        ]}
      >
        Where are you?
      </Text>
      <Text
        style={[styles.hint, { fontSize: layout.font(14), color: colors.inkSoft }]}
      >
        Tap a place. Missions open next.
      </Text>

      <View style={styles.grid}>
        {places.map((p, i) => (
          <Pressable
            key={p.id}
            style={[
              styles.place,
              {
                minHeight: placeMin,
                borderColor: colors.border,
                backgroundColor: colors.surface,
              },
              i === places.length - 1 &&
                places.length % 2 === 1 &&
                styles.placeWide,
            ]}
            onPress={() => onSelectPlace(p.id)}
          >
            <Text
              style={[
                styles.placeText,
                { fontSize: layout.font(16), color: colors.ink },
              ]}
            >
              {p.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  recentBlock: {
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    width: "100%",
  },
  section: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  hint: {
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
    marginBottom: 8,
  },
  recentCopy: { flex: 1 },
  recentSit: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  recentMis: { fontWeight: "700", marginTop: 2 },
  sleepBtn: {
    marginTop: 8,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  sleepText: { fontWeight: "800" },
  title: {
    fontWeight: "700",
    marginBottom: 4,
    alignSelf: "stretch",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    width: "100%",
  },
  place: {
    width: "48%",
    flexGrow: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  placeWide: { width: "100%" },
  placeText: { fontWeight: "800" },
});
