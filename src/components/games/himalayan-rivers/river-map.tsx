"use client";

import { useMemo } from "react";
import { IndiaBasemap, type IndiaProjectionContext } from "@/components/maps/india-basemap";
import type { MapHotspot } from "@/lib/games/himalayan-rivers/hotspots";
import type { River, RiverSystem } from "@/lib/games/himalayan-rivers/rivers";
import { cn } from "@/lib/utils";

export type TargetVisualState =
  | "neutral"
  | "correct"
  | "missed"
  | "wrong-flash"
  | "western"
  | "eastern"
  | "selected";

type RiverMapProps = {
  rivers: River[];
  hotspots: MapHotspot[];
  riverStates?: Record<string, TargetVisualState>;
  hotspotStates?: Record<string, TargetVisualState>;
  labeledRiverIds?: Set<string>;
  labeledHotspotIds?: Set<string>;
  /** Dim rivers slightly when the current clue targets a hotspot (and vice versa). */
  emphasize?: "rivers" | "hotspots" | "both";
  /** Explore: paint rivers by Indus / Ganga / Brahmaputra system. */
  colorBySystem?: boolean;
  disabled?: boolean;
  onRiverClick?: (riverId: string) => void;
  onHotspotClick?: (hotspotId: string) => void;
  className?: string;
};

function riverPolyline(
  ctx: IndiaProjectionContext,
  river: River
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

const SYSTEM_STROKE: Record<RiverSystem, string> = {
  indus: "stroke-sky-700/75 dark:stroke-sky-400/80",
  ganga: "stroke-emerald-700/75 dark:stroke-emerald-400/80",
  brahmaputra: "stroke-amber-700/75 dark:stroke-amber-400/80",
};

const RIVER_STROKE: Record<TargetVisualState, string> = {
  neutral: "stroke-foreground/35",
  correct: "stroke-emerald-600 dark:stroke-emerald-400",
  missed: "stroke-sky-600 dark:stroke-sky-400",
  "wrong-flash": "stroke-red-500",
  western: "stroke-amber-600 dark:stroke-amber-400",
  eastern: "stroke-violet-600 dark:stroke-violet-400",
  selected: "stroke-foreground",
};

const DOT_FILL: Record<TargetVisualState, string> = {
  neutral: "fill-foreground/50",
  correct: "fill-emerald-600 dark:fill-emerald-400",
  missed: "fill-sky-600 dark:fill-sky-400",
  "wrong-flash": "fill-red-500",
  western: "fill-amber-600",
  eastern: "fill-violet-600",
  selected: "fill-foreground",
};

export function RiverMap({
  rivers,
  hotspots,
  riverStates = {},
  hotspotStates = {},
  labeledRiverIds = new Set(),
  labeledHotspotIds = new Set(),
  emphasize = "both",
  colorBySystem = false,
  disabled,
  onRiverClick,
  onHotspotClick,
  className,
}: RiverMapProps) {
  return (
    <IndiaBasemap className={className} width={560} height={640} padding={10}>
      {(ctx) => (
        <MapOverlays
          ctx={ctx}
          rivers={rivers}
          hotspots={hotspots}
          riverStates={riverStates}
          hotspotStates={hotspotStates}
          labeledRiverIds={labeledRiverIds}
          labeledHotspotIds={labeledHotspotIds}
          emphasize={emphasize}
          colorBySystem={colorBySystem}
          disabled={disabled}
          onRiverClick={onRiverClick}
          onHotspotClick={onHotspotClick}
        />
      )}
    </IndiaBasemap>
  );
}

function MapOverlays({
  ctx,
  rivers,
  hotspots,
  riverStates,
  hotspotStates,
  labeledRiverIds,
  labeledHotspotIds,
  emphasize,
  colorBySystem,
  disabled,
  onRiverClick,
  onHotspotClick,
}: {
  ctx: IndiaProjectionContext;
  rivers: River[];
  hotspots: MapHotspot[];
  riverStates: Record<string, TargetVisualState>;
  hotspotStates: Record<string, TargetVisualState>;
  labeledRiverIds: Set<string>;
  labeledHotspotIds: Set<string>;
  emphasize: "rivers" | "hotspots" | "both";
  colorBySystem: boolean;
  disabled?: boolean;
  onRiverClick?: (riverId: string) => void;
  onHotspotClick?: (hotspotId: string) => void;
}) {
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

  const dots = useMemo(() => {
    return hotspots.map((h) => ({
      hotspot: h,
      point: ctx.project(h.at),
    }));
  }, [ctx, hotspots]);

  const riverDim = emphasize === "hotspots" ? "opacity-40" : "";
  const hotspotDim = emphasize === "rivers" ? "opacity-45" : "";

  return (
    <g>
      <g className={riverDim}>
        {paths.map(({ river, d, label }) => {
          if (!d) return null;
          const state = riverStates[river.id] ?? "neutral";
          const showLabel = labeledRiverIds.has(river.id) && label;
          const glow =
            state === "correct" ||
            state === "missed" ||
            state === "wrong-flash" ||
            state === "western" ||
            state === "eastern" ||
            state === "selected";

          const strokeClass =
            state === "neutral" && colorBySystem
              ? SYSTEM_STROKE[river.system]
              : RIVER_STROKE[state];

          return (
            <g key={river.id}>
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
                  state === "neutral" ? (colorBySystem ? 2.75 : 2.25) : 3
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
      </g>

      <g className={hotspotDim}>
        {dots.map(({ hotspot, point }) => {
          if (!point) return null;
          const state = hotspotStates[hotspot.id] ?? "neutral";
          const showLabel = labeledHotspotIds.has(hotspot.id);
          const r = hotspot.kind === "doab" ? 6 : 5;

          return (
            <g key={hotspot.id}>
              <circle
                cx={point[0]}
                cy={point[1]}
                r={14}
                fill="transparent"
                className={cn(!disabled && onHotspotClick && "cursor-pointer")}
                pointerEvents={disabled || !onHotspotClick ? "none" : "all"}
                onClick={() => onHotspotClick?.(hotspot.id)}
                aria-label={hotspot.name}
                role="button"
              />
              <circle
                cx={point[0]}
                cy={point[1]}
                r={r + 2}
                className={cn(
                  "pointer-events-none fill-card stroke-border",
                  state !== "neutral" && "opacity-90"
                )}
                strokeWidth={1}
              />
              <circle
                cx={point[0]}
                cy={point[1]}
                r={r}
                className={cn(
                  DOT_FILL[state],
                  "pointer-events-none transition-colors duration-200",
                  state === "wrong-flash" && "animate-pulse"
                )}
              />
              {showLabel && (
                <Label
                  x={point[0] + 8}
                  y={point[1] - 6}
                  text={hotspot.shortLabel}
                />
              )}
            </g>
          );
        })}
      </g>
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

/** @deprecated Use TargetVisualState */
export type RiverVisualState = TargetVisualState;
