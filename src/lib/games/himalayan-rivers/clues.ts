import {
  CITIES_ON_RIVERS,
  RIVER_PROFILES,
} from "@/lib/games/himalayan-rivers/facts-data";
import { HOTSPOTS, type MapHotspot } from "@/lib/games/himalayan-rivers/hotspots";
import { RIVERS, type River } from "@/lib/games/himalayan-rivers/rivers";

export type ClueTargetKind = "river" | "hotspot" | "prayag-order";

export type MapClue = {
  id: string;
  prompt: string;
  kind: ClueTargetKind;
  /** River or hotspot id; unused for prayag-order. */
  targetId: string;
  /** Fact shown after answering (enrichment). */
  revealFact: string;
  revealTitle: string;
};

const MAP_RIVER_IDS = new Set(RIVERS.map((r) => r.id));

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function riverById(id: string): River | undefined {
  return RIVERS.find((r) => r.id === id);
}

function profileById(id: string) {
  return RIVER_PROFILES.find((r) => r.id === id);
}

function enrichmentForRiver(id: string): { title: string; fact: string } {
  const river = riverById(id);
  const profile = profileById(id);
  const extra = profile?.facts?.[0];
  return {
    title: river?.name ?? id,
    fact: extra ?? river?.fact ?? "",
  };
}

function enrichmentForHotspot(h: MapHotspot) {
  return { title: h.name, fact: h.fact };
}

function riverClues(): MapClue[] {
  const out: MapClue[] = [];

  for (const river of RIVERS) {
    const enrich = enrichmentForRiver(river.id);
    out.push({
      id: `find-${river.id}`,
      prompt: `Find the ${river.name}.`,
      kind: "river",
      targetId: river.id,
      revealTitle: enrich.title,
      revealFact: enrich.fact || river.fact,
    });
  }

  // Ancient / regional names (map rivers only)
  for (const profile of RIVER_PROFILES) {
    if (!MAP_RIVER_IDS.has(profile.id)) continue;
    const enrich = enrichmentForRiver(profile.id);

    if (profile.ancientName) {
      out.push({
        id: `ancient-${profile.id}`,
        prompt: `Find the river known as ${profile.ancientName}.`,
        kind: "river",
        targetId: profile.id,
        revealTitle: enrich.title,
        revealFact: `${profile.name}'s ancient name is ${profile.ancientName}. ${enrich.fact}`,
      });
    }

    for (const aka of profile.alsoKnownAs ?? []) {
      out.push({
        id: `aka-${profile.id}-${aka.region}`,
        prompt: `Find the river also known as ${aka.name} (${aka.region}).`,
        kind: "river",
        targetId: profile.id,
        revealTitle: enrich.title,
        revealFact: enrich.fact,
      });
    }

    if (profile.namesByRegion) {
      for (const [region, name] of Object.entries(profile.namesByRegion)) {
        if (region === "Assam" && profile.id === "brahmaputra") continue; // same as common name
        out.push({
          id: `region-${profile.id}-${region}`,
          prompt: `Find the river known as ${name} in ${region}.`,
          kind: "river",
          targetId: profile.id,
          revealTitle: enrich.title,
          revealFact: enrich.fact,
        });
      }
    }
  }

  // City → river (only cities whose river is on the map)
  for (const row of CITIES_ON_RIVERS) {
    if (!row.himalayan) continue;
    const target = RIVERS.find(
      (r) => r.name.toLowerCase() === row.river.toLowerCase()
    );
    if (!target) continue;
    const enrich = enrichmentForRiver(target.id);
    out.push({
      id: `city-${row.city}`,
      prompt: `Find the river that flows past ${row.city}.`,
      kind: "river",
      targetId: target.id,
      revealTitle: enrich.title,
      revealFact: `${row.city} lies on the ${target.name}. ${enrich.fact}`,
    });
  }

  // Hand-picked defining-fact clues (map rivers)
  const defining: { id: string; prompt: string; targetId: string; fact?: string }[] =
    [
      {
        id: "def-sutlej-longest",
        prompt: "Find the longest tributary of the Indus.",
        targetId: "sutlej",
      },
      {
        id: "def-chenab-largest",
        prompt: "Find the largest tributary of the Indus.",
        targetId: "chenab",
      },
      {
        id: "def-beas-pakistan",
        prompt: "Find the only Indus tributary that never enters Pakistan.",
        targetId: "beas",
      },
      {
        id: "def-kosi-sorrow",
        prompt: "Find the river nicknamed the \"Sorrow of Bihar\".",
        targetId: "kosi",
      },
      {
        id: "def-ghaghara-volume",
        prompt: "Find the Ganga's largest tributary by water volume.",
        targetId: "ghaghara",
        fact: "Ghaghara (Karnali in Nepal) is the Ganga's largest tributary by volume; it joins at Chapra, Bihar.",
      },
      {
        id: "def-yamuna-longest-plains",
        prompt: "Find the longest tributary of the Ganga in the Northern Plains.",
        targetId: "yamuna",
      },
      {
        id: "def-ganga-national",
        prompt: "Find India's National River (declared 2008).",
        targetId: "ganga",
      },
      {
        id: "def-jhelum-wular",
        prompt: "Find the river that feeds Wular Lake.",
        targetId: "jhelum",
      },
      {
        id: "def-brahmaputra-majuli",
        prompt: "Find the river that hosts Majuli, the world's largest river island.",
        targetId: "brahmaputra",
        fact: "Majuli and Umananda (world's smallest river island) both lie on the Brahmaputra.",
      },
    ];

  for (const d of defining) {
    const enrich = enrichmentForRiver(d.targetId);
    out.push({
      id: d.id,
      prompt: d.prompt,
      kind: "river",
      targetId: d.targetId,
      revealTitle: enrich.title,
      revealFact: d.fact ?? enrich.fact,
    });
  }

  return out;
}

function hotspotClues(): MapClue[] {
  const curated: { id: string; prompt: string; hotspotId: string }[] = [
    {
      id: "hs-demchok",
      prompt: "Click where the Indus enters India.",
      hotspotId: "demchok",
    },
    {
      id: "hs-shipki",
      prompt: "Click where the Sutlej enters India.",
      hotspotId: "shipkila",
    },
    {
      id: "hs-panchnad",
      prompt: "Click the meeting point of five Punjab rivers.",
      hotspotId: "panchnad",
    },
    {
      id: "hs-devprayag",
      prompt: "Click the confluence that officially creates the Ganga.",
      hotspotId: "devprayag",
    },
    {
      id: "hs-tandi",
      prompt: "Click where the Chandra and Bhaga rivers become the Chenab.",
      hotspotId: "tandi",
    },
    {
      id: "hs-farakka",
      prompt: "Click where the Ganga splits toward Bangladesh.",
      hotspotId: "farakka",
    },
    {
      id: "hs-gangotri",
      prompt: "Click the origin of the Ganga (as the Bhagirathi).",
      hotspotId: "gangotri",
    },
    {
      id: "hs-yamunotri",
      prompt: "Click the origin of the Yamuna.",
      hotspotId: "yamunotri",
    },
    {
      id: "hs-verinag",
      prompt: "Click the origin of the Jhelum.",
      hotspotId: "verinag",
    },
    {
      id: "hs-harike",
      prompt: "Click where the Beas joins the Sutlej.",
      hotspotId: "harike",
    },
    {
      id: "hs-namcha",
      prompt: "Click where the Brahmaputra makes its sharp U-turn / gorge.",
      hotspotId: "namchabarwa",
    },
    {
      id: "hs-dhubri",
      prompt: "Click where the Brahmaputra turns south in Assam.",
      hotspotId: "dhubri",
    },
    {
      id: "hs-doab-sindh",
      prompt: "Click the doab between the Indus and the Jhelum.",
      hotspotId: "sindhsagardoab",
    },
    {
      id: "hs-doab-jech",
      prompt: "Click the doab between the Jhelum and the Chenab.",
      hotspotId: "jechdoab",
    },
    {
      id: "hs-doab-rechna",
      prompt: "Click the doab between the Chenab and the Ravi.",
      hotspotId: "rechnadoab",
    },
    {
      id: "hs-doab-bari",
      prompt: "Click the doab between the Ravi and the Beas.",
      hotspotId: "baridoab",
    },
    {
      id: "hs-doab-bist",
      prompt: "Click the doab between the Beas and the Sutlej.",
      hotspotId: "bistdoab",
    },
  ];

  return curated.map((c) => {
    const h = HOTSPOTS.find((x) => x.id === c.hotspotId)!;
    const enrich = enrichmentForHotspot(h);
    return {
      id: c.id,
      prompt: c.prompt,
      kind: "hotspot" as const,
      targetId: c.hotspotId,
      revealTitle: enrich.title,
      revealFact: enrich.fact,
    };
  });
}

function prayagOrderClue(): MapClue {
  return {
    id: "prayag-order",
    prompt: "Put the Panch Prayag in order from upstream to downstream.",
    kind: "prayag-order",
    targetId: "prayag-order",
    revealTitle: "Panch Prayag",
    revealFact:
      "Upstream → downstream: Vishnuprayag, Nandaprayag, Karnaprayag, Rudraprayag, Devprayag (forms the Ganga).",
  };
}

/** Build a shuffled round mixing river + hotspot clues, plus one prayag-order item. */
export function buildMapClueRound(limit = 14): MapClue[] {
  const pool = [...riverClues(), ...hotspotClues()];
  shuffleInPlace(pool);

  // Prefer a mix: take up to limit-1 from pool, always append prayag-order once
  const selected = pool.slice(0, Math.max(1, limit - 1));
  selected.push(prayagOrderClue());
  return shuffleInPlace(selected);
}

export const IWT_WESTERN = ["indus", "jhelum", "chenab"] as const;
export const IWT_EASTERN = ["ravi", "beas", "sutlej"] as const;

export const IWT_FACTS = [
  "Indus Waters Treaty (1960, Karachi) — mediated by the World Bank; signed by Nehru and Ayub Khan.",
  "Western Rivers (Indus, Jhelum, Chenab) → primarily Pakistan's share.",
  "Eastern Rivers (Ravi, Beas, Sutlej) → primarily India's share.",
];
