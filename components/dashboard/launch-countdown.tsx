"use client";

import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export function LaunchCountdown({ projection, kpis }: { projection: LaunchProjection; kpis: DashboardKpis }) {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    setNowMs(Date.now());
  }, [projection.projectedLaunchAt, projection.status]);

  useEffect(() => {
    if (projection.status !== "counting") return;
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [projection.status]);

  const targetMs = useMemo(() => {
    if (!projection.projectedLaunchAt) return null;
    const parsed = Date.parse(projection.projectedLaunchAt);
    return Number.isFinite(parsed) ? parsed : null;
  }, [projection.projectedLaunchAt]);

  const secondsRemaining = targetMs == null ? null : Math.max(0, Math.floor((targetMs - nowMs) / 1000));
  const countdown = secondsRemaining == null ? null : countdownParts(secondsRemaining);
  const liftoff = projection.status === "launched" || (projection.status === "counting" && secondsRemaining === 0);

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

  return (
    <Card className="launch-card border-slate-700 bg-slate-950 text-slate-100 shadow-[0_24px_54px_hsl(220_45%_5%_/_0.55)]">
      <CardHeader className="relative pb-1">
        <p className="text-[11px] font-mono uppercase tracking-[0.32em] text-cyan-200/80">Artemis Archive Program</p>
        <CardTitle className="mt-2 text-2xl font-bold tracking-wide text-white md:text-3xl">Countdown to Launch</CardTitle>
        <p className="mt-1 text-xs text-cyan-100/80">Projected from live tape completion velocity and queue depth.</p>
      </CardHeader>

      <CardContent className="relative space-y-5">
        <div className="rounded-md border border-cyan-300/25 bg-slate-950/65 p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-cyan-100/75">Mission Clock</p>
          <p className="launch-digit-glow mt-2 font-mono text-3xl font-semibold tracking-[0.16em] text-cyan-100 md:text-5xl">
            {missionClock}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`inline-flex rounded-full border px-2.5 py-1 font-mono uppercase tracking-[0.18em] ${confidenceClass(projection.confidence)}`}
            >
              {projection.confidence} confidence
            </span>
            <span className="rounded-full border border-slate-400/40 bg-slate-800/70 px-2.5 py-1 font-mono uppercase tracking-[0.18em] text-slate-100">
              {projection.status === "counting" ? "Go for launch" : projection.status === "launched" ? "Mission complete" : "Waiting for telemetry"}
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-300">
            Projected launch window:{" "}
            <span className="font-mono text-slate-100">{formatProjectionTime(projection.projectedLaunchAt)}</span>
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-slate-600/45 bg-slate-900/80 p-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Backlog</p>
            <p className="mt-1 font-mono text-2xl text-white">{projection.backlogCount}</p>
          </div>
          <div className="rounded-md border border-slate-600/45 bg-slate-900/80 p-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Velocity</p>
            <p className="mt-1 font-mono text-2xl text-white">{projection.throughputPerDay.toFixed(2)} tapes/day</p>
          </div>
          <div className="rounded-md border border-slate-600/45 bg-slate-900/80 p-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">ETA</p>
            <p className="mt-1 font-mono text-2xl text-white">
              {projection.estimatedDaysRemaining != null ? `${projection.estimatedDaysRemaining} days` : "TBD"}
            </p>
          </div>
        </div>

        <div className="space-y-3 rounded-md border border-slate-700/70 bg-slate-950/70 p-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-slate-300">Subsystem Readiness</p>
            <p className="text-[11px] text-slate-400">
              Recent completions: <span className="font-mono text-slate-200">{projection.recentCompletions}</span>
            </p>
          </div>
          {phaseProgress.map((phase) => {
            const pct = Math.max(0, Math.min(100, (phase.count / total) * 100));
            return (
              <div key={phase.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-300">
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
          <p className="text-[11px] text-slate-400">
            Basis: <span className="font-mono text-slate-300">{projectionBasis(projection)}</span> | Completion-date
            coverage: <span className="font-mono text-slate-300">{projection.completionDateCoveragePercent}%</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
