export type Place = {
  id: string;
  label: string;
  sort: number;
  enabled: boolean;
};

export const PLACES: Place[] = [
  { id: "store", label: "Store", sort: 10, enabled: true },
  { id: "restaurant", label: "Restaurant", sort: 20, enabled: true },
  { id: "car", label: "Car", sort: 30, enabled: true },
  { id: "bedtime", label: "Bedtime", sort: 40, enabled: true },
  { id: "anytime", label: "Anytime", sort: 50, enabled: true },
];
