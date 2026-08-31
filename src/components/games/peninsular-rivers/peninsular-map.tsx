"use client";

import { useMemo, useState } from "react";
import {
  IndiaBasemap,
  type IndiaProjectionContext,
} from "@/components/maps/india-basemap";
import {
  OVERVIEW_RIVERS,
  REGIONS,
  type Flow,
  type PeninsularRiver,
  type RegionHub,
  type RegionId,
} from "@/lib/games/peninsular-rivers/data";
import { cn } from "@/lib/utils";

export type TargetVisualState =
  | "neutral"
  | "correct"
  | "missed"
  | "wrong-flash"
  | "selected";

type Props = {
  rivers?: PeninsularRiver[];
  regions?: RegionHub[];
  riverStates?: Record<string, TargetVisualState>;
  regionStates?: Record<string, TargetVisualState>;
  labeledRiverIds?: Set<string>;
  labeledRegionIds?: Set<string>;
  /** Explore: paint by east / west flow. */
  colorByFlow?: boolean;
  /** Hunt: show name on hover/tap only (when not already labeled). */
  hoverLabels?: boolean;
  showRegions?: boolean;
  disabled?: boolean;
  onRiverClick?: (riverId: string) => void;
  onRegionClick?: (regionId: RegionId) => void;
  className?: string;
};

const FLOW_STROKE: Record<Flow, string> = {
  east: "stroke-emerald-700/75 dark:stroke-emerald-400/80",
  west: "stroke-amber-700/75 dark:stroke-amber-400/80",
};

const RIVER_STROKE: Record<TargetVisualState, string> = {
  neutral: "stroke-foreground/35",
  correct: "stroke-emerald-600 dark:stroke-emerald-400",
  missed: "stroke-sky-600 dark:stroke-sky-400",
  "wrong-flash": "stroke-red-500",
  selected: "stroke-foreground",
};

const FILL: Record<TargetVisualState, string> = {
  neutral: "fill-foreground/50",
  correct: "fill-emerald-600 dark:fill-emerald-400",
  missed: "fill-sky-600 dark:fill-sky-400",
  "wrong-flash": "fill-red-500",
  selected: "fill-foreground",
};

function riverPolyline(
  ctx: IndiaProjectionContext,
  river: PeninsularRiver
): string | null {
  const points: [number, number][] = [];
  for (const lngLat of river.path) {
    const p = ctx.project(lngLat);
    if (p) points.push(p);
  }
  if (points.length < 2) return null;
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i][0]} ${points[i][1]}`;
  }
  return d;
}

export function PeninsularMap({
  rivers = OVERVIEW_RIVERS,
  regions = REGIONS,
  riverStates = {},
  regionStates = {},
  labeledRiverIds = new Set(),
  labeledRegionIds = new Set(),
  colorByFlow = false,
  hoverLabels = false,
  showRegions = true,
  disabled,
  onRiverClick,
  onRegionClick,
  className,
}: Props) {
  return (
    <IndiaBasemap
      className={className}
      width={560}
      height={640}
      padding={10}
      ariaLabel="Peninsular rivers map"
    >
      {(ctx) => (
        <Overlays
          ctx={ctx}
          rivers={rivers}
          regions={regions}
          riverStates={riverStates}
          regionStates={regionStates}
          labeledRiverIds={labeledRiverIds}
          labeledRegionIds={labeledRegionIds}
          colorByFlow={colorByFlow}
          hoverLabels={hoverLabels}
          showRegions={showRegions}
          disabled={disabled}
          onRiverClick={onRiverClick}
          onRegionClick={onRegionClick}
        />
      )}
    </IndiaBasemap>
  );
}

function Overlays({
  ctx,
  rivers,
  regions,
  riverStates,
  regionStates,
  labeledRiverIds,
  labeledRegionIds,
  colorByFlow,
  hoverLabels,
  showRegions,
  disabled,
  onRiverClick,
  onRegionClick,
}: {
  ctx: IndiaProjectionContext;
  rivers: PeninsularRiver[];
  regions: RegionHub[];
  riverStates: Record<string, TargetVisualState>;
  regionStates: Record<string, TargetVisualState>;
  labeledRiverIds: Set<string>;
  labeledRegionIds: Set<string>;
  colorByFlow: boolean;
  hoverLabels: boolean;
  showRegions: boolean;
  disabled?: boolean;
  onRiverClick?: (riverId: string) => void;
  onRegionClick?: (regionId: RegionId) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const paths = useMemo(() => {
    return rivers
      .slice()
      .sort((a, b) => a.path.length - b.path.length)
      .map((river) => ({
        river,
        d: riverPolyline(ctx, river),
        label: ctx.project(river.labelAt),
      }));
  }, [ctx, rivers]);

  return (
    <g>
      {paths.map(({ river, d, label }) => {
        if (!d) return null;
        const state = riverStates[river.id] ?? "neutral";
        const showLabel =
          (labeledRiverIds.has(river.id) ||
            (hoverLabels && hovered === river.id)) &&
          label;
        const glow =
          state === "correct" ||
          state === "missed" ||
          state === "wrong-flash" ||
          state === "selected";
        const strokeClass =
          state === "neutral" && colorByFlow
            ? FLOW_STROKE[river.flow]
            : RIVER_STROKE[state];

        return (
          <g
            key={river.id}
            onMouseEnter={() => hoverLabels && setHovered(river.id)}
            onMouseLeave={() =>
              hoverLabels && setHovered((h) => (h === river.id ? null : h))
            }
          >
            <path
              d={d}
              fill="none"
              stroke="transparent"
              strokeWidth={18}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(!disabled && onRiverClick && "cursor-pointer")}
              pointerEvents={disabled || !onRiverClick ? "none" : "stroke"}
              onClick={() => onRiverClick?.(river.id)}
              aria-label={river.name}
              role="button"
            />
            {glow && (
              <path
                d={d}
                fill="none"
                strokeWidth={7}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn(strokeClass, "pointer-events-none opacity-30")}
              />
            )}
            <path
              d={d}
              fill="none"
              strokeWidth={
                state === "neutral" ? (colorByFlow ? 2.75 : 2.25) : 3
              }
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(
                strokeClass,
                "pointer-events-none transition-[stroke,stroke-width] duration-200",
                state === "wrong-flash" && "animate-pulse"
              )}
            />
            {showLabel && label && (
              <Label x={label[0]} y={label[1]} text={river.name} />
            )}
          </g>
        );
      })}

      {showRegions &&
        regions.map((r) => {
          const point = ctx.project(r.at);
          if (!point) return null;
          const state = regionStates[r.id] ?? "neutral";
          const showLabel =
            labeledRegionIds.has(r.id) ||
            (hoverLabels && hovered === `region:${r.id}`);
          return (
            <g
              key={r.id}
              onMouseEnter={() =>
                hoverLabels && setHovered(`region:${r.id}`)
              }
              onMouseLeave={() =>
                hoverLabels &&
                setHovered((h) => (h === `region:${r.id}` ? null : h))
              }
            >
              <circle
                cx={point[0]}
                cy={point[1]}
                r={16}
                fill="transparent"
                className={cn(!disabled && onRegionClick && "cursor-pointer")}
                pointerEvents={disabled || !onRegionClick ? "none" : "all"}
                onClick={() => onRegionClick?.(r.id)}
                aria-label={r.name}
                role="button"
              />
              <rect
                x={point[0] - 6}
                y={point[1] - 6}
                width={12}
                height={12}
                rx={2}
                className="pointer-events-none fill-card stroke-border"
                strokeWidth={1}
              />
              <rect
                x={point[0] - 4}
                y={point[1] - 4}
                width={8}
                height={8}
                rx={1}
                className={cn(FILL[state], "pointer-events-none opacity-80")}
              />
              {showLabel && (
                <Label x={point[0] + 10} y={point[1] - 4} text={r.name} />
              )}
            </g>
          );
        })}
    </g>
  );
}

function Label({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <g transform={`translate(${x}, ${y})`} className="pointer-events-none">
      <rect
        x={-4}
        y={-10}
        rx={3}
        height={16}
        width={Math.max(36, text.length * 6.2 + 8)}
        className="fill-card stroke-border"
        strokeWidth={1}
      />
      <text
        x={4}
        y={2}
        className="fill-foreground"
        style={{ fontSize: 10, fontWeight: 500 }}
      >
        {text}
      </text>
    </g>
  );
}
