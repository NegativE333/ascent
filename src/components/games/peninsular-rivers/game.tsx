"use client";

import { GameModeTabs } from "@/components/games/shared/game-mode-tabs";
import { PeninsularExplore } from "@/components/games/peninsular-rivers/explore";
import { PeninsularHunt } from "@/components/games/peninsular-rivers/hunt";

export function PeninsularRiversGame() {
  return (
    <GameModeTabs explore={<PeninsularExplore />} hunt={<PeninsularHunt />} />
  );
}
