/**
 * PlacesStore — bundled catalog of situations shown on Home.
 * V1: local only. No network.
 */
(function (global) {
  const PLACES = [
    { id: "store", label: "Store", sort: 10, enabled: true },
    { id: "restaurant", label: "Restaurant", sort: 20, enabled: true },
    { id: "car", label: "Car", sort: 30, enabled: true },
    { id: "bedtime", label: "Bedtime", sort: 40, enabled: true },
    { id: "anytime", label: "Anytime", sort: 50, enabled: true },
  ];

  const PlacesStore = {
    load() {
      return PLACES;
    },
    list() {
      return [...PLACES].sort((a, b) => a.sort - b.sort);
    },
    listEnabled() {
      return this.list().filter((p) => p.enabled);
    },
    get(id) {
      return PLACES.find((p) => p.id === id) || null;
    },
    label(id) {
      return this.get(id)?.label || id;
    },
  };

  global.PlacesStore = PlacesStore;
})(window);
