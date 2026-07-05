// Static SF delivery addresses with WGS84 longitude/latitude coords.
// We intentionally keep this fully offline so the demo does not depend
// on any geocoding service. Each entry also lists the closest hub so
// checkout can hint the cheapest station. Distances are straight-line km
// (used only as a visual cue).

export const presetAddresses = [
  {
    id: 'mission',
    label: 'Mission 区 · 瓦伦西亚街',
    detail: '100 Valencia St, San Francisco, CA',
    longitude: -122.4216,
    latitude: 37.7649,
    hubHint: 'Mission Hub',
    hubIdHint: null, // resolved dynamically after first /orders/plans call
  },
  {
    id: 'soma',
    label: 'SoMa · 布兰南街',
    detail: '500 Brannan St, San Francisco, CA',
    longitude: -122.3955,
    latitude: 37.7793,
    hubHint: 'Mission Hub',
    hubIdHint: null,
  },
  {
    id: 'marina',
    label: 'Marina · 栗子街',
    detail: '2001 Chestnut St, San Francisco, CA',
    longitude: -122.4367,
    latitude: 37.8024,
    hubHint: 'Marina Hub',
    hubIdHint: null,
  },
  {
    id: 'sunset',
    label: 'Sunset · 朱达街',
    detail: '2400 Judah St, San Francisco, CA',
    longitude: -122.4862,
    latitude: 37.7599,
    hubHint: 'Sunset Hub',
    hubIdHint: null,
  },
  {
    id: 'castro',
    label: 'Castro · 市场街',
    detail: '500 Castro St, San Francisco, CA',
    longitude: -122.4351,
    latitude: 37.7609,
    hubHint: 'Sunset Hub',
    hubIdHint: null,
  },
];

export function findAddressById(id) {
  return presetAddresses.find((a) => a.id === id) || presetAddresses[0];
}
