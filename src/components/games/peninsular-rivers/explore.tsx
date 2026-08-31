"use client";

import { useMemo, useState } from "react";
import { FilterChips } from "@/components/games/shared/filter-chips";
import { FactRow, FactsPanel } from "@/components/games/shared/facts-panel";
import { MapSearch } from "@/components/games/shared/map-search";
import { PeninsularMap } from "@/components/games/peninsular-rivers/peninsular-map";
import { PeninsularRegionPanel } from "@/components/games/peninsular-rivers/region-panel";
import {
  ALL_RIVERS,
  FLOW_LABEL,
  OVERVIEW_RIVERS,
  REGIONS,
  getRegion,
  getRiver,
  riversForRegion,
  type Flow,
  type RegionId,
} from "@/lib/games/peninsular-rivers/data";

type FilterId = "all" | Flow | "coasts";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "east", label: "East" },
  { id: "west", label: "West" },
  { id: "coasts", label: "Coasts" },
];

type Selection =
  | { kind: "river"; id: string }
  | { kind: "region"; id: RegionId }
  | null;

export function PeninsularExplore() {
  const [filter, setFilter] = useState<FilterId>("all");
  const [selection, setSelection] = useState<Selection>(null);
  const [openRegion, setOpenRegion] = useState<RegionId | null>(null);

  const visibleRivers = useMemo(() => {
    if (filter === "coasts") return [];
    if (filter === "all") return OVERVIEW_RIVERS;
    return OVERVIEW_RIVERS.filter((r) => r.flow === filter);
  }, [filter]);

  const showRegions = filter === "all" || filter === "coasts";

  const labeledRiverIds = useMemo(
    () => new Set(visibleRivers.map((r) => r.id)),
    [visibleRivers]
  );
  const labeledRegionIds = useMemo(
    () => (showRegions ? new Set(REGIONS.map((r) => r.id)) : new Set<string>()),
    [showRegions]
  );

  const riverStates = useMemo(() => {
    if (selection?.kind !== "river") return {};
    return { [selection.id]: "selected" as const };
  }, [selection]);

  const regionStates = useMemo(() => {
    if (selection?.kind !== "region") return {};
    return { [selection.id]: "selected" as const };
  }, [selection]);

  const searchItems = useMemo(
    () => [
      ...ALL_RIVERS.map((r) => ({
        id: `river:${r.id}`,
        label: r.name,
        hint: r.regionId ? `coast · ${r.regionId}` : FLOW_LABEL[r.flow],
      })),
      ...REGIONS.map((r) => ({
        id: `region:${r.id}`,
        label: r.name,
        hint: "coast panel",
      })),
    ],
    []
  );

  const onSearchPick = (compoundId: string) => {
    const [kind, id] = compoundId.split(":");
    if (kind === "river" && id) {
      const river = getRiver(id);
      if (river?.regionId) {
        setFilter("coasts");
        setOpenRegion(river.regionId);
        setSelection({ kind: "river", id });
      } else {
        setFilter(river?.flow ?? "all");
        setOpenRegion(null);
        setSelection({ kind: "river", id });
      }
    } else if (kind === "region" && id) {
      setFilter("coasts");
      setOpenRegion(id as RegionId);
      setSelection({ kind: "region", id: id as RegionId });
    }
  };

  const regionLabeled = useMemo(() => {
    if (!openRegion) return new Set<string>();
    return new Set(riversForRegion(openRegion).map((r) => r.id));
  }, [openRegion]);

  return (
    <div className="space-y-4">
      <div className="panel space-y-3 p-4">
        <div>
          <p className="section-label">Explore</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Labeled study map — filter east / west / coastal panels, search,
            then tap for facts. Switch to Hunt when you want to quiz yourself.
          </p>
        </div>
        <FilterChips
          chips={FILTERS}
          value={filter}
          onChange={(id) => {
            setFilter(id as FilterId);
            setOpenRegion(null);
          }}
        />
        <MapSearch
          items={searchItems}
          placeholder="Type a river or coast…"
          onPick={onSearchPick}
        />
        <ul className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
          <li className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-700/80 dark:bg-emerald-400" />
            East-flowing
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-amber-700/80 dark:bg-amber-400" />
            West-flowing
          </li>
          <li>□ coast region zoom</li>
        </ul>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          {openRegion ? (
            <PeninsularRegionPanel
              regionId={openRegion}
              states={riverStates}
              labeledIds={regionLabeled}
              onSelect={(id) => setSelection({ kind: "river", id })}
              onBack={() => setOpenRegion(null)}
            />
          ) : (
            <div className="panel overflow-hidden p-2 sm:p-3">
              <PeninsularMap
                rivers={visibleRivers}
                riverStates={riverStates}
                regionStates={regionStates}
                labeledRiverIds={labeledRiverIds}
                labeledRegionIds={labeledRegionIds}
                colorByFlow
                showRegions={showRegions}
                onRiverClick={(id) => setSelection({ kind: "river", id })}
                onRegionClick={(rid) => {
                  setOpenRegion(rid);
                  setSelection({ kind: "region", id: rid });
                }}
              />
            </div>
          )}
        </div>
        <PeninsularFacts selection={selection} />
      </div>
    </div>
  );
}

function PeninsularFacts({ selection }: { selection: Selection }) {
  if (!selection) {
    return (
      <FactsPanel empty="Tap a river or coast square on the map." />
    );
  }

  if (selection.kind === "region") {
    const region = getRegion(selection.id);
    if (!region) return <FactsPanel />;
    const rivers = riversForRegion(selection.id);
    return (
      <FactsPanel title={region.name} eyebrow="Coast panel">
        <p>{region.fact}</p>
        <FactRow
          label="Rivers"
          value={rivers.map((r) => r.name).join(", ")}
        />
      </FactsPanel>
    );
  }

  const river = getRiver(selection.id);
  if (!river) return <FactsPanel />;

  return (
    <FactsPanel title={river.name} eyebrow={FLOW_LABEL[river.flow]}>
      <FactRow label="Origin" value={river.origin} />
      {river.drainsInto ? (
        <FactRow label="Drains into" value={river.drainsInto} />
      ) : null}
      {river.lengthKm ? (
        <FactRow label="Length" value={`${river.lengthKm} km`} />
      ) : null}
      {river.alsoKnownAs?.length ? (
        <FactRow label="Also known as" value={river.alsoKnownAs.join(", ")} />
      ) : null}
      {river.tributaries?.length ? (
        <FactRow label="Tributaries" value={river.tributaries.join(", ")} />
      ) : null}
      {river.cities?.length ? (
        <FactRow label="Cities" value={river.cities.join(", ")} />
      ) : null}
      {river.regionId ? (
        <FactRow label="Coast panel" value={river.regionId} />
      ) : null}
      <p>{river.fact}</p>
      {(river.facts ?? []).map((f) => (
        <p key={f}>{f}</p>
      ))}
    </FactsPanel>
  );
}
