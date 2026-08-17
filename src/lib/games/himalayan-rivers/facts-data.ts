import type { RiverSystem } from "@/lib/games/himalayan-rivers/rivers";

/** Mode B category filters (plus "all"). */
export type FactCategory =
  | "origins-names"
  | "tributaries"
  | "treaties-boundaries"
  | "confluences"
  | "cities";

export const FACT_CATEGORY_LABEL: Record<FactCategory | "all", string> = {
  all: "All",
  "origins-names": "Origins & Names",
  tributaries: "Tributaries",
  "treaties-boundaries": "Treaties & Boundaries",
  confluences: "Confluences",
  cities: "Cities on Rivers",
};

export type AlsoKnownAs = {
  name: string;
  region: string;
};

/**
 * Rich per-river fields for Mode B template questions.
 * Separate from map-path data in `rivers.ts`.
 */
export type RiverProfile = {
  id: string;
  name: string;
  system: RiverSystem;
  lengthKm?: number;
  lengthInIndiaKm?: number;
  origin?: string;
  ancientName?: string;
  alsoKnownAs?: AlsoKnownAs[];
  namesByRegion?: Record<string, string>;
  entersIndiaAt?: string;
  flowsThrough?: string;
  drainsInto?: string;
  leftBankTributaries?: string[];
  rightBankTributaries?: string[];
  tributaries?: string[];
  /** Short "joins X at Y" style note for templates. */
  joinsWith?: string;
  cities?: string[];
  facts?: string[];
};

export type SpecialFact = {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  category: FactCategory;
  explanation?: string;
};

export type CityOnRiver = {
  city: string;
  river: string;
  /** false = peninsular; excluded from this game's city rounds. */
  himalayan: boolean;
};

export const RIVER_PROFILES: RiverProfile[] = [
  {
    id: "indus",
    name: "Indus",
    system: "indus",
    lengthKm: 2880,
    lengthInIndiaKm: 1114,
    origin: "Bokhar Chu Glacier, Kailash Range, near Lake Mansarovar (Tibet)",
    alsoKnownAs: [
      { name: "Singi Khamban (Lion's Mouth)", region: "Tibet" },
    ],
    entersIndiaAt: "Demchok (Ladakh)",
    flowsThrough: "China → India → Pakistan",
    drainsInto: "Arabian Sea",
    leftBankTributaries: ["Jhelum", "Chenab", "Ravi", "Beas", "Sutlej"],
    rightBankTributaries: ["Shyok", "Gilgit", "Hunza"],
    cities: ["Leh"],
    facts: [
      "Flows between the Ladakh and Zanskar ranges",
      "Leh is located on its bank",
    ],
  },
  {
    id: "jhelum",
    name: "Jhelum",
    system: "indus",
    ancientName: "Vitasta",
    alsoKnownAs: [
      { name: "Vyath", region: "Kashmir" },
      { name: "Hydaspes", region: "Greek sources" },
    ],
    origin: "Verinag, Jammu & Kashmir",
    cities: ["Srinagar"],
    facts: [
      "Meanders in its youthful stage",
      "Srinagar is located on its bank",
      "Feeds Wular Lake, the largest freshwater lake in India",
      "Site of the Battle of Hydaspes (Alexander vs Porus, 326 BC)",
    ],
  },
  {
    id: "chenab",
    name: "Chenab",
    system: "indus",
    ancientName: "Askini",
    origin:
      "Baralacha La Pass; formed by Chandra and Bhaga at Tandi (Lahaul Valley, Himachal Pradesh)",
    facts: [
      "Largest tributary of the Indus",
      "Chenab Railway Bridge (Reasi, J&K) is the world's highest railway arch bridge (359 m high, 1,315 m long)",
    ],
  },
  {
    id: "ravi",
    name: "Ravi",
    system: "indus",
    ancientName: "Purushni",
    origin: "Rohtang Pass",
    facts: ["Transboundary river — flows through both India and Pakistan"],
  },
  {
    id: "beas",
    name: "Beas",
    system: "indus",
    ancientName: "Bipasha",
    origin: "Rohtang Pass",
    joinsWith: "Joins the Sutlej near Harike, Punjab",
    facts: [
      "The only Indus tributary that does not enter Pakistan",
      "Joins the Sutlej near Harike, Punjab",
    ],
  },
  {
    id: "sutlej",
    name: "Sutlej",
    system: "indus",
    ancientName: "Shutudri",
    alsoKnownAs: [{ name: "Langqen Zangbo", region: "Tibet" }],
    origin: "Rakshastal Lake, near Mansarovar (Tibet)",
    entersIndiaAt: "Shipki La Pass",
    cities: ["Ludhiana"],
    facts: ["Longest tributary of the Indus"],
  },
  {
    id: "ganga",
    name: "Ganga",
    system: "ganga",
    lengthKm: 2525,
    origin: "Gangotri Glacier (Gaumukh), Uttarakhand",
    drainsInto: "Bay of Bengal",
    cities: ["Kanpur", "Prayagraj", "Varanasi", "Patna"],
    facts: [
      "Declared the National River of India in 2008",
      "Home to the endangered Susu (Gangetic) Dolphin",
      "Longest stretch in Uttar Pradesh; shortest in Jharkhand",
      "Splits near Murshidabad into the Padma (Bangladesh) and Bhagirathi-Hooghly (West Bengal)",
      "Known as the Padma in Bangladesh; meets the Jamuna (Brahmaputra) to form the Meghna",
    ],
  },
  {
    id: "yamuna",
    name: "Yamuna",
    system: "ganga",
    lengthKm: 1370,
    origin: "Yamunotri Glacier, Banderpoonch Peak (Uttarakhand)",
    tributaries: ["Chambal", "Sindh", "Betwa", "Ken", "Tons"],
    cities: ["Delhi", "Agra"],
    facts: [
      "Longest tributary of the Ganga in the Northern Plains",
      "Tons is its largest tributary",
    ],
  },
  {
    id: "ghaghara",
    name: "Ghaghara",
    system: "ganga",
    origin: "Mapchachungo Glacier (Tibet); known as the Karnali in Nepal",
    alsoKnownAs: [{ name: "Karnali", region: "Nepal" }],
    tributaries: ["Sharda", "Tila", "Seti", "Beri"],
    joinsWith: "Joins the Ganga at Chapra, Bihar",
    facts: [
      "Forms a deep gorge at Shishapani",
      "Joins the Ganga at Chapra, Bihar",
    ],
  },
  {
    id: "gandak",
    name: "Gandak",
    system: "ganga",
    origin: "Nhubine Himal Glacier, Nepal",
  },
  {
    id: "kosi",
    name: "Kosi",
    system: "ganga",
    origin:
      "Nepal Himalayas; confluence of the Sun Kosi, Arun Kosi, and Tamur Kosi",
    joinsWith: "Joins the Ganga at Katihar district, Bihar",
    facts: [
      'Nicknamed the "Sorrow of Bihar" for floods and shifting course',
      "Joins the Ganga at Katihar district, Bihar",
    ],
  },
  {
    id: "ramganga",
    name: "Ramganga",
    system: "ganga",
    origin: "Doodhatoli Ranges (Pauri Garhwal)",
  },
  {
    id: "son",
    name: "Son",
    system: "ganga",
    origin: "Amarkantak Plateau",
    tributaries: ["North Koel", "Rihand"],
    joinsWith: "Joins the Ganga just above Patna",
    facts: [
      "Forms a radial drainage pattern from Amarkantak",
      "Joins the Ganga just above Patna",
    ],
  },
  {
    id: "punpun",
    name: "Punpun",
    system: "ganga",
    origin: "Palamu district, Jharkhand",
    joinsWith: "Joins the Ganga at Fatuha, near Patna",
  },
  {
    id: "gomti",
    name: "Gomti",
    system: "ganga",
    origin: "Fulhar Lake, Uttar Pradesh",
    cities: ["Lucknow"],
    joinsWith: "Joins the Ganga at Kaithi, Ghazipur (UP)",
  },
  {
    id: "chambal",
    name: "Chambal",
    system: "ganga",
    origin: "Mhow Plateau (Janapav Hills), Madhya Pradesh",
    tributaries: ["Banas", "Shipra", "Kalisindh", "Parvati"],
    cities: ["Kota", "Gwalior", "Dholpur"],
    facts: ["Known for badland topography (ravines from gully erosion)"],
  },
  {
    id: "sarda",
    name: "Sarda",
    system: "ganga",
    origin: "Milam Glacier",
    alsoKnownAs: [
      { name: "Kali", region: "parts of its course" },
      { name: "Goriganga", region: "upper reaches" },
    ],
  },
  {
    id: "brahmaputra",
    name: "Brahmaputra",
    system: "brahmaputra",
    lengthKm: 2900,
    lengthInIndiaKm: 916,
    origin: "Chemayungdung Glacier / Angsi Glacier, Tibet",
    namesByRegion: {
      Tibet: "Yarlung Tsangpo",
      "Arunachal Pradesh": "Siang / Dihang",
      Assam: "Brahmaputra",
      Bangladesh: "Jamuna",
    },
    leftBankTributaries: ["Lohit", "Dhansiri", "Dibang"],
    rightBankTributaries: ["Kameng", "Manas", "Teesta", "Subansiri", "Sankosh"],
    cities: ["Dibrugarh"],
    drainsInto: "Bay of Bengal (via Meghna / Sundarbans Delta)",
    facts: [
      "Forms a gorge at Namcha Barwa and a sharp U-turn before entering Arunachal Pradesh",
      "Majuli (world's largest river island) and Umananda (world's smallest) lie on it",
      "Forms the Sundarbans Delta jointly with the Ganga",
      "Dhola-Sadiya Bridge (Bhupen Hazarika Setu) spans the Lohit and is 9.15 km long",
    ],
  },
  {
    id: "barak",
    name: "Barak",
    system: "brahmaputra",
    origin: "Manipur Hills",
    facts: [
      "Enters Bangladesh as the Surma and Kushiyara rivers",
      "Later known as the Meghna, which receives Padma + Jamuna flow",
    ],
  },
];

/** Hand-written one-offs that don't template cleanly. */
export const SPECIAL_FACTS: SpecialFact[] = [
  // Indus Water Treaty
  {
    id: "iwt-year",
    question: "In which year was the Indus Waters Treaty signed?",
    options: ["1948", "1960", "1971", "1996"],
    correctIndex: 1,
    category: "treaties-boundaries",
    explanation: "Signed in 1960 at Karachi, mediated by the World Bank.",
  },
  {
    id: "iwt-signatories",
    question:
      "Who signed the Indus Waters Treaty for India and Pakistan respectively?",
    options: [
      "Nehru and Ayub Khan",
      "Gandhi and Jinnah",
      "Shastri and Yahya Khan",
      "Indira Gandhi and Bhutto",
    ],
    correctIndex: 0,
    category: "treaties-boundaries",
    explanation: "Jawaharlal Nehru (India) and Mohammad Ayub Khan (Pakistan).",
  },
  {
    id: "iwt-western",
    question:
      "Under the Indus Waters Treaty, which rivers are the Western Rivers allocated primarily to Pakistan?",
    options: [
      "Ravi, Beas, Sutlej",
      "Indus, Jhelum, Chenab",
      "Ganga, Yamuna, Ghaghara",
      "Beas, Sutlej, Chenab",
    ],
    correctIndex: 1,
    category: "treaties-boundaries",
    explanation: "Western Rivers (Indus, Jhelum, Chenab) → Pakistan's control.",
  },
  {
    id: "iwt-eastern",
    question:
      "Under the Indus Waters Treaty, which rivers are the Eastern Rivers allocated primarily to India?",
    options: [
      "Indus, Jhelum, Chenab",
      "Ravi, Beas, Sutlej",
      "Jhelum, Ravi, Beas",
      "Sutlej, Indus, Ravi",
    ],
    correctIndex: 1,
    category: "treaties-boundaries",
    explanation: "Eastern Rivers (Ravi, Beas, Sutlej) → India's control.",
  },
  {
    id: "iwt-mediator",
    question: "Which organisation mediated the Indus Waters Treaty?",
    options: ["United Nations", "World Bank", "IMF", "SAARC"],
    correctIndex: 1,
    category: "treaties-boundaries",
  },
  // Doabs
  {
    id: "doab-sindh-sagar",
    question: "The Sindh Sagar Doab lies between which two rivers?",
    options: [
      "Indus and Jhelum",
      "Jhelum and Chenab",
      "Chenab and Ravi",
      "Ravi and Beas",
    ],
    correctIndex: 0,
    category: "confluences",
  },
  {
    id: "doab-jech",
    question: "The Jech Doab lies between which two rivers?",
    options: [
      "Indus and Jhelum",
      "Jhelum and Chenab",
      "Chenab and Ravi",
      "Beas and Sutlej",
    ],
    correctIndex: 1,
    category: "confluences",
  },
  {
    id: "doab-rechna",
    question: "The Rechna Doab lies between which two rivers?",
    options: [
      "Jhelum and Chenab",
      "Chenab and Ravi",
      "Ravi and Beas",
      "Beas and Sutlej",
    ],
    correctIndex: 1,
    category: "confluences",
  },
  {
    id: "doab-bari",
    question: "The Bari Doab lies between which two rivers?",
    options: [
      "Chenab and Ravi",
      "Ravi and Beas",
      "Beas and Sutlej",
      "Indus and Jhelum",
    ],
    correctIndex: 1,
    category: "confluences",
  },
  {
    id: "doab-bist",
    question: "The Bist Doab lies between which two rivers?",
    options: [
      "Ravi and Beas",
      "Beas and Sutlej",
      "Jhelum and Chenab",
      "Ganga and Yamuna",
    ],
    correctIndex: 1,
    category: "confluences",
  },
  {
    id: "doab-ganga-yamuna",
    question: "The Ganga–Yamuna Doab lies mainly in which region?",
    options: [
      "Punjab plains",
      "Delhi / Uttar Pradesh plains",
      "Assam valley",
      "Rajasthan desert",
    ],
    correctIndex: 1,
    category: "confluences",
  },
  // Panchnad
  {
    id: "panchnad",
    question: "What is the Panchnad?",
    options: [
      "Confluence of five Punjab rivers (Jhelum, Chenab, Ravi, Beas, Sutlej)",
      "Five sacred lakes of Mansarovar",
      "Five Indus Water Treaty signatories",
      "Five tributaries of the Brahmaputra",
    ],
    correctIndex: 0,
    category: "confluences",
  },
  // Panch Prayag
  {
    id: "prayag-vishnu",
    question: "Vishnuprayag is the confluence of which rivers?",
    options: [
      "Alaknanda + Dhauliganga",
      "Alaknanda + Nandakini",
      "Alaknanda + Pindar",
      "Alaknanda + Mandakini",
    ],
    correctIndex: 0,
    category: "confluences",
  },
  {
    id: "prayag-nanda",
    question: "Nandaprayag is the confluence of which rivers?",
    options: [
      "Alaknanda + Dhauliganga",
      "Alaknanda + Nandakini",
      "Alaknanda + Pindar",
      "Alaknanda + Bhagirathi",
    ],
    correctIndex: 1,
    category: "confluences",
  },
  {
    id: "prayag-karna",
    question: "Karnaprayag is the confluence of which rivers?",
    options: [
      "Alaknanda + Mandakini",
      "Alaknanda + Pindar",
      "Alaknanda + Nandakini",
      "Bhagirathi + Mandakini",
    ],
    correctIndex: 1,
    category: "confluences",
  },
  {
    id: "prayag-rudra",
    question: "Rudraprayag is the confluence of which rivers?",
    options: [
      "Alaknanda + Mandakini",
      "Alaknanda + Pindar",
      "Alaknanda + Bhagirathi",
      "Alaknanda + Dhauliganga",
    ],
    correctIndex: 0,
    category: "confluences",
  },
  {
    id: "prayag-dev",
    question:
      "At which confluence do the Alaknanda and Bhagirathi meet to form the Ganga?",
    options: ["Rudraprayag", "Karnaprayag", "Devprayag", "Vishnuprayag"],
    correctIndex: 2,
    category: "confluences",
  },
  // Farakka
  {
    id: "farakka-year",
    question: "In which year was the Farakka Agreement signed?",
    options: ["1960", "1971", "1996", "2005"],
    correctIndex: 2,
    category: "treaties-boundaries",
    explanation: "India–Bangladesh treaty (1996) on sharing Ganga water at Farakka.",
  },
  {
    id: "farakka-parties",
    question: "The Farakka Agreement is a water-sharing treaty between:",
    options: [
      "India and Pakistan",
      "India and Bangladesh",
      "India and Nepal",
      "India and China",
    ],
    correctIndex: 1,
    category: "treaties-boundaries",
  },
  {
    id: "hooghly-tributaries",
    question: "Which of these is a tributary of the Hooghly?",
    options: ["Damodar", "Ghaghara", "Son", "Gandak"],
    correctIndex: 0,
    category: "tributaries",
    explanation: "Hooghly tributaries include Mayurakshi, Kangsabati, Damodar, Rupnarayan.",
  },
  // Misc / watershed
  {
    id: "water-divide",
    question:
      "Which region acts as the water divide (watershed) between the Indus and Ganga river systems?",
    options: [
      "Punjab and Haryana",
      "Haryana and Delhi",
      "Rajasthan and Gujarat",
      "Bihar and Jharkhand",
    ],
    correctIndex: 1,
    category: "treaties-boundaries",
  },
  {
    id: "beas-pakistan",
    question: "Which Indus tributary does not enter Pakistan?",
    options: ["Jhelum", "Chenab", "Ravi", "Beas"],
    correctIndex: 3,
    category: "tributaries",
  },
  {
    id: "chenab-largest",
    question: "Which is the largest tributary of the Indus?",
    options: ["Jhelum", "Chenab", "Ravi", "Sutlej"],
    correctIndex: 1,
    category: "tributaries",
  },
  {
    id: "sutlej-longest-trib",
    question: "Which is the longest tributary of the Indus?",
    options: ["Chenab", "Jhelum", "Sutlej", "Beas"],
    correctIndex: 2,
    category: "tributaries",
  },
  {
    id: "kosi-sorrow",
    question: "Which river is nicknamed the \"Sorrow of Bihar\"?",
    options: ["Gandak", "Ghaghara", "Kosi", "Son"],
    correctIndex: 2,
    category: "origins-names",
  },
  {
    id: "ganga-national",
    question: "When was the Ganga declared the National River of India?",
    options: ["1950", "1986", "2008", "2014"],
    correctIndex: 2,
    category: "origins-names",
  },
  {
    id: "majuli",
    question: "Majuli, the world's largest river island, lies on which river?",
    options: ["Ganga", "Brahmaputra", "Godavari", "Indus"],
    correctIndex: 1,
    category: "origins-names",
  },
  {
    id: "brahmaputra-tibet",
    question: "In Tibet, the Brahmaputra is known as:",
    options: ["Siang", "Dihang", "Yarlung Tsangpo", "Jamuna"],
    correctIndex: 2,
    category: "origins-names",
  },
  {
    id: "brahmaputra-arunachal",
    question: "In Arunachal Pradesh, the Brahmaputra is known as:",
    options: ["Jamuna", "Padma", "Siang / Dihang", "Meghna"],
    correctIndex: 2,
    category: "origins-names",
  },
  {
    id: "brahmaputra-bangladesh",
    question: "In Bangladesh, the Brahmaputra is known as:",
    options: ["Padma", "Meghna", "Jamuna", "Hooghly"],
    correctIndex: 2,
    category: "origins-names",
  },
  {
    id: "yamuna-largest-trib",
    question: "What is the largest tributary of the Yamuna?",
    options: ["Chambal", "Betwa", "Ken", "Tons"],
    correctIndex: 3,
    category: "tributaries",
  },
  {
    id: "wular",
    question: "Wular Lake, India's largest freshwater lake, is fed by which river?",
    options: ["Indus", "Jhelum", "Chenab", "Ravi"],
    correctIndex: 1,
    category: "origins-names",
  },
];

/**
 * City–river bank pairs. Peninsular rows kept for a future game;
 * Mode B city questions use `himalayan: true` only.
 */
export const CITIES_ON_RIVERS: CityOnRiver[] = [
  { city: "Lucknow", river: "Gomti", himalayan: true },
  { city: "Kanpur", river: "Ganga", himalayan: true },
  { city: "Prayagraj", river: "Ganga", himalayan: true },
  { city: "Varanasi", river: "Ganga", himalayan: true },
  { city: "Patna", river: "Ganga", himalayan: true },
  { city: "Delhi", river: "Yamuna", himalayan: true },
  { city: "Agra", river: "Yamuna", himalayan: true },
  { city: "Ayodhya", river: "Sarayu", himalayan: true },
  { city: "Dibrugarh", river: "Brahmaputra", himalayan: true },
  { city: "Srinagar", river: "Jhelum", himalayan: true },
  { city: "Ludhiana", river: "Sutlej", himalayan: true },
  { city: "Kota", river: "Chambal", himalayan: true },
  { city: "Gwalior", river: "Chambal", himalayan: true },
  { city: "Dholpur", river: "Chambal", himalayan: true },
  // Peninsular — reserved for a future game
  { city: "Jabalpur", river: "Narmada", himalayan: false },
  { city: "Ahmedabad", river: "Sabarmati", himalayan: false },
  { city: "Surat", river: "Tapi", himalayan: false },
  { city: "Ujjain", river: "Shipra", himalayan: false },
  { city: "Nasik", river: "Godavari", himalayan: false },
  { city: "Hyderabad", river: "Musi", himalayan: false },
  { city: "Jamshedpur", river: "Subarnarekha", himalayan: false },
  { city: "Vijayawada", river: "Krishna", himalayan: false },
];
