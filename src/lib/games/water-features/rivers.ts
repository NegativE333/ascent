import { RIVERS as HIMALAYAN_RIVERS } from "@/lib/games/himalayan-rivers/rivers";
import {
  OVERVIEW_RIVERS as PENINSULAR_OVERVIEW,
  REGION_RIVERS as PENINSULAR_REGION,
} from "@/lib/games/peninsular-rivers/data";

const PATHS = new Map<string, [number, number][]>();

for (const r of [
  ...HIMALAYAN_RIVERS,
  ...PENINSULAR_OVERVIEW,
  ...PENINSULAR_REGION,
]) {
  PATHS.set(r.id, r.path);
}

/** Minimal stubs for rivers not digitized in other games. */
const STUBS: Record<string, [number, number][]> = {
  son: [
    [81.5, 24.8],
    [82.2, 24.5],
    [82.8, 24.2],
  ],
  chambal: [
    [75.8, 26.5],
    [76.5, 26.0],
    [77.2, 25.5],
    [78.0, 25.0],
  ],
  banas: [
    [74.5, 25.8],
    [75.2, 25.5],
    [75.8, 25.2],
  ],
};

for (const [id, path] of Object.entries(STUBS)) {
  PATHS.set(id, path);
}

/** Fraction 0–1 along an existing river path from other games. */
export function pointOnRiver(riverId: string, t: number): [number, number] {
  const path = PATHS.get(riverId);
  if (!path?.length) return [78, 22];
  const clamped = Math.min(1, Math.max(0, t));
  const idx = Math.round(clamped * (path.length - 1));
  return path[idx]!;
}

export function riverPath(riverId: string): [number, number][] | undefined {
  return PATHS.get(riverId);
}

export const RIVER_IDS = [...PATHS.keys()] as string[];
