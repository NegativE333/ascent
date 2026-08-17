export type HotspotKind =
  | "origin"
  | "confluence"
  | "pass"
  | "barrage"
  | "landmark"
  | "doab";

export type MapHotspot = {
  id: string;
  name: string;
  kind: HotspotKind;
  /** [lng, lat] */
  at: [number, number];
  /** Short label on the map when revealed. */
  shortLabel: string;
  /** Enrichment fact shown after a correct/incorrect answer targeting this hotspot. */
  fact: string;
};

/**
 * Clickable place markers for Map Hunt clues.
 * Coordinates are approximate for national-map recognition — not survey-grade.
 */
export const HOTSPOTS: MapHotspot[] = [
  {
    id: "gangotri",
    name: "Gangotri / Gaumukh",
    kind: "origin",
    at: [79.08, 30.93],
    shortLabel: "Gangotri",
    fact: "Origin of the Ganga as the Bhagirathi at Gaumukh (Gangotri Glacier), Uttarakhand.",
  },
  {
    id: "yamunotri",
    name: "Yamunotri",
    kind: "origin",
    at: [78.45, 31.0],
    shortLabel: "Yamunotri",
    fact: "Origin of the Yamuna at the Yamunotri Glacier, Banderpoonch Peak (Uttarakhand).",
  },
  {
    id: "verinag",
    name: "Verinag",
    kind: "origin",
    at: [75.25, 33.55],
    shortLabel: "Verinag",
    fact: "Spring at Verinag (J&K) — origin of the Jhelum (ancient Vitasta).",
  },
  {
    id: "tandi",
    name: "Tandi",
    kind: "confluence",
    at: [76.9, 32.55],
    shortLabel: "Tandi",
    fact: "Chandra and Bhaga meet at Tandi in the Lahaul Valley (HP) to form the Chenab.",
  },
  {
    id: "demchok",
    name: "Demchok",
    kind: "pass",
    at: [79.4, 32.7],
    shortLabel: "Demchok",
    fact: "Where the Indus enters India in Ladakh, after rising near Mansarovar in Tibet.",
  },
  {
    id: "shipkila",
    name: "Shipki La Pass",
    kind: "pass",
    at: [78.7, 31.9],
    shortLabel: "Shipki La",
    fact: "Where the Sutlej (from Rakshastal near Mansarovar) enters India in Himachal Pradesh.",
  },
  {
    id: "harike",
    name: "Harike",
    kind: "confluence",
    at: [74.95, 31.15],
    shortLabel: "Harike",
    fact: "Beas joins the Sutlej near Harike, Punjab. The Beas never enters Pakistan.",
  },
  {
    id: "panchnad",
    name: "Panchnad",
    kind: "confluence",
    at: [71.1, 29.4],
    shortLabel: "Panchnad",
    fact: "Meeting of the five Punjab rivers: Jhelum, Chenab, Ravi, Beas, and Sutlej.",
  },
  {
    id: "devprayag",
    name: "Devprayag",
    kind: "confluence",
    at: [78.6, 30.15],
    shortLabel: "Devprayag",
    fact: "Alaknanda + Bhagirathi meet here to form the Ganga — the last of the Panch Prayag.",
  },
  {
    id: "farakka",
    name: "Farakka Barrage",
    kind: "barrage",
    at: [87.92, 24.8],
    shortLabel: "Farakka",
    fact: "Near here the Ganga splits toward the Padma (Bangladesh) and the Bhagirathi-Hooghly. Site of the 1996 India–Bangladesh Farakka Agreement.",
  },
  {
    id: "namchabarwa",
    name: "Namcha Barwa",
    kind: "landmark",
    at: [95.05, 29.63],
    shortLabel: "Namcha Barwa",
    fact: "The Brahmaputra (Yarlung Tsangpo) forms a gorge and sharp U-turn here in Tibet before entering Arunachal as the Siang/Dihang.",
  },
  {
    id: "dhubri",
    name: "Dhubri",
    kind: "landmark",
    at: [89.98, 26.02],
    shortLabel: "Dhubri",
    fact: "In Assam, the Brahmaputra turns south near Dhubri before entering Bangladesh as the Jamuna.",
  },
  // Doabs — markers roughly centered between the two rivers
  {
    id: "sindhsagardoab",
    name: "Sindh Sagar Doab",
    kind: "doab",
    at: [72.4, 32.4],
    shortLabel: "Sindh Sagar",
    fact: "Doab between the Indus and the Jhelum.",
  },
  {
    id: "jechdoab",
    name: "Jech Doab",
    kind: "doab",
    at: [73.7, 32.3],
    shortLabel: "Jech",
    fact: "Doab between the Jhelum and the Chenab.",
  },
  {
    id: "rechnadoab",
    name: "Rechna Doab",
    kind: "doab",
    at: [74.3, 31.9],
    shortLabel: "Rechna",
    fact: "Doab between the Chenab and the Ravi.",
  },
  {
    id: "baridoab",
    name: "Bari Doab",
    kind: "doab",
    at: [74.9, 31.55],
    shortLabel: "Bari",
    fact: "Doab between the Ravi and the Beas.",
  },
  {
    id: "bistdoab",
    name: "Bist Doab",
    kind: "doab",
    at: [75.5, 31.05],
    shortLabel: "Bist",
    fact: "Doab between the Beas and the Sutlej.",
  },
];

export function getHotspotById(id: string): MapHotspot | undefined {
  return HOTSPOTS.find((h) => h.id === id);
}

/** Upstream → downstream Panch Prayag (Devprayag forms the Ganga). */
export const PANCH_PRAYAG = [
  {
    id: "vishnuprayag",
    name: "Vishnuprayag",
    detail: "Alaknanda + Dhauliganga",
  },
  {
    id: "nandaprayag",
    name: "Nandaprayag",
    detail: "Alaknanda + Nandakini",
  },
  {
    id: "karnaprayag",
    name: "Karnaprayag",
    detail: "Alaknanda + Pindar",
  },
  {
    id: "rudraprayag",
    name: "Rudraprayag",
    detail: "Alaknanda + Mandakini",
  },
  {
    id: "devprayag",
    name: "Devprayag",
    detail: "Alaknanda + Bhagirathi → forms the Ganga",
  },
] as const;
