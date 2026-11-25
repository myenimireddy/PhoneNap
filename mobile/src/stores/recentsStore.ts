import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "phonenap-recent-v1";

export type RecentNap = {
  placeId: string;
  missionId: string;
};

export const RecentsStore = {
  async list(): Promise<RecentNap[]> {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      const list = raw ? (JSON.parse(raw) as RecentNap[]) : [];
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  async push(entry: RecentNap): Promise<RecentNap[]> {
    const next = [
      entry,
      ...(await this.list()).filter(
        (r) =>
          !(r.placeId === entry.placeId && r.missionId === entry.missionId)
      ),
    ].slice(0, 3);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
    return next;
  },
};
