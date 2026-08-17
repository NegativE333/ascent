export type RiverSystem = "indus" | "ganga" | "brahmaputra";

export type River = {
  id: string;
  name: string;
  system: RiverSystem;
  /** One-line fact shown after answering (origin + notable detail). */
  fact: string;
  /**
   * Approximate course as GeoJSON-style [lng, lat] points along the real river.
   * Digitized for quiz recognition on an India basemap (same projection).
   */
  path: [number, number][];
  /** Preferred label anchor [lng, lat] along the course. */
  labelAt: [number, number];
};

export const RIVER_SYSTEM_LABEL: Record<RiverSystem, string> = {
  indus: "Indus system",
  ganga: "Ganga system",
  brahmaputra: "Brahmaputra system",
};

/**
 * Eleven Himalayan / north-Indian rivers for SSC CGL geography prep.
 * Paths are hand-digitized along real courses for map quiz use — not survey-grade.
 */
export const RIVERS: River[] = [
  {
    id: "indus",
    name: "Indus",
    system: "indus",
    fact: "Rises near Lake Mansarovar in Tibet as the Senge Khabab, flows through Ladakh and Pakistan to the Arabian Sea.",
    path: [
      [81.3, 30.7],
      [80.5, 31.2],
      [79.5, 32.0],
      [78.8, 32.8],
      [77.8, 33.5],
      [77.2, 34.0],
      [76.5, 34.4],
      [75.8, 34.7],
      [75.0, 34.9],
      [74.2, 35.1],
      [73.5, 35.0],
      [72.8, 34.5],
      [71.8, 33.5],
      [70.8, 32.0],
      [69.5, 30.0],
      [68.5, 28.0],
      [67.8, 26.0],
      [67.5, 24.5],
    ],
    labelAt: [77.0, 34.0],
  },
  {
    id: "jhelum",
    name: "Jhelum",
    system: "indus",
    fact: "Rises from a spring at Verinag in Kashmir; flows through Srinagar and Wular Lake before entering Pakistan.",
    path: [
      [75.25, 33.55],
      [75.1, 33.7],
      [74.95, 33.9],
      [74.85, 34.05],
      [74.75, 34.15],
      [74.6, 34.2],
      [74.4, 34.05],
      [74.2, 33.85],
      [74.0, 33.55],
      [73.85, 33.3],
      [73.7, 33.0],
      [73.55, 32.75],
    ],
    labelAt: [74.75, 34.1],
  },
  {
    id: "chenab",
    name: "Chenab",
    system: "indus",
    fact: "Formed by the Chandra and Bhaga rivers in Himachal Pradesh; the largest tributary of the Indus.",
    path: [
      [77.35, 32.55],
      [76.95, 32.65],
      [76.5, 32.75],
      [76.0, 32.9],
      [75.5, 33.0],
      [75.1, 32.95],
      [74.7, 32.8],
      [74.3, 32.5],
      [74.0, 32.2],
      [73.7, 31.9],
      [73.4, 31.5],
    ],
    labelAt: [75.4, 32.95],
  },
  {
    id: "ravi",
    name: "Ravi",
    system: "indus",
    fact: "Rises in the Himalayas near Bara Bhangal in Himachal Pradesh; one of the five rivers of Punjab.",
    path: [
      [76.85, 32.45],
      [76.5, 32.35],
      [76.15, 32.25],
      [75.8, 32.1],
      [75.45, 31.95],
      [75.15, 31.8],
      [74.85, 31.65],
      [74.55, 31.5],
      [74.25, 31.4],
    ],
    labelAt: [75.5, 32.0],
  },
  {
    id: "beas",
    name: "Beas",
    system: "indus",
    fact: "Rises at Beas Kund near Rohtang Pass in Himachal Pradesh; joins the Sutlej at Harike in Punjab.",
    path: [
      [77.35, 32.35],
      [77.15, 32.15],
      [76.95, 31.95],
      [76.7, 31.75],
      [76.4, 31.55],
      [76.1, 31.4],
      [75.8, 31.3],
      [75.5, 31.2],
      [75.2, 31.15],
      [74.95, 31.15],
    ],
    labelAt: [76.4, 31.55],
  },
  {
    id: "sutlej",
    name: "Sutlej",
    system: "indus",
    fact: "Rises from Rakshastal near Mansarovar in Tibet; the longest of the five Punjab rivers, joining the Chenab in Pakistan.",
    path: [
      [81.25, 30.75],
      [80.4, 31.1],
      [79.5, 31.5],
      [78.7, 31.7],
      [78.0, 31.6],
      [77.3, 31.4],
      [76.6, 31.15],
      [76.0, 30.95],
      [75.4, 30.85],
      [74.8, 30.7],
      [74.2, 30.5],
      [73.7, 30.3],
    ],
    labelAt: [77.0, 31.35],
  },
  {
    id: "ganga",
    name: "Ganga",
    system: "ganga",
    fact: "Rises at the Gangotri Glacier (Gomukh) in Uttarakhand as the Bhagirathi; becomes the Ganga at Devprayag.",
    path: [
      [79.08, 30.93],
      [78.85, 30.7],
      [78.6, 30.45],
      [78.45, 30.25],
      [78.3, 30.1],
      [78.25, 29.95],
      [78.15, 29.7],
      [78.1, 29.4],
      [78.05, 28.9],
      [78.2, 28.2],
      [79.0, 27.4],
      [80.2, 26.6],
      [81.5, 25.9],
      [82.5, 25.5],
      [83.5, 25.4],
      [85.0, 25.35],
      [86.5, 25.3],
      [87.8, 24.8],
      [88.5, 24.0],
      [88.8, 23.0],
      [88.5, 22.2],
      [88.2, 21.7],
    ],
    labelAt: [82.0, 25.6],
  },
  {
    id: "yamuna",
    name: "Yamuna",
    system: "ganga",
    fact: "Rises at the Yamunotri Glacier; the largest tributary of the Ganga, meeting it at Prayagraj (Triveni Sangam).",
    path: [
      [78.45, 31.0],
      [78.2, 30.7],
      [77.95, 30.4],
      [77.7, 30.1],
      [77.5, 29.7],
      [77.35, 29.2],
      [77.25, 28.7],
      [77.3, 28.2],
      [77.5, 27.6],
      [77.8, 27.0],
      [78.3, 26.5],
      [79.2, 26.0],
      [80.2, 25.7],
      [81.0, 25.5],
      [81.85, 25.43],
    ],
    labelAt: [77.4, 28.5],
  },
  {
    id: "ghaghara",
    name: "Ghaghara",
    system: "ganga",
    fact: "Rises near Mansarovar in Tibet (as the Karnali in Nepal); the largest tributary of the Ganga by volume.",
    path: [
      [81.5, 30.4],
      [81.3, 29.8],
      [81.2, 29.2],
      [81.3, 28.6],
      [81.5, 28.0],
      [81.8, 27.4],
      [82.3, 27.0],
      [83.0, 26.7],
      [83.8, 26.4],
      [84.5, 26.0],
      [84.8, 25.75],
    ],
    labelAt: [82.5, 27.0],
  },
  {
    id: "kosi",
    name: "Kosi",
    system: "ganga",
    fact: "Formed by rivers draining the Everest region of Tibet and Nepal; known as the 'Sorrow of Bihar' for its floods and course shifts.",
    path: [
      [86.9, 28.3],
      [86.7, 27.8],
      [86.55, 27.3],
      [86.5, 26.8],
      [86.55, 26.4],
      [86.7, 26.0],
      [86.9, 25.7],
      [87.1, 25.45],
    ],
    labelAt: [86.6, 26.5],
  },
  {
    id: "brahmaputra",
    name: "Brahmaputra",
    system: "brahmaputra",
    fact: "Rises as the Yarlung Tsangpo in Tibet, enters India as the Siang/Dihang in Arunachal Pradesh, then flows through Assam.",
    path: [
      [95.2, 29.2],
      [95.4, 28.6],
      [95.2, 28.1],
      [94.8, 27.7],
      [94.2, 27.3],
      [93.5, 26.9],
      [92.7, 26.6],
      [91.8, 26.4],
      [91.0, 26.25],
      [90.2, 26.15],
      [89.7, 25.9],
      [89.5, 25.5],
      [89.7, 25.0],
    ],
    labelAt: [92.5, 26.6],
  },
];

export function getRiverById(id: string): River | undefined {
  return RIVERS.find((r) => r.id === id);
}

export function shuffleRivers(rivers: River[] = RIVERS): River[] {
  const arr = rivers.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
