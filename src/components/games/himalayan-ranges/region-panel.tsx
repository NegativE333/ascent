"use client";

import { useMemo } from "react";
import {
  IndiaBasemap,
  type IndiaProjectionContext,
} from "@/components/maps/india-basemap";
import {
  getRegion,
  targetsForRegion,
  type RegionId,
  type TargetVisualState,
} from "@/lib/games/himalayan-ranges/data";
import { OVERVIEW_PEAKS } from "@/lib/games/himalayan-ranges/data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

type Props = {
  regionId: RegionId;
  states?: Record<string, TargetVisualState>;
  labeledIds?: Set<string>;
  /** When set, only this marker is shown on the region map. */
  soloId?: string | null;
  disabled?: boolean;
  /** Hide back control when the current clue requires this panel. */
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
};

export function RegionZoomPanel({
  regionId,
  states = {},
  labeledIds = new Set(),
  soloId = null,
  disabled,
  lockBack,
  onSelect,
  onBack,
  className,
}: Props) {
  const region = getRegion(regionId);
  const targets = useMemo(() => {
    const local = targetsForRegion(regionId);
    const extras = OVERVIEW_PEAKS.filter((p) => {
      if (regionId === "nepal-sikkim") {
        return ["everest", "kanchenjunga"].includes(p.id);
      }
      if (regionId === "jk-ladakh") return p.id === "k2" || p.id === "nanga-parbat";
      if (regionId === "uttarakhand") {
        return p.id === "nanda-devi" || p.id === "kamet";
      }
      if (regionId === "arunachal") return p.id === "namcha-barwa";
      return false;
    }).map((p) => ({ ...p, regionId }));
    const ids = new Set(local.map((t) => t.id));
    const all = [...local, ...extras.filter((e) => !ids.has(e.id))];
    if (soloId) return all.filter((t) => t.id === soloId);
    return all;
  }, [regionId, soloId]);

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
            <RegionDots
              ctx={ctx}
              targets={targets}
              states={states}
              labeledIds={labeledIds}
              disabled={disabled}
              onSelect={onSelect}
            />
          )}
        </IndiaBasemap>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground px-0.5">
        {region.fact}
      </p>
    </div>
  );
}

function RegionDots({
  ctx,
  targets,
  states,
  labeledIds,
  disabled,
  onSelect,
}: {
  ctx: IndiaProjectionContext;
  targets: ReturnType<typeof targetsForRegion>;
  states: Record<string, TargetVisualState>;
  labeledIds: Set<string>;
  disabled?: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <g>
      {targets.map((t) => {
        if (!t.at) return null;
        const point = ctx.project(t.at);
        if (!point) return null;
        const state = states[t.id] ?? "neutral";
        const isPass = t.kind === "pass";
        return (
          <g key={t.id}>
            <circle
              cx={point[0]}
              cy={point[1]}
              r={16}
              fill="transparent"
              className={cn(!disabled && "cursor-pointer")}
              pointerEvents={disabled ? "none" : "all"}
              onClick={() => onSelect(t.id)}
              aria-label={t.name}
              role="button"
            />
            <circle
              cx={point[0]}
              cy={point[1]}
              r={isPass ? 7 : 6}
              className="pointer-events-none fill-card stroke-border"
              strokeWidth={1}
            />
            <circle
              cx={point[0]}
              cy={point[1]}
              r={isPass ? 4.5 : 3.5}
              className={cn(
                FILL[state],
                "pointer-events-none",
                state === "wrong-flash" && "animate-pulse"
              )}
            />
            {labeledIds.has(t.id) && (
              <g
                transform={`translate(${point[0] + 8}, ${point[1] - 6})`}
                className="pointer-events-none"
              >
                <rect
                  x={-4}
                  y={-10}
                  rx={3}
                  height={16}
                  width={Math.max(36, t.shortLabel.length * 5.8 + 8)}
                  className="fill-card stroke-border"
                  strokeWidth={1}
                />
                <text
                  x={4}
                  y={2}
                  className="fill-foreground"
                  style={{ fontSize: 9, fontWeight: 500 }}
                >
                  {t.shortLabel}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}
