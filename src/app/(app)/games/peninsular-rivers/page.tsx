import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PeninsularRiversGame } from "@/components/games/peninsular-rivers/game";

export default function PeninsularRiversPage() {
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
        <h1 className="page-title mt-2">Peninsular River Hunt</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Explore east- and west-flowing rivers on the labeled map, then hunt
          by clue — including Goa, Kerala, and Karnataka coast panels.
        </p>
      </div>
      <PeninsularRiversGame />
    </div>
  );
}
