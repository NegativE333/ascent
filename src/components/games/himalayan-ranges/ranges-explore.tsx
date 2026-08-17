"use client";

import { useMemo, useState } from "react";
import { FilterChips } from "@/components/games/shared/filter-chips";
import { FactRow, FactsPanel } from "@/components/games/shared/facts-panel";
import { MapSearch } from "@/components/games/shared/map-search";
import {
  RangesOverviewMap,
  type RangesLayerFilter,
} from "@/components/games/himalayan-ranges/overview-map";
import { RegionZoomPanel } from "@/components/games/himalayan-ranges/region-panel";
import {
  DIVISIONS,
  INTRO_FACTS,
  NON_HIMALAYA_TARGET,
  OVERVIEW_PEAKS,
  RANGE_BANDS,
  REGION_TARGETS,
  REGIONS,
  getTarget,
  targetsForRegion,
  type RegionId,
} from "@/lib/games/himalayan-ranges/data";

const FILTERS: { id: RangesLayerFilter; label: string }[] = [
  { id: "ranges", label: "Ranges" },
  { id: "divisions", label: "Divisions" },
  { id: "peaks", label: "Peaks" },
  { id: "passes", label: "Passes" },
  { id: "glaciers", label: "Glaciers" },
  { id: "valleys", label: "Valleys" },
  { id: "places", label: "Places" },
  { id: "regions", label: "Regions" },
  { id: "all", label: "Overview" },
];

const KIND_TO_FILTER: Record<string, RangesLayerFilter> = {
  range: "ranges",
  division: "divisions",
  peak: "peaks",
  pass: "passes",
  glacier: "glaciers",
  valley: "valleys",
  place: "places",
  region: "regions",
  hills: "all",
};

export function RangesExplore() {
  const [filter, setFilter] = useState<RangesLayerFilter>("ranges");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openRegion, setOpenRegion] = useState<RegionId | null>(null);
  const [showFormation, setShowFormation] = useState(false);

  const extraTargets = useMemo(() => {
    if (
      filter === "passes" ||
      filter === "glaciers" ||
      filter === "valleys" ||
      filter === "places"
    ) {
      const kind =
        filter === "passes"
          ? "pass"
          : filter === "glaciers"
            ? "glacier"
            : filter === "valleys"
              ? "valley"
              : "place";
      return REGION_TARGETS.filter((t) => t.kind === kind);
    }
    return [];
  }, [filter]);

  const labeledIds = useMemo(() => {
    const ids = new Set<string>();
    if (filter === "ranges" || filter === "all") {
      RANGE_BANDS.forEach((t) => ids.add(t.id));
    }
    if (filter === "divisions" || filter === "all") {
      DIVISIONS.forEach((t) => ids.add(t.id));
    }
    if (filter === "peaks" || filter === "all") {
      OVERVIEW_PEAKS.forEach((t) => ids.add(t.id));
    }
    if (filter === "regions" || filter === "all") {
      REGIONS.forEach((r) => ids.add(r.id));
    }
    if (filter === "all") ids.add(NON_HIMALAYA_TARGET.id);
    extraTargets.forEach((t) => ids.add(t.id));
    return ids;
  }, [filter, extraTargets]);

  const states = useMemo(
    () => (selectedId ? { [selectedId]: "correct" as const } : {}),
    [selectedId]
  );

  const searchItems = useMemo(() => {
    const items = [
      ...RANGE_BANDS.map((t) => ({
        id: t.id,
        label: t.name,
        hint: "range",
      })),
      ...DIVISIONS.map((t) => ({
        id: t.id,
        label: t.name,
        hint: "division",
      })),
      ...OVERVIEW_PEAKS.map((t) => ({
        id: t.id,
        label: t.name,
        hint: "peak",
      })),
      ...REGIONS.map((r) => ({
        id: r.id,
        label: r.name,
        hint: "region",
      })),
      ...REGION_TARGETS.map((t) => ({
        id: t.id,
        label: t.name,
        hint: t.kind,
      })),
      {
        id: NON_HIMALAYA_TARGET.id,
        label: NON_HIMALAYA_TARGET.name,
        hint: "not Himalaya",
      },
    ];
    return items;
  }, []);

  const onSearchPick = (id: string) => {
    const target = getTarget(id);
    setSelectedId(id);
    if (target?.regionId) {
      setOpenRegion(target.regionId);
      setFilter(KIND_TO_FILTER[target.kind] ?? "passes");
    } else if (target?.kind === "region") {
      setOpenRegion(id as RegionId);
      setFilter("regions");
    } else if (target) {
      setOpenRegion(null);
      setFilter(KIND_TO_FILTER[target.kind] ?? "all");
    }
  };

  const regionTargets = openRegion ? targetsForRegion(openRegion) : [];

  return (
    <div className="space-y-4">
      <div className="panel space-y-3 p-4">
        <div>
          <p className="section-label">Explore</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Study map with labels — filter by category, search, then tap for
            facts. Open a region square for dense clusters of passes and peaks.
          </p>
        </div>
        <FilterChips
          chips={FILTERS}
          value={filter}
          onChange={(id) => {
            setFilter(id as RangesLayerFilter);
            setOpenRegion(null);
          }}
        />
        <MapSearch
          items={searchItems}
          placeholder="Type a range, peak, or pass…"
          onPick={onSearchPick}
        />
        <ul className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
          <li>△ peak</li>
          <li>⌂ pass</li>
          <li>○ place / valley</li>
          <li>□ region zoom</li>
        </ul>
        <div>
          <button
            type="button"
            onClick={() => setShowFormation((v) => !v)}
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            {showFormation ? "Hide" : "Show"} formation notes
          </button>
          {showFormation ? (
            <ul className="mt-2 space-y-2 border-t border-border pt-2 text-sm leading-relaxed text-muted-foreground">
              {INTRO_FACTS.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          {openRegion ? (
            <RegionZoomPanel
              regionId={openRegion}
              states={states}
              labeledIds={new Set(regionTargets.map((t) => t.id))}
              onSelect={setSelectedId}
              onBack={() => setOpenRegion(null)}
            />
          ) : (
            <div className="panel overflow-hidden p-2 sm:p-3">
              <RangesOverviewMap
                layerFilter={filter}
                extraTargets={extraTargets}
                labeledIds={labeledIds}
                states={states}
                onSelect={setSelectedId}
                onOpenRegion={(rid) => {
                  setOpenRegion(rid);
                  setSelectedId(rid);
                }}
              />
            </div>
          )}
        </div>

        <RangesFacts selectedId={selectedId} />
      </div>
    </div>
  );
}

function RangesFacts({ selectedId }: { selectedId: string | null }) {
  const selected = selectedId ? getTarget(selectedId) : undefined;
  if (!selectedId || !selected) {
    return <FactsPanel empty="Tap a range, peak, pass, or region on the map." />;
  }

  return (
    <FactsPanel title={selected.name} eyebrow={selected.kind}>
      <p>{selected.fact}</p>
      {selected.regionId ? (
        <FactRow label="Region panel" value={selected.regionId} />
      ) : null}
    </FactsPanel>
  );
}
