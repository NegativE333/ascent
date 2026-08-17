"use client";

import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  AnswerFeedback,
  QuizProgressHeader,
  QuizResults,
  type RecapItem,
} from "@/components/games/himalayan-rivers/quiz-chrome";
import { GameModeTabs } from "@/components/games/shared/game-mode-tabs";
import { RangesExplore } from "@/components/games/himalayan-ranges/ranges-explore";
import { RangesOverviewMap } from "@/components/games/himalayan-ranges/overview-map";
import { RegionZoomPanel } from "@/components/games/himalayan-ranges/region-panel";
import {
  buildRangesRound,
  type RangesClue,
} from "@/lib/games/himalayan-ranges/clues";
import {
  REGION_TARGETS,
  getTarget,
  type RegionId,
  type TargetVisualState,
} from "@/lib/games/himalayan-ranges/data";

type HuntState = {
  clues: RangesClue[];
  index: number;
  score: number;
  streak: number;
  bestStreak: number;
  answers: { clueId: string; correct: boolean }[];
  flash: Record<string, TargetVisualState>;
  labeled: Set<string>;
  awaitingAdvance: boolean;
  lastCorrect: boolean | null;
  openRegion: RegionId | null;
};

function freshHunt(): HuntState {
  return {
    clues: buildRangesRound(14),
    index: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    answers: [],
    flash: {},
    labeled: new Set(),
    awaitingAdvance: false,
    lastCorrect: null,
    openRegion: null,
  };
}

function huntClickableFor(
  clue: RangesClue
): "ranges" | "divisions" | "peaks" | "regions" | "all" | "trick" {
  if (clue.regionId) return "all";
  const t = getTarget(clue.targetId);
  if (!t) return "all";
  if (t.id === "garo-khasi-jaintia") return "trick";
  if (t.kind === "range") return "ranges";
  if (t.kind === "division") return "divisions";
  if (t.kind === "peak") return "peaks";
  if (t.kind === "region") return "regions";
  if (t.kind === "hills") return "trick";
  return "all";
}

export function RangesHuntGame() {
  return (
    <GameModeTabs explore={<RangesExplore />} hunt={<RangesHuntRound />} />
  );
}

function RangesHuntRound() {
  const [hunt, setHunt] = useState<HuntState | null>(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setHunt(freshHunt());
  }, []);

  const restart = () => {
    setFinished(false);
    setHunt(freshHunt());
  };

  if (!hunt) {
    return (
      <div className="panel h-[420px] animate-pulse bg-muted/40" aria-busy />
    );
  }

  if (finished) {
    const recap: RecapItem[] = hunt.answers.map((a) => {
      const clue = hunt.clues.find((c) => c.id === a.clueId);
      return {
        id: a.clueId,
        prompt: clue?.prompt ?? a.clueId,
        correct: a.correct,
        detail: clue
          ? `${clue.revealTitle}: ${clue.revealFact}`
          : undefined,
      };
    });
    return (
      <QuizResults
        score={hunt.score}
        total={hunt.clues.length}
        bestStreak={hunt.bestStreak}
        recap={recap}
        onPlayAgain={restart}
      />
    );
  }

  return (
    <HuntRound
      hunt={hunt}
      setHunt={setHunt}
      onFinished={() => setFinished(true)}
    />
  );
}

function HuntRound({
  hunt,
  setHunt,
  onFinished,
}: {
  hunt: HuntState;
  setHunt: Dispatch<SetStateAction<HuntState | null>>;
  onFinished: () => void;
}) {
  const current = hunt.clues[hunt.index];
  const total = hunt.clues.length;
  const progress = hunt.answers.length / total;

  useEffect(() => {
    if (!current?.regionId) return;
    setHunt((prev) => {
      if (!prev || prev.openRegion === current.regionId) return prev;
      return { ...prev, openRegion: current.regionId ?? null };
    });
  }, [current?.regionId, current?.id, setHunt]);

  useEffect(() => {
    if (!hunt.awaitingAdvance) return;
    const wrongId = Object.entries(hunt.flash).find(
      ([, s]) => s === "wrong-flash"
    )?.[0];
    if (!wrongId) return;
    const timer = window.setTimeout(() => {
      setHunt((prev) => {
        if (!prev?.flash[wrongId]) return prev;
        const flash = { ...prev.flash };
        delete flash[wrongId];
        return { ...prev, flash };
      });
    }, 650);
    return () => window.clearTimeout(timer);
  }, [hunt.awaitingAdvance, hunt.flash, setHunt]);

  const record = useCallback(
    (correct: boolean, selectedId: string) => {
      if (!current) return;
      setHunt((prev) => {
        if (!prev || prev.awaitingAdvance) return prev;
        const streak = correct ? prev.streak + 1 : 0;
        const flash: Record<string, TargetVisualState> = {
          [current.targetId]: correct ? "correct" : "missed",
        };
        if (!correct) flash[selectedId] = "wrong-flash";
        return {
          ...prev,
          score: prev.score + (correct ? 1 : 0),
          streak,
          bestStreak: Math.max(prev.bestStreak, streak),
          answers: [...prev.answers, { clueId: current.id, correct }],
          flash,
          labeled: new Set([current.targetId]),
          awaitingAdvance: true,
          lastCorrect: correct,
        };
      });
    },
    [current, setHunt]
  );

  const onSelect = (id: string) => {
    if (!current || hunt.awaitingAdvance) return;
    record(id === current.targetId, id);
  };

  const advance = () => {
    setHunt((prev) => {
      if (!prev) return prev;
      const nextIndex = prev.index + 1;
      if (nextIndex >= prev.clues.length) {
        queueMicrotask(onFinished);
        return prev;
      }
      const nextClue = prev.clues[nextIndex];
      return {
        ...prev,
        index: nextIndex,
        awaitingAdvance: false,
        lastCorrect: null,
        flash: {},
        labeled: new Set(),
        openRegion: nextClue?.regionId ?? null,
      };
    });
  };

  if (!current) return null;

  const inRegion = Boolean(current.regionId && hunt.openRegion);
  const extraTargets =
    current.regionId || huntClickableFor(current) !== "all"
      ? []
      : REGION_TARGETS.filter((t) => t.id === current.targetId);

  return (
    <div className="space-y-4">
      <QuizProgressHeader
        questionLabel={`Question ${hunt.index + 1}/${total}`}
        title={current.prompt}
        subtitle={
          inRegion
            ? "Zoomed region — tap the place"
            : "Overview — tap a range, peak, division, or region"
        }
        score={hunt.score}
        streak={hunt.streak}
        bestStreak={hunt.bestStreak}
        progress={progress}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          {inRegion && hunt.openRegion ? (
            <RegionZoomPanel
              regionId={hunt.openRegion}
              states={hunt.flash}
              labeledIds={hunt.labeled}
              disabled={hunt.awaitingAdvance}
              lockBack={Boolean(current.regionId)}
              onSelect={onSelect}
              onBack={() =>
                setHunt((prev) =>
                  prev && !current.regionId
                    ? { ...prev, openRegion: null }
                    : prev
                )
              }
            />
          ) : (
            <div className="panel overflow-hidden p-2 sm:p-3">
              <RangesOverviewMap
                layerFilter="all"
                extraTargets={extraTargets}
                states={hunt.flash}
                labeledIds={hunt.labeled}
                huntClickable={huntClickableFor(current)}
                disabled={hunt.awaitingAdvance}
                onSelect={onSelect}
                onOpenRegion={(rid) => {
                  if (current.regionId) return;
                  if (huntClickableFor(current) === "regions") return;
                  setHunt((prev) =>
                    prev ? { ...prev, openRegion: rid } : prev
                  );
                }}
              />
            </div>
          )}
        </div>

        <aside className="space-y-3">
          <div className="panel p-4">
            <p className="section-label">Hint</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {current.regionId
                ? "This clue lives in a region panel — tap the matching marker."
                : "Labels stay off in Hunt. Tap the feature that matches the clue."}
            </p>
          </div>

          {hunt.awaitingAdvance ? (
            <AnswerFeedback
              correct={Boolean(hunt.lastCorrect)}
              title={current.revealTitle}
              body={current.revealFact}
              nextLabel={
                hunt.index + 1 >= total ? "See results" : "Next clue"
              }
              onNext={advance}
            />
          ) : null}
        </aside>
      </div>
    </div>
  );
}
