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
import { useOpsSummary } from "@/lib/hooks/use-api";
import { stageLabel } from "@/lib/stage-label";
import { formatDurationHMSFromMinutes } from "@/lib/runtime-format";

const SLIDE_INTERVAL_MS = 12000;

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

function SlideHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-4 flex items-center justify-between">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-cyan-200/70">VHS Mission Control</p>
        <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-white">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-cyan-100/80">{subtitle}</p> : null}
      </div>
      <div className="text-right text-cyan-50">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-200/70">Live Telemetry</p>
        <p className="font-mono text-xs opacity-80">{format(new Date(), "yyyy-MM-dd HH:mm:ss")}</p>
      </div>
    </header>
  );
}

export default function PresentationPage() {
  const { data, isLoading, error, mutate } = useOpsSummary();
  const [slide, setSlide] = useState(0);
  const router = useRouter();

  const stageData = useMemo(
    () =>
      data?.stageCounts.map((row) => ({ stage: stageLabel(row.stage), count: row.count })) ?? [],
    [data?.stageCounts]
  );

  const slides = [
    {
      key: "launch",
      title: "Launch Readiness",
      subtitle: "Projected mission completion from live queue + throughput",
      content: data ? (
        <div className="grid h-full gap-4 md:grid-cols-5">
          <div className="md:col-span-3">
            <LaunchCountdown projection={data.launchProjection} kpis={data.kpis} />
          </div>
          <div className="md:col-span-2 grid gap-4">
            <Card className="mission-panel">
              <CardContent className="py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/65">Projected Launch Window</p>
                <p className="mt-1 font-mono text-lg font-semibold text-cyan-50">
                  {formatProjectedLaunch(data.launchProjection.projectedLaunchAt)}
                </p>
              </CardContent>
            </Card>
            <Card className="mission-panel">
              <CardContent className="py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/65">Completion Status</p>
                <p className="mt-1 text-3xl font-bold leading-none text-white">
                  {data.launchProjection.completedCount}/{data.kpis.totalTapes}
                </p>
              </CardContent>
            </Card>
            <Card className="mission-panel">
              <CardContent className="py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/65">Velocity</p>
                <p className="mt-1 font-mono text-3xl font-bold leading-none text-white">
                  {data.launchProjection.throughputPerDay.toFixed(2)}
                </p>
                <p className="mt-1 text-xs text-cyan-100/65">tapes/day ({data.launchProjection.source})</p>
              </CardContent>
            </Card>
            <Card className="mission-panel">
              <CardContent className="py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/65">Confidence</p>
                <p className="mt-1 text-3xl font-bold uppercase leading-none text-white">
                  {data.launchProjection.confidence}
                </p>
                <p className="mt-1 text-xs text-cyan-100/65">
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
      title: "VHS Mission Control",
      subtitle: "Project pulse for wall display",
      content: data ? (
        <div className="grid h-full gap-4 md:grid-cols-5">
          <Card className="mission-panel md:col-span-3">
            <CardHeader>
              <CardTitle className="text-cyan-50">Stage Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <PipelineFlowChart data={stageData} theme="mission" />
            </CardContent>
          </Card>
          <div className="md:col-span-2 grid gap-4">
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
                  <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/65">{label}</p>
                  <p className="text-4xl font-bold leading-none text-white">{value}</p>
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
          <Card className="mission-panel">
            <CardHeader>
              <CardTitle className="text-cyan-50">Captured Per Day</CardTitle>
            </CardHeader>
            <CardContent>
              {data.capturedDateCoveragePercent > 0 ? (
                <>
                  <p className="mb-2 text-xs text-cyan-100/65">
                    Coverage: {data.capturedDateCoveragePercent}% have capture timestamps
                  </p>
                  <AcquisitionChart data={data.capturedDaily} theme="mission" />
                </>
              ) : (
                <div className="flex h-[260px] items-center justify-center text-center text-sm text-cyan-100/65">
                  Capture timestamp field not available yet.
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="mission-panel">
            <CardHeader>
              <CardTitle className="text-cyan-50">Cataloged Per Day</CardTitle>
            </CardHeader>
            <CardContent>
              <AcquisitionChart data={data.acquisitionDaily} theme="mission" />
            </CardContent>
          </Card>
          <Card className="mission-panel">
            <CardHeader>
              <CardTitle className="text-cyan-50">Projected Source Recording Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {data.contentRecordedCoveragePercent > 0 ? (
                <>
                  <p className="mb-2 text-xs text-cyan-100/65">
                    Coverage: {data.contentRecordedCoveragePercent}% have content recorded dates
                  </p>
                  <AcquisitionChart data={data.contentRecordedDaily} theme="mission" />
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
      key: "runtime",
      title: "Runtime Intelligence",
      subtitle: "Distribution by source/output runtime fields",
      content: data ? (
        <div className="grid h-full gap-4 md:grid-cols-3">
          <Card className="mission-panel">
            <CardHeader>
              <CardTitle className="text-cyan-50">Meeting Runtime Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <HistogramChart data={data.runtimeHistograms.labelRuntime} theme="mission" />
            </CardContent>
          </Card>
          <Card className="mission-panel">
            <CardHeader>
              <CardTitle className="text-cyan-50">QT Runtime Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <HistogramChart data={data.runtimeHistograms.qtRuntime} theme="mission" />
            </CardContent>
          </Card>
          <Card className="mission-panel">
            <CardHeader>
              <CardTitle className="text-cyan-50">Final Runtime Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <HistogramChart data={data.runtimeHistograms.finalRuntime} theme="mission" />
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
        <Card className="mission-panel h-full text-cyan-50">
          <CardHeader>
            <CardTitle className="text-cyan-50">Top 30 Most Recent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3 grid grid-cols-4 gap-2 text-xs text-cyan-100/70">
              <p>Avg Label RT: <span className="font-semibold text-cyan-50">{formatDurationHMSFromMinutes(data.runtimeStats.labelAverage)}</span></p>
              <p>Avg QT RT: <span className="font-semibold text-cyan-50">{formatDurationHMSFromMinutes(data.runtimeStats.qtAverage)}</span></p>
              <p>Avg Final RT: <span className="font-semibold text-cyan-50">{formatDurationHMSFromMinutes(data.runtimeStats.finalAverage)}</span></p>
              <p>Avg Drift: <span className="font-semibold text-cyan-50">{formatDurationHMSFromMinutes(data.runtimeStats.driftAverage)}</span></p>
            </div>
            <div className="overflow-auto" style={{ maxHeight: "42vh" }}>
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
    <div className="presentation-mission-bg min-h-screen p-6 text-white">
      <div className="relative z-10 mx-auto max-w-[1800px]">
        <SlideHeader
          title={current.title}
          subtitle={current.subtitle}
        />

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

        {data && <div className="aspect-video w-full animate-floatIn">{current.content}</div>}

        <footer className="mt-4 flex items-center justify-between text-xs text-cyan-100/85">
          <div className="flex gap-2">
            {slides.map((s, idx) => (
              <button
                key={s.key}
                onClick={() => setSlide(idx)}
                className={`h-2.5 rounded-full transition-all ${slide === idx ? "w-8 bg-amber-300" : "w-2.5 bg-cyan-200/50"}`}
                aria-label={`Go to ${s.title}`}
              />
            ))}
          </div>
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
