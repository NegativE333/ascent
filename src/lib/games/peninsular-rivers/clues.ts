import {
  ALL_RIVERS,
  CITIES,
  OVERVIEW_RIVERS,
  REGION_RIVERS,
  REGIONS,
  getRiver,
  type RegionId,
} from "@/lib/games/peninsular-rivers/data";

export type PeninsularClue = {
  id: string;
  prompt: string;
  targetId: string;
  /** If set, open this coastal region panel to answer. */
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

function enrich(id: string): { title: string; fact: string } {
  const river = getRiver(id);
  const extra = river?.facts?.[0];
  return {
    title: river?.name ?? id,
    fact: extra ?? river?.fact ?? "",
  };
}

function clueFor(
  id: string,
  prompt: string,
  targetId: string,
  regionId?: RegionId,
  fact?: string
): PeninsularClue {
  const e = enrich(targetId);
  const river = getRiver(targetId);
  return {
    id,
    prompt,
    targetId,
    regionId: regionId ?? river?.regionId,
    revealTitle: e.title,
    revealFact: fact ?? e.fact,
  };
}

function buildPool(): PeninsularClue[] {
  const out: PeninsularClue[] = [];

  for (const river of OVERVIEW_RIVERS) {
    out.push(
      clueFor(`find-${river.id}`, `Find the ${river.name}.`, river.id)
    );
  }

  for (const river of REGION_RIVERS) {
    out.push(
      clueFor(
        `find-${river.id}`,
        `Find the ${river.name}.`,
        river.id,
        river.regionId
      )
    );
  }

  for (const river of ALL_RIVERS) {
    for (const aka of river.alsoKnownAs ?? []) {
      out.push(
        clueFor(
          `aka-${river.id}-${aka}`,
          `Find the river also known as ${aka}.`,
          river.id,
          river.regionId
        )
      );
    }
  }

  for (const row of CITIES) {
    const river = getRiver(row.riverId);
    if (!river) continue;
    out.push(
      clueFor(
        `city-${row.city}`,
        `Find the river that flows past ${row.city}.`,
        river.id,
        river.regionId,
        `${row.city} lies on the ${river.name}. ${river.fact}`
      )
    );
  }

  const defining: {
    id: string;
    prompt: string;
    targetId: string;
    fact?: string;
  }[] = [
    {
      id: "def-godavari-largest",
      prompt: "Find the largest peninsular river.",
      targetId: "godavari",
    },
    {
      id: "def-godavari-dakshin",
      prompt: 'Find the river called "Dakshin Ganga" or "Vridha Ganga".',
      targetId: "godavari",
    },
    {
      id: "def-krishna-2nd",
      prompt: "Find the 2nd longest river of South India.",
      targetId: "krishna",
    },
    {
      id: "def-kaveri-perennial",
      prompt: "Find the only perennial South Indian river.",
      targetId: "kaveri",
    },
    {
      id: "def-kaveri-granary",
      prompt: 'Find the river whose delta is called the "Granary of South India".',
      targetId: "kaveri",
    },
    {
      id: "def-kaveri-ponni",
      prompt: "Find the river called Ponni in Tamil Nadu.",
      targetId: "kaveri",
    },
    {
      id: "def-narmada-west",
      prompt: "Find the longest west-flowing river of India.",
      targetId: "narmada",
    },
    {
      id: "def-tapi-2nd-west",
      prompt: "Find the 2nd-longest west-flowing river.",
      targetId: "tapi",
    },
    {
      id: "def-damodar-sorrow",
      prompt: 'Find the river nicknamed the "Sorrow of Bengal".',
      targetId: "damodar",
    },
    {
      id: "def-subarnarekha-gold",
      prompt: 'Find the river whose name means "Streak of Gold".',
      targetId: "subarnarekha",
    },
    {
      id: "def-mahanadi-hirakud",
      prompt: "Find the river that hosts Hirakud Dam (India's longest).",
      targetId: "mahanadi",
    },
    {
      id: "def-mahi-tropic",
      prompt: "Find the river that crosses the Tropic of Cancer twice.",
      targetId: "mahi",
    },
    {
      id: "def-luni-rann",
      prompt: "Find India's only major saline river (ends in the Rann of Kutch).",
      targetId: "luni",
    },
    {
      id: "def-vaigai-south",
      prompt: "Find the southernmost river of India.",
      targetId: "vaigai",
    },
    {
      id: "def-pennar-pinakini",
      prompt: 'Find the river also called "Uttara Pinakini".',
      targetId: "pennar",
    },
    {
      id: "def-narmada-rift",
      prompt:
        "Find the west-flowing river that flows in a rift valley between the Vindhya and Satpura ranges.",
      targetId: "narmada",
    },
    {
      id: "def-mandovi-goa",
      prompt: 'Find the river called the "lifeline of Goa".',
      targetId: "mandovi",
    },
    {
      id: "def-periyar-kerala",
      prompt: "Find Kerala's longest river (its lifeline).",
      targetId: "periyar",
    },
    {
      id: "def-sharavati-jog",
      prompt: "Find the river famous for Jog Falls.",
      targetId: "sharavati",
    },
    {
      id: "def-varahi-kunchikal",
      prompt: "Find the river that hosts Kunchikal Falls (India's highest).",
      targetId: "varahi",
    },
    {
      id: "def-pamba-vembanad",
      prompt: "Find the river that drains into Vembanad Lake.",
      targetId: "pamba",
    },
    {
      id: "def-zuari-mormugao",
      prompt: "Find the Goa river that opens into Mormugao Bay.",
      targetId: "zuari",
    },
  ];

  for (const d of defining) {
    out.push(clueFor(d.id, d.prompt, d.targetId, undefined, d.fact));
  }

  // Region hub openers (overview squares)
  for (const region of REGIONS) {
    out.push({
      id: `region-${region.id}`,
      prompt: `Open the ${region.name} panel (coastal river cluster).`,
      targetId: region.id,
      revealTitle: region.name,
      revealFact: region.fact,
    });
  }

  return out;
}

/** Build a shuffled Hunt round. */
export function buildPeninsularRound(limit = 14): PeninsularClue[] {
  const pool = buildPool();
  shuffleInPlace(pool);
  return pool.slice(0, limit);
}
