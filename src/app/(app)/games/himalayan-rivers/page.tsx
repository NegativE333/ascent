import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { RiverHuntGame } from "@/components/games/himalayan-rivers/river-hunt-game";

export default function HimalayanRiversPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/games"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" />
          Games
        </Link>
        <h1 className="page-title mt-2">Himalayan River Hunt</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Explore the labeled map and facts, then switch to Hunt to quiz
          yourself — Indus, Ganga, and Brahmaputra systems.
        </p>
      </div>
      <RiverHuntGame />
    </div>
  );
}
