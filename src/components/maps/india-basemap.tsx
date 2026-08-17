"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { geoMercator, geoPath, type GeoPermissibleObjects } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { cn } from "@/lib/utils";

export type IndiaProjectionContext = {
  width: number;
  height: number;
  projection: ReturnType<typeof geoMercator>;
  pathGenerator: (object: GeoPermissibleObjects) => string | null;
  project: (lngLat: [number, number]) => [number, number] | null;
};

type IndiaBasemapProps = {
  className?: string;
  /** Intrinsic SVG size; viewBox scales responsively. */
  width?: number;
  height?: number;
  /** Padding inside the fitted bounds (px). */
  padding?: number;
  /**
   * Optional geographic frame for fitExtent (clockwise polygon on the sphere).
   * Defaults to all-India. Pass a tighter bbox for regional zoom panels.
   */
  fitFrame?: Feature;
  /** Accessible label for the SVG. */
  ariaLabel?: string;
  children?: (ctx: IndiaProjectionContext) => ReactNode;
};

const GEO_URL = "/geo/india-outline.geojson";

/**
 * Fixed geographic frame for India (incl. J&K/Ladakh). Used for fitExtent so the
 * basemap always fills the SVG — some outline files have spherical winding that
 * makes d3-geo treat the feature as covering the whole globe.
 */
const INDIA_FIT_FRAME: Feature = {
  type: "Feature",
  properties: {},
  geometry: {
    type: "Polygon",
    // Clockwise on the sphere → small patch (d3-geo), not the complementary globe.
    coordinates: [
      [
        [67.5, 6.0],
        [67.5, 37.6],
        [98.0, 37.6],
        [98.0, 6.0],
        [67.5, 6.0],
      ],
    ],
  },
};

export function IndiaBasemap({
  className,
  width = 560,
  height = 640,
  padding = 12,
  fitFrame = INDIA_FIT_FRAME,
  ariaLabel = "Map of India",
  children,
}: IndiaBasemapProps) {
  const [geo, setGeo] = useState<FeatureCollection<Geometry> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(GEO_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load map (${res.status})`);
        return res.json();
      })
      .then((data: FeatureCollection<Geometry>) => {
        if (!cancelled) setGeo(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load map");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const ctx = useMemo((): IndiaProjectionContext | null => {
    if (!geo) return null;
    const projection = geoMercator().fitExtent(
      [
        [padding, padding],
        [width - padding, height - padding],
      ],
      fitFrame
    );
    const path = geoPath(projection);
    return {
      width,
      height,
      projection,
      pathGenerator: (object) => path(object),
      project: (lngLat) => {
        const p = projection(lngLat);
        return p ? [p[0], p[1]] : null;
      },
    };
  }, [geo, width, height, padding, fitFrame]);

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-md border border-border bg-muted/40 text-sm text-muted-foreground",
          className
        )}
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        {error}
      </div>
    );
  }

  if (!ctx || !geo) {
    return (
      <div
        className={cn(
          "skeleton rounded-md border border-border",
          className
        )}
        style={{ aspectRatio: `${width} / ${height}` }}
        aria-busy
        aria-label="Loading map"
      />
    );
  }

  const outlinePath = geo.features
    .map((f) => ctx.pathGenerator(f))
    .filter(Boolean)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-auto w-full touch-manipulation", className)}
      role="img"
      aria-label={ariaLabel}
    >
      <rect width={width} height={height} fill="transparent" />
      <path
        d={outlinePath}
        className="fill-muted/60 stroke-border"
        strokeWidth={1}
        strokeLinejoin="round"
      />
      {children?.(ctx)}
    </svg>
  );
}

/** Default India fit frame — exported for games that compose custom zooms. */
export { INDIA_FIT_FRAME };
