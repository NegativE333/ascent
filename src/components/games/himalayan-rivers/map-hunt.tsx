"use client";

import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import {
  buildMapClueRound,
  IWT_EASTERN,
  IWT_FACTS,
  IWT_WESTERN,
  type MapClue,
} from "@/lib/games/himalayan-rivers/clues";
import { HOTSPOTS } from "@/lib/games/himalayan-rivers/hotspots";
import { RIVERS } from "@/lib/games/himalayan-rivers/rivers";
import {
  AnswerFeedback,
  QuizProgressHeader,
  QuizResults,
  type RecapItem,
} from "@/components/games/himalayan-rivers/quiz-chrome";
import { PrayagOrderPanel } from "@/components/games/himalayan-rivers/prayag-order";
import {
  RiverMap,
  type TargetVisualState,
} from "@/components/games/himalayan-rivers/river-map";
import { cn } from "@/lib/utils";

type Phase = "hunt" | "results" | "iwt" | "done";

type HuntState = {
  clues: MapClue[];
  index: number;
  score: number;
  streak: number;
  bestStreak: number;
  answers: { clueId: string; correct: boolean }[];
  riverFlash: Record<string, TargetVisualState>;
  hotspotFlash: Record<string, TargetVisualState>;
  labeledRivers: Set<string>;
  labeledHotspots: Set<string>;
  awaitingAdvance: boolean;
  lastCorrect: boolean | null;
};

function freshHunt(): HuntState {
  return {
    clues: buildMapClueRound(14),
    index: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    answers: [],
    riverFlash: {},
    hotspotFlash: {},
    labeledRivers: new Set(),
    labeledHotspots: new Set(),
    awaitingAdvance: false,
    lastCorrect: null,
  };
}

export function MapHuntMode() {
  const [phase, setPhase] = useState<Phase>("hunt");
  const [hunt, setHunt] = useState<HuntState | null>(null);

  useEffect(() => {
    setHunt(freshHunt());
  }, []);

  const restart = () => {
    setHunt(freshHunt());
    setPhase("hunt");
  };

  if (!hunt) {
    return (
      <div className="panel h-[420px] animate-pulse bg-muted/40" aria-busy />
    );
  }

  if (phase === "results") {
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
      <div className="space-y-4">
        <QuizResults
          score={hunt.score}
          total={hunt.clues.length}
          bestStreak={hunt.bestStreak}
          recap={recap}
          onPlayAgain={restart}
        />
        <div className="mx-auto max-w-lg">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setPhase("iwt")}
          >
            Bonus: Indus Waters Treaty
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "iwt" || phase === "done") {
    return (
      <IwtBonus
        done={phase === "done"}
        onDone={() => setPhase("done")}
        onRestart={restart}
      />
    );
  }

  return (
    <HuntRound
      hunt={hunt}
      setHunt={setHunt}
      onFinished={() => setPhase("results")}
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

  const finishOrAdvance = useCallback(
    (prev: HuntState): HuntState | "finished" => {
      const nextIndex = prev.index + 1;
      if (nextIndex >= prev.clues.length) return "finished";
      return {
        ...prev,
        index: nextIndex,
        awaitingAdvance: false,
        lastCorrect: null,
        riverFlash: {},
        hotspotFlash: {},
        labeledRivers: new Set(),
        labeledHotspots: new Set(),
      };
    },
    []
  );

  // Clear wrong-flash after a short pulse
  useEffect(() => {
    if (!hunt.awaitingAdvance) return;
    const wrongRiver = Object.entries(hunt.riverFlash).find(
      ([, s]) => s === "wrong-flash"
    )?.[0];
    const wrongHotspot = Object.entries(hunt.hotspotFlash).find(
      ([, s]) => s === "wrong-flash"
    )?.[0];
    if (!wrongRiver && !wrongHotspot) return;
    const timer = window.setTimeout(() => {
      setHunt((prev) => {
        if (!prev) return prev;
        const riverFlash = { ...prev.riverFlash };
        const hotspotFlash = { ...prev.hotspotFlash };
        if (wrongRiver) delete riverFlash[wrongRiver];
        if (wrongHotspot) delete hotspotFlash[wrongHotspot];
        return { ...prev, riverFlash, hotspotFlash };
      });
    }, 650);
    return () => window.clearTimeout(timer);
  }, [hunt.awaitingAdvance, hunt.riverFlash, hunt.hotspotFlash, setHunt]);

  const recordAnswer = useCallback(
    (
      correct: boolean,
      reveal: {
        riverId?: string;
        hotspotId?: string;
        wrongId?: string;
        wrongKind?: "river" | "hotspot";
      }
    ) => {
      setHunt((prev) => {
        if (!prev || !current || prev.awaitingAdvance) return prev;
        const streak = correct ? prev.streak + 1 : 0;
        const riverFlash: Record<string, TargetVisualState> = {};
        const hotspotFlash: Record<string, TargetVisualState> = {};
        const labeledRivers = new Set<string>();
        const labeledHotspots = new Set<string>();

        if (reveal.riverId) {
          riverFlash[reveal.riverId] = correct ? "correct" : "missed";
          labeledRivers.add(reveal.riverId);
        }
        if (reveal.hotspotId) {
          hotspotFlash[reveal.hotspotId] = correct ? "correct" : "missed";
          labeledHotspots.add(reveal.hotspotId);
        }
        if (reveal.wrongId && reveal.wrongKind === "river") {
          riverFlash[reveal.wrongId] = "wrong-flash";
        }
        if (reveal.wrongId && reveal.wrongKind === "hotspot") {
          hotspotFlash[reveal.wrongId] = "wrong-flash";
        }

        return {
          ...prev,
          score: prev.score + (correct ? 1 : 0),
          streak,
          bestStreak: Math.max(prev.bestStreak, streak),
          answers: [...prev.answers, { clueId: current.id, correct }],
          riverFlash,
          hotspotFlash,
          labeledRivers,
          labeledHotspots,
          awaitingAdvance: true,
          lastCorrect: correct,
        };
      });
    },
    [current, setHunt]
  );

  const onRiverClick = (riverId: string) => {
    if (!current || current.kind !== "river" || hunt.awaitingAdvance) return;
    const correct = riverId === current.targetId;
    recordAnswer(correct, {
      riverId: current.targetId,
      wrongId: correct ? undefined : riverId,
      wrongKind: "river",
    });
  };

  const onHotspotClick = (hotspotId: string) => {
    if (!current || current.kind !== "hotspot" || hunt.awaitingAdvance) return;
    const correct = hotspotId === current.targetId;
    recordAnswer(correct, {
      hotspotId: current.targetId,
      wrongId: correct ? undefined : hotspotId,
      wrongKind: "hotspot",
    });
  };

  /** Prayag panel already shows feedback — record and move on. */
  const onPrayagComplete = (correct: boolean) => {
    if (!current || current.kind !== "prayag-order" || hunt.awaitingAdvance) {
      return;
    }
    setHunt((prev) => {
      if (!prev || !current) return prev;
      const streak = correct ? prev.streak + 1 : 0;
      const updated: HuntState = {
        ...prev,
        score: prev.score + (correct ? 1 : 0),
        streak,
        bestStreak: Math.max(prev.bestStreak, streak),
        answers: [...prev.answers, { clueId: current.id, correct }],
        awaitingAdvance: false,
        lastCorrect: correct,
      };
      const next = finishOrAdvance(updated);
      if (next === "finished") {
        queueMicrotask(onFinished);
        return updated;
      }
      return next;
    });
  };

  const advance = () => {
    setHunt((prev) => {
      if (!prev) return prev;
      const next = finishOrAdvance(prev);
      if (next === "finished") {
        queueMicrotask(onFinished);
        return prev;
      }
      return next;
    });
  };

  if (!current) return null;

  const emphasize =
    current.kind === "river"
      ? "rivers"
      : current.kind === "hotspot"
        ? "hotspots"
        : "both";

  return (
    <div className="space-y-4">
      <QuizProgressHeader
        questionLabel={`Question ${hunt.index + 1}/${total}`}
        title={current.prompt}
        subtitle={
          current.kind === "river"
            ? "Tap a river"
            : current.kind === "hotspot"
              ? "Tap a place marker"
              : "Order the confluences"
        }
        score={hunt.score}
        streak={hunt.streak}
        bestStreak={hunt.bestStreak}
        progress={progress}
      />

      {current.kind === "prayag-order" ? (
        <div className="mx-auto max-w-lg">
          <PrayagOrderPanel onComplete={onPrayagComplete} />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="panel overflow-hidden p-2 sm:p-3">
            <RiverMap
              rivers={RIVERS}
              hotspots={HOTSPOTS}
              riverStates={hunt.riverFlash}
              hotspotStates={hunt.hotspotFlash}
              labeledRiverIds={hunt.labeledRivers}
              labeledHotspotIds={hunt.labeledHotspots}
              emphasize={emphasize}
              disabled={hunt.awaitingAdvance}
              onRiverClick={
                current.kind === "river" ? onRiverClick : undefined
              }
              onHotspotClick={
                current.kind === "hotspot" ? onHotspotClick : undefined
              }
            />
          </div>

          <aside className="space-y-3">
            <div className="panel p-4">
              <p className="section-label">How to play</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {current.kind === "river"
                  ? "Rivers are the thin paths. Hotspots are dimmed for this clue."
                  : "Tap a circular place marker. River paths are dimmed for this clue."}
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
      )}
    </div>
  );
}

function IwtBonus({
  done,
  onDone,
  onRestart,
}: {
  done: boolean;
  onDone: () => void;
  onRestart: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(done);

  const toggle = (id: string) => {
    if (submitted) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const riverStates = useMemo(() => {
    const states: Record<string, TargetVisualState> = {};
    if (!submitted) {
      for (const id of selected) states[id] = "selected";
      return states;
    }
    for (const id of IWT_WESTERN) states[id] = "western";
    for (const id of IWT_EASTERN) states[id] = "eastern";
    return states;
  }, [selected, submitted]);

  const labeled = useMemo(() => {
    if (!submitted) return new Set<string>();
    return new Set<string>([...IWT_WESTERN, ...IWT_EASTERN]);
  }, [submitted]);

  const westernCorrect =
    IWT_WESTERN.every((id) => selected.has(id)) &&
    [...selected].every((id) =>
      (IWT_WESTERN as readonly string[]).includes(id)
    );

  return (
    <div className="space-y-4">
      <div className="panel space-y-2 p-4">
        <p className="section-label">Bonus · Indus Waters Treaty</p>
        <h2 className="text-xl font-semibold tracking-tight">
          {submitted
            ? "Western vs Eastern rivers"
            : "Tap every Western River (Pakistan's share)"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {submitted
            ? "Amber = Western (Pakistan). Violet = Eastern (India)."
            : "Select Indus, Jhelum, and Chenab, then submit."}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="panel overflow-hidden p-2 sm:p-3">
          <RiverMap
            rivers={RIVERS}
            hotspots={[]}
            riverStates={riverStates}
            labeledRiverIds={labeled}
            emphasize="rivers"
            disabled={submitted}
            onRiverClick={toggle}
          />
        </div>

        <aside className="space-y-3">
          {!submitted ? (
            <div className="panel space-y-3 p-4">
              <p className="text-sm text-muted-foreground">
                Selected:{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {selected.size}
                </span>
              </p>
              <Button
                type="button"
                className="w-full"
                disabled={selected.size === 0}
                onClick={() => {
                  setSubmitted(true);
                  onDone();
                }}
              >
                Submit
              </Button>
            </div>
          ) : (
            <div className="panel space-y-3 p-4">
              <p
                className={cn(
                  "text-sm font-medium",
                  westernCorrect
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-muted-foreground"
                )}
              >
                {westernCorrect
                  ? "You got the Western Rivers right."
                  : "Western Rivers are Indus, Jhelum, and Chenab."}
              </p>
              <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                {IWT_FACTS.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <Button type="button" className="w-full" onClick={onRestart}>
                Play again
              </Button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
