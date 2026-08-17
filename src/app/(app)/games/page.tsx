import Link from "next/link";
import { GAMES } from "@/lib/games/registry";

export default function GamesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Games</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Short quizzes to lock in SSC CGL geography and more.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {GAMES.map((game) => {
          const Icon = game.icon;
          return (
            <li key={game.id}>
              <Link
                href={game.route}
                className="panel row-hover flex gap-3 p-4 transition-colors"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50 text-foreground">
                  <Icon className="size-5 opacity-80" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">
                    {game.title}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground leading-snug">
                    {game.description}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
