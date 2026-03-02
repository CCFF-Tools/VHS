"use client";

import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardKpis, LaunchProjection } from "@/lib/types";

function formatProjectionTime(value?: string) {
  if (!value) return "Awaiting sufficient throughput signal";
  try {
    return format(parseISO(value), "MMM d, yyyy HH:mm:ss");
  } catch {
    return value;
  }
}

function countdownParts(totalSeconds: number) {
  const clamped = Math.max(0, totalSeconds);
  const days = Math.floor(clamped / 86400);
  const hours = Math.floor((clamped % 86400) / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;
  return {
    days: String(days).padStart(3, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

function confidenceClass(confidence: LaunchProjection["confidence"]) {
  if (confidence === "high") return "border-emerald-300/50 bg-emerald-500/20 text-emerald-100";
  if (confidence === "medium") return "border-amber-300/50 bg-amber-500/20 text-amber-100";
  return "border-rose-300/50 bg-rose-500/20 text-rose-100";
}

function projectionBasis(projection: LaunchProjection) {
  if (projection.source === "completion-dates") {
    return `Completion timestamps (${projection.throughputWindowDays}d window)`;
  }
  if (projection.source === "historical-count") {
    return "Historical completion ratio";
  }
  return "Insufficient completed records";
}

function formatDeadlineTime(value?: string) {
  if (!value) return "n/a";
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return value;
  return format(new Date(parsed), "MMM d, yyyy HH:mm:ss");
}

interface SummaryOverride {
  backlogCount: number;
  throughputPerDay: number;
  estimatedDaysRemaining?: number;
  labelPrefix?: string;
  throughputUnit?: string;
}

export function LaunchCountdown({
  projection,
  kpis,
  deadlineAt,
  className,
  showFrameHeader = true,
  summaryOverride,
}: {
  projection: LaunchProjection;
  kpis: DashboardKpis;
  deadlineAt?: string;
  className?: string;
  showFrameHeader?: boolean;
  summaryOverride?: SummaryOverride;
}) {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    setNowMs(Date.now());
  }, [projection.projectedLaunchAt, projection.status, deadlineAt]);

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const targetMs = useMemo(() => {
    if (!projection.projectedLaunchAt) return null;
    const parsed = Date.parse(projection.projectedLaunchAt);
    return Number.isFinite(parsed) ? parsed : null;
  }, [projection.projectedLaunchAt]);
  const deadlineMs = useMemo(() => {
    if (!deadlineAt) return null;
    const parsed = Date.parse(deadlineAt);
    return Number.isFinite(parsed) ? parsed : null;
  }, [deadlineAt]);

  const secondsRemaining = targetMs == null ? null : Math.max(0, Math.floor((targetMs - nowMs) / 1000));
  const countdown = secondsRemaining == null ? null : countdownParts(secondsRemaining);
  const deadlineSecondsRemaining = deadlineMs == null ? null : Math.max(0, Math.floor((deadlineMs - nowMs) / 1000));
  const deadlineCountdown =
    deadlineSecondsRemaining == null ? null : countdownParts(deadlineSecondsRemaining);
  const liftoff = projection.status === "launched" || (projection.status === "counting" && secondsRemaining === 0);
  const deadlineReached = deadlineMs != null && deadlineSecondsRemaining === 0;
  const projectedMissesDeadline = targetMs != null && deadlineMs != null && targetMs > deadlineMs;

  const missionClock =
    projection.status === "counting" && countdown
      ? `T-${countdown.days}:${countdown.hours}:${countdown.minutes}:${countdown.seconds}`
      : liftoff
        ? "LIFTOFF"
        : "TRAJECTORY PENDING";

  const total = Math.max(1, kpis.totalTapes);
  const phaseProgress = [
    { label: "Capture", count: kpis.capturedCount },
    { label: "Trim", count: kpis.trimmedCount },
    { label: "Combine", count: kpis.combinedCount },
    { label: "Transfer", count: kpis.transferredCount },
  ];
  const summaryPrefix = summaryOverride?.labelPrefix?.trim();
  const backlogLabel = summaryPrefix ? `${summaryPrefix} Backlog` : "Backlog";
  const velocityLabel = summaryPrefix ? `${summaryPrefix} Velocity` : "Velocity";
  const etaLabel = summaryPrefix ? `${summaryPrefix} ETA` : "ETA";
  const summaryBacklog = summaryOverride?.backlogCount ?? projection.backlogCount;
  const summaryThroughput = summaryOverride?.throughputPerDay ?? projection.throughputPerDay;
  const summaryEta = summaryOverride?.estimatedDaysRemaining ?? projection.estimatedDaysRemaining;
  const throughputUnit = summaryOverride?.throughputUnit ?? "tapes/day";

  return (
    <Card
      className={cn(
        "launch-card border-slate-700 bg-slate-950 text-slate-100 shadow-[0_24px_54px_hsl(220_45%_5%_/_0.55)]",
        className
      )}
    >
      {showFrameHeader && (
        <CardHeader className="relative pb-1">
          <p className="text-[11px] font-mono uppercase tracking-[0.32em] text-cyan-200/80">
            Artemis Archive Program
          </p>
          <CardTitle className="mt-2 text-2xl font-bold tracking-wide text-white md:text-3xl">
            Countdown to Launch
          </CardTitle>
          <p className="mt-1 text-xs text-cyan-100/80">
            Projected from live tape completion velocity and queue depth.
          </p>
        </CardHeader>
      )}

      <CardContent className="relative space-y-5">
        <div className="rounded-md border border-cyan-300/25 bg-slate-950/65 p-4">
          <p className="font-mono text-[clamp(0.78rem,0.64vw,1.18rem)] uppercase tracking-[0.3em] text-cyan-100/75">
            Mission Clock
          </p>
          <p className="launch-digit-glow mt-2 font-mono text-[clamp(2.2rem,2.8vw,5.1rem)] font-semibold tracking-[0.14em] text-cyan-100">
            {missionClock}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[clamp(0.78rem,0.64vw,1.1rem)]">
            <span
              className={`inline-flex rounded-full border px-2.5 py-1 font-mono uppercase tracking-[0.18em] ${confidenceClass(projection.confidence)}`}
            >
              {projection.confidence} confidence
            </span>
            <span className="rounded-full border border-slate-400/40 bg-slate-800/70 px-2.5 py-1 font-mono uppercase tracking-[0.18em] text-slate-100">
              {projection.status === "counting" ? "Go for launch" : projection.status === "launched" ? "Mission complete" : "Waiting for telemetry"}
            </span>
          </div>
          <p className="mt-3 text-[clamp(0.8rem,0.66vw,1.16rem)] text-slate-300">
            Projected launch window:{" "}
            <span className="font-mono text-slate-100">{formatProjectionTime(projection.projectedLaunchAt)}</span>
          </p>
          {deadlineMs != null && (
            <>
              <p className="mt-2 text-[clamp(0.8rem,0.66vw,1.16rem)] text-slate-300">
                Launch window deadline:{" "}
                <span className="font-mono text-slate-100">{formatDeadlineTime(deadlineAt)}</span>
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[clamp(0.78rem,0.64vw,1.1rem)]">
                <span className="rounded-full border border-cyan-300/35 bg-cyan-500/15 px-2.5 py-1 font-mono uppercase tracking-[0.18em] text-cyan-100">
                  {deadlineReached || !deadlineCountdown
                    ? "Window closed"
                    : `D-${deadlineCountdown.days}:${deadlineCountdown.hours}:${deadlineCountdown.minutes}:${deadlineCountdown.seconds}`}
                </span>
                {projectedMissesDeadline && (
                  <span className="rounded-full border border-rose-300/45 bg-rose-500/20 px-2.5 py-1 font-mono uppercase tracking-[0.18em] text-rose-100">
                    Projected after deadline
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-slate-600/45 bg-slate-900/80 p-3">
            <p className="text-[clamp(0.76rem,0.6vw,1.06rem)] uppercase tracking-[0.2em] text-slate-400">{backlogLabel}</p>
            <p className="mt-1 font-mono text-[clamp(1.8rem,2vw,3.4rem)] text-white">{summaryBacklog}</p>
          </div>
          <div className="rounded-md border border-slate-600/45 bg-slate-900/80 p-3">
            <p className="text-[clamp(0.76rem,0.6vw,1.06rem)] uppercase tracking-[0.2em] text-slate-400">{velocityLabel}</p>
            <p className="mt-1 font-mono text-[clamp(1.8rem,2vw,3.4rem)] text-white">{summaryThroughput.toFixed(2)} {throughputUnit}</p>
          </div>
          <div className="rounded-md border border-slate-600/45 bg-slate-900/80 p-3">
            <p className="text-[clamp(0.76rem,0.6vw,1.06rem)] uppercase tracking-[0.2em] text-slate-400">{etaLabel}</p>
            <p className="mt-1 font-mono text-[clamp(1.8rem,2vw,3.4rem)] text-white">
              {summaryEta != null ? `${summaryEta} days` : "TBD"}
            </p>
          </div>
        </div>

        <div className="space-y-3 rounded-md border border-slate-700/70 bg-slate-950/70 p-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[clamp(0.76rem,0.6vw,1.06rem)] uppercase tracking-[0.26em] text-slate-300">
              Subsystem Readiness
            </p>
            <p className="text-[clamp(0.76rem,0.6vw,1.06rem)] text-slate-400">
              Recent completions: <span className="font-mono text-slate-200">{projection.recentCompletions}</span>
            </p>
          </div>
          {phaseProgress.map((phase) => {
            const pct = Math.max(0, Math.min(100, (phase.count / total) * 100));
            return (
              <div key={phase.label} className="space-y-1">
                <div className="flex items-center justify-between text-[clamp(0.78rem,0.64vw,1.1rem)] text-slate-300">
                  <span className="font-mono uppercase tracking-[0.14em]">{phase.label}</span>
                  <span className="font-mono text-slate-100">
                    {phase.count}/{kpis.totalTapes}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-300 transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
          <p className="text-[clamp(0.76rem,0.6vw,1.06rem)] text-slate-400">
            Basis: <span className="font-mono text-slate-300">{projectionBasis(projection)}</span> | Completion-date
            coverage: <span className="font-mono text-slate-300">{projection.completionDateCoveragePercent}%</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
