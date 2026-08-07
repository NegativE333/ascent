export const SUBJECT_SEED = [
  { name: "Quantitative Aptitude", slug: "quantitative-aptitude", displayOrder: 1 },
  {
    name: "General Intelligence & Reasoning",
    slug: "general-intelligence-reasoning",
    displayOrder: 2,
  },
  { name: "English Comprehension", slug: "english-comprehension", displayOrder: 3 },
  { name: "General Awareness", slug: "general-awareness", displayOrder: 4 },
] as const;

export type TopicSeedItem = {
  name: string;
  section?: string;
  status?: "not_started" | "in_progress" | "done";
  confidence?: number;
};

function sectionTopics(section: string, names: string[]): TopicSeedItem[] {
  return names.map((name) => ({ name, section }));
}

export const TOPIC_SEED: Record<string, TopicSeedItem[]> = {
  "quantitative-aptitude": [
    { name: "Percentage", status: "in_progress", confidence: 2 },
    { name: "Profit and Loss", status: "in_progress", confidence: 2 },
    { name: "Simple Interest", status: "in_progress", confidence: 2 },
    { name: "Compound Interest", status: "in_progress", confidence: 2 },
    { name: "Ratio and Proportion", status: "in_progress", confidence: 2 },
    { name: "Average" },
    { name: "Number System" },
    { name: "HCF and LCM" },
    { name: "Algebra" },
    { name: "Geometry" },
    { name: "Mensuration" },
    { name: "Trigonometry" },
    { name: "Time Speed and Distance" },
    { name: "Time and Work" },
    { name: "Data Interpretation" },
    { name: "Mixture and Alligation" },
  ],
  "general-intelligence-reasoning": [
    { name: "Analogy" },
    { name: "Classification" },
    { name: "Series (Number/Alphabet)" },
    { name: "Coding-Decoding" },
    { name: "Blood Relations" },
    { name: "Direction Sense" },
    { name: "Ranking and Order" },
    { name: "Syllogism" },
    { name: "Venn Diagrams" },
    { name: "Non-Verbal Reasoning" },
    { name: "Puzzle" },
    { name: "Matrix" },
    { name: "Word Formation" },
    { name: "Statement and Conclusion" },
  ],
  "english-comprehension": [
    { name: "Reading Comprehension" },
    { name: "Cloze Test" },
    { name: "Error Spotting" },
    { name: "Sentence Improvement" },
    { name: "Fill in the Blanks" },
    { name: "Synonyms/Antonyms" },
    { name: "Idioms and Phrases" },
    { name: "One Word Substitution" },
    { name: "Spelling Correction" },
    { name: "Para Jumbles" },
    { name: "Active-Passive Voice" },
    { name: "Direct-Indirect Speech" },
  ],
  "general-awareness": [
    ...sectionTopics("Geography", [
      "Solar System",
      "Longitude and Latitude",
      "Earth's Interior and Plate Tectonics",
      "Rocks, Continents, and Oceans",
      "Geomorphology",
      "Landforms",
      "Atmosphere",
      "Wind, Ocean Current, and Cyclone",
      "India and Its Location",
      "Himalayas",
      "Peninsular Plateau",
      "Northern Plains and Islands",
      "Himalayan River System",
      "Peninsular Rivers",
      "Dams, Lakes and Waterfall",
      "Monsoon",
      "Forest and Grassland",
      "Soil",
      "Agriculture",
      "Minerals",
      "World Map",
      "Human Geography",
      "Transport",
    ]),
    ...sectionTopics("Ancient History", [
      "Stone Age",
      "Indus Valley Civilization",
      "Vedic Age",
      "Sangam Age",
      "Jainism and Buddhism",
      "Mahajanapadas",
      "Maurya Dynasty",
      "Post-Maurya Dynasties",
      "Gupta Dynasty",
      "Post-Gupta Dynasties",
      "Tripartite Struggle and Cholas",
    ]),
    ...sectionTopics("Medieval History", [
      "Delhi Sultanate",
      "Vijayanagara and Bahmani Kingdom",
      "The Mughal Empire",
      "Marathas",
      "Bhakti and Sufi Movements",
    ]),
    ...sectionTopics("Modern History", [
      "Advent of Europeans",
      "Socio Religious Reforms",
      "Revolt of 1857",
      "Indian National Congress",
      "Bengal Partition",
      "Gandhian Era",
      "CDM and Simon Commission",
      "Quit India Movement",
      "Governor-General and Viceroy",
    ]),
    ...sectionTopics("Polity", [
      "Making of Constitution",
      "Salient Features of the Constitution",
      "Preamble",
      "Part 1 and Part 2 of the Constitution",
      "Fundamental Rights",
      "DPSP and Fundamental Duties",
      "President and Vice President of India",
      "Prime Minister and Council of Ministers",
      "Parliament",
      "State Legislature",
      "Centre-State Relations",
      "Emergency and Constitutional Amendment",
      "Supreme Court and High Court",
      "Local Government",
      "Constitutional and Non-Constitutional Bodies",
      "New Criminal Laws 2023",
      "Important Acts",
      "Sources of the Indian Constitution",
      "Noteworthy Points",
    ]),
    ...sectionTopics("Economics", [
      "Basics of Economy",
      "Microeconomics",
      "National Income",
      "Budget and Taxation",
      "Inflation and Unemployment",
      "Banking: Part 1",
      "Monetary Policy",
      "Banking: Part 2",
      "Poverty and Balance of Payment",
      "Five Year Plan and Industrial Policy Resolution",
      "Indices, Reports, International Institutions and Key Economic Concepts",
    ]),
    ...sectionTopics("Physics", [
      "Motion",
      "Force and Laws of Motion",
      "Gravitation and Work Done",
      "Sound",
      "Reflection and Refraction",
      "Human Eye and Vision",
      "Electricity",
      "Magnetic Effect of Electric Current",
    ]),
    ...sectionTopics("Chemistry", [
      "Matter",
      "Atom and Its Structure",
      "Periodic Table",
      "Chemical Reactions",
      "Metals and Non-Metals",
      "Acid, Base and Salt",
      "Carbon and Its Compounds",
    ]),
    ...sectionTopics("Biology", [
      "Cell",
      "Plant Tissue and Animal Tissue",
      "Plant and Animal Kingdom",
      "Nervous System",
      "Hormones and Plant Movement",
      "Reproduction",
      "Digestion and Respiration",
      "Circulatory System and Excretory System",
      "Diseases",
      "Nutrients",
      "Heredity and Evolution",
    ]),
    ...sectionTopics("Environment", [
      "Basics of Environmental Sciences",
      "Ecosystem",
      "Trophic Dynamics and Energy Transfer",
      "Biogeochemical Cycles",
      "Environmental Conventions",
      "National Parks",
    ]),
    ...sectionTopics("Static GK", [
      "Music and Paintings",
      "Classical Dance",
      "Folk Dances of India",
      "Festivals of India",
      "Census",
      "Important Days",
      "Books and Authors",
      "Sports",
      "International Organisations",
      "National Organisations",
      "Awards and Honours",
    ]),
  ],
};

/**
 * First-pass study time per topic, in minutes — concept coverage plus enough
 * practice to attempt the topic in a mock. Calibrated against published SSC CGL
 * study plans: Quant needs roughly 2–2.5h/day for two months, Reasoning and
 * English about 1.5h/day for a month each, and the whole of General Awareness
 * fits a 30-day block at 2–3h/day, which is why GA topics are minutes each
 * while Geometry is a multi-day chapter.
 */
const SUBJECT_DEFAULT_MINUTES: Record<string, number> = {
  "quantitative-aptitude": 300,
  "general-intelligence-reasoning": 150,
  "english-comprehension": 210,
  "general-awareness": 30,
};

/** GA varies a lot by block — Polity and Modern History are the dense ones. */
const GA_SECTION_MINUTES: Record<string, number> = {
  Geography: 30,
  "Ancient History": 30,
  "Medieval History": 30,
  "Modern History": 45,
  Polity: 45,
  Economics: 35,
  Physics: 30,
  Chemistry: 30,
  Biology: 30,
  Environment: 20,
  "Static GK": 20,
};

const TOPIC_MINUTE_OVERRIDES: Record<string, number> = {
  // Quant — advanced maths carries the heaviest load
  Geometry: 480,
  Algebra: 420,
  Mensuration: 420,
  Trigonometry: 420,
  "Data Interpretation": 360,
  "Number System": 300,
  "Simple Interest": 180,
  "HCF and LCM": 120,
  "Mixture and Alligation": 180,
  Average: 180,
  // Reasoning — non-verbal and puzzles need drilling, not theory
  "Non-Verbal Reasoning": 300,
  Puzzle: 300,
  Matrix: 90,
  "Word Formation": 90,
  Analogy: 120,
  Classification: 120,
  "Direction Sense": 120,
  "Venn Diagrams": 120,
  "Ranking and Order": 120,
  // English — vocabulary is a long grind, mechanics are quick
  "Reading Comprehension": 300,
  "Error Spotting": 300,
  "Synonyms/Antonyms": 300,
  "Idioms and Phrases": 240,
  "One Word Substitution": 240,
  "Sentence Improvement": 240,
  "Spelling Correction": 120,
  "Fill in the Blanks": 150,
  "Active-Passive Voice": 150,
  "Direct-Indirect Speech": 150,
  // GA — the few blocks that genuinely take a sitting
  "Indian Constitution": 60,
  "Fundamental Rights": 60,
  "Revolt of 1857": 45,
};

/** Estimated first-pass minutes for a seeded topic. */
export function seedEstimateMinutes(
  subjectSlug: string,
  topic: TopicSeedItem
): number {
  const override = TOPIC_MINUTE_OVERRIDES[topic.name];
  if (override) return override;

  if (topic.section && GA_SECTION_MINUTES[topic.section]) {
    return GA_SECTION_MINUTES[topic.section];
  }

  return SUBJECT_DEFAULT_MINUTES[subjectSlug] ?? 60;
}

/** Canonical GA section order for progress UI. */
export const GA_SECTION_ORDER = [
  "Geography",
  "Ancient History",
  "Medieval History",
  "Modern History",
  "Polity",
  "Economics",
  "Physics",
  "Chemistry",
  "Biology",
  "Environment",
  "Static GK",
] as const;
