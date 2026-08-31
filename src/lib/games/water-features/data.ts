import type { Feature } from "geojson";
import { pointOnRiver } from "@/lib/games/water-features/rivers";

export type FeatureKind = "dam" | "lake" | "waterfall";

export type RegionId =
  | "jk-ladakh"
  | "himachal"
  | "uttarakhand"
  | "punjab"
  | "uttar-pradesh"
  | "gujarat-mp-rajasthan"
  | "maharashtra-jharkhand-chhattisgarh"
  | "odisha"
  | "karnataka"
  | "kerala"
  | "tamil-nadu"
  | "andhra-telangana"
  | "ne-hills";

export type WaterFeature = {
  id: string;
  name: string;
  kind: FeatureKind;
  state: string;
  river?: string;
  /** Existing river id from River Hunt / Peninsular games — marker sits on its path. */
  riverId?: string;
  at: [number, number];
  shortLabel: string;
  fact: string;
  facts?: string[];
  regionId?: RegionId;
  /** Shown on the national overview (headline / record items only). */
  overview?: boolean;
};

export type RegionPanel = {
  id: RegionId;
  name: string;
  at: [number, number];
  fit: Feature;
  fact: string;
  /** Ramsar / reference notes searchable in Explore for this panel. */
  ramsarNotes?: string[];
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

function dam(
  id: string,
  name: string,
  state: string,
  river: string,
  riverId: string,
  t: number,
  fact: string,
  opts?: { regionId?: RegionId; overview?: boolean; facts?: string[] }
): WaterFeature {
  return {
    id,
    name,
    kind: "dam",
    state,
    river,
    riverId,
    at: pointOnRiver(riverId, t),
    shortLabel: name.split(" ")[0] ?? name,
    fact,
    ...opts,
  };
}

function lake(
  id: string,
  name: string,
  state: string,
  at: [number, number],
  fact: string,
  opts?: {
    river?: string;
    riverId?: string;
    regionId?: RegionId;
    overview?: boolean;
    facts?: string[];
  }
): WaterFeature {
  return {
    id,
    name,
    kind: "lake",
    state,
    at: opts?.riverId ? pointOnRiver(opts.riverId, 0.5) : at,
    shortLabel: name.split(" ")[0] ?? name,
    fact,
    river: opts?.river,
    riverId: opts?.riverId,
    regionId: opts?.regionId,
    overview: opts?.overview,
    facts: opts?.facts,
  };
}

function falls(
  id: string,
  name: string,
  state: string,
  river: string,
  at: [number, number],
  fact: string,
  opts?: {
    riverId?: string;
    t?: number;
    regionId?: RegionId;
    overview?: boolean;
    facts?: string[];
  }
): WaterFeature {
  const pos =
    opts?.riverId && opts.t !== undefined
      ? pointOnRiver(opts.riverId, opts.t)
      : at;
  return {
    id,
    name,
    kind: "waterfall",
    state,
    river,
    riverId: opts?.riverId,
    at: pos,
    shortLabel: name.split(" ")[0] ?? name,
    fact,
    regionId: opts?.regionId,
    overview: opts?.overview,
    facts: opts?.facts,
  };
}

export const INTRO_FACTS = {
  dams: [
    'Dam = structure across a river to store water, control floods, generate power, and irrigate — often multipurpose. Nehru called dams "Temples of Modern India."',
    "Drawbacks: displacement, biodiversity loss, inter-state and international water disputes.",
  ],
  hydro: [
    "Hydroelectric generation: stored water's potential energy → kinetic energy through the penstock → turbine → generator → electricity.",
  ],
  waterfallTypes: [
    "Cataract — large volume, powerful.",
    "Plunge — falls clear of the cliff face.",
    "Cascade — stepped / multi-drop.",
  ],
  worldRecords: [
    "Angel Falls (Venezuela) — world's highest waterfall, 979 m.",
    "Niagara Falls (USA–Canada) — world's 2nd-highest by volume.",
    "Caspian Sea — world's largest lake.",
    "Lake Titicaca (Peru/Bolivia) — highest navigable lake.",
    "Lake Baikal (Russia) — deepest lake.",
    "Lake Superior (USA/Canada) — largest freshwater lake by surface area.",
  ],
};

export const RAMSAR_SUMMARY = [
  "India has 93 Ramsar wetlands (Oct 2025).",
  "First two Ramsar sites: Chilika Lake (Odisha, 1981) and Keoladeo National Park (Rajasthan).",
  "Most Ramsar sites: Tamil Nadu.",
  "Latest additions include Tawa Reservoir (MP), Nanjarayan Lake & Kazhuveli (TN).",
  "Montreux Record — wetlands whose ecological character is at risk from pollution or human interference.",
];

/** National overview — headline dams, lakes, waterfalls only. */
export const OVERVIEW_FEATURES: WaterFeature[] = [
  dam(
    "bhakra-nangal",
    "Bhakra–Nangal",
    "HP / Punjab",
    "Sutlej",
    "sutlej",
    0.35,
    "India's highest gravity dam and largest by volume; Bhakra forms Gobind Sagar Lake.",
    { overview: true }
  ),
  dam(
    "hirakud",
    "Hirakud",
    "Odisha",
    "Mahanadi",
    "mahanadi",
    0.55,
    "World's longest earthen dam — main dam 4.8 km; dam + dykes 25.8 km.",
    { overview: true }
  ),
  dam(
    "tehri",
    "Tehri",
    "Uttarakhand",
    "Bhagirathi",
    "ganga",
    0.08,
    "India's highest dam (261 m), on the Bhagirathi.",
    { overview: true }
  ),
  dam(
    "farakka",
    "Farakka",
    "West Bengal",
    "Ganga",
    "ganga",
    0.72,
    "Built to feed the Hooghly branch of the Ganga.",
    { overview: true }
  ),
  dam(
    "sardar-sarovar",
    "Sardar Sarovar",
    "Gujarat",
    "Narmada",
    "narmada",
    0.15,
    "Multipurpose dam on the Narmada in Gujarat.",
    { overview: true }
  ),
  lake(
    "wular",
    "Wular Lake",
    "J&K",
    [74.52, 34.32],
    "India's largest freshwater lake — tectonic origin, on the Jhelum.",
    { river: "Jhelum", riverId: "jhelum", overview: true, regionId: "jk-ladakh" }
  ),
  lake(
    "chilika",
    "Chilika Lake",
    "Odisha",
    [85.45, 19.7],
    "India's largest brackish-water lake; India's first Ramsar site (1981).",
    { overview: true, regionId: "odisha" }
  ),
  lake(
    "sambhar",
    "Sambhar Lake",
    "Rajasthan",
    [75.2, 26.9],
    "India's largest inland saltwater lake.",
    { overview: true, regionId: "gujarat-mp-rajasthan" }
  ),
  falls(
    "kunchikal",
    "Kunchikal Falls",
    "Karnataka",
    "Varahi",
    [0, 0],
    "India's highest waterfall (455 m), on the Varahi.",
    { riverId: "varahi", t: 0.15, overview: true, regionId: "karnataka" }
  ),
  lake(
    "loktak",
    "Loktak Lake",
    "Manipur",
    [93.94, 24.55],
    "World's only floating lake (phumdis); Keibul Lamjao NP — world's only floating national park.",
    { overview: true, regionId: "ne-hills" }
  ),
];

/** Region-panel features (dams, lakes, waterfalls by state cluster). */
export const REGION_FEATURES: WaterFeature[] = [
  // —— J&K & Ladakh ——
  dam("dul-hasti", "Dul Hasti", "J&K", "Chenab", "chenab", 0.45, "On the Chenab in Kishtwar.", { regionId: "jk-ladakh" }),
  dam("baglihar", "Baglihar", "J&K", "Chenab", "chenab", 0.5, "Run-of-the-river project on the Chenab.", { regionId: "jk-ladakh" }),
  dam("salal", "Salal", "J&K", "Chenab", "chenab", 0.55, "One of the earliest large dams on the Chenab.", { regionId: "jk-ladakh" }),
  dam("ratle", "Ratle", "J&K", "Chenab", "chenab", 0.48, "On the Chenab near Kishtwar.", { regionId: "jk-ladakh" }),
  dam("kishanganga", "Kishanganga", "J&K", "Kishanganga", "jhelum", 0.2, "Hydro project on a Jhelum tributary.", { regionId: "jk-ladakh" }),
  dam("tulbul", "Tulbul", "J&K", "Jhelum", "jhelum", 0.35, "Navigation project on the Jhelum (Wular outlet).", { regionId: "jk-ladakh" }),
  dam("uri", "Uri", "J&K", "Jhelum", "jhelum", 0.4, "Uri hydroelectric project on the Jhelum.", { regionId: "jk-ladakh" }),
  lake("dal", "Dal Lake", "J&K", [74.87, 34.12], "Jewel of Srinagar — famous houseboats.", { regionId: "jk-ladakh" }),
  lake("anchar", "Anchar Lake", "J&K", [74.85, 34.08], "Shallow lake linked to Dal via a channel.", { regionId: "jk-ladakh" }),
  lake("mansar", "Mansar Lake", "J&K", [75.15, 32.98], "Sacred lake in the Jammu region.", { regionId: "jk-ladakh" }),
  lake("pangong", "Pangong Tso", "Ladakh", [78.7, 33.75], "Endorheic saltwater lake spanning India and China.", { regionId: "jk-ladakh" }),
  lake("tso-kar", "Tso Kar", "Ladakh", [78.05, 32.98], "Saltwater lake in the Rupshu Valley.", { regionId: "jk-ladakh" }),
  lake("tso-moriri", "Tso Moriri", "Ladakh", [78.3, 32.9], "High-altitude Ramsar wetland in Ladakh.", { regionId: "jk-ladakh" }),

  // —— Himachal Pradesh ——
  dam("pong", "Pong / Maharana Pratap Sagar", "HP", "Beas", "beas", 0.45, "Multipurpose dam on the Beas.", { regionId: "himachal" }),
  dam("chamera", "Chamera", "HP", "Ravi", "ravi", 0.5, "On the Ravi in Chamba district.", { regionId: "himachal" }),
  dam("baira-siul", "Baira Siul", "HP", "Ravi", "ravi", 0.55, "Hydro project on the Ravi.", { regionId: "himachal" }),
  dam("bassi", "Bassi", "HP", "Ravi", "ravi", 0.48, "Small hydro on a Ravi tributary.", { regionId: "himachal" }),
  dam("nathpa-jhakri", "Nathpa Jhakri", "HP", "Sutlej", "sutlej", 0.25, "India's largest hydroelectric plant by capacity (on the Sutlej).", { regionId: "himachal" }),
  lake("gobind-sagar", "Gobind Sagar", "HP", [76.42, 31.4], "Reservoir of Bhakra Dam on the Sutlej.", { riverId: "sutlej", regionId: "himachal" }),
  lake("renuka", "Renuka Lake", "HP", [77.45, 30.62], "Natural lake shaped like a reclining woman.", { regionId: "himachal" }),
  lake("khajjar", "Khajjiar Lake", "HP", [76.05, 32.55], "Small meadow lake near Dalhousie.", { regionId: "himachal" }),

  // —— Punjab ——
  dam("thein", "Thein / Ranjit Sagar", "Punjab", "Ravi", "ravi", 0.35, "Multipurpose dam on the Ravi.", { regionId: "punjab" }),
  dam("shahpur", "Shahpur Kandi", "Punjab", "Ravi", "ravi", 0.38, "On the Ravi near Pathankot.", { regionId: "punjab" }),
  dam("harike", "Harike Barrage", "Punjab", "Sutlej+Beas", "sutlej", 0.55, "Confluence of Sutlej and Beas — source of the Indira Gandhi Canal (India's longest canal).", { regionId: "punjab" }),
  lake("harike-lake", "Harike Wetland", "Punjab", [75.2, 31.17], "Ramsar wetland at the Harike barrage.", { regionId: "punjab" }),
  lake("kanjli", "Kanjli Wetland", "Punjab", [75.38, 31.18], "Ramsar site in Kapurthala district.", { regionId: "punjab" }),

  // —— Uttarakhand ——
  lake("dodital", "Dodital", "Uttarakhand", [78.38, 30.98], "High-altitude freshwater lake in Garhwal.", { regionId: "uttarakhand" }),
  lake("bhimtal", "Bhimtal", "Uttarakhand", [79.55, 29.35], "Largest lake in the Kumaon region.", { regionId: "uttarakhand" }),
  lake("roopkund", "Roopkund", "Uttarakhand", [79.73, 30.26], "Skeleton Lake — famous for ancient human remains.", { regionId: "uttarakhand" }),
  lake("nainital", "Nainital", "Uttarakhand", [79.45, 29.38], "Hill-station lake in the Kumaon Himalaya.", { regionId: "uttarakhand" }),
  lake("suryadhar", "Suryadhar Lake", "Uttarakhand", [78.95, 30.05], "Artificial lake near Mussoorie.", { regionId: "uttarakhand" }),

  // —— Uttar Pradesh ——
  dam("matatila", "Matatila", "UP", "Betwa", "yamuna", 0.15, "On the Betwa in Lalitpur district.", { regionId: "uttar-pradesh" }),
  dam("lakshmibai", "Lakshmibai Sagar", "UP", "Betwa", "yamuna", 0.12, "Irrigation project on the Betwa.", { regionId: "uttar-pradesh" }),
  dam("rihand", "Rihand Dam", "UP", "Rihand", "son", 0.5, "Forms Govind Vallabh Pant Sagar — India's largest artificial lake by volume.", { regionId: "uttar-pradesh" }),
  lake("gb-pant-sagar", "Govind Ballabh Pant Sagar", "UP", [82.65, 24.2], "India's largest artificial lake (Sonbhadra), formed by Rihand Dam.", { regionId: "uttar-pradesh" }),
  lake("keetham", "Keetham / Sur Sarovar", "UP", [77.95, 27.25], "Ramsar site near Agra (added 2020).", { regionId: "uttar-pradesh" }),
  lake("surajkund", "Surajkund", "Haryana", [77.48, 28.48], "Historic reservoir near Delhi NCR.", { regionId: "uttar-pradesh" }),

  // —— Gujarat / MP / Rajasthan ——
  dam("ukai", "Ukai", "Gujarat", "Tapi", "tapi", 0.35, "Multipurpose dam on the Tapi.", { regionId: "gujarat-mp-rajasthan" }),
  dam("kakrapar", "Kakrapar", "Gujarat", "Tapi", "tapi", 0.3, "Near Kakrapar Atomic Power Station.", { regionId: "gujarat-mp-rajasthan" }),
  dam("kandana", "Kadana", "Gujarat", "Mahi", "mahi", 0.4, "On the Mahi in Panchmahal.", { regionId: "gujarat-mp-rajasthan" }),
  dam("tawa", "Tawa", "MP", "Tawa", "narmada", 0.05, "On a Narmada tributary; Tawa Reservoir is a Ramsar site.", { regionId: "gujarat-mp-rajasthan" }),
  dam("omkareshwar", "Omkareshwar", "MP", "Narmada", "narmada", 0.25, "Run-of-the-river project on the Narmada.", { regionId: "gujarat-mp-rajasthan" }),
  dam("indira-sagar", "Indira Sagar", "MP", "Narmada", "narmada", 0.2, "Large reservoir on the Narmada.", { regionId: "gujarat-mp-rajasthan" }),
  dam("ban-sagar", "Ban Sagar", "MP", "Son", "son", 0.45, "Multipurpose project on the Son.", { regionId: "gujarat-mp-rajasthan" }),
  dam("gandhi-sagar", "Gandhi Sagar", "MP", "Chambal", "chambal", 0.55, "First of the Chambal Valley projects.", { regionId: "gujarat-mp-rajasthan" }),
  dam("mahi-bajaj", "Mahi Bajaj Sagar", "Rajasthan", "Mahi", "mahi", 0.55, "On the Mahi in Banswara.", { regionId: "gujarat-mp-rajasthan" }),
  dam("rana-pratap", "Rana Pratap Sagar", "Rajasthan", "Chambal", "chambal", 0.45, "Downstream of Gandhi Sagar on the Chambal.", { regionId: "gujarat-mp-rajasthan" }),
  dam("jawahar-sagar", "Jawahar Sagar", "Rajasthan", "Chambal", "chambal", 0.35, "Hydro project near Rawatbhata.", { regionId: "gujarat-mp-rajasthan" }),
  dam("bisalpur", "Bisalpur", "Rajasthan", "Banas", "banas", 0.5, "Supplies drinking water to Jaipur.", { regionId: "gujarat-mp-rajasthan" }),
  lake("pushkar", "Pushkar Lake", "Rajasthan", [74.55, 26.49], "Sacred lake in Ajmer district.", { regionId: "gujarat-mp-rajasthan" }),
  lake("jaisamand", "Jaisamand / Dhebar", "Rajasthan", [73.88, 24.28], "Second-largest artificial lake in Asia.", { regionId: "gujarat-mp-rajasthan" }),
  lake("nalsarovar", "Nalsarovar", "Gujarat", [72.02, 22.78], "Ramsar bird sanctuary near Ahmedabad.", { regionId: "gujarat-mp-rajasthan" }),
  lake("rann-kutch", "Rann of Kutch", "Gujarat", [70.5, 23.8], "Vast seasonal salt marsh — not a conventional lake.", { regionId: "gujarat-mp-rajasthan" }),
  lake("thol", "Thol Lake", "Gujarat", [72.38, 23.22], "Ramsar site added in 2021.", { regionId: "gujarat-mp-rajasthan" }),
  lake("bhojtal", "Bhojtal / Bhopal Lake", "MP", [77.4, 23.25], "Asia's largest artificial lake — built by Raja Bhoj (Parmar dynasty).", { regionId: "gujarat-mp-rajasthan" }),
  falls("dhuandhar", "Dhuandhar Falls", "MP", "Narmada", [0, 0], "Marble gorge waterfall at Bhedaghat on the Narmada.", { riverId: "narmada", t: 0.42, regionId: "gujarat-mp-rajasthan" }),
  falls("kapildhara", "Kapildhara Falls", "MP", "Narmada", [0, 0], "Near Amarkantak, origin of the Narmada.", { riverId: "narmada", t: 0.02, regionId: "gujarat-mp-rajasthan" }),
  falls("chulia", "Chulia Falls", "Rajasthan", "Chambal", [0, 0], "On the Chambal near Rawatbhata.", { riverId: "chambal", t: 0.4, regionId: "gujarat-mp-rajasthan" }),

  // —— Maharashtra / Jharkhand / Chhattisgarh ——
  dam("jayakwadi", "Jayakwadi", "Maharashtra", "Godavari", "godavari", 0.15, "Major irrigation dam on the Godavari.", { regionId: "maharashtra-jharkhand-chhattisgarh" }),
  dam("koyna", "Koyna Dam", "Maharashtra", "Koyna", "krishna", 0.05, "Major hydro project on a Krishna tributary.", { regionId: "maharashtra-jharkhand-chhattisgarh" }),
  dam("dhom", "Dhom", "Maharashtra", "Krishna", "krishna", 0.2, "On the Krishna near Satara.", { regionId: "maharashtra-jharkhand-chhattisgarh" }),
  dam("ujjaini", "Ujjaini", "Maharashtra", "Krishna", "krishna", 0.25, "On the Krishna in Solapur district.", { regionId: "maharashtra-jharkhand-chhattisgarh" }),
  dam("isapur", "Isapur", "Maharashtra", "Penganga", "godavari", 0.08, "On the Penganga (Godavari basin).", { regionId: "maharashtra-jharkhand-chhattisgarh" }),
  dam("bhusi", "Bhushi Dam", "Maharashtra", "Indrayani", "krishna", 0.02, "Popular monsoon spot near Lonavala.", { regionId: "maharashtra-jharkhand-chhattisgarh" }),
  dam("panchet", "Panchet", "Jharkhand", "Damodar", "damodar", 0.6, "Part of the Damodar Valley Project.", { regionId: "maharashtra-jharkhand-chhattisgarh" }),
  dam("maithon", "Maithon", "Jharkhand", "Barakar", "damodar", 0.45, "Damodar Valley Project — on the Barakar.", { regionId: "maharashtra-jharkhand-chhattisgarh" }),
  dam("tilaiya", "Tilaiya", "Jharkhand", "Barakar", "damodar", 0.4, "First dam of the Damodar Valley Project (1948).", { regionId: "maharashtra-jharkhand-chhattisgarh" }),
  dam("patratu", "Patratu", "Jharkhand", "Nalkari", "damodar", 0.35, "Thermal and hydro hub near Ramgarh.", { regionId: "maharashtra-jharkhand-chhattisgarh" }),
  dam("konar", "Konar", "Jharkhand", "Konar", "damodar", 0.5, "Damodar Valley Project on the Konar.", { regionId: "maharashtra-jharkhand-chhattisgarh" }),
  dam("massanjore", "Massanjore", "Jharkhand", "Mayurakshi", "subarnarekha", 0.15, "Near Dumka on the Mayurakshi.", { regionId: "maharashtra-jharkhand-chhattisgarh" }),
  dam("indravati", "Indravati", "Chhattisgarh", "Indravati", "godavari", 0.55, "Major dam on an Indravati tributary of the Godavari.", { regionId: "maharashtra-jharkhand-chhattisgarh" }),
  dam("hasdeo-bango", "Hasdeo Bango", "Chhattisgarh", "Hasdeo", "mahanadi", 0.25, "On a Mahanadi tributary in Korba.", { regionId: "maharashtra-jharkhand-chhattisgarh" }),
  lake("bhushi-lake", "Bhushi Lake", "Maharashtra", [73.48, 18.72], "Seasonal lake below Bhushi Dam, Lonavala.", { regionId: "maharashtra-jharkhand-chhattisgarh" }),
  lake("lonar", "Lonar Lake", "Maharashtra", [76.52, 19.98], "Crater lake from meteorite impact, Buldhana.", { regionId: "maharashtra-jharkhand-chhattisgarh" }),
  falls("vajrai", "Vajrai Falls", "Maharashtra", "Urmodi", [73.98, 17.58], "Near Satara — one of Maharashtra's highest.", { regionId: "maharashtra-jharkhand-chhattisgarh" }),
  falls("kune", "Kune Falls", "Maharashtra", "Ulhas", [73.42, 18.78], "Near Khandala in the Western Ghats.", { regionId: "maharashtra-jharkhand-chhattisgarh" }),
  falls("hundru", "Hundru Falls", "Jharkhand", "Subarnarekha", [0, 0], "On the Subarnarekha near Ranchi.", { riverId: "subarnarekha", t: 0.25, regionId: "maharashtra-jharkhand-chhattisgarh" }),
  {
    id: "damodar-valley",
    name: "Damodar Valley Project",
    kind: "dam",
    state: "Jharkhand",
    river: "Damodar / Barakar / Konar",
    at: pointOnRiver("damodar", 0.5),
    shortLabel: "DVP",
    fact: "India's first river valley project (1948), modeled on the USA's Tennessee Valley Project — Maithon, Tilaiya, Panchet, Konar dams.",
    regionId: "maharashtra-jharkhand-chhattisgarh",
  },

  // —— Odisha ——
  falls("duduma", "Duduma Falls", "Odisha", "Machkund", [82.95, 18.35], "On the Machkund (Godavari basin).", { regionId: "odisha" }),
  falls("barehipani", "Barehipani Falls", "Odisha", "Budhabalanga", [86.35, 21.35], "In Simlipal — among India's highest tiered falls.", { regionId: "odisha" }),

  // —— Karnataka ——
  dam("linganamakki", "Linganamakki", "Karnataka", "Sharavati", "sharavati", 0.35, "Forms reservoir for Sharavati hydro.", { regionId: "karnataka" }),
  dam("almatti", "Almatti", "Karnataka", "Krishna", "krishna", 0.55, "Major dam on the Krishna.", { regionId: "karnataka" }),
  dam("krs", "Krishna Raja Sagar", "Karnataka", "Kaveri", "kaveri", 0.35, "Near Mysuru on the Kaveri.", { regionId: "karnataka" }),
  falls("jog", "Jog / Gersoppa Falls", "Karnataka", "Sharavati", [0, 0], "Second-highest plunge waterfall in India.", { riverId: "sharavati", t: 0.25, regionId: "karnataka" }),
  falls("shivasamudram", "Shivasamudram", "Karnataka", "Kaveri", [0, 0], "Twin falls on the Kaveri.", { riverId: "kaveri", t: 0.45, regionId: "karnataka" }),
  falls("hebbe", "Hebbe Falls", "Karnataka", "Bhadra", [75.72, 13.55], "In the Kemmangundi hills.", { regionId: "karnataka" }),
  falls("gokak", "Gokak Falls", "Karnataka", "Ghatprabha", [74.82, 16.17], "On the Ghatprabha near Belagavi.", { regionId: "karnataka" }),

  // —— Kerala ——
  dam("idukki", "Idukki", "Kerala", "Periyar", "periyar", 0.45, "Arch dam between Kuravan and Kurathi hills.", { regionId: "kerala" }),
  dam("mullaperiyar", "Mullaperiyar", "Kerala", "Periyar", "periyar", 0.5, "Inter-state dam (Kerala–Tamil Nadu dispute).", { regionId: "kerala" }),
  lake("vembanad", "Vembanad Lake", "Kerala", [76.35, 9.65], "India's longest lake; the Pamba drains into it.", { regionId: "kerala" }),
  lake("sasthamkotta", "Sasthamkotta Lake", "Kerala", [76.62, 9.05], "Largest natural freshwater lake in Kerala.", { regionId: "kerala" }),
  lake("ashtamudi", "Ashtamudi Lake", "Kerala", [76.58, 8.95], "Palm-shaped estuarine lake in Kollam.", { regionId: "kerala" }),

  // —— Tamil Nadu ——
  dam("mettur", "Mettur", "Tamil Nadu", "Kaveri", "kaveri", 0.75, "Important irrigation dam on the Kaveri.", { regionId: "tamil-nadu" }),
  dam("pykara", "Pykara", "Tamil Nadu", "Pykara", "kaveri", 0.05, "Hydro project in the Nilgiris.", { regionId: "tamil-nadu" }),
  lake("pulicat", "Pulicat Lake", "Tamil Nadu", [80.15, 13.55], "India's 2nd-largest brackish lake (AP–TN border).", { regionId: "tamil-nadu" }),
  lake("kaliveli", "Kaliveli Lake", "Tamil Nadu", [79.85, 12.05], "Coastal wetland near Pondicherry.", { regionId: "tamil-nadu" }),

  // —— Andhra Pradesh / Telangana ——
  dam("pochampad", "Pochampad / Sriram Sagar", "Telangana", "Godavari", "godavari", 0.45, "Major irrigation project on the Godavari.", { regionId: "andhra-telangana" }),
  dam("kaleshwaram", "Kaleshwaram", "Telangana", "Godavari", "godavari", 0.5, "One of the world's largest lift-irrigation projects.", { regionId: "andhra-telangana" }),
  dam("nagarjuna-sagar", "Nagarjuna Sagar", "Telangana / AP", "Krishna", "krishna", 0.65, "Masonry dam on the Krishna.", { regionId: "andhra-telangana" }),
  dam("nizam-sagar", "Nizam Sagar", "Telangana", "Manjira", "godavari", 0.35, "On the Manjira (Godavari basin).", { regionId: "andhra-telangana" }),
  dam("srisailam", "Srisailam", "Andhra Pradesh", "Krishna", "krishna", 0.7, "Large hydro project on the Krishna.", { regionId: "andhra-telangana" }),
  dam("somasila", "Somasila", "Andhra Pradesh", "Pennar", "pennar", 0.55, "On the Pennar near Nellore.", { regionId: "andhra-telangana" }),
  lake("kolleru", "Kolleru Lake", "Andhra Pradesh", [81.2, 16.45], "Freshwater lake between the Godavari and Krishna deltas.", { regionId: "andhra-telangana" }),
  lake("hussain-sagar", "Hussain Sagar", "Telangana", [78.47, 17.42], "Connects Hyderabad and Secunderabad.", { regionId: "andhra-telangana" }),

  // —— Northeast Hills ——
  falls("nohkalikai", "Nohkalikai Falls", "Meghalaya", "rain-fed", [91.7, 25.28], "Tallest plunge waterfall in India (341 m) — rain-fed near Cherrapunji.", { regionId: "ne-hills" }),
  lake("gurudongmar", "Gurudongmar Lake", "Sikkim", [88.7, 28.02], "One of India's highest lakes.", { regionId: "ne-hills" }),
  lake("tsomgo", "Tsomgo / Changu Lake", "Sikkim", [88.75, 27.38], "Glacial lake near Nathu La.", { regionId: "ne-hills" }),
  lake("barapani", "Barapani / Umiam Lake", "Meghalaya", [91.88, 25.58], "Reservoir near Shillong.", { regionId: "ne-hills" }),
  lake("haflong", "Haflong Lake", "Assam", [93.02, 25.17], "Hill-station lake in Assam.", { regionId: "ne-hills" }),
  lake("deepor-beel", "Deepor Beel", "Assam", [91.65, 26.12], "Ramsar wetland near Guwahati.", { regionId: "ne-hills" }),
  lake("pala-wetland", "Pala Wetland", "Mizoram", [92.72, 23.35], "Ramsar site in Mizoram.", { regionId: "ne-hills" }),
  lake("rudrasagar", "Rudrasagar", "Tripura", [91.28, 23.48], "Lake with Neermahal palace.", { regionId: "ne-hills" }),
  lake("kanwar-tal", "Kanwar Tal", "Bihar", [86.95, 26.62], "India's largest ox-bow lake (on the Burhi Gandak).", { regionId: "ne-hills" }),
  lake("gogabil", "Gogabil Lake", "Bihar", [87.15, 25.55], "Ramsar wetland in Katihar district.", { regionId: "ne-hills" }),
  falls("dudhsagar", "Dudhsagar Falls", "Goa", "Mandovi", [0, 0], "Four-tiered falls on the Mandovi.", { riverId: "mandovi", t: 0.2, regionId: "karnataka" }),
];

export const ALL_FEATURES: WaterFeature[] = [
  ...OVERVIEW_FEATURES,
  ...REGION_FEATURES,
];

export const REGIONS: RegionPanel[] = [
  {
    id: "jk-ladakh",
    name: "J&K & Ladakh",
    at: [76.5, 34.2],
    fit: fitBbox(73.5, 32.5, 80.0, 36.2),
    fact: "Chenab & Jhelum dams; Wular, Dal, Pangong Tso, Tso Moriri.",
    ramsarNotes: ["Wular Lake", "Hokersar", "Surinsar-Mansar"],
  },
  {
    id: "himachal",
    name: "Himachal Pradesh",
    at: [77.2, 32.0],
    fit: fitBbox(75.5, 30.5, 79.0, 33.5),
    fact: "Bhakra–Nangal, Nathpa Jhakri, Pong, Chamera; Gobind Sagar, Renuka.",
  },
  {
    id: "uttarakhand",
    name: "Uttarakhand",
    at: [79.4, 30.4],
    fit: fitBbox(77.5, 28.8, 81.2, 31.5),
    fact: "Tehri Dam; Dodital, Bhimtal, Roopkund, Nainital.",
  },
  {
    id: "punjab",
    name: "Punjab",
    at: [75.5, 31.2],
    fit: fitBbox(73.8, 30.5, 76.8, 32.5),
    fact: "Ranjit Sagar, Harike barrage — source of the Indira Gandhi Canal.",
    ramsarNotes: ["Harike Wetland", "Kanjli Wetland", "Ropar Wetland"],
  },
  {
    id: "uttar-pradesh",
    name: "Uttar Pradesh",
    at: [80.0, 26.5],
    fit: fitBbox(77.0, 24.0, 83.0, 28.5),
    fact: "Rihand / Govind Ballabh Pant Sagar; Keetham (Ramsar 2020).",
    ramsarNotes: ["Keetham (Sur Sarovar)", "Upper Ganga River", "Nawabganj"],
  },
  {
    id: "gujarat-mp-rajasthan",
    name: "Gujarat · MP · Rajasthan",
    at: [73.5, 24.0],
    fit: fitBbox(69.5, 20.5, 82.0, 27.5),
    fact: "Sardar Sarovar, Ukai, Gandhi Sagar; Sambhar, Bhojtal, Thol (Ramsar 2021).",
    ramsarNotes: ["Nalsarovar", "Thol Lake", "Sambhar Lake", "Tawa Reservoir"],
  },
  {
    id: "maharashtra-jharkhand-chhattisgarh",
    name: "Maharashtra · Jharkhand · Chhattisgarh",
    at: [80.0, 21.0],
    fit: fitBbox(74.0, 18.0, 84.5, 24.5),
    fact: "Maharashtra has the most dams in India, followed by MP and Gujarat. Damodar Valley Project (1948).",
    ramsarNotes: ["Lonar Lake", "Nandur Madhmeshwar"],
  },
  {
    id: "odisha",
    name: "Odisha",
    at: [84.5, 20.5],
    fit: fitBbox(81.5, 18.5, 87.5, 22.5),
    fact: "Hirakud; Chilika — India's first Ramsar site (1981).",
    ramsarNotes: ["Chilika Lake", "Bhitarkanika", "Satkosia Gorge"],
  },
  {
    id: "karnataka",
    name: "Karnataka",
    at: [76.0, 14.5],
    fit: fitBbox(74.0, 11.5, 78.5, 16.5),
    fact: "Kunchikal (455 m), Jog Falls, Linganamakki, KRS on the Kaveri.",
  },
  {
    id: "kerala",
    name: "Kerala",
    at: [76.35, 10.05],
    fit: fitBbox(75.5, 8.0, 77.5, 12.5),
    fact: "Idukki, Mullaperiyar; Vembanad — India's longest lake.",
    ramsarNotes: ["Vembanad-Kol", "Ashtamudi", "Sasthamkotta"],
  },
  {
    id: "tamil-nadu",
    name: "Tamil Nadu",
    at: [78.5, 11.0],
    fit: fitBbox(76.0, 8.0, 80.5, 13.5),
    fact: "Mettur on the Kaveri; Pulicat — 2nd-largest brackish lake.",
    ramsarNotes: ["Most Ramsar sites of any state", "Nanjarayan Lake", "Kazhuveli"],
  },
  {
    id: "andhra-telangana",
    name: "Andhra · Telangana",
    at: [79.5, 17.0],
    fit: fitBbox(77.0, 14.0, 82.0, 19.5),
    fact: "Nagarjuna Sagar, Srisailam, Kaleshwaram; Kolleru between Godavari & Krishna.",
  },
  {
    id: "ne-hills",
    name: "Northeast Hills",
    at: [93.2, 24.8],
    fit: fitBbox(85.5, 22.5, 97.0, 29.0),
    fact: "Loktak floating lake; Nohkalikai; Gurudongmar; Deepor Beel.",
    ramsarNotes: ["Loktak Lake", "Deepor Beel", "Pala Wetland"],
  },
];

export function getFeature(id: string): WaterFeature | undefined {
  return ALL_FEATURES.find((f) => f.id === id);
}

export function getRegion(id: RegionId): RegionPanel | undefined {
  return REGIONS.find((r) => r.id === id);
}

export function featuresForRegion(regionId: RegionId): WaterFeature[] {
  return REGION_FEATURES.filter((f) => f.regionId === regionId);
}

export function isRegionId(id: string): id is RegionId {
  return REGIONS.some((r) => r.id === id);
}

export const KIND_LABEL: Record<FeatureKind, string> = {
  dam: "Dam",
  lake: "Lake",
  waterfall: "Waterfall",
};
