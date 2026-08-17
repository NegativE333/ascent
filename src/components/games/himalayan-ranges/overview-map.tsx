"use client";

import { useMemo } from "react";
import {
  IndiaBasemap,
  type IndiaProjectionContext,
} from "@/components/maps/india-basemap";
import {
  DIVISIONS,
  NON_HIMALAYA_TARGET,
  OVERVIEW_PEAKS,
  RANGE_BANDS,
  REGION_TARGETS,
  REGIONS,
  type MapTarget,
  type MapTargetKind,
  type RegionId,
  type TargetVisualState,
} from "@/lib/games/himalayan-ranges/data";
import { cn } from "@/lib/utils";

export type RangesLayerFilter =
  | "all"
  | "ranges"
  | "divisions"
  | "peaks"
  | "passes"
  | "glaciers"
  | "valleys"
  | "places"
  | "regions";

type Props = {
  states?: Record<string, TargetVisualState>;
  labeledIds?: Set<string>;
  /** Explore category filter. */
  layerFilter?: RangesLayerFilter;
  /** Extra targets to plot (e.g. filtered passes from region data). */
  extraTargets?: MapTarget[];
  /**
   * Hunt mode: restrict which layers accept clicks.
   * Explore leaves this unset (everything visible is clickable).
   */
  huntClickable?:
    | "ranges"
    | "divisions"
    | "peaks"
    | "regions"
    | "all"
    | "trick";
  disabled?: boolean;
  onSelect: (id: string) => void;
  onOpenRegion?: (regionId: RegionId) => void;
  className?: string;
};

function polyline(
  ctx: IndiaProjectionContext,
  path: [number, number][]
): string | null {
  const pts: [number, number][] = [];
  for (const lngLat of path) {
    const p = ctx.project(lngLat);
    if (p) pts.push(p);
  }
  if (pts.length < 2) return null;
  return pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`)
    .join(" ");
}

const RANGE_STROKE: Record<string, string> = {
  "trans-himalaya": "stroke-stone-500/80 dark:stroke-stone-400/70",
  "greater-himalaya": "stroke-sky-700/75 dark:stroke-sky-400/80",
  "lesser-himalaya": "stroke-emerald-700/70 dark:stroke-emerald-400/75",
  "outer-himalaya": "stroke-amber-700/70 dark:stroke-amber-400/75",
};

const STATE_STROKE: Record<TargetVisualState, string> = {
  neutral: "stroke-foreground/40",
  correct: "stroke-emerald-600 dark:stroke-emerald-400",
  missed: "stroke-sky-600 dark:stroke-sky-400",
  "wrong-flash": "stroke-red-500",
};

const FILL: Record<TargetVisualState, string> = {
  neutral: "fill-foreground/50",
  correct: "fill-emerald-600 dark:fill-emerald-400",
  missed: "fill-sky-600 dark:fill-sky-400",
  "wrong-flash": "fill-red-500",
};

function showLayer(
  filter: RangesLayerFilter,
  layer: RangesLayerFilter | "hills"
): boolean {
  if (filter === "all") {
    // Default "all" still avoids dumping every pass/glacier — those need their chip.
    return (
      layer === "ranges" ||
      layer === "divisions" ||
      layer === "peaks" ||
      layer === "regions" ||
      layer === "hills"
    );
  }
  return filter === layer;
}

export function RangesOverviewMap({
  states = {},
  labeledIds = new Set(),
  layerFilter = "all",
  extraTargets = [],
  huntClickable,
  disabled,
  onSelect,
  onOpenRegion,
  className,
}: Props) {
  return (
    <IndiaBasemap
      className={className}
      width={560}
      height={640}
      padding={10}
      ariaLabel="Himalayan ranges overview"
    >
      {(ctx) => (
        <OverviewLayers
          ctx={ctx}
          states={states}
          labeledIds={labeledIds}
          layerFilter={layerFilter}
          extraTargets={extraTargets}
          huntClickable={huntClickable}
          disabled={disabled}
          onSelect={onSelect}
          onOpenRegion={onOpenRegion}
        />
      )}
    </IndiaBasemap>
  );
}

function OverviewLayers({
  ctx,
  states,
  labeledIds,
  layerFilter,
  extraTargets,
  huntClickable,
  disabled,
  onSelect,
  onOpenRegion,
}: {
  ctx: IndiaProjectionContext;
  states: Record<string, TargetVisualState>;
  labeledIds: Set<string>;
  layerFilter: RangesLayerFilter;
  extraTargets: MapTarget[];
  huntClickable?: Props["huntClickable"];
  disabled?: boolean;
  onSelect: (id: string) => void;
  onOpenRegion?: (regionId: RegionId) => void;
}) {
  const bands = useMemo(
    () =>
      RANGE_BANDS.map((t) => ({
        t,
        d: t.path ? polyline(ctx, t.path) : null,
      })),
    [ctx]
  );
  const divisions = useMemo(
    () =>
      DIVISIONS.map((t) => ({
        t,
        d: t.path ? polyline(ctx, t.path) : null,
        point: t.at ? ctx.project(t.at) : null,
      })),
    [ctx]
  );

  const canClick = (layer: NonNullable<Props["huntClickable"]>) => {
    if (disabled) return false;
    if (!huntClickable) return true;
    return huntClickable === "all" || huntClickable === layer;
  };

  return (
    <g>
      {showLayer(layerFilter, "ranges") &&
        bands.map(({ t, d }, i) => {
          if (!d) return null;
          const state = states[t.id] ?? "neutral";
          const stroke =
            state === "neutral"
              ? RANGE_STROKE[t.id] ?? STATE_STROKE.neutral
              : STATE_STROKE[state];
          return (
            <g key={t.id}>
              <path
                d={d}
                fill="none"
                stroke="transparent"
                strokeWidth={22}
                strokeLinecap="round"
                className={cn(canClick("ranges") && "cursor-pointer")}
                pointerEvents={canClick("ranges") ? "stroke" : "none"}
                onClick={() => onSelect(t.id)}
                aria-label={t.name}
                role="button"
              />
              <path
                d={d}
                fill="none"
                strokeWidth={4 + i * 0.25}
                strokeLinecap="round"
                className={cn(stroke, "pointer-events-none opacity-80")}
              />
              {labeledIds.has(t.id) &&
                t.path?.[Math.floor(t.path.length / 2)] && (
                  <PointLabel
                    ctx={ctx}
                    at={t.path[Math.floor(t.path.length / 2)]!}
                    text={t.shortLabel}
                  />
                )}
            </g>
          );
        })}

      {showLayer(layerFilter, "divisions") &&
        divisions.map(({ t, d, point }) => {
          if (!d) return null;
          const state = states[t.id] ?? "neutral";
          return (
            <g key={t.id}>
              <path
                d={d}
                fill="none"
                stroke="transparent"
                strokeWidth={20}
                strokeLinecap="round"
                className={cn(canClick("divisions") && "cursor-pointer")}
                pointerEvents={canClick("divisions") ? "stroke" : "none"}
                onClick={() => onSelect(t.id)}
                aria-label={t.name}
                role="button"
              />
              <path
                d={d}
                fill="none"
                strokeWidth={3}
                strokeDasharray="4 3"
                strokeLinecap="round"
                className={cn(
                  STATE_STROKE[state],
                  "pointer-events-none opacity-80"
                )}
              />
              {labeledIds.has(t.id) && point && (
                <Label x={point[0]} y={point[1]} text={t.shortLabel} />
              )}
            </g>
          );
        })}

      {showLayer(layerFilter, "peaks") &&
        OVERVIEW_PEAKS.map((t) => (
          <Marker
            key={t.id}
            ctx={ctx}
            target={t}
            state={states[t.id] ?? "neutral"}
            labeled={labeledIds.has(t.id)}
            active={canClick("peaks")}
            onSelect={onSelect}
          />
        ))}

      {showLayer(layerFilter, "regions") &&
        REGIONS.map((r) => {
          const point = ctx.project(r.at);
          if (!point) return null;
          const state = states[r.id] ?? "neutral";
          return (
            <g key={r.id}>
              <circle
                cx={point[0]}
                cy={point[1]}
                r={16}
                fill="transparent"
                className={cn(canClick("regions") && "cursor-pointer")}
                pointerEvents={canClick("regions") ? "all" : "none"}
                onClick={() => {
                  onSelect(r.id);
                  onOpenRegion?.(r.id);
                }}
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
              {labeledIds.has(r.id) && (
                <Label x={point[0] + 10} y={point[1] - 4} text={r.name} />
              )}
            </g>
          );
        })}

      {showLayer(layerFilter, "hills") && (
        <Marker
          ctx={ctx}
          target={NON_HIMALAYA_TARGET}
          state={states[NON_HIMALAYA_TARGET.id] ?? "neutral"}
          labeled={labeledIds.has(NON_HIMALAYA_TARGET.id)}
          active={canClick("trick") || canClick("all")}
          onSelect={onSelect}
        />
      )}

      {extraTargets.map((t) => (
        <Marker
          key={t.id}
          ctx={ctx}
          target={t}
          state={states[t.id] ?? "neutral"}
          labeled={labeledIds.has(t.id)}
          active={canClick("all")}
          onSelect={onSelect}
        />
      ))}
    </g>
  );
}

function Marker({
  ctx,
  target,
  state,
  labeled,
  active,
  onSelect,
}: {
  ctx: IndiaProjectionContext;
  target: MapTarget;
  state: TargetVisualState;
  labeled: boolean;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  if (!target.at) return null;
  const point = ctx.project(target.at);
  if (!point) return null;
  const [x, y] = point;

  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={14}
        fill="transparent"
        className={cn(active && "cursor-pointer")}
        pointerEvents={active ? "all" : "none"}
        onClick={() => onSelect(target.id)}
        aria-label={target.name}
        role="button"
      />
      <MarkerGlyph kind={target.kind} x={x} y={y} state={state} />
      {labeled && <Label x={x + 8} y={y - 6} text={target.shortLabel} />}
    </g>
  );
}

function MarkerGlyph({
  kind,
  x,
  y,
  state,
}: {
  kind: MapTargetKind;
  x: number;
  y: number;
  state: TargetVisualState;
}) {
  const fill = FILL[state];
  if (kind === "peak") {
    return (
      <polygon
        points={`${x},${y - 7} ${x + 6},${y + 5} ${x - 6},${y + 5}`}
        className={cn(fill, "pointer-events-none stroke-border")}
        strokeWidth={1}
      />
    );
  }
  if (kind === "pass") {
    // Notch / saddle shape
    return (
      <path
        d={`M ${x - 6} ${y + 4} L ${x - 2} ${y - 5} L ${x + 2} ${y - 5} L ${x + 6} ${y + 4} Z`}
        className={cn(fill, "pointer-events-none stroke-border")}
        strokeWidth={1}
      />
    );
  }
  if (kind === "glacier") {
    return (
      <ellipse
        cx={x}
        cy={y}
        rx={7}
        ry={5}
        className={cn(fill, "pointer-events-none stroke-border")}
        strokeWidth={1}
      />
    );
  }
  if (kind === "hills") {
    return (
      <polygon
        points={`${x},${y - 6} ${x + 6},${y} ${x},${y + 6} ${x - 6},${y}`}
        className={cn(fill, "pointer-events-none stroke-border")}
        strokeWidth={1}
      />
    );
  }
  // valley / place / default
  return (
    <>
      <circle
        cx={x}
        cy={y}
        r={6}
        className="pointer-events-none fill-card stroke-border"
        strokeWidth={1}
      />
      <circle
        cx={x}
        cy={y}
        r={3.5}
        className={cn(fill, "pointer-events-none")}
      />
    </>
  );
}

function PointLabel({
  ctx,
  at,
  text,
}: {
  ctx: IndiaProjectionContext;
  at: [number, number];
  text: string;
}) {
  const p = ctx.project(at);
  if (!p) return null;
  return <Label x={p[0]} y={p[1] - 8} text={text} />;
}

function Label({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <g transform={`translate(${x}, ${y})`} className="pointer-events-none">
      <rect
        x={-4}
        y={-10}
        rx={3}
        height={16}
        width={Math.max(40, text.length * 5.8 + 8)}
        className="fill-card stroke-border"
        strokeWidth={1}
      />
      <text
        x={4}
        y={2}
        className="fill-foreground"
        style={{ fontSize: 9, fontWeight: 500 }}
      >
        {text}
      </text>
    </g>
  );
}

/** Re-export for callers that plot region features on overview. */
export { REGION_TARGETS };
