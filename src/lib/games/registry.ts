import type { LucideIcon } from "lucide-react";
import { Mountain, Waves } from "lucide-react";

export type GameMeta = {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: LucideIcon;
};

/** Registry of available games — add an entry here to surface a new game on /games. */
export const GAMES: GameMeta[] = [
  {
    id: "himalayan-rivers",
    title: "Himalayan River Hunt",
    description:
      "Explore the labeled river map, then hunt rivers and places by clue.",
    route: "/games/himalayan-rivers",
    icon: Waves,
  },
  {
    id: "himalayan-ranges",
    title: "Himalayan Ranges & Passes",
    description:
      "Explore the labeled atlas, then hunt ranges, peaks, and passes on the map.",
    route: "/games/himalayan-ranges",
    icon: Mountain,
  },
];
