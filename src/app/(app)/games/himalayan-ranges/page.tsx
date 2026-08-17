import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { RangesHuntGame } from "@/components/games/himalayan-ranges/ranges-hunt-game";

export default function HimalayanRangesPage() {
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
        <h1 className="page-title mt-2">Himalayan Ranges & Passes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Explore the labeled atlas first, then Hunt to quiz ranges, peaks, and
          passes.
        </p>
      </div>
      <RangesHuntGame />
    </div>
  );
}
