import {
  NON_HIMALAYA_TARGET,
  REGION_TARGETS,
  REGIONS,
  getTarget,
  type RegionId,
} from "@/lib/games/himalayan-ranges/data";

export type RangesClue = {
  id: string;
  prompt: string;
  targetId: string;
  /** If set, open this region panel to answer. */
  regionId?: RegionId;
  revealTitle: string;
  revealFact: string;
};

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function clueFor(
  id: string,
  prompt: string,
  targetId: string,
  regionId?: RegionId
): RangesClue {
  const t = getTarget(targetId);
  return {
    id,
    prompt,
    targetId,
    regionId: regionId ?? t?.regionId,
    revealTitle: t?.name ?? targetId,
    revealFact: t?.fact ?? "",
  };
}

function buildPool(): RangesClue[] {
  const out: RangesClue[] = [];

  // Ranges
  out.push(
    clueFor(
      "range-trans",
      "Click the range that lies north of the Greater Himalaya.",
      "trans-himalaya"
    ),
    clueFor(
      "range-himadri",
      "Click the range also called Himadri.",
      "greater-himalaya"
    ),
    clueFor(
      "range-lesser",
      "Click the Middle Himalaya (also called Himachal).",
      "lesser-himalaya"
    ),
    clueFor(
      "range-shivalik",
      "Click the Outer Himalaya, also called the Shivalik.",
      "outer-himalaya"
    )
  );

  // Overview peaks
  out.push(
    clueFor("peak-k2", "Click the world's second-highest peak.", "k2"),
    clueFor("peak-india-high", "Click India's highest peak.", "kanchenjunga"),
    clueFor(
      "peak-nanga",
      "Click the westernmost point of the Greater Himalaya.",
      "nanga-parbat"
    ),
    clueFor(
      "peak-namcha",
      "Click the peak marking the Brahmaputra's sharp U-turn.",
      "namcha-barwa"
    ),
    clueFor(
      "peak-everest",
      "Click the world's highest peak (Sagarmatha / Chomolungma).",
      "everest"
    ),
    clueFor(
      "peak-nanda",
      "Click the highest peak wholly in Uttarakhand.",
      "nanda-devi"
    ),
    clueFor(
      "peak-kamet",
      "Click the highest peak of the Zanskar Range.",
      "kamet"
    )
  );

  // Divisions
  out.push(
    clueFor(
      "div-nepal",
      "Click the region between the Kali and Teesta rivers.",
      "nepal-himalaya"
    ),
    clueFor(
      "div-punjab",
      "Click the Himalayan division between the Indus and Sutlej.",
      "punjab-himalaya"
    ),
    clueFor(
      "div-kumaon",
      "Click the Himalayan division between the Sutlej and Kali.",
      "kumaon-himalaya"
    ),
    clueFor(
      "div-assam",
      "Click the Himalayan division between the Teesta and Dihang.",
      "assam-himalaya"
    )
  );

  // Region hubs
  for (const r of REGIONS) {
    out.push(
      clueFor(`region-${r.id}`, `Click the ${r.name} region.`, r.id)
    );
  }

  // Passes / places in panels
  out.push(
    clueFor(
      "pass-shipki",
      "Click the pass through which the Sutlej enters India.",
      "shipki-la",
      "himachal"
    ),
    clueFor(
      "pass-rohtang",
      "Click the pass that connects Kullu Valley to Lahaul & Spiti.",
      "rohtang-pass",
      "himachal"
    ),
    clueFor(
      "pass-zoji",
      "Click the pass connecting Srinagar with Leh / Ladakh.",
      "zoji-la",
      "jk-ladakh"
    ),
    clueFor(
      "pass-umling",
      "Click the world's highest motorable road pass (Project Himank).",
      "umling-la",
      "jk-ladakh"
    ),
    clueFor(
      "glacier-siachen",
      "Click the glacier that is also the world's highest battlefield.",
      "siachen",
      "jk-ladakh"
    ),
    clueFor(
      "place-dehradun",
      "Click the largest Dun in India.",
      "dehradun",
      "uttarakhand"
    ),
    clueFor(
      "pass-nathu",
      "Click the pass that links Sikkim and Tibet.",
      "nathu-la",
      "nepal-sikkim"
    ),
    clueFor(
      "pass-yangyap",
      "Click where the Brahmaputra enters India.",
      "yangyap-pass",
      "arunachal"
    ),
    clueFor(
      "place-loktak",
      "Click the world's only floating lake.",
      "loktak",
      "ne-hills"
    ),
    clueFor(
      "peak-lhotse",
      "Click Lhotse — neighbour of Everest.",
      "lhotse",
      "nepal-sikkim"
    ),
    clueFor(
      "valley-kangra",
      "Click the longitudinal valley in Himachal (runs parallel to the ranges).",
      "kangra-valley",
      "himachal"
    ),
    clueFor(
      "valley-kullu",
      "Click the transverse valley in Himachal (cuts across the ranges).",
      "kullu-valley",
      "himachal"
    ),
    clueFor(
      "pass-bara",
      "Click the pass connecting Lahaul and Leh across the Zanskar range.",
      "bara-lacha-la",
      "himachal"
    ),
    clueFor(
      "pass-lipu",
      "Click the India–Tibet–Nepal tri-junction pass.",
      "lipu-lekh",
      "uttarakhand"
    ),
    clueFor(
      "peak-saramati",
      "Click the highest peak in Nagaland.",
      "saramati",
      "ne-hills"
    ),
    clueFor(
      "valley-kashmir",
      "Click the valley known for Karewa formations and saffron.",
      "kashmir-valley",
      "jk-ladakh"
    )
  );

  // Trick clue
  out.push(
    clueFor(
      "trick-garo",
      "Click the hills that are NOT part of the Himalayas (Garo–Khasi–Jaintia).",
      NON_HIMALAYA_TARGET.id
    )
  );

  // Generic “find X” for a sample of remaining region targets
  const extras = REGION_TARGETS.filter(
    (t) =>
      ![
        "shipki-la",
        "rohtang-pass",
        "zoji-la",
        "umling-la",
        "siachen",
        "dehradun",
        "nathu-la",
        "yangyap-pass",
        "loktak",
        "lhotse",
        "kangra-valley",
        "kullu-valley",
        "bara-lacha-la",
        "lipu-lekh",
        "saramati",
        "kashmir-valley",
      ].includes(t.id)
  );
  for (const t of extras.slice(0, 12)) {
    out.push(
      clueFor(`find-${t.id}`, `Find ${t.name}.`, t.id, t.regionId)
    );
  }

  return out;
}

export function buildRangesRound(limit = 14): RangesClue[] {
  return shuffleInPlace(buildPool()).slice(0, limit);
}
