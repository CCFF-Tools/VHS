"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Pause, Play, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PipelineFlowChart } from "@/components/charts/pipeline-flow-chart";
import { AcquisitionChart } from "@/components/charts/acquisition-chart";
import { HistogramChart } from "@/components/charts/histogram-chart";
import { LaunchCountdown } from "@/components/dashboard/launch-countdown";
import { SpaceshipAssemblySlide } from "@/components/presentation/spaceship-assembly-slide";
import { MissionStateSlide } from "@/components/presentation/mission-state-slide";
import { MissionColonizationSlide } from "@/components/presentation/mission-colonization-slide";
import { MissionBriefingContentSlide, MissionBriefingVisualsSlide } from "@/components/presentation/mission-lore-briefing-slide";
import { useOpsSummary } from "@/lib/hooks/use-api";
import { stageLabel } from "@/lib/stage-label";
import { formatDurationHMSFromMinutes } from "@/lib/runtime-format";
import { RUNTIME_BUCKETS } from "@/lib/runtime-buckets";
import type { LaunchProjection, TapeRecord } from "@/lib/types";

const SLIDE_INTERVAL_MS = 20000;
const MISSION_CHART_CLASS =
  "h-[300px] md:h-[360px] lg:h-[430px] xl:h-[520px] 2xl:h-[650px] [@media(min-width:2800px)]:h-[860px]";
const MISSION_PIPELINE_CHART_CLASS =
  "h-[340px] lg:h-[440px] xl:h-[540px] 2xl:h-[690px] [@media(min-width:2800px)]:h-[900px]";

function formatFeedDate(acquiredAt?: string, receivedDate?: string, updatedTime?: string) {
  const source = acquiredAt ?? receivedDate ?? updatedTime;
  if (!source) return "n/a";
  const parsed = new Date(source);
  if (Number.isNaN(parsed.getTime())) return "n/a";
  return format(parsed, "yyyy-MM-dd HH:mm");
}

function formatProjectedLaunch(value?: string) {
  if (!value) return "TBD";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "TBD";
  return format(parsed, "yyyy-MM-dd HH:mm:ss");
}

function formatLaunchProjectionSource(projection: LaunchProjection) {
  if (projection.source === "capture-dates-count") {
    return `capture timestamps (${projection.throughputWindowDays}d window)`;
  }
  if (projection.source === "historical-capture-count") {
    return "historical capture throughput";
  }
  return "insufficient capture records";
}

function runtimeMinutesForTape(tape: TapeRecord, fallbackMinutes: number) {
  const value = tape.labelRuntimeMinutes ?? tape.qtRuntimeMinutes ?? tape.finalClipDurationMinutes;
  if (value == null || !Number.isFinite(value) || value < 0) return fallbackMinutes;
  return value;
}

function toDateKey(value?: string) {
  if (!value) return undefined;
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return undefined;
  return format(new Date(parsed), "yyyy-MM-dd");
}

function buildRuntimeHoursByDate({
  tapes,
  dates,
  fallbackMinutes,
  pickDate,
}: {
  tapes: TapeRecord[];
  dates: Array<{ date: string }>;
  fallbackMinutes: number;
  pickDate: (tape: TapeRecord) => string | undefined;
}) {
  const minutesByDate = new Map<string, number>();
  for (const tape of tapes) {
    const key = pickDate(tape);
    if (!key) continue;
    minutesByDate.set(
      key,
      (minutesByDate.get(key) ?? 0) + runtimeMinutesForTape(tape, fallbackMinutes)
    );
  }

  return dates.map((row) => ({
    date: row.date,
    count: Number((((minutesByDate.get(row.date) ?? 0) / 60)).toFixed(2)),
  }));
}

function bucketForRuntime(minutes: number) {
  for (const bucket of RUNTIME_BUCKETS) {
    if (minutes < bucket.min) continue;
    if (bucket.max == null || minutes <= bucket.max) return bucket.key;
  }
  return RUNTIME_BUCKETS[RUNTIME_BUCKETS.length - 1].key;
}

function buildRuntimeHistogramHours(
  tapes: TapeRecord[],
  field: "label" | "qt" | "final"
) {
  const bucketMinutes = new Map<string, number>(RUNTIME_BUCKETS.map((bucket) => [bucket.key, 0]));

  for (const tape of tapes) {
    const value =
      field === "label"
        ? tape.labelRuntimeMinutes
        : field === "qt"
          ? tape.qtRuntimeMinutes
          : tape.finalClipDurationMinutes;
    if (value == null || !Number.isFinite(value) || value < 0) continue;
    const bucket = bucketForRuntime(value);
    bucketMinutes.set(bucket, (bucketMinutes.get(bucket) ?? 0) + value);
  }

  return RUNTIME_BUCKETS.map((bucket) => ({
    bucket: bucket.key,
    count: Number((((bucketMinutes.get(bucket.key) ?? 0) / 60)).toFixed(2)),
  }));
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

function SlideHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-1.5 flex items-center justify-between gap-4 lg:mb-1.5">
      <div>
        <p className="font-mono text-[clamp(0.84rem,0.7vw,1.3rem)] uppercase tracking-[0.32em] text-cyan-200/70">
          VHS Mission Control // Meridia
        </p>
        <h1 className="mt-1 text-[clamp(2.45rem,3.1vw,5.5rem)] font-extrabold tracking-tight text-white">{title}</h1>
        {subtitle ? <p className="mt-1 text-[clamp(1.08rem,1.02vw,1.86rem)] text-cyan-100/80">{subtitle}</p> : null}
      </div>
      <div className="text-right text-cyan-50">
        <p className="font-mono text-[clamp(0.84rem,0.7vw,1.3rem)] uppercase tracking-[0.22em] text-cyan-200/70">
          Live Telemetry
        </p>
        <p className="font-mono text-[clamp(0.96rem,0.82vw,1.46rem)] opacity-80">
          {format(new Date(), "yyyy-MM-dd HH:mm:ss")}
        </p>
      </div>
    </header>
  );
}

export default function PresentationPage() {
  const { data, isLoading, error, mutate } = useOpsSummary();
  const [slide, setSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const router = useRouter();
  const deadlineIso = data?.missionState.deadline.iso;
  const deadlineMs = useMemo(() => {
    if (!deadlineIso) return null;
    const parsed = Date.parse(deadlineIso);
    return Number.isFinite(parsed) ? parsed : null;
  }, [deadlineIso]);

  const stageData = useMemo(
    () =>
      data?.stageCounts.map((row) => {
        const runtimeMinutes = data.missionState.runtime.stageMinutes[row.stage] ?? 0;
        const runtimeWeighted = data.missionState.runtime.coveragePercent > 0;
        const count = runtimeWeighted ? Number((runtimeMinutes / 60).toFixed(1)) : row.count;
        return { stage: stageLabel(row.stage), count };
      }) ?? [],
    [data?.stageCounts, data?.missionState.runtime.coveragePercent, data?.missionState.runtime.stageMinutes]
  );
  const runtimeDailyBars = useMemo(() => {
    if (!data || data.missionState.runtime.coveragePercent <= 0) return null;
    const fallbackMinutes = data.missionState.runtime.fallbackMinutesPerTape;
    return {
      captured: buildRuntimeHoursByDate({
        tapes: data.tapes,
        dates: data.capturedDaily,
        fallbackMinutes,
        pickDate: (tape) => toDateKey(tape.capturedAt),
      }),
      cataloged: buildRuntimeHoursByDate({
        tapes: data.tapes,
        dates: data.acquisitionDaily,
        fallbackMinutes,
        pickDate: (tape) => toDateKey(tape.updatedTime ?? tape.acquisitionAt ?? tape.receivedDate),
      }),
      content: buildRuntimeHoursByDate({
        tapes: data.tapes,
        dates: data.contentRecordedDaily,
        fallbackMinutes,
        pickDate: (tape) => toDateKey(tape.contentRecordedAt),
      }),
    };
  }, [data]);
  const runtimeHistogramBars = useMemo(() => {
    if (!data || data.missionState.runtime.coveragePercent <= 0) return null;
    return {
      label: buildRuntimeHistogramHours(data.tapes, "label"),
      qt: buildRuntimeHistogramHours(data.tapes, "qt"),
      final: buildRuntimeHistogramHours(data.tapes, "final"),
    };
  }, [data]);
  const projectedLaunchMs = useMemo(() => {
    if (!data?.launchProjection.projectedLaunchAt) return null;
    const parsed = Date.parse(data.launchProjection.projectedLaunchAt);
    return Number.isFinite(parsed) ? parsed : null;
  }, [data?.launchProjection.projectedLaunchAt]);
  const deadlineSecondsRemaining =
    deadlineMs == null ? null : Math.max(0, Math.floor((deadlineMs - nowMs) / 1000));
  const deadlineCountdown =
    deadlineSecondsRemaining == null ? null : countdownParts(deadlineSecondsRemaining);
  const deadlineReached = deadlineMs != null && deadlineSecondsRemaining === 0;
  const projectedAfterDeadline =
    projectedLaunchMs != null && deadlineMs != null && projectedLaunchMs > deadlineMs;
  const deadlineClockLabel =
    deadlineReached
      ? "WINDOW CLOSED"
      : !deadlineCountdown
        ? "TELEMETRY PENDING"
      : `D-${deadlineCountdown.days}:${deadlineCountdown.hours}:${deadlineCountdown.minutes}:${deadlineCountdown.seconds}`;
  const captureLaunchSummary = useMemo(() => {
    if (!data) return null;

    const throughputWindowDays = 21;
    const captureBacklogCount = Math.max(0, data.kpis.totalTapes - data.kpis.capturedCount);
    const recentCapturedCount = data.capturedDaily
      .slice(-throughputWindowDays)
      .reduce((sum, day) => sum + day.count, 0);

    let captureThroughputPerDay = recentCapturedCount / throughputWindowDays;
    let source = `captured-at (${throughputWindowDays}d window)`;

    if (captureThroughputPerDay <= 0 && data.kpis.capturedCount > 0) {
      const timelineStartCandidates = data.tapes
        .map((tape) => {
          const raw = tape.acquisitionAt ?? tape.receivedDate ?? tape.updatedTime ?? tape.capturedAt;
          if (!raw) return null;
          const parsed = Date.parse(raw);
          return Number.isFinite(parsed) ? parsed : null;
        })
        .filter((timestamp): timestamp is number => timestamp != null);

      if (timelineStartCandidates.length > 0) {
        const timelineStartMs = Math.min(...timelineStartCandidates);
        const activeDays = Math.max(1, Math.floor((Date.now() - timelineStartMs) / 86400000) + 1);
        captureThroughputPerDay = data.kpis.capturedCount / activeDays;
        source = "historical capture ratio";
      }
    }

    const throughputPerDay = Number(captureThroughputPerDay.toFixed(2));
    const estimatedDaysRemaining =
      captureBacklogCount === 0
        ? 0
        : throughputPerDay > 0
          ? Number((captureBacklogCount / throughputPerDay).toFixed(1))
          : undefined;

    return {
      backlogCount: captureBacklogCount,
      throughputPerDay,
      estimatedDaysRemaining,
      source,
    };
  }, [data]);

  const baseSlides = [
    {
      key: "deadline",
      title: "Signal Fade Deadline",
      subtitle: "Core Cascade countdown against the launch window",
      content: data ? (
        <Card className="launch-card flex h-full flex-col border-slate-700 bg-slate-950 text-slate-100">
          <CardHeader className="pb-2">
            <p className="text-[clamp(0.84rem,0.7vw,1.3rem)] font-mono uppercase tracking-[0.3em] text-cyan-200/75">
              Great Signal Fade Clock
            </p>
            <CardTitle className="text-[clamp(1.6rem,1.78vw,2.95rem)] text-cyan-50">
              {formatProjectedLaunch(data.missionState.deadline.iso)}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col justify-between gap-6">
            <p className="launch-digit-glow whitespace-nowrap text-center font-mono text-[clamp(2.8rem,7.5vw,10rem)] font-semibold leading-none tracking-[0.08em] text-cyan-100">
              {deadlineClockLabel}
            </p>
            <div className="grid gap-3 xl:gap-5 lg:grid-cols-3">
              <div className="rounded-md border border-slate-600/45 bg-slate-900/80 p-4">
                <p className="text-[clamp(0.78rem,0.66vw,1.1rem)] uppercase tracking-[0.16em] text-cyan-100/70">
                  Projected Launch
                </p>
                <p className="mt-1 font-mono text-[clamp(1.15rem,1.08vw,1.9rem)] text-cyan-50">
                  {formatProjectedLaunch(data.launchProjection.projectedLaunchAt)}
                </p>
              </div>
              <div className="rounded-md border border-slate-600/45 bg-slate-900/80 p-4">
                <p className="text-[clamp(0.78rem,0.66vw,1.1rem)] uppercase tracking-[0.16em] text-cyan-100/70">
                  Signal Fade Status
                </p>
                <p className="mt-1 text-[clamp(1.55rem,1.6vw,2.7rem)] font-semibold text-cyan-50">
                  {data.missionState.deadline.status === "missed" ? "Missed Window" : "Inside Window"}
                </p>
              </div>
              <div className="rounded-md border border-slate-600/45 bg-slate-900/80 p-4">
                <p className="text-[clamp(0.78rem,0.66vw,1.1rem)] uppercase tracking-[0.16em] text-cyan-100/70">
                  Trajectory
                </p>
                <p className={`mt-1 text-[clamp(1.55rem,1.6vw,2.7rem)] font-semibold ${projectedAfterDeadline ? "text-rose-200" : "text-emerald-200"}`}>
                  {projectedAfterDeadline ? "Missed Window" : "Inside Window"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null,
    },
    {
      key: "mission-state",
      title: "Mission State Contract",
      subtitle: "Assembly, planning, and colonization in one canonical object",
      content: data ? (
        <MissionStateSlide
          missionState={data.missionState}
          projectedLaunchAt={data.launchProjection.projectedLaunchAt}
        />
      ) : null,
    },
    {
      key: "lore-briefing",
      title: "Mission Briefing",
      subtitle: "Command directives for protecting NoCap's municipal archive.",
      content: data ? <MissionBriefingContentSlide /> : null,
    },
    {
      key: "lore-briefing-visuals",
      title: "Mission Briefing",
      subtitle: "Route and crew stations for the NoCap to Meridia mission.",
      content: data ? <MissionBriefingVisualsSlide missionState={data.missionState} nowMs={nowMs} /> : null,
    },
    {
      key: "launch",
      title: "Launch Readiness",
      subtitle: "Projected cargo evacuation against Signal Fade pressure",
      content: data ? (
        <div className="grid h-full gap-4 md:grid-cols-5">
          <div className="md:col-span-3">
            <LaunchCountdown
              projection={data.launchProjection}
              kpis={data.kpis}
              deadlineAt={data.missionState.deadline.iso}
              className="h-full"
              showFrameHeader={false}
              summaryOverride={
                captureLaunchSummary
                  ? {
                      backlogCount: captureLaunchSummary.backlogCount,
                      throughputPerDay: captureLaunchSummary.throughputPerDay,
                      estimatedDaysRemaining: captureLaunchSummary.estimatedDaysRemaining,
                      labelPrefix: "Capture",
                      throughputUnit: "tapes/day",
                    }
                  : undefined
              }
            />
          </div>
          <div className="md:col-span-2 grid gap-4 sm:grid-cols-2 md:grid-cols-1 [@media(min-width:2800px)]:grid-cols-2">
            <Card className="mission-panel">
              <CardContent className="py-4">
                <p className="text-[clamp(0.88rem,0.74vw,1.24rem)] uppercase tracking-[0.16em] text-cyan-100/65">
                  Projected Launch Window
                </p>
                <p className="mt-1 font-mono text-[clamp(1.3rem,1.25vw,2.2rem)] font-semibold text-cyan-50">
                  {formatProjectedLaunch(data.launchProjection.projectedLaunchAt)}
                </p>
              </CardContent>
            </Card>
            <Card className="mission-panel">
              <CardContent className="py-4">
                <p className="text-[clamp(0.88rem,0.74vw,1.24rem)] uppercase tracking-[0.16em] text-cyan-100/65">
                  Completion Status
                </p>
                <p className="mt-1 text-[clamp(2.2rem,2.45vw,4.3rem)] font-bold leading-none text-white">
                  {data.launchProjection.completedCount}/{data.kpis.totalTapes}
                </p>
              </CardContent>
            </Card>
            <Card className="mission-panel">
              <CardContent className="py-4">
                <p className="text-[clamp(0.88rem,0.74vw,1.24rem)] uppercase tracking-[0.16em] text-cyan-100/65">
                  Velocity
                </p>
                <p className="mt-1 font-mono text-[clamp(2.2rem,2.45vw,4.3rem)] font-bold leading-none text-white">
                  {(captureLaunchSummary?.throughputPerDay ?? data.launchProjection.throughputPerDay).toFixed(2)}
                </p>
                <p className="mt-1 text-[clamp(0.86rem,0.7vw,1.16rem)] text-cyan-100/65">
                  tapes/day ({captureLaunchSummary?.source ?? formatLaunchProjectionSource(data.launchProjection)})
                </p>
              </CardContent>
            </Card>
            <Card className="mission-panel">
              <CardContent className="py-4">
                <p className="text-[clamp(0.88rem,0.74vw,1.24rem)] uppercase tracking-[0.16em] text-cyan-100/65">
                  Confidence
                </p>
                <p className="mt-1 text-[clamp(2.2rem,2.45vw,4.3rem)] font-bold uppercase leading-none text-white">
                  {data.launchProjection.confidence}
                </p>
                <p className="mt-1 text-[clamp(0.86rem,0.7vw,1.16rem)] text-cyan-100/65">
                  Completion-date coverage: {data.launchProjection.completionDateCoveragePercent}%
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null,
    },
    {
      key: "overview",
      title: "Stage Distribution",
      subtitle:
        data && data.missionState.runtime.coveragePercent > 0
          ? "Runtime-weighted pipeline load (hours) by stage"
          : "Current pipeline load by stage",
      content: data ? (
        <div className="grid h-full gap-4 md:grid-cols-5">
          <Card className="mission-panel md:col-span-3">
            <CardHeader>
              <CardTitle className="text-cyan-50">
                {data.missionState.runtime.coveragePercent > 0 ? "Stage Runtime Load (hours)" : "Stage Distribution"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PipelineFlowChart data={stageData} theme="mission" className={MISSION_PIPELINE_CHART_CLASS} />
            </CardContent>
          </Card>
          <div className="md:col-span-2 grid gap-3 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
            {[
              ["Total Tapes", data.kpis.totalTapes],
              ["Awaiting Capture", data.kpis.awaitingCaptureCount],
              ["Captured", data.kpis.capturedCount],
              ["Trimmed", data.kpis.trimmedCount],
              ["Combined", data.kpis.combinedCount],
              ["Transferred", data.kpis.transferredCount],
              ["Cataloged Today", data.kpis.receivedToday],
            ].map(([label, value]) => (
              <Card key={label} className="mission-panel">
                <CardContent className="py-4">
                  <p className="text-[clamp(0.86rem,0.7vw,1.18rem)] uppercase tracking-[0.16em] text-cyan-100/65">
                    {label}
                  </p>
                  <p className="text-[clamp(2.2rem,2.5vw,4.4rem)] font-bold leading-none text-white">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : null,
    },
    {
      key: "throughput",
      title: "Cataloged + Capture Throughput",
      subtitle:
        data && runtimeDailyBars
          ? "Runtime-weighted bars (hours) with tape-count context"
          : "Last 30 days",
      content: data ? (
        <div className="grid h-full gap-4 md:grid-cols-3">
          <Card className="mission-panel flex h-full flex-col">
            <CardHeader>
              <CardTitle className="text-cyan-50">
                {runtimeDailyBars ? "Captured Runtime Per Day" : "Captured Per Day"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col">
              {data.capturedDateCoveragePercent > 0 ? (
                <>
                  <p className="mb-2 text-[clamp(0.78rem,0.62vw,1.06rem)] text-cyan-100/65">
                    Coverage: {data.capturedDateCoveragePercent}% have capture timestamps
                    {runtimeDailyBars ? ` | Runtime coverage: ${data.missionState.runtime.coveragePercent}%` : ""}
                  </p>
                  <AcquisitionChart
                    data={runtimeDailyBars?.captured ?? data.capturedDaily}
                    theme="mission"
                    className={MISSION_CHART_CLASS}
                  />
                </>
              ) : (
                <div className="flex h-[260px] items-center justify-center text-center text-sm text-cyan-100/65">
                  Capture timestamp field not available yet.
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="mission-panel flex h-full flex-col">
            <CardHeader>
              <CardTitle className="text-cyan-50">
                {runtimeDailyBars ? "Cataloged Runtime Per Day" : "Cataloged Per Day"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col">
              {runtimeDailyBars ? (
                <p className="mb-2 text-[clamp(0.78rem,0.62vw,1.06rem)] text-cyan-100/65">
                  Runtime-weighted bars. Tape counts remain in KPI cards and feed tables.
                </p>
              ) : null}
              <AcquisitionChart
                data={runtimeDailyBars?.cataloged ?? data.acquisitionDaily}
                theme="mission"
                className={MISSION_CHART_CLASS}
              />
            </CardContent>
          </Card>
          <Card className="mission-panel flex h-full flex-col">
            <CardHeader>
              <CardTitle className="text-cyan-50">
                {runtimeDailyBars ? "Source Recording Runtime Timeline" : "Projected Source Recording Timeline"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col">
              {data.contentRecordedCoveragePercent > 0 ? (
                <>
                  <p className="mb-2 text-[clamp(0.78rem,0.62vw,1.06rem)] text-cyan-100/65">
                    Coverage: {data.contentRecordedCoveragePercent}% have content recorded dates
                    {runtimeDailyBars ? ` | Runtime coverage: ${data.missionState.runtime.coveragePercent}%` : ""}
                  </p>
                  <AcquisitionChart
                    data={runtimeDailyBars?.content ?? data.contentRecordedDaily}
                    theme="mission"
                    className={MISSION_CHART_CLASS}
                  />
                </>
              ) : (
                <div className="flex h-[260px] items-center justify-center text-center text-sm text-cyan-100/65">
                  Content recorded date field not available yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null,
    },
    {
      key: "assembly",
      title: "Interplanetary Vessel Assembly",
      subtitle: "Capture builds the vessel while Trim + Combine lock mission planning.",
      content: data ? (
        <SpaceshipAssemblySlide missionState={data.missionState} />
      ) : null,
    },
    {
      key: "colonization",
      title: "Meridia Colonization Timeline",
      subtitle: "Archived cargo drives launch, cruise, Fluxfall landing, and The Stacks growth.",
      content: data ? (
        <MissionColonizationSlide
          missionState={data.missionState}
          projectedAfterDeadline={projectedAfterDeadline}
        />
      ) : null,
    },
    {
      key: "runtime",
      title: "Runtime Intelligence",
      subtitle: runtimeHistogramBars
        ? "Runtime-volume bars (hours) by source/output fields"
        : "Distribution by source/output runtime fields",
      content: data ? (
        <div className="grid h-full gap-4 md:grid-cols-3">
          <Card className="mission-panel flex h-full flex-col">
            <CardHeader>
              <CardTitle className="text-cyan-50">
                {runtimeHistogramBars ? "Meeting Runtime Volume (hours)" : "Meeting Runtime Distribution"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col">
              {runtimeHistogramBars ? (
                <p className="mb-2 text-[clamp(0.78rem,0.62vw,1.06rem)] text-cyan-100/65">
                  Bars show runtime hours per bucket. Tape counts remain in KPI cards and drilldown rows.
                </p>
              ) : null}
              <HistogramChart
                data={runtimeHistogramBars?.label ?? data.runtimeHistograms.labelRuntime}
                theme="mission"
                className={MISSION_CHART_CLASS}
              />
            </CardContent>
          </Card>
          <Card className="mission-panel flex h-full flex-col">
            <CardHeader>
              <CardTitle className="text-cyan-50">
                {runtimeHistogramBars ? "QT Runtime Volume (hours)" : "QT Runtime Distribution"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col">
              <HistogramChart
                data={runtimeHistogramBars?.qt ?? data.runtimeHistograms.qtRuntime}
                theme="mission"
                className={MISSION_CHART_CLASS}
              />
            </CardContent>
          </Card>
          <Card className="mission-panel flex h-full flex-col">
            <CardHeader>
              <CardTitle className="text-cyan-50">
                {runtimeHistogramBars ? "Final Runtime Volume (hours)" : "Final Runtime Distribution"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col">
              <HistogramChart
                data={runtimeHistogramBars?.final ?? data.runtimeHistograms.finalRuntime}
                theme="mission"
                className={MISSION_CHART_CLASS}
              />
            </CardContent>
          </Card>
        </div>
      ) : null,
    },
    {
      key: "recent",
      title: "Recent Cataloged Feed",
      subtitle: "Newest records with runtime + progression flags",
      content: data ? (
        <Card className="mission-panel flex h-full flex-col text-cyan-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-cyan-50">Top 12 Most Recent</CardTitle>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col">
            <div className="mb-3 grid grid-cols-2 gap-2 text-[clamp(0.9rem,0.76vw,1.24rem)] text-cyan-100/80 xl:grid-cols-4">
              <div className="rounded-md border border-cyan-300/20 bg-slate-900/75 px-3 py-2">
                Avg Label RT:{" "}
                <span className="font-semibold text-cyan-50">{formatDurationHMSFromMinutes(data.runtimeStats.labelAverage)}</span>
              </div>
              <div className="rounded-md border border-cyan-300/20 bg-slate-900/75 px-3 py-2">
                Avg QT RT:{" "}
                <span className="font-semibold text-cyan-50">{formatDurationHMSFromMinutes(data.runtimeStats.qtAverage)}</span>
              </div>
              <div className="rounded-md border border-cyan-300/20 bg-slate-900/75 px-3 py-2">
                Avg Final RT:{" "}
                <span className="font-semibold text-cyan-50">{formatDurationHMSFromMinutes(data.runtimeStats.finalAverage)}</span>
              </div>
              <div className="rounded-md border border-cyan-300/20 bg-slate-900/75 px-3 py-2">
                Avg Drift:{" "}
                <span className="font-semibold text-cyan-50">{formatDurationHMSFromMinutes(data.runtimeStats.driftAverage)}</span>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto rounded-md border border-cyan-300/25">
              <table className="w-full text-[clamp(0.92rem,0.8vw,1.3rem)] text-cyan-50">
                <thead className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm">
                  <tr className="text-left text-cyan-100/80">
                    <th className="px-3 py-2.5 font-mono uppercase tracking-[0.12em]">Tape</th>
                    <th className="px-3 py-2.5 font-mono uppercase tracking-[0.12em]">Cataloged</th>
                    <th className="px-3 py-2.5 font-mono uppercase tracking-[0.12em]">Runtimes (L / QT / F)</th>
                    <th className="px-3 py-2.5 font-mono uppercase tracking-[0.12em]">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentAcquisitions.length > 0 ? (
                    data.recentAcquisitions.slice(0, 12).map((t) => (
                      <tr key={t.id} className="border-t border-cyan-300/20 text-cyan-50">
                        <td className="px-3 py-2.5">
                          <p className="font-mono text-[clamp(0.8rem,0.66vw,1.08rem)] text-cyan-100/80">{t.tapeId}</p>
                          <p className="font-semibold text-cyan-50">{t.tapeName}</p>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[clamp(0.82rem,0.68vw,1.1rem)] text-cyan-100/80">
                          {formatFeedDate(t.acquisitionAt, t.receivedDate, t.updatedTime)}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[clamp(0.84rem,0.7vw,1.12rem)]">
                          L {formatDurationHMSFromMinutes(t.labelRuntimeMinutes)} | QT {formatDurationHMSFromMinutes(t.qtRuntimeMinutes)} | F{" "}
                          {formatDurationHMSFromMinutes(t.finalClipDurationMinutes)}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[clamp(0.84rem,0.7vw,1.12rem)]">
                          C {t.captured ? "Y" : "N"} · T {t.trimmed ? "Y" : "N"} · Cb {t.combined ? "Y" : "N"} · NAS{" "}
                          {t.transferredToNas ? "Y" : "N"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-t border-cyan-300/20">
                      <td colSpan={4} className="py-4 text-center text-sm text-cyan-100/65">
                        No catalog rows available yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null,
    },
  ];

  const slideByKey = (key: string) => baseSlides.find((slide) => slide.key === key);
  const colonizationSlide = slideByKey("colonization");
  const slides = [
    slideByKey("deadline"),
    slideByKey("lore-briefing"),
    slideByKey("lore-briefing-visuals"),
    colonizationSlide,
    slideByKey("assembly"),
    slideByKey("launch"),
    colonizationSlide ? { ...colonizationSlide, key: "colonization-repeat" } : undefined,
    slideByKey("runtime"),
    slideByKey("recent"),
    slideByKey("overview"),
  ].filter((slide): slide is (typeof baseSlides)[number] => Boolean(slide));

  const totalSlides = slides.length;
  const autoRotateLabel = isPaused
    ? "Slides paused | Left/Right: slides | P: resume | Esc: return home"
    : "Auto-rotate every 20s | Left/Right: slides | P: pause | Esc: return home";

  useEffect(() => {
    const id = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const id = window.setTimeout(() => {
      setSlide((prev) => (prev + 1) % totalSlides);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearTimeout(id);
  }, [isPaused, slide, totalSlides]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") setSlide((prev) => (prev + 1) % totalSlides);
      if (event.key === "ArrowLeft") setSlide((prev) => (prev + totalSlides - 1) % totalSlides);
      if (event.key.toLowerCase() === "p") setIsPaused((prev) => !prev);
      if (event.key.toLowerCase() === "r") mutate();
      if (event.key === "Escape") router.push("/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mutate, router, totalSlides]);

  const current = slides[slide];

  return (
    <div className="presentation-wallboard presentation-mission-bg h-screen overflow-hidden p-1.5 text-white md:p-2 xl:p-3 [@media(min-width:2800px)]:p-4">
      <div className="relative z-10 mx-auto flex h-full w-full flex-col">
        <SlideHeader
          title={current.title}
          subtitle={current.subtitle}
        />

        {data &&
          current.key !== "deadline" &&
          current.key !== "assembly" &&
          current.key !== "mission-state" &&
          current.key !== "lore-briefing" &&
          current.key !== "lore-briefing-visuals" &&
          current.key !== "colonization-repeat" &&
          current.key !== "colonization" && (
          <div className="mission-alert-box mb-2 flex flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-5 lg:py-3 [@media(min-width:2800px)]:px-6 [@media(min-width:2800px)]:py-4">
            <div>
              <p className="text-[clamp(0.8rem,0.66vw,1.15rem)] font-mono uppercase tracking-[0.22em] text-cyan-100/70">
                Signal Fade Window
              </p>
              <p className="font-mono text-[clamp(0.9rem,0.74vw,1.3rem)] text-cyan-50">
                Deadline: {formatProjectedLaunch(data.missionState.deadline.iso)}
              </p>
            </div>
            <p className="launch-digit-glow font-mono text-[clamp(1.9rem,2.7vw,5.2rem)] font-semibold tracking-[0.13em] text-cyan-100">
              {deadlineClockLabel}
            </p>
            <div className="text-right text-[clamp(0.8rem,0.66vw,1.15rem)] text-cyan-100/70">
              <p>
                Projected launch:{" "}
                <span className="font-mono text-cyan-50">
                  {formatProjectedLaunch(data.launchProjection.projectedLaunchAt)}
                </span>
              </p>
              <p className={projectedAfterDeadline ? "text-rose-200" : "text-emerald-200"}>
                Trajectory: {projectedAfterDeadline ? "Missed Window" : "Inside Window"}
              </p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="mission-alert-box p-8 text-center text-cyan-50">
            Loading presentation data...
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-300/35 bg-rose-950/60 p-8 text-center text-rose-100">
            Presentation data unavailable: {error.message}
          </div>
        )}

        {data && <div className="min-h-0 flex-1 animate-floatIn">{current.content}</div>}

        <footer className="mt-1.5 flex items-center justify-between text-[clamp(0.84rem,0.72vw,1.26rem)] text-cyan-100/85">
          <p className="font-mono text-[clamp(0.76rem,0.62vw,1rem)] uppercase tracking-[0.12em] text-cyan-100/70">
            {autoRotateLabel}
          </p>
          <div className="flex items-center gap-2">
            <div
              className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[clamp(0.72rem,0.58vw,0.9rem)] uppercase tracking-[0.12em] ${
                isPaused
                  ? "border-amber-300/45 bg-amber-500/20 text-amber-100"
                  : "border-emerald-300/45 bg-emerald-500/20 text-emerald-100"
              }`}
              aria-live="polite"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isPaused ? "bg-amber-200" : "bg-emerald-200 animate-pulse"
                }`}
              />
              {isPaused ? "Paused" : "Playing"}
            </div>
            <button
              onClick={() => setIsPaused((prev) => !prev)}
              className="inline-flex items-center gap-1 rounded-md border border-cyan-300/35 bg-slate-900/65 px-2 py-1 text-cyan-50 hover:bg-slate-800/75"
            >
              {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              {isPaused ? "Resume Slides" : "Pause Slides"}
            </button>
            <button
              onClick={() => mutate()}
              className="inline-flex items-center gap-1 rounded-md border border-cyan-300/35 bg-slate-900/65 px-2 py-1 text-cyan-50 hover:bg-slate-800/75"
            >
              <RefreshCcw className="h-3.5 w-3.5" /> Refresh Data
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
