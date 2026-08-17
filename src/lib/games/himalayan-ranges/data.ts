import type { Feature } from "geojson";

/** Build a clockwise spherical bbox polygon for d3-geo fitExtent. */
export function fitBbox(
  west: number,
  south: number,
  east: number,
  north: number
): Feature {
  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [west, south],
          [west, north],
          [east, north],
          [east, south],
          [west, south],
        ],
      ],
    },
  };
}

export type TargetVisualState =
  | "neutral"
  | "correct"
  | "missed"
  | "wrong-flash";

export type MapTargetKind =
  | "range"
  | "division"
  | "peak"
  | "pass"
  | "glacier"
  | "valley"
  | "place"
  | "region"
  | "hills";

export type MapTarget = {
  id: string;
  name: string;
  kind: MapTargetKind;
  /** [lng, lat] for points; range/division use path instead. */
  at?: [number, number];
  /** Polyline for range bands / division arcs. */
  path?: [number, number][];
  shortLabel: string;
  fact: string;
  /** If set, this target lives on a region panel (not overview). */
  regionId?: RegionId;
};

export type RegionId =
  | "jk-ladakh"
  | "himachal"
  | "uttarakhand"
  | "nepal-sikkim"
  | "arunachal"
  | "ne-hills";

export type RegionPanel = {
  id: RegionId;
  name: string;
  fit: Feature;
  /** Overview map click point for this region. */
  at: [number, number];
  fact: string;
};

export const INTRO_FACTS = [
  "The Himalayas rose when the Indo-Australian plate collided with the Eurasian plate, closing the ancient Tethys Sea and folding its seabed sediments upward.",
  "A geosyncline (obsolete concept) was a long crustal trough where sediment piled up before later folding into mountains.",
  "The Himalayas are among the world's youngest fold mountains — mainly sedimentary rock, though the Greater Himalaya's core is granitic.",
];

/** North → south range bands on the overview map. */
export const RANGE_BANDS: MapTarget[] = [
  {
    id: "trans-himalaya",
    name: "Trans-Himalaya",
    kind: "range",
    shortLabel: "Trans-Himalaya",
    path: [
      [74.0, 35.8],
      [75.5, 35.5],
      [77.0, 35.2],
      [78.5, 34.6],
      [80.0, 34.0],
      [82.0, 33.2],
      [85.0, 31.5],
      [88.0, 30.2],
      [92.0, 29.5],
      [95.0, 29.8],
    ],
    fact: "North of the Greater Himalaya; arid high plateau (~3,000 m). Sub-ranges: Karakoram, Ladakh, Zanskar. The Indus flows between Ladakh and Zanskar; the Shyok between Karakoram and Ladakh.",
  },
  {
    id: "greater-himalaya",
    name: "Greater Himalaya",
    kind: "range",
    shortLabel: "Greater / Himadri",
    path: [
      [74.5, 35.2],
      [76.0, 34.5],
      [78.0, 33.2],
      [80.0, 31.5],
      [82.5, 30.2],
      [85.0, 28.8],
      [88.0, 28.0],
      [91.0, 28.2],
      [94.0, 28.8],
      [95.2, 29.5],
    ],
    fact: "Also called Himadri / Inner Himalaya. Avg ~6,000 m; axial length ~2,500 km. Westernmost point Nanga Parbat; easternmost Namcha Barwa (syntaxial bend).",
  },
  {
    id: "lesser-himalaya",
    name: "Lesser Himalaya",
    kind: "range",
    shortLabel: "Lesser / Himachal",
    path: [
      [74.2, 34.2],
      [76.0, 33.4],
      [78.0, 32.0],
      [80.0, 30.4],
      [82.5, 29.2],
      [85.0, 28.0],
      [88.0, 27.3],
      [91.0, 27.2],
      [93.5, 27.5],
    ],
    fact: "Also Middle Himalaya / Himachal (~4,000 m). Regional names: Pir Panjal (J&K), Dhauladhar (HP), Nagtibba (Uttarakhand), Mahabharat Range (Nepal).",
  },
  {
    id: "outer-himalaya",
    name: "Outer Himalaya (Shivalik)",
    kind: "range",
    shortLabel: "Shivalik",
    path: [
      [74.0, 33.2],
      [76.0, 32.2],
      [78.0, 30.8],
      [80.0, 29.5],
      [82.5, 28.4],
      [85.0, 27.2],
      [87.5, 26.8],
      [89.5, 26.9],
    ],
    fact: "Avg ~1,000 m. Disappears eastward, replaced by Duars. Duns are valleys between Lesser Himalaya and Shivaliks — Dehradun is India's largest. Nepal stretch = Churia Range.",
  },
];

/** West → east regional divisions along the arc. */
export const DIVISIONS: MapTarget[] = [
  {
    id: "punjab-himalaya",
    name: "Punjab Himalaya",
    kind: "division",
    shortLabel: "Punjab Him.",
    path: [
      [73.5, 34.8],
      [74.5, 34.2],
      [75.5, 33.5],
      [76.5, 32.8],
    ],
    at: [75.0, 33.8],
    fact: "Between the Indus and the Sutlej.",
  },
  {
    id: "kumaon-himalaya",
    name: "Kumaon Himalaya",
    kind: "division",
    shortLabel: "Kumaon Him.",
    path: [
      [76.8, 32.5],
      [78.0, 31.5],
      [79.5, 30.5],
      [80.5, 29.8],
    ],
    at: [78.8, 31.0],
    fact: "Between the Sutlej and the Kali (Sarda / Goriganga).",
  },
  {
    id: "nepal-himalaya",
    name: "Nepal Himalaya",
    kind: "division",
    shortLabel: "Nepal Him.",
    path: [
      [81.0, 30.0],
      [83.0, 29.0],
      [85.5, 28.2],
      [87.5, 27.8],
    ],
    at: [84.5, 28.5],
    fact: "Between the Kali and the Teesta.",
  },
  {
    id: "assam-himalaya",
    name: "Assam Himalaya",
    kind: "division",
    shortLabel: "Assam Him.",
    path: [
      [88.5, 28.0],
      [90.5, 28.2],
      [92.5, 28.5],
      [94.5, 28.8],
    ],
    at: [91.5, 28.4],
    fact: "Between the Teesta and the Dihang (Brahmaputra in Arunachal).",
  },
];

/** Peaks safe at national scale. */
export const OVERVIEW_PEAKS: MapTarget[] = [
  {
    id: "everest",
    name: "Everest",
    kind: "peak",
    at: [86.925, 27.988],
    shortLabel: "Everest",
    fact: "8,848 m — world's highest. Sagarmatha (Nepal) / Chomolungma (Tibet).",
  },
  {
    id: "k2",
    name: "K2 / Mt. Godwin-Austen",
    kind: "peak",
    at: [76.513, 35.881],
    shortLabel: "K2",
    fact: "8,611 m — Karakoram; world's second-highest peak.",
  },
  {
    id: "kanchenjunga",
    name: "Kanchenjunga",
    kind: "peak",
    at: [88.147, 27.702],
    shortLabel: "Kanchenjunga",
    fact: "8,598 m — highest peak in India (Sikkim).",
  },
  {
    id: "nanga-parbat",
    name: "Nanga Parbat",
    kind: "peak",
    at: [74.589, 35.237],
    shortLabel: "Nanga Parbat",
    fact: "8,126 m — westernmost point of the Greater Himalaya.",
  },
  {
    id: "namcha-barwa",
    name: "Namcha Barwa",
    kind: "peak",
    at: [95.05, 29.63],
    shortLabel: "Namcha Barwa",
    fact: "Easternmost point of the Greater Himalaya; syntaxial bend — where the Brahmaputra makes its sharp U-turn.",
  },
  {
    id: "nanda-devi",
    name: "Nanda Devi",
    kind: "peak",
    at: [79.976, 30.376],
    shortLabel: "Nanda Devi",
    fact: "7,816 m — highest peak wholly in Uttarakhand.",
  },
  {
    id: "kamet",
    name: "Kamet",
    kind: "peak",
    at: [79.593, 30.92],
    shortLabel: "Kamet",
    fact: "7,756 m — Uttarakhand; also the highest peak of the Zanskar Range.",
  },
];

/** Trick target: Peninsular, not Himalayan. */
export const NON_HIMALAYA_TARGET: MapTarget = {
  id: "garo-khasi-jaintia",
  name: "Garo–Khasi–Jaintia Hills",
  kind: "hills",
  at: [91.7, 25.5],
  shortLabel: "Garo–Khasi–Jaintia",
  fact: "These hills are NOT part of the Himalayas — they belong to the Peninsular Plateau.",
};

export const REGIONS: RegionPanel[] = [
  {
    id: "jk-ladakh",
    name: "J&K & Ladakh",
    at: [76.5, 34.2],
    fit: fitBbox(73.5, 32.5, 80.0, 36.2),
    fact: "Trans-Himalaya heartland: Karakoram, Ladakh, Zanskar. Kashmir Valley sits between Greater and Lesser Himalaya — famous for Karewas (saffron), Dal & Wular, Pangong Tso & Tso Moriri.",
  },
  {
    id: "himachal",
    name: "Himachal Pradesh",
    at: [77.2, 32.0],
    fit: fitBbox(75.5, 30.5, 79.0, 33.5),
    fact: "Lesser Himalaya here is the Dhauladhar. Kangra Valley is longitudinal; Kullu Valley is transverse. Hill stations: Dharamshala, Shimla.",
  },
  {
    id: "uttarakhand",
    name: "Uttarakhand",
    at: [79.4, 30.4],
    fit: fitBbox(77.5, 28.8, 81.2, 31.5),
    fact: "Lesser Himalaya name: Nagtibba. Dehradun is India's largest Dun. Hill station: Mussoorie. Greater Himalaya peaks include Nanda Devi, Kamet, Kedarnath, Badrinath, Banderpoonch.",
  },
  {
    id: "nepal-sikkim",
    name: "Nepal & Sikkim",
    at: [86.5, 28.0],
    fit: fitBbox(83.5, 26.8, 89.2, 29.0),
    fact: "Home to Everest, Lhotse, Makalu, Dhaulagiri, Annapurna, and Kanchenjunga. Lesser Himalaya here: Mahabharat Range. Passes: Nathu La, Jelep La.",
  },
  {
    id: "arunachal",
    name: "Arunachal Pradesh",
    at: [94.0, 28.2],
    fit: fitBbox(91.5, 26.8, 97.2, 29.8),
    fact: "Eastern border of the Eastern Himalaya (SW–NE orientation). Tribes west→east include Monpa, Dafla, Abor, Mishmi, Nyishi, Naga. Jhumming is widely practiced.",
  },
  {
    id: "ne-hills",
    name: "Northeast Hills",
    at: [93.2, 24.8],
    fit: fitBbox(91.5, 22.5, 95.5, 27.0),
    fact: "Patkai, Naga, Manipur, and Mizo/Lushai Hills. Manipur & Mizoram sit in the Molasses Basin. Loktak Lake is the world's only floating lake; Keibul Lamjao NP sits on it.",
  },
];

/** Features shown inside region zoom panels. */
export const REGION_TARGETS: MapTarget[] = [
  // —— J&K & Ladakh ——
  {
    id: "rakaposhi",
    name: "Rakaposhi",
    kind: "peak",
    regionId: "jk-ladakh",
    at: [74.49, 36.14],
    shortLabel: "Rakaposhi",
    fact: "Major Karakoram peak in Gilgit-Baltistan.",
  },
  {
    id: "gasherbrum",
    name: "Gasherbrum",
    kind: "peak",
    regionId: "jk-ladakh",
    at: [76.7, 35.72],
    shortLabel: "Gasherbrum",
    fact: "Karakoram massif; several 8,000 m summits.",
  },
  {
    id: "siachen",
    name: "Siachen Glacier",
    kind: "glacier",
    regionId: "jk-ladakh",
    at: [77.0, 35.42],
    shortLabel: "Siachen",
    fact: "2nd-longest non-polar glacier; highest battlefield (~5,700 m). Operation Meghdoot, 1984. (Fedchenko in Tajikistan is the longest non-polar; Lambert in Antarctica is longest overall.)",
  },
  {
    id: "baltoro",
    name: "Baltoro Glacier",
    kind: "glacier",
    regionId: "jk-ladakh",
    at: [76.4, 35.7],
    shortLabel: "Baltoro",
    fact: "Major glacier in Gilgit-Baltistan (Pakistan), near the Gasherbrum / K2 region.",
  },
  {
    id: "hispar",
    name: "Hispar Glacier",
    kind: "glacier",
    regionId: "jk-ladakh",
    at: [75.2, 36.05],
    shortLabel: "Hispar",
    fact: "Karakoram glacier linked with Biafo in the Hispar Muztagh.",
  },
  {
    id: "biafo",
    name: "Biafo Glacier",
    kind: "glacier",
    regionId: "jk-ladakh",
    at: [75.6, 35.9],
    shortLabel: "Biafo",
    fact: "Long Karakoram glacier adjoining Hispar.",
  },
  {
    id: "karakoram-pass",
    name: "Karakoram Pass",
    kind: "pass",
    regionId: "jk-ladakh",
    at: [77.82, 35.51],
    shortLabel: "Karakoram Pass",
    fact: "Highest pass connecting India and China.",
  },
  {
    id: "pir-panjal-pass",
    name: "Pir Panjal Pass",
    kind: "pass",
    regionId: "jk-ladakh",
    at: [74.5, 33.6],
    shortLabel: "Pir Panjal",
    fact: "Connects Jammu side routes toward the Kashmir Valley across the Pir Panjal Range.",
  },
  {
    id: "banihal-pass",
    name: "Banihal Pass",
    kind: "pass",
    regionId: "jk-ladakh",
    at: [75.2, 33.45],
    shortLabel: "Banihal",
    fact: "Links Jammu with Srinagar across the Pir Panjal.",
  },
  {
    id: "burzil-pass",
    name: "Burzil Pass",
    kind: "pass",
    regionId: "jk-ladakh",
    at: [75.0, 34.8],
    shortLabel: "Burzil",
    fact: "Historic Srinagar–Gilgit route pass.",
  },
  {
    id: "zoji-la",
    name: "Zoji La",
    kind: "pass",
    regionId: "jk-ladakh",
    at: [75.3, 34.28],
    shortLabel: "Zoji La",
    fact: "Connects Srinagar with Leh / Ladakh.",
  },
  {
    id: "umling-la",
    name: "Umling La",
    kind: "pass",
    regionId: "jk-ladakh",
    at: [78.4, 33.0],
    shortLabel: "Umling La",
    fact: "World's highest motorable road — built under Project Himank.",
  },
  {
    id: "kashmir-valley",
    name: "Kashmir Valley",
    kind: "valley",
    regionId: "jk-ladakh",
    at: [74.8, 34.1],
    shortLabel: "Kashmir Valley",
    fact: "Between Greater and Lesser Himalaya. Karewa deposits grow saffron (Zafran). Lakes: Dal, Wular (fresh); Pangong Tso, Tso Moriri (salt). Drained by Indus tributaries Jhelum & Chenab.",
  },

  // —— Himachal ——
  {
    id: "shipki-la",
    name: "Shipki La",
    kind: "pass",
    regionId: "himachal",
    at: [78.7, 31.9],
    shortLabel: "Shipki La",
    fact: "Kinnaur–Tibet/China pass — the Sutlej enters India here.",
  },
  {
    id: "rohtang-pass",
    name: "Rohtang Pass",
    kind: "pass",
    regionId: "himachal",
    at: [77.25, 32.37],
    shortLabel: "Rohtang",
    fact: "Links Kullu Valley to Lahaul & Spiti. Atal Tunnel (9.02 km — India's longest highway tunnel) runs under it.",
  },
  {
    id: "bara-lacha-la",
    name: "Bara-Lacha La",
    kind: "pass",
    regionId: "himachal",
    at: [77.42, 32.82],
    shortLabel: "Bara-Lacha La",
    fact: "Connects Lahaul and Leh, crossing the Zanskar range.",
  },
  {
    id: "kangra-valley",
    name: "Kangra Valley",
    kind: "valley",
    regionId: "himachal",
    at: [76.3, 32.1],
    shortLabel: "Kangra",
    fact: "Longitudinal valley — runs parallel to the mountain trend. Near Dharamshala.",
  },
  {
    id: "kullu-valley",
    name: "Kullu Valley",
    kind: "valley",
    regionId: "himachal",
    at: [77.1, 31.95],
    shortLabel: "Kullu",
    fact: "Transverse valley — cuts across the mountain trend.",
  },
  {
    id: "dharamshala",
    name: "Dharamshala",
    kind: "place",
    regionId: "himachal",
    at: [76.32, 32.22],
    shortLabel: "Dharamshala",
    fact: "Hill station on the Dhauladhar (Lesser Himalaya name in HP).",
  },
  {
    id: "shimla",
    name: "Shimla",
    kind: "place",
    regionId: "himachal",
    at: [77.17, 31.1],
    shortLabel: "Shimla",
    fact: "Former summer capital; major Himachal hill station.",
  },

  // —— Uttarakhand ——
  {
    id: "kedarnath-peak",
    name: "Kedarnath",
    kind: "peak",
    regionId: "uttarakhand",
    at: [79.07, 30.74],
    shortLabel: "Kedarnath",
    fact: "Greater Himalaya peak / pilgrimage massif in Uttarakhand.",
  },
  {
    id: "badrinath-peak",
    name: "Badrinath",
    kind: "peak",
    regionId: "uttarakhand",
    at: [79.49, 30.74],
    shortLabel: "Badrinath",
    fact: "Greater Himalaya peak associated with the Badrinath shrine.",
  },
  {
    id: "banderpoonch",
    name: "Banderpoonch",
    kind: "peak",
    regionId: "uttarakhand",
    at: [78.55, 31.0],
    shortLabel: "Banderpoonch",
    fact: "Greater Himalaya peak; Yamunotri Glacier lies on its flank.",
  },
  {
    id: "mana-pass",
    name: "Mana Pass",
    kind: "pass",
    regionId: "uttarakhand",
    at: [79.42, 31.07],
    shortLabel: "Mana",
    fact: "Mana–Tibet pass in Uttarakhand.",
  },
  {
    id: "niti-pass",
    name: "Niti Pass",
    kind: "pass",
    regionId: "uttarakhand",
    at: [79.88, 30.97],
    shortLabel: "Niti",
    fact: "Uttarakhand–Tibet pass.",
  },
  {
    id: "lipu-lekh",
    name: "Lipu Lekh Pass",
    kind: "pass",
    regionId: "uttarakhand",
    at: [80.82, 30.23],
    shortLabel: "Lipu Lekh",
    fact: "India–Tibet–Nepal tri-junction pass.",
  },
  {
    id: "mauling-la",
    name: "Mauling La",
    kind: "pass",
    regionId: "uttarakhand",
    at: [80.2, 30.6],
    shortLabel: "Mauling La",
    fact: "Seasonal winter pass, Uttarakhand–Tibet.",
  },
  {
    id: "dehradun",
    name: "Dehradun",
    kind: "place",
    regionId: "uttarakhand",
    at: [78.03, 30.32],
    shortLabel: "Dehradun",
    fact: "Largest Dun in India — a longitudinal valley between Lesser Himalaya and Shivaliks.",
  },
  {
    id: "mussoorie",
    name: "Mussoorie",
    kind: "place",
    regionId: "uttarakhand",
    at: [78.08, 30.46],
    shortLabel: "Mussoorie",
    fact: "Hill station above Dehradun in the Lesser Himalaya (Nagtibba region).",
  },

  // —— Nepal & Sikkim ——
  {
    id: "lhotse",
    name: "Lhotse",
    kind: "peak",
    regionId: "nepal-sikkim",
    at: [86.93, 27.96],
    shortLabel: "Lhotse",
    fact: "8,516 m — Tibet & Khumbu region of Nepal; neighbour of Everest.",
  },
  {
    id: "makalu",
    name: "Makalu",
    kind: "peak",
    regionId: "nepal-sikkim",
    at: [87.09, 27.89],
    shortLabel: "Makalu",
    fact: "8,485 m — among the world's highest peaks, near Everest.",
  },
  {
    id: "dhaulagiri",
    name: "Dhaulagiri",
    kind: "peak",
    regionId: "nepal-sikkim",
    at: [83.49, 28.7],
    shortLabel: "Dhaulagiri",
    fact: '8,167 m — "White Mountain" in Nepal.',
  },
  {
    id: "annapurna",
    name: "Annapurna",
    kind: "peak",
    regionId: "nepal-sikkim",
    at: [83.82, 28.6],
    shortLabel: "Annapurna",
    fact: "8,091 m — famous Nepal massif.",
  },
  {
    id: "jhopuno",
    name: "Mt. Jhopuno",
    kind: "peak",
    regionId: "nepal-sikkim",
    at: [88.35, 27.55],
    shortLabel: "Jhopuno",
    fact: "Peak in Sikkim.",
  },
  {
    id: "nathu-la",
    name: "Nathu La",
    kind: "pass",
    regionId: "nepal-sikkim",
    at: [88.83, 27.39],
    shortLabel: "Nathu La",
    fact: "Links Sikkim and Tibet. Lepcha/Bhutia tribes live in higher elevations of Darjeeling & Sikkim.",
  },
  {
    id: "jelep-la",
    name: "Jelep La",
    kind: "pass",
    regionId: "nepal-sikkim",
    at: [88.87, 27.37],
    shortLabel: "Jelep La",
    fact: "Pass on the Sikkim–Tibet border.",
  },

  // —— Arunachal ——
  {
    id: "kangto",
    name: "Kangto",
    kind: "peak",
    regionId: "arunachal",
    at: [92.5, 27.9],
    shortLabel: "Kangto",
    fact: "Highest peak in Arunachal Pradesh.",
  },
  {
    id: "gorichen",
    name: "Gorichen Peak",
    kind: "peak",
    regionId: "arunachal",
    at: [92.4, 27.8],
    shortLabel: "Gorichen",
    fact: "Major peak in western Arunachal.",
  },
  {
    id: "bom-di-la",
    name: "Bom Di La",
    kind: "pass",
    regionId: "arunachal",
    at: [92.4, 27.25],
    shortLabel: "Bom Di La",
    fact: "Arunachal–Lhasa / Tibet route pass.",
  },
  {
    id: "sela-pass",
    name: "Sela Pass",
    kind: "pass",
    regionId: "arunachal",
    at: [92.1, 27.51],
    shortLabel: "Sela",
    fact: "High pass on the road to Tawang.",
  },
  {
    id: "dihang-la",
    name: "Dihang La",
    kind: "pass",
    regionId: "arunachal",
    at: [95.5, 28.2],
    shortLabel: "Dihang La",
    fact: "Arunachal–Myanmar pass.",
  },
  {
    id: "pangsu-pass",
    name: "Pangsu Pass",
    kind: "pass",
    regionId: "arunachal",
    at: [96.2, 27.2],
    shortLabel: "Pangsu",
    fact: "Arunachal–Myanmar pass.",
  },
  {
    id: "bum-la",
    name: "Bum La",
    kind: "pass",
    regionId: "arunachal",
    at: [91.9, 27.72],
    shortLabel: "Bum La",
    fact: "China–Tawang border pass.",
  },
  {
    id: "diphu-pass",
    name: "Diphu Pass",
    kind: "pass",
    regionId: "arunachal",
    at: [97.0, 28.15],
    shortLabel: "Diphu",
    fact: "Near the India–Myanmar–China tri-junction.",
  },
  {
    id: "yangyap-pass",
    name: "Yangyap Pass",
    kind: "pass",
    regionId: "arunachal",
    at: [95.2, 29.1],
    shortLabel: "Yangyap",
    fact: "Where the Brahmaputra (Siang/Dihang) enters India — cross-link to River Hunt.",
  },

  // —— NE Hills ——
  {
    id: "saramati",
    name: "Saramati",
    kind: "peak",
    regionId: "ne-hills",
    at: [95.0, 25.74],
    shortLabel: "Saramati",
    fact: "Highest peak in Nagaland (Naga Hills).",
  },
  {
    id: "phawngpui",
    name: "Phawngpui / Blue Mountain",
    kind: "peak",
    regionId: "ne-hills",
    at: [93.05, 22.63],
    shortLabel: "Phawngpui",
    fact: "Highest peak in Mizoram (Mizo / Lushai Hills).",
  },
  {
    id: "mt-iso",
    name: "Mt. Iso",
    kind: "peak",
    regionId: "ne-hills",
    at: [94.0, 25.1],
    shortLabel: "Mt. Iso",
    fact: "Highest peak in Manipur.",
  },
  {
    id: "thaidawr",
    name: "Thaidawr Tlang",
    kind: "peak",
    regionId: "ne-hills",
    at: [92.3, 23.8],
    shortLabel: "Thaidawr",
    fact: "Notable peak in Tripura.",
  },
  {
    id: "loktak",
    name: "Loktak Lake",
    kind: "place",
    regionId: "ne-hills",
    at: [93.82, 24.55],
    shortLabel: "Loktak",
    fact: "World's only floating lake (Manipur). Keibul Lamjao National Park on it is the world's only floating national park. Barak River is significant in this basin.",
  },
];

export function getRegion(id: RegionId): RegionPanel | undefined {
  return REGIONS.find((r) => r.id === id);
}

export function getTarget(id: string): MapTarget | undefined {
  return (
    RANGE_BANDS.find((t) => t.id === id) ??
    DIVISIONS.find((t) => t.id === id) ??
    OVERVIEW_PEAKS.find((t) => t.id === id) ??
    REGION_TARGETS.find((t) => t.id === id) ??
    (id === NON_HIMALAYA_TARGET.id ? NON_HIMALAYA_TARGET : undefined) ??
    (REGIONS.find((r) => r.id === id)
      ? {
          id,
          name: REGIONS.find((r) => r.id === id)!.name,
          kind: "region" as const,
          at: REGIONS.find((r) => r.id === id)!.at,
          shortLabel: REGIONS.find((r) => r.id === id)!.name,
          fact: REGIONS.find((r) => r.id === id)!.fact,
        }
      : undefined)
  );
}

export function targetsForRegion(regionId: RegionId): MapTarget[] {
  return REGION_TARGETS.filter((t) => t.regionId === regionId);
}

