import { MISSIONS, type Mission, type MissionClass } from "../data/missions";

const CLASS_ORDER: Record<MissionClass, number> = {
  action: 0,
  search: 1,
  count: 2,
};

function sortMissions(list: Mission[]): Mission[] {
  return [...list].sort((a, b) => {
    const ca = CLASS_ORDER[a.class] ?? 9;
    const cb = CLASS_ORDER[b.class] ?? 9;
    if (ca !== cb) return ca - cb;
    return a.sort - b.sort;
  });
}

export const MissionsStore = {
  get(id: string): Mission | null {
    return MISSIONS.find((m) => m.id === id) ?? null;
  },
  forPlace(placeId: string): Mission[] {
    return sortMissions(MISSIONS.filter((m) => m.placeIds.includes(placeId)));
  },
};
