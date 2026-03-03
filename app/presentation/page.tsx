"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PipelineFlowChart } from "@/components/charts/pipeline-flow-chart";
import { AcquisitionChart } from "@/components/charts/acquisition-chart";
import { HistogramChart } from "@/components/charts/histogram-chart";
import { LaunchCountdown } from "@/components/dashboard/launch-countdown";
import { SpaceshipAssemblySlide } from "@/components/presentation/spaceship-assembly-slide";
import { MissionStateSlide } from "@/components/presentation/mission-state-slide";
import { MissionColonizationSlide } from "@/components/presentation/mission-colonization-slide";
import { MissionLoreBriefingSlide } from "@/components/presentation/mission-lore-briefing-slide";
import { useOpsSummary } from "@/lib/hooks/use-api";
import { stageLabel } from "@/lib/stage-label";
import { formatDurationHMSFromMinutes } from "@/lib/runtime-format";

const SLIDE_INTERVAL_MS = 20000;
const MISSION_CHART_CLASS =
  "h-[220px] md:h-[240px] lg:h-[280px] xl:h-[320px] 2xl:h-[380px] [@media(min-width:2800px)]:h-[520px]";
const MISSION_PIPELINE_CHART_CLASS =
  "h-[260px] lg:h-[320px] xl:h-[380px] 2xl:h-[460px] [@media(min-width:2800px)]:h-[620px]";

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
    <header className="mb-3 flex items-center justify-between gap-4 lg:mb-4">
      <div>
        <p className="font-mono text-[clamp(0.78rem,0.62vw,1.2rem)] uppercase tracking-[0.32em] text-cyan-200/70">
          VHS Mission Control // Meridia
        </p>
        <h1 className="mt-1 text-[clamp(2.3rem,2.9vw,5.2rem)] font-extrabold tracking-tight text-white">{title}</h1>
        {subtitle ? <p className="mt-1 text-[clamp(1rem,0.9vw,1.7rem)] text-cyan-100/80">{subtitle}</p> : null}
      </div>
      <div className="text-right text-cyan-50">
        <p className="font-mono text-[clamp(0.78rem,0.62vw,1.2rem)] uppercase tracking-[0.22em] text-cyan-200/70">
          Live Telemetry
        </p>
        <p className="font-mono text-[clamp(0.9rem,0.74vw,1.35rem)] opacity-80">
          {format(new Date(), "yyyy-MM-dd HH:mm:ss")}
        </p>
      </div>
    </header>
  );
}

export default function PresentationPage() {
  const { data, isLoading, error, mutate } = useOpsSummary();
  const [slide, setSlide] = useState(0);
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
      data?.stageCounts.map((row) => ({ stage: stageLabel(row.stage), count: row.count })) ?? [],
    [data?.stageCounts]
  );
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

  const slides = [
    {
      key: "deadline",
      title: "Signal Fade Deadline",
      subtitle: "Core Cascade countdown against the launch window",
      content: data ? (
        <Card className="launch-card flex h-full flex-col border-slate-700 bg-slate-950 text-slate-100">
          <CardHeader className="pb-3">
            <p className="text-[clamp(0.78rem,0.62vw,1.2rem)] font-mono uppercase tracking-[0.3em] text-cyan-200/75">
              Great Signal Fade Clock
            </p>
            <CardTitle className="text-[clamp(1.35rem,1.45vw,2.4rem)] text-cyan-50">
              {formatProjectedLaunch(data.missionState.deadline.iso)}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col justify-between gap-8">
            <p className="launch-digit-glow whitespace-nowrap text-center font-mono text-[clamp(2.8rem,7.5vw,10rem)] font-semibold leading-none tracking-[0.08em] text-cyan-100">
              {deadlineClockLabel}
            </p>
            <div className="grid gap-3 xl:gap-5 lg:grid-cols-3">
              <div className="rounded-md border border-slate-600/45 bg-slate-900/80 p-4">
                <p className="text-[clamp(0.68rem,0.56vw,0.98rem)] uppercase tracking-[0.16em] text-cyan-100/70">
                  Projected Launch
                </p>
                <p className="mt-1 font-mono text-[clamp(1rem,0.95vw,1.6rem)] text-cyan-50">
                  {formatProjectedLaunch(data.launchProjection.projectedLaunchAt)}
                </p>
              </div>
              <div className="rounded-md border border-slate-600/45 bg-slate-900/80 p-4">
                <p className="text-[clamp(0.68rem,0.56vw,0.98rem)] uppercase tracking-[0.16em] text-cyan-100/70">
                  Signal Fade Status
                </p>
                <p className="mt-1 text-[clamp(1.4rem,1.35vw,2.4rem)] font-semibold text-cyan-50">
                  {data.missionState.deadline.status === "missed" ? "Missed Window" : "Inside Window"}
                </p>
              </div>
              <div className="rounded-md border border-slate-600/45 bg-slate-900/80 p-4">
                <p className="text-[clamp(0.68rem,0.56vw,0.98rem)] uppercase tracking-[0.16em] text-cyan-100/70">
                  Trajectory
                </p>
                <p
                  className={`mt-1 text-[clamp(1.4rem,1.35vw,2.4rem)] font-semibold ${projectedAfterDeadline ? "text-rose-200" : "text-emerald-200"}`}
                >
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
      subtitle: "Backstory, stakes, and mission objectives for the Meridia evacuation.",
      content: data ? <MissionLoreBriefingSlide missionState={data.missionState} /> : null,
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
                <p className="text-[clamp(0.8rem,0.66vw,1.15rem)] uppercase tracking-[0.16em] text-cyan-100/65">
                  Projected Launch Window
                </p>
                <p className="mt-1 font-mono text-[clamp(1.2rem,1.15vw,2rem)] font-semibold text-cyan-50">
                  {formatProjectedLaunch(data.launchProjection.projectedLaunchAt)}
                </p>
              </CardContent>
            </Card>
            <Card className="mission-panel">
              <CardContent className="py-4">
                <p className="text-[clamp(0.8rem,0.66vw,1.15rem)] uppercase tracking-[0.16em] text-cyan-100/65">
                  Completion Status
                </p>
                <p className="mt-1 text-[clamp(2rem,2.2vw,3.9rem)] font-bold leading-none text-white">
                  {data.launchProjection.completedCount}/{data.kpis.totalTapes}
                </p>
              </CardContent>
            </Card>
            <Card className="mission-panel">
              <CardContent className="py-4">
                <p className="text-[clamp(0.8rem,0.66vw,1.15rem)] uppercase tracking-[0.16em] text-cyan-100/65">
                  Velocity
                </p>
                <p className="mt-1 font-mono text-[clamp(2rem,2.2vw,3.9rem)] font-bold leading-none text-white">
                  {(captureLaunchSummary?.throughputPerDay ?? data.launchProjection.throughputPerDay).toFixed(2)}
                </p>
                <p className="mt-1 text-[clamp(0.78rem,0.62vw,1.06rem)] text-cyan-100/65">
                  tapes/day ({captureLaunchSummary?.source ?? data.launchProjection.source})
                </p>
              </CardContent>
            </Card>
            <Card className="mission-panel">
              <CardContent className="py-4">
                <p className="text-[clamp(0.8rem,0.66vw,1.15rem)] uppercase tracking-[0.16em] text-cyan-100/65">
                  Confidence
                </p>
                <p className="mt-1 text-[clamp(2rem,2.2vw,3.9rem)] font-bold uppercase leading-none text-white">
                  {data.launchProjection.confidence}
                </p>
                <p className="mt-1 text-[clamp(0.78rem,0.62vw,1.06rem)] text-cyan-100/65">
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
      subtitle: "Current pipeline load by stage",
      content: data ? (
        <div className="grid h-full gap-4 md:grid-cols-5">
          <Card className="mission-panel md:col-span-3">
            <CardHeader>
              <CardTitle className="text-cyan-50">Stage Distribution</CardTitle>
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
                  <p className="text-[clamp(0.78rem,0.62vw,1.06rem)] uppercase tracking-[0.16em] text-cyan-100/65">
                    {label}
                  </p>
                  <p className="text-[clamp(2rem,2.3vw,4rem)] font-bold leading-none text-white">{value}</p>
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
      subtitle: "Last 30 days",
      content: data ? (
        <div className="grid h-full gap-4 md:grid-cols-3">
          <Card className="mission-panel flex h-full flex-col">
            <CardHeader>
              <CardTitle className="text-cyan-50">Captured Per Day</CardTitle>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col">
              {data.capturedDateCoveragePercent > 0 ? (
                <>
                  <p className="mb-2 text-[clamp(0.78rem,0.62vw,1.06rem)] text-cyan-100/65">
                    Coverage: {data.capturedDateCoveragePercent}% have capture timestamps
                  </p>
                  <AcquisitionChart data={data.capturedDaily} theme="mission" className={MISSION_CHART_CLASS} />
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
              <CardTitle className="text-cyan-50">Cataloged Per Day</CardTitle>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col">
              <AcquisitionChart data={data.acquisitionDaily} theme="mission" className={MISSION_CHART_CLASS} />
            </CardContent>
          </Card>
          <Card className="mission-panel flex h-full flex-col">
            <CardHeader>
              <CardTitle className="text-cyan-50">Projected Source Recording Timeline</CardTitle>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col">
              {data.contentRecordedCoveragePercent > 0 ? (
                <>
                  <p className="mb-2 text-[clamp(0.78rem,0.62vw,1.06rem)] text-cyan-100/65">
                    Coverage: {data.contentRecordedCoveragePercent}% have content recorded dates
                  </p>
                  <AcquisitionChart
                    data={data.contentRecordedDaily}
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
      title: "Orbiter Assembly Progress",
      subtitle: "Capture builds the ship while Trim + Combine lock mission planning.",
      content: data ? (
        <SpaceshipAssemblySlide
          kpis={data.kpis}
          stageCounts={data.stageCounts}
          missionState={data.missionState}
        />
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
      subtitle: "Distribution by source/output runtime fields",
      content: data ? (
        <div className="grid h-full gap-4 md:grid-cols-3">
          <Card className="mission-panel flex h-full flex-col">
            <CardHeader>
              <CardTitle className="text-cyan-50">Meeting Runtime Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col">
              <HistogramChart data={data.runtimeHistograms.labelRuntime} theme="mission" className={MISSION_CHART_CLASS} />
            </CardContent>
          </Card>
          <Card className="mission-panel flex h-full flex-col">
            <CardHeader>
              <CardTitle className="text-cyan-50">QT Runtime Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col">
              <HistogramChart data={data.runtimeHistograms.qtRuntime} theme="mission" className={MISSION_CHART_CLASS} />
            </CardContent>
          </Card>
          <Card className="mission-panel flex h-full flex-col">
            <CardHeader>
              <CardTitle className="text-cyan-50">Final Runtime Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col">
              <HistogramChart data={data.runtimeHistograms.finalRuntime} theme="mission" className={MISSION_CHART_CLASS} />
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
          <CardHeader>
            <CardTitle className="text-cyan-50">Top 30 Most Recent</CardTitle>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col">
            <div className="mb-3 grid grid-cols-4 gap-2 text-xs text-cyan-100/70">
              <p>Avg Label RT: <span className="font-semibold text-cyan-50">{formatDurationHMSFromMinutes(data.runtimeStats.labelAverage)}</span></p>
              <p>Avg QT RT: <span className="font-semibold text-cyan-50">{formatDurationHMSFromMinutes(data.runtimeStats.qtAverage)}</span></p>
              <p>Avg Final RT: <span className="font-semibold text-cyan-50">{formatDurationHMSFromMinutes(data.runtimeStats.finalAverage)}</span></p>
              <p>Avg Drift: <span className="font-semibold text-cyan-50">{formatDurationHMSFromMinutes(data.runtimeStats.driftAverage)}</span></p>
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
              <table className="w-full text-sm text-cyan-50">
                <thead className="sticky top-0 bg-slate-950/90 backdrop-blur-sm">
                  <tr className="text-left text-cyan-100/70">
                    <th className="py-2">📼</th>
                    <th>Name</th>
                    <th>Cataloged</th>
                    <th>Label</th>
                    <th>QT</th>
                    <th>Final</th>
                    <th>C/T/Cb/NAS</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentAcquisitions.length > 0 ? (
                    data.recentAcquisitions.slice(0, 30).map((t) => (
                      <tr key={t.id} className="border-t border-cyan-300/20 text-cyan-50">
                        <td className="py-2 font-mono text-xs">{t.tapeId}</td>
                        <td className="font-medium text-cyan-50">{t.tapeName}</td>
                        <td className="font-mono text-xs text-cyan-100/75">
                          {formatFeedDate(t.acquisitionAt, t.receivedDate, t.updatedTime)}
                        </td>
                        <td>{formatDurationHMSFromMinutes(t.labelRuntimeMinutes)}</td>
                        <td>{formatDurationHMSFromMinutes(t.qtRuntimeMinutes)}</td>
                        <td>{formatDurationHMSFromMinutes(t.finalClipDurationMinutes)}</td>
                        <td className="font-mono text-xs">
                          {t.captured ? "Y" : "N"}/{t.trimmed ? "Y" : "N"}/{t.combined ? "Y" : "N"}/
                          {t.transferredToNas ? "Y" : "N"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-t border-cyan-300/20">
                      <td colSpan={7} className="py-4 text-center text-sm text-cyan-100/65">
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

  const totalSlides = slides.length;

  useEffect(() => {
    const id = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSlide((prev) => (prev + 1) % totalSlides);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [totalSlides]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") setSlide((prev) => (prev + 1) % totalSlides);
      if (event.key === "ArrowLeft") setSlide((prev) => (prev + totalSlides - 1) % totalSlides);
      if (event.key.toLowerCase() === "r") mutate();
      if (event.key === "Escape") router.push("/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mutate, router, totalSlides]);

  const current = slides[slide];

  return (
    <div className="presentation-mission-bg h-screen overflow-hidden p-3 text-white md:p-5 xl:p-7 [@media(min-width:2800px)]:p-10">
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
          current.key !== "colonization" && (
          <div className="mission-alert-box mb-3 flex flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6 lg:py-4 [@media(min-width:2800px)]:px-8 [@media(min-width:2800px)]:py-5">
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

        <footer className="mt-3 flex items-center justify-between text-[clamp(0.82rem,0.7vw,1.22rem)] text-cyan-100/85">
          <p className="font-mono text-[clamp(0.76rem,0.62vw,1rem)] uppercase tracking-[0.12em] text-cyan-100/70">
            Auto-rotate every 20s | Left/Right: slides | Esc: return home
          </p>
          <button
            onClick={() => mutate()}
            className="inline-flex items-center gap-1 rounded-md border border-cyan-300/35 bg-slate-900/65 px-2 py-1 text-cyan-50 hover:bg-slate-800/75"
          >
            <RefreshCcw className="h-3.5 w-3.5" /> Refresh Data
          </button>
        </footer>
      </div>
    </div>
  );
}
