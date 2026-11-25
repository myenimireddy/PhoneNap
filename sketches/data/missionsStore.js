/**
 * MissionsStore — bundled missions, filtered by place.
 * Ordered simpler → harder (action → search → count).
 * V1: local only. No network.
 */
(function (global) {
  const HANDBACK = "Now hand the phone back to a grown-up.";
  const CLASS_ORDER = { action: 0, search: 1, count: 2 };

  const MISSIONS = [
    // store
    {
      id: "store-cart",
      placeIds: ["store"],
      text: "Touch the shopping cart",
      speak: `Touch the shopping cart. ${HANDBACK}`,
      art: "cart",
      class: "action",
      sort: 10,
    },
    {
      id: "store-yellow",
      placeIds: ["store"],
      text: "Find something yellow",
      speak: `Find something yellow. ${HANDBACK}`,
      art: "one-yellow",
      class: "search",
      sort: 20,
    },
    {
      id: "store-blue",
      placeIds: ["store"],
      text: "Find three blue things",
      speak: `Find three blue things. ${HANDBACK}`,
      art: "three-blue",
      class: "count",
      sort: 30,
    },
    {
      id: "store-round",
      placeIds: ["store"],
      text: "Count five round things",
      speak: `Count five round things. ${HANDBACK}`,
      art: "five-round",
      class: "count",
      sort: 40,
    },
    // restaurant
    {
      id: "rest-hands",
      placeIds: ["restaurant"],
      text: "Hands on the table",
      speak: `Put your hands on the table. ${HANDBACK}`,
      art: "hands",
      class: "action",
      sort: 10,
    },
    {
      id: "rest-cup",
      placeIds: ["restaurant"],
      text: "Look for a cup",
      speak: `Look for a cup. ${HANDBACK}`,
      art: "cup",
      class: "search",
      sort: 20,
    },
    {
      id: "rest-green",
      placeIds: ["restaurant"],
      text: "Find three green things",
      speak: `Find three green things. ${HANDBACK}`,
      art: "three-green",
      class: "count",
      sort: 30,
    },
    {
      id: "rest-spoons",
      placeIds: ["restaurant"],
      text: "Count the spoons",
      speak: `Count the spoons. ${HANDBACK}`,
      art: "spoons",
      class: "count",
      sort: 40,
    },
    // car
    {
      id: "car-truck",
      placeIds: ["car"],
      text: "Look out the window and spot a truck",
      speak: `Look out your window and spot a truck. ${HANDBACK}`,
      art: "truck",
      class: "search",
      sort: 10,
    },
    {
      id: "car-sign",
      placeIds: ["car"],
      text: "Look out the window and find a yellow sign",
      speak: `Look out your window and find a yellow sign. ${HANDBACK}`,
      art: "sign",
      class: "search",
      sort: 20,
    },
    {
      id: "car-clouds",
      placeIds: ["car"],
      text: "Look out the window and count the clouds",
      speak: `Look out your window and count the clouds. ${HANDBACK}`,
      art: "clouds",
      class: "count",
      sort: 30,
    },
    {
      id: "car-red",
      placeIds: ["car"],
      text: "Look out the window and spot five red cars",
      speak: `Look out your window and find five red cars. ${HANDBACK}`,
      art: "five-cars",
      class: "count",
      sort: 40,
    },
    // bedtime
    {
      id: "bed-hug",
      placeIds: ["bedtime"],
      text: "Hug your bear",
      speak: `Hug your bear. ${HANDBACK}`,
      art: "hug-bear",
      class: "action",
      sort: 10,
    },
    {
      id: "bed-shoes",
      placeIds: ["bedtime"],
      text: "Put your shoes away",
      speak: `Put your shoes away. ${HANDBACK}`,
      art: "shoes-away",
      class: "action",
      sort: 20,
    },
    {
      id: "bed-pj",
      placeIds: ["bedtime"],
      text: "Find your pajamas",
      speak: `Find your pajamas. ${HANDBACK}`,
      art: "pajamas",
      class: "search",
      sort: 30,
    },
    {
      id: "bed-book",
      placeIds: ["bedtime"],
      text: "Get your bedtime book",
      speak: `Get your bedtime book. ${HANDBACK}`,
      art: "get-book",
      class: "search",
      sort: 40,
    },
    // anytime
    {
      id: "any-hug",
      placeIds: ["anytime"],
      text: "Hug your bear",
      speak: `Hug your bear. ${HANDBACK}`,
      art: "hug-bear",
      class: "action",
      sort: 10,
    },
    {
      id: "any-shoes-on",
      placeIds: ["anytime"],
      text: "Put your shoes on",
      speak: `Put your shoes on. ${HANDBACK}`,
      art: "shoes-on",
      class: "action",
      sort: 20,
    },
    {
      id: "any-yellow",
      placeIds: ["anytime"],
      text: "Find something yellow",
      speak: `Find something yellow. ${HANDBACK}`,
      art: "one-yellow",
      class: "search",
      sort: 30,
    },
    {
      id: "any-blue",
      placeIds: ["anytime"],
      text: "Find something blue",
      speak: `Find something blue. ${HANDBACK}`,
      art: "three-blue",
      class: "search",
      sort: 40,
    },
  ];

  function sortMissions(list) {
    return [...list].sort((a, b) => {
      const ca = CLASS_ORDER[a.class] ?? 9;
      const cb = CLASS_ORDER[b.class] ?? 9;
      if (ca !== cb) return ca - cb;
      return a.sort - b.sort;
    });
  }

  const MissionsStore = {
    load() {
      return MISSIONS;
    },
    get(id) {
      return MISSIONS.find((m) => m.id === id) || null;
    },
    forPlace(placeId) {
      return sortMissions(MISSIONS.filter((m) => m.placeIds.includes(placeId)));
    },
  };

  global.MissionsStore = MissionsStore;
})(window);
