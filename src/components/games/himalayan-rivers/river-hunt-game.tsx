"use client";

import { GameModeTabs } from "@/components/games/shared/game-mode-tabs";
import { MapHuntMode } from "@/components/games/himalayan-rivers/map-hunt";
import { RiverExplore } from "@/components/games/himalayan-rivers/river-explore";

export function RiverHuntGame() {
  return <GameModeTabs explore={<RiverExplore />} hunt={<MapHuntMode />} />;
}
