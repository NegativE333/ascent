"use client";

import { useMemo, useState } from "react";
import { FilterChips } from "@/components/games/shared/filter-chips";
import { FactRow, FactsPanel } from "@/components/games/shared/facts-panel";
import { MapSearch } from "@/components/games/shared/map-search";
import { RiverMap } from "@/components/games/himalayan-rivers/river-map";
import { RIVER_PROFILES } from "@/lib/games/himalayan-rivers/facts-data";
import { HOTSPOTS, getHotspotById } from "@/lib/games/himalayan-rivers/hotspots";
import {
  RIVERS,
  RIVER_SYSTEM_LABEL,
  type RiverSystem,
} from "@/lib/games/himalayan-rivers/rivers";

type FilterId = "all" | RiverSystem | "places";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "indus", label: "Indus" },
  { id: "ganga", label: "Ganga" },
  { id: "brahmaputra", label: "Brahmaputra" },
  { id: "places", label: "Places" },
];

type Selection =
  | { kind: "river"; id: string }
  | { kind: "hotspot"; id: string }
  | null;

export function RiverExplore() {
  const [filter, setFilter] = useState<FilterId>("all");
  const [selection, setSelection] = useState<Selection>(null);

  const visibleRivers = useMemo(() => {
    if (filter === "places") return [];
    if (filter === "all") return RIVERS;
    return RIVERS.filter((r) => r.system === filter);
  }, [filter]);

  const visibleHotspots = useMemo(() => {
    if (filter === "all" || filter === "places") return HOTSPOTS;
    return [];
  }, [filter]);

  const labeledRivers = useMemo(
    () => new Set(visibleRivers.map((r) => r.id)),
    [visibleRivers]
  );
  const labeledHotspots = useMemo(
    () => new Set(visibleHotspots.map((h) => h.id)),
    [visibleHotspots]
  );

  const riverStates = useMemo(() => {
    if (selection?.kind !== "river") return {};
    return { [selection.id]: "selected" as const };
  }, [selection]);

  const hotspotStates = useMemo(() => {
    if (selection?.kind !== "hotspot") return {};
    return { [selection.id]: "selected" as const };
  }, [selection]);

  const searchItems = useMemo(
    () => [
      ...RIVERS.map((r) => ({
        id: `river:${r.id}`,
        label: r.name,
        hint: RIVER_SYSTEM_LABEL[r.system],
      })),
      ...HOTSPOTS.map((h) => ({
        id: `hotspot:${h.id}`,
        label: h.name,
        hint: h.kind,
      })),
    ],
    []
  );

  const onSearchPick = (compoundId: string) => {
    const [kind, id] = compoundId.split(":");
    if (kind === "river" && id) {
      setFilter("all");
      setSelection({ kind: "river", id });
    } else if (kind === "hotspot" && id) {
      setFilter("places");
      setSelection({ kind: "hotspot", id });
    }
  };

  return (
    <div className="space-y-4">
      <div className="panel space-y-3 p-4">
        <div>
          <p className="section-label">Explore</p>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            Labeled study map — tap a river or place for notes. Switch to Hunt
            when you want to quiz yourself.
          </p>
        </div>
        <FilterChips
          chips={FILTERS}
          value={filter}
          onChange={(id) => setFilter(id as FilterId)}
        />
        <MapSearch
          items={searchItems}
          placeholder="Type a river or place…"
          onPick={onSearchPick}
        />
        <ul className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
          <li className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-sky-700/80 dark:bg-sky-400" />
            Indus
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-700/80 dark:bg-emerald-400" />
            Ganga
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-amber-700/80 dark:bg-amber-400" />
            Brahmaputra
          </li>
        </ul>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="panel overflow-hidden p-2 sm:p-3">
          <RiverMap
            rivers={visibleRivers}
            hotspots={visibleHotspots}
            labeledRiverIds={labeledRivers}
            labeledHotspotIds={labeledHotspots}
            riverStates={riverStates}
            hotspotStates={hotspotStates}
            colorBySystem
            emphasize={
              filter === "places"
                ? "hotspots"
                : filter !== "all"
                  ? "rivers"
                  : "both"
            }
            onRiverClick={(id) => setSelection({ kind: "river", id })}
            onHotspotClick={(id) => setSelection({ kind: "hotspot", id })}
          />
        </div>
        <RiverFacts selection={selection} />
      </div>
    </div>
  );
}

function RiverFacts({ selection }: { selection: Selection }) {
  if (!selection) {
    return <FactsPanel empty="Tap a river or place on the map." />;
  }

  if (selection.kind === "hotspot") {
    const h = getHotspotById(selection.id);
    if (!h) return <FactsPanel />;
    return (
      <FactsPanel title={h.name} eyebrow={h.kind}>
        <p>{h.fact}</p>
      </FactsPanel>
    );
  }

  const river = RIVERS.find((r) => r.id === selection.id);
  const profile = RIVER_PROFILES.find((p) => p.id === selection.id);
  if (!river) return <FactsPanel />;

  return (
    <FactsPanel title={river.name} eyebrow={RIVER_SYSTEM_LABEL[river.system]}>
      {profile?.origin ? <FactRow label="Origin" value={profile.origin} /> : null}
      {profile?.ancientName ? (
        <FactRow label="Ancient name" value={profile.ancientName} />
      ) : null}
      {profile?.alsoKnownAs?.map((a) => (
        <FactRow
          key={a.region}
          label={`Also known as (${a.region})`}
          value={a.name}
        />
      ))}
      {profile?.namesByRegion
        ? Object.entries(profile.namesByRegion).map(([region, name]) => (
            <FactRow key={region} label={`In ${region}`} value={name} />
          ))
        : null}
      {profile?.entersIndiaAt ? (
        <FactRow label="Enters India" value={profile.entersIndiaAt} />
      ) : null}
      {profile?.drainsInto ? (
        <FactRow label="Drains into" value={profile.drainsInto} />
      ) : null}
      {profile?.lengthKm ? (
        <FactRow
          label="Length"
          value={`${profile.lengthKm} km${
            profile.lengthInIndiaKm
              ? ` (${profile.lengthInIndiaKm} km in India)`
              : ""
          }`}
        />
      ) : null}
      {profile?.leftBankTributaries?.length ? (
        <FactRow
          label="Left-bank tributaries"
          value={profile.leftBankTributaries.join(", ")}
        />
      ) : null}
      {profile?.rightBankTributaries?.length ? (
        <FactRow
          label="Right-bank tributaries"
          value={profile.rightBankTributaries.join(", ")}
        />
      ) : null}
      {profile?.tributaries?.length ? (
        <FactRow label="Tributaries" value={profile.tributaries.join(", ")} />
      ) : null}
      {profile?.joinsWith ? (
        <FactRow label="Joins" value={profile.joinsWith} />
      ) : null}
      {profile?.cities?.length ? (
        <FactRow label="Cities" value={profile.cities.join(", ")} />
      ) : null}
      {(profile?.facts ?? [river.fact]).map((f) => (
        <p key={f}>{f}</p>
      ))}
    </FactsPanel>
  );
}
