import { PLACES, type Place } from "../data/places";

export const PlacesStore = {
  list(): Place[] {
    return [...PLACES].sort((a, b) => a.sort - b.sort);
  },
  listEnabled(): Place[] {
    return this.list().filter((p) => p.enabled);
  },
  get(id: string): Place | null {
    return PLACES.find((p) => p.id === id) ?? null;
  },
  label(id: string): string {
    return this.get(id)?.label ?? id;
  },
};
