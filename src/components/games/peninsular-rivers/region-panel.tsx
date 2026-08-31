"use client";

import { useMemo } from "react";
import { ChevronLeft } from "lucide-react";
import {
  IndiaBasemap,
  type IndiaProjectionContext,
} from "@/components/maps/india-basemap";
import { Button } from "@/components/ui/button";
import {
  getRegion,
  riversForRegion,
  type RegionId,
} from "@/lib/games/peninsular-rivers/data";
import type { TargetVisualState } from "@/components/games/peninsular-rivers/peninsular-map";
import { cn } from "@/lib/utils";

type Props = {
  regionId: RegionId;
  states?: Record<string, TargetVisualState>;
  labeledIds?: Set<string>;
  disabled?: boolean;
  lockBack?: boolean;
  onSelect: (id: string) => void;
  onBack: () => void;
  className?: string;
};

const FILL: Record<TargetVisualState, string> = {
  neutral: "fill-foreground/50",
  correct: "fill-emerald-600 dark:fill-emerald-400",
  missed: "fill-sky-600 dark:fill-sky-400",
  "wrong-flash": "fill-red-500",
  selected: "fill-foreground",
};

const STROKE: Record<TargetVisualState, string> = {
  neutral: "stroke-amber-700/75 dark:stroke-amber-400/80",
  correct: "stroke-emerald-600 dark:stroke-emerald-400",
  missed: "stroke-sky-600 dark:stroke-sky-400",
  "wrong-flash": "stroke-red-500",
  selected: "stroke-foreground",
};

export function PeninsularRegionPanel({
  regionId,
  states = {},
  labeledIds = new Set(),
  disabled,
  lockBack,
  onSelect,
  onBack,
  className,
}: Props) {
  const region = getRegion(regionId);
  const rivers = useMemo(() => riversForRegion(regionId), [regionId]);

  if (!region) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-2">
        {!lockBack ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1 text-muted-foreground"
            onClick={onBack}
          >
            <ChevronLeft className="size-3.5" />
            Overview
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">Region zoom</span>
        )}
        <p className="text-sm font-medium text-foreground">{region.name}</p>
      </div>

      <div className="panel overflow-hidden p-2 sm:p-3">
        <IndiaBasemap
          width={560}
          height={420}
          padding={16}
          fitFrame={region.fit}
          ariaLabel={`${region.name} map`}
        >
          {(ctx) => (
            <RegionRivers
              ctx={ctx}
              rivers={rivers}
              states={states}
              labeledIds={labeledIds}
              disabled={disabled}
              onSelect={onSelect}
            />
          )}
        </IndiaBasemap>
      </div>

      <p className="px-0.5 text-xs leading-relaxed text-muted-foreground">
        {region.fact}
      </p>
    </div>
  );
}

function RegionRivers({
  ctx,
  rivers,
  states,
  labeledIds,
  disabled,
  onSelect,
}: {
  ctx: IndiaProjectionContext;
  rivers: ReturnType<typeof riversForRegion>;
  states: Record<string, TargetVisualState>;
  labeledIds: Set<string>;
  disabled?: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <g>
      {rivers.map((river) => {
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
        const label = ctx.project(river.labelAt);
        const state = states[river.id] ?? "neutral";
        const stroke = STROKE[state];

        return (
          <g key={river.id}>
            <path
              d={d}
              fill="none"
              stroke="transparent"
              strokeWidth={22}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(!disabled && "cursor-pointer")}
              pointerEvents={disabled ? "none" : "stroke"}
              onClick={() => onSelect(river.id)}
              aria-label={river.name}
              role="button"
            />
            <path
              d={d}
              fill="none"
              strokeWidth={state === "neutral" ? 3 : 3.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(
                stroke,
                "pointer-events-none",
                state === "wrong-flash" && "animate-pulse"
              )}
            />
            {label && (
              <>
                <circle
                  cx={label[0]}
                  cy={label[1]}
                  r={5}
                  className={cn(FILL[state], "pointer-events-none")}
                />
                {labeledIds.has(river.id) && (
                  <g
                    transform={`translate(${label[0] + 8}, ${label[1] - 6})`}
                    className="pointer-events-none"
                  >
                    <rect
                      x={-4}
                      y={-10}
                      rx={3}
                      height={16}
                      width={Math.max(36, river.name.length * 5.8 + 8)}
                      className="fill-card stroke-border"
                      strokeWidth={1}
                    />
                    <text
                      x={4}
                      y={2}
                      className="fill-foreground"
                      style={{ fontSize: 9, fontWeight: 500 }}
                    >
                      {river.name}
                    </text>
                  </g>
                )}
              </>
            )}
          </g>
        );
      })}
    </g>
  );
}
