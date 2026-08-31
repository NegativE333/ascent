import type { Feature } from "geojson";

export type Flow = "east" | "west";

export type RegionId = "goa" | "kerala" | "karnataka";

export type PeninsularRiver = {
  id: string;
  name: string;
  flow: Flow;
  origin: string;
  fact: string;
  facts?: string[];
  tributaries?: string[];
  alsoKnownAs?: string[];
  lengthKm?: number;
  cities?: string[];
  drainsInto?: string;
  path: [number, number][];
  labelAt: [number, number];
  /** Coastal rivers live on a region panel, not the overview. */
  regionId?: RegionId;
};

export type RegionHub = {
  id: RegionId;
  name: string;
  at: [number, number];
  fact: string;
  fit: Feature;
};

function fitBbox(
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

export const FLOW_LABEL: Record<Flow, string> = {
  east: "East-flowing · Bay of Bengal",
  west: "West-flowing · Arabian Sea",
};

/**
 * Overview rivers only (10 east + 5 west). Paths are hand-digitized for
 * quiz recognition on the India basemap — not survey-grade.
 */
export const OVERVIEW_RIVERS: PeninsularRiver[] = [
  {
    id: "mahanadi",
    name: "Mahanadi",
    flow: "east",
    origin: "Sihawa Hills, Chhattisgarh",
    lengthKm: 900,
    tributaries: ["Tel", "Jonk", "Ong", "Hasdeo", "Mand", "Ib", "Seonath"],
    drainsInto: "Bay of Bengal (delta near Paradip)",
    fact: "900 km; 3rd largest peninsular river. Hirakud Dam (India's longest) sits on it; Chilika Lake lies near the mouth.",
    facts: [
      "Hirakud Dam on the Mahanadi is India's longest dam.",
      "Chilika Lake, a coastal lagoon, lies near the Mahanadi mouth in Odisha.",
    ],
    path: [
      [82.06, 20.47],
      [81.9, 20.9],
      [82.0, 21.3],
      [82.5, 21.5],
      [83.2, 21.55],
      [83.87, 21.47],
      [84.5, 21.2],
      [85.2, 20.7],
      [85.88, 20.46],
      [86.4, 20.35],
      [86.7, 20.28],
    ],
    labelAt: [84.2, 21.25],
  },
  {
    id: "godavari",
    name: "Godavari",
    flow: "east",
    origin: "Trimbakeshwar Plateau (Western Ghats), Nasik, Maharashtra",
    lengthKm: 1465,
    alsoKnownAs: ["Dakshin Ganga", "Vridha Ganga"],
    tributaries: ["Pravara", "Purna", "Manjira", "Pranhita", "Indravati", "Sabari"],
    cities: ["Nasik"],
    drainsInto: "Bay of Bengal (Gautami branch via Yanam)",
    fact: "1,465 km — the largest peninsular river, called Dakshin Ganga / Vridha Ganga. The Gautami branch reaches the Bay via the Yanam enclave.",
    path: [
      [73.53, 19.93],
      [74.5, 19.9],
      [76.0, 19.6],
      [77.5, 19.1],
      [78.8, 18.7],
      [80.0, 17.8],
      [81.2, 17.2],
      [81.78, 17.0],
      [82.21, 16.73],
      [82.35, 16.5],
    ],
    labelAt: [78.0, 18.85],
  },
  {
    id: "krishna",
    name: "Krishna",
    flow: "east",
    origin: "Mahabaleshwar, Western Ghats, Maharashtra",
    lengthKm: 1400,
    tributaries: [
      "Bhima",
      "Tungabhadra",
      "Ghataprabha",
      "Malaprabha",
      "Musi",
      "Koyna",
      "Dudhganga",
      "Yerla",
      "Warna",
      "Dindi",
    ],
    cities: ["Vijayawada"],
    drainsInto: "Bay of Bengal (near Hamsaladeevi)",
    fact: "1,400 km — 2nd longest river of South India. Musi (Hyderabad) is a tributary; Vijayawada sits on its bank.",
    path: [
      [73.66, 17.92],
      [74.8, 17.4],
      [76.2, 16.9],
      [77.5, 16.5],
      [78.8, 16.5],
      [80.0, 16.52],
      [80.65, 16.51],
      [80.99, 15.98],
    ],
    labelAt: [77.8, 16.55],
  },
  {
    id: "kaveri",
    name: "Kaveri",
    flow: "east",
    origin: "Brahmagiri Hills (Talakaveri), Kodagu, Karnataka",
    lengthKm: 800,
    alsoKnownAs: ["Cauvery", "Ponni", "Ganga of the South"],
    tributaries: ["Hemavati", "Kabini", "Bhavani", "Shimsha", "Amaravati"],
    drainsInto: "Bay of Bengal (Kaveri delta, Tamil Nadu)",
    fact: "800 km; the only perennial South Indian river — the Ganga of the South. Its delta is the Granary of South India; called Ponni in Tamil Nadu.",
    facts: [
      "Cauvery Water Dispute: Karnataka vs Tamil Nadu, also Kerala and Puducherry. Allocated shares — Tamil Nadu 404.25 TMC, Karnataka 284.75 TMC, Kerala 30 TMC, Puducherry 7 TMC.",
    ],
    path: [
      [75.49, 12.38],
      [76.0, 12.42],
      [76.65, 12.42],
      [76.9, 12.3],
      [77.2, 11.6],
      [77.73, 11.44],
      [78.7, 10.96],
      [79.4, 11.05],
      [79.85, 11.14],
    ],
    labelAt: [77.5, 11.7],
  },
  {
    id: "pennar",
    name: "Pennar",
    flow: "east",
    origin: "Nandi Hills, Chikkaballapura, Karnataka",
    alsoKnownAs: ["Uttara Pinakini"],
    drainsInto: "Bay of Bengal (near Nellore, Andhra Pradesh)",
    fact: "Also called Uttara Pinakini — an independent river of Andhra Pradesh, rising at the Nandi Hills.",
    path: [
      [77.68, 13.37],
      [78.2, 13.7],
      [78.8, 14.1],
      [79.4, 14.4],
      [80.15, 14.5],
    ],
    labelAt: [78.9, 14.15],
  },
  {
    id: "damodar",
    name: "Damodar",
    flow: "east",
    origin: "Chotanagpur Plateau rift valley, Jharkhand",
    tributaries: ["Bokaro", "Barakar", "Konar"],
    drainsInto: "Hugli (Hooghly)",
    fact: "Nicknamed the Sorrow of Bengal for its floods. Rises in the Chotanagpur rift valley and joins the Hugli.",
    path: [
      [84.73, 23.68],
      [85.4, 23.72],
      [86.2, 23.65],
      [87.0, 23.4],
      [87.8, 22.9],
      [88.15, 22.45],
    ],
    labelAt: [86.4, 23.55],
  },
  {
    id: "subarnarekha",
    name: "Subarnarekha",
    flow: "east",
    origin: "Ranchi Plateau, Jharkhand",
    cities: ["Jamshedpur"],
    drainsInto: "Bay of Bengal (near Talsari)",
    fact: "Name means Streak of Gold — gold particles in its sand. Rises on the Ranchi Plateau; Jamshedpur sits on its bank.",
    path: [
      [85.17, 23.31],
      [85.8, 22.95],
      [86.4, 22.55],
      [86.9, 22.1],
      [87.35, 21.65],
    ],
    labelAt: [86.3, 22.5],
  },
  {
    id: "baitarani",
    name: "Baitarani",
    flow: "east",
    origin: "Gonasikha / Guptaganga Hills, Odisha",
    drainsInto: "Bay of Bengal (with Brahmani, via the Dhamra)",
    fact: "Rises in the Gonasikha Hills and joins the Brahmani to form a shared delta.",
    facts: [
      "APJ Abdul Kalam Islands (formerly Wheeler Islands) lie near the Dhamra mouth — the Baitarani–Brahmani confluence.",
      "Bhitarkanika National Park sits in the Brahmani–Baitarani–Dhamra delta.",
      "Gahirmatha Marine Sanctuary (world's largest Olive Ridley nesting site) and Rushikulya beach (2nd largest) are nearby on the Odisha coast.",
    ],
    path: [
      [85.62, 21.5],
      [86.0, 21.15],
      [86.4, 20.9],
      [86.9, 20.76],
    ],
    labelAt: [86.15, 21.1],
  },
  {
    id: "brahmani",
    name: "Brahmani",
    flow: "east",
    origin: "Sankh + South Koel confluence, near Rourkela, Odisha",
    drainsInto: "Bay of Bengal (with Baitarani)",
    fact: "Formed by the Sankh and South Koel near Rourkela; joins the Baitarani to form a delta.",
    facts: [
      "Bhitarkanika National Park sits in the Brahmani–Baitarani–Dhamra delta.",
    ],
    path: [
      [84.86, 22.22],
      [85.4, 21.7],
      [85.9, 21.2],
      [86.5, 20.85],
      [86.87, 20.73],
    ],
    labelAt: [85.6, 21.45],
  },
  {
    id: "vaigai",
    name: "Vaigai",
    flow: "east",
    origin: "Varushanad Hills, Tamil Nadu",
    drainsInto: "Palk Bay / Bay of Bengal",
    fact: "A Tamil Nadu river — the southernmost river of India.",
    path: [
      [77.48, 9.73],
      [77.85, 9.95],
      [78.12, 9.93],
      [78.55, 9.6],
      [79.0, 9.36],
    ],
    labelAt: [78.2, 9.85],
  },
  {
    id: "narmada",
    name: "Narmada",
    flow: "west",
    origin: "Amarkantak Plateau, Madhya Pradesh",
    lengthKm: 1312,
    tributaries: ["Banjar", "Tawa", "Shakkar", "Halon"],
    cities: ["Jabalpur"],
    drainsInto: "Gulf of Khambhat (Arabian Sea)",
    fact: "1,312 km — the longest west-flowing river. Flows through a rift valley between the Vindhya and Satpura ranges; forms Dhuandhar Falls at Bhedaghat, Jabalpur.",
    path: [
      [81.76, 22.67],
      [80.6, 23.0],
      [79.93, 23.17],
      [78.5, 22.7],
      [76.8, 22.3],
      [75.0, 22.0],
      [73.5, 21.85],
      [72.56, 21.65],
    ],
    labelAt: [77.5, 22.5],
  },
  {
    id: "tapi",
    name: "Tapi",
    flow: "west",
    origin: "Multai, Betul district, Madhya Pradesh (Satpura Range)",
    lengthKm: 724,
    alsoKnownAs: ["Tapti"],
    tributaries: ["Aner", "Gomai", "Purna", "Bori", "Girna", "Arunawati"],
    cities: ["Surat"],
    drainsInto: "Gulf of Khambhat (Arabian Sea)",
    fact: "724 km; 2nd-longest westward river. About 80% of the basin is in Maharashtra. Flows in a rift valley alongside the Narmada; Surat sits on its bank.",
    path: [
      [78.26, 21.77],
      [76.8, 21.4],
      [75.4, 21.2],
      [74.0, 21.2],
      [72.83, 21.17],
      [72.68, 21.08],
    ],
    labelAt: [75.2, 21.25],
  },
  {
    id: "mahi",
    name: "Mahi",
    flow: "west",
    origin: "Vindhya mountains, Madhya Pradesh",
    drainsInto: "Gulf of Khambhat (Arabian Sea)",
    fact: "Rises in the Vindhyas and is notable for crossing the Tropic of Cancer twice.",
    path: [
      [75.05, 22.55],
      [74.6, 23.4],
      [74.1, 24.0],
      [73.5, 23.6],
      [73.0, 22.9],
      [72.55, 22.27],
    ],
    labelAt: [73.7, 23.5],
  },
  {
    id: "sabarmati",
    name: "Sabarmati",
    flow: "west",
    origin: "Aravalli Range (near Dhebar Lake, Rajasthan)",
    cities: ["Ahmedabad"],
    drainsInto: "Gulf of Khambhat (Arabian Sea)",
    fact: "Rises in the Aravallis; Ahmedabad sits on its bank.",
    path: [
      [73.95, 24.27],
      [73.2, 23.8],
      [72.7, 23.3],
      [72.57, 23.03],
      [72.4, 22.35],
    ],
    labelAt: [72.75, 23.35],
  },
  {
    id: "luni",
    name: "Luni",
    flow: "west",
    origin: "Nag Pahar (Naga Hills), Ajmer, Rajasthan",
    alsoKnownAs: ["Lavanavari"],
    drainsInto: "Rann of Kutch (endorheic — never reaches the sea)",
    fact: "Also called Lavanavari. Endorheic — it ends in the Rann of Kutch and never reaches the sea. India's only major saline river.",
    path: [
      [74.64, 26.45],
      [73.6, 26.1],
      [72.5, 25.5],
      [71.5, 24.9],
      [70.7, 24.4],
      [70.25, 24.05],
    ],
    labelAt: [72.4, 25.4],
  },
];

/** Smaller west-coast rivers, shown only on region zoom panels. */
export const REGION_RIVERS: PeninsularRiver[] = [
  {
    id: "zuari",
    name: "Zuari",
    flow: "west",
    regionId: "goa",
    origin: "Western Ghats, Goa",
    drainsInto: "Mormugao Bay (estuary)",
    fact: "Goa's estuary river, opening into Mormugao Bay.",
    path: [
      [74.15, 15.28],
      [73.98, 15.35],
      [73.82, 15.41],
    ],
    labelAt: [73.98, 15.35],
  },
  {
    id: "mandovi",
    name: "Mandovi",
    flow: "west",
    regionId: "goa",
    origin: "Western Ghats, Goa",
    cities: ["Panaji"],
    drainsInto: "Arabian Sea (Goa)",
    fact: "Called the lifeline of Goa; Panaji sits on its bank.",
    path: [
      [74.18, 15.52],
      [74.0, 15.5],
      [73.83, 15.5],
    ],
    labelAt: [74.0, 15.5],
  },
  {
    id: "periyar",
    name: "Periyar",
    flow: "west",
    regionId: "kerala",
    origin: "Sivagiri Hills, Western Ghats",
    drainsInto: "Arabian Sea (near Kochi)",
    fact: "Kerala's longest river — the lifeline of Kerala.",
    path: [
      [77.17, 9.47],
      [76.85, 9.7],
      [76.5, 10.0],
      [76.25, 10.05],
    ],
    labelAt: [76.6, 9.85],
  },
  {
    id: "bharathapuzha",
    name: "Bharathapuzha",
    flow: "west",
    regionId: "kerala",
    origin: "Anamalai Hills, Western Ghats",
    alsoKnownAs: ["Ponnani"],
    drainsInto: "Arabian Sea (Ponnani)",
    fact: "Also called the Ponnani river — Kerala's second-longest.",
    path: [
      [76.75, 10.45],
      [76.35, 10.7],
      [76.0, 10.78],
      [75.92, 10.78],
    ],
    labelAt: [76.3, 10.68],
  },
  {
    id: "pamba",
    name: "Pamba",
    flow: "west",
    regionId: "kerala",
    origin: "Pulachimalai, Western Ghats",
    drainsInto: "Vembanad Lake",
    fact: "Drains into Vembanad Lake, Kerala's largest lake.",
    path: [
      [77.05, 9.42],
      [76.7, 9.4],
      [76.45, 9.48],
    ],
    labelAt: [76.7, 9.42],
  },
  {
    id: "kali",
    name: "Kali",
    flow: "west",
    regionId: "karnataka",
    origin: "Western Ghats, Uttara Kannada",
    alsoKnownAs: ["Kalinadi"],
    drainsInto: "Arabian Sea (near Karwar)",
    fact: "Also called Kalinadi — a west-flowing Karnataka coastal river.",
    path: [
      [74.65, 15.15],
      [74.35, 14.95],
      [74.12, 14.85],
    ],
    labelAt: [74.4, 14.98],
  },
  {
    id: "sharavati",
    name: "Sharavati",
    flow: "west",
    regionId: "karnataka",
    origin: "Western Ghats, Shimoga district",
    drainsInto: "Arabian Sea (near Honnavar)",
    fact: "Famous for Jog Falls, one of India's highest plunge waterfalls.",
    path: [
      [75.05, 14.05],
      [74.81, 14.23],
      [74.45, 14.28],
    ],
    labelAt: [74.81, 14.23],
  },
  {
    id: "varahi",
    name: "Varahi",
    flow: "west",
    regionId: "karnataka",
    origin: "Western Ghats, Karnataka",
    drainsInto: "Arabian Sea",
    fact: "Site of Kunchikal Falls — India's highest waterfall.",
    path: [
      [75.12, 13.72],
      [74.85, 13.68],
      [74.65, 13.64],
    ],
    labelAt: [74.9, 13.68],
  },
];

export const REGIONS: RegionHub[] = [
  {
    id: "goa",
    name: "Goa coast",
    at: [74.0, 15.45],
    fact: "Tight cluster of Goa's west-coast rivers — Zuari (Mormugao Bay) and Mandovi (lifeline of Goa, Panaji).",
    fit: fitBbox(73.65, 15.15, 74.35, 15.7),
  },
  {
    id: "kerala",
    name: "Kerala coast",
    at: [76.35, 10.05],
    fact: "Kerala's west-coast cluster — Periyar (lifeline), Bharathapuzha (Ponnani), and Pamba (Vembanad Lake).",
    fit: fitBbox(75.7, 9.15, 77.4, 11.1),
  },
  {
    id: "karnataka",
    name: "Karnataka coast",
    at: [74.55, 14.2],
    fact: "Karnataka's west-coast cluster — Kali (Kalinadi), Sharavati (Jog Falls), and Varahi (Kunchikal Falls).",
    fit: fitBbox(74.0, 13.4, 75.35, 15.35),
  },
];

export const ALL_RIVERS: PeninsularRiver[] = [
  ...OVERVIEW_RIVERS,
  ...REGION_RIVERS,
];

export function getRiver(id: string): PeninsularRiver | undefined {
  return ALL_RIVERS.find((r) => r.id === id);
}

export function getRegion(id: RegionId): RegionHub | undefined {
  return REGIONS.find((r) => r.id === id);
}

export function riversForRegion(regionId: RegionId): PeninsularRiver[] {
  return REGION_RIVERS.filter((r) => r.regionId === regionId);
}

export const CITIES: { city: string; riverId: string }[] = [
  { city: "Nasik", riverId: "godavari" },
  { city: "Vijayawada", riverId: "krishna" },
  { city: "Hyderabad", riverId: "krishna" },
  { city: "Jamshedpur", riverId: "subarnarekha" },
  { city: "Jabalpur", riverId: "narmada" },
  { city: "Surat", riverId: "tapi" },
  { city: "Ahmedabad", riverId: "sabarmati" },
  { city: "Panaji", riverId: "mandovi" },
];
