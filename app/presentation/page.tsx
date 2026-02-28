"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { RefreshCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PipelineFlowChart } from "@/components/charts/pipeline-flow-chart";
import { AcquisitionChart } from "@/components/charts/acquisition-chart";
import { HistogramChart } from "@/components/charts/histogram-chart";
import { useOpsSummary } from "@/lib/hooks/use-api";
import { stageLabel } from "@/lib/stage-label";
import { formatDurationHMSFromMinutes } from "@/lib/runtime-format";

const SLIDE_INTERVAL_MS = 12000;

function SlideHeader({
  title,
  subtitle,
  slideIndex,
  slideCount,
}: {
  title: string;
  subtitle: string;
  slideIndex: number;
  slideCount: number;
}) {
  return (
    <header className="mb-4 flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white">{title}</h1>
        <p className="text-sm text-cyan-100/90">{subtitle}</p>
      </div>
      <div className="text-right text-cyan-50">
        <p className="font-mono text-sm">Slide {slideIndex + 1}/{slideCount}</p>
        <p className="font-mono text-xs opacity-80">{format(new Date(), "yyyy-MM-dd HH:mm:ss")}</p>
      </div>
    </header>
  );
}

export default function PresentationPage() {
  const { data, isLoading, error, mutate } = useOpsSummary();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSlide((prev) => (prev + 1) % 4);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") setSlide((prev) => (prev + 1) % 4);
      if (event.key === "ArrowLeft") setSlide((prev) => (prev + 3) % 4);
      if (event.key.toLowerCase() === "r") mutate();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mutate]);

  const stageData = useMemo(
    () =>
      data?.stageCounts.map((row) => ({ stage: stageLabel(row.stage), count: row.count })) ?? [],
    [data?.stageCounts]
  );

  const slides = [
    {
      key: "overview",
      title: "VHS Mission Control",
      subtitle: "Project pulse for wall display",
      content: data ? (
        <div className="grid h-full gap-4 md:grid-cols-5">
          <Card className="md:col-span-3 border-cyan-200/40 bg-white/95">
            <CardHeader>
              <CardTitle>Stage Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <PipelineFlowChart data={stageData} />
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
              ["Received Today", data.kpis.receivedToday],
            ].map(([label, value]) => (
              <Card key={label} className="border-cyan-200/40 bg-white/95">
                <CardContent className="py-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
                  <p className="text-4xl font-bold leading-none text-slate-900">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : null,
    },
    {
      key: "throughput",
      title: "Acquisition + Capture Throughput",
      subtitle: "Last 30 days",
      content: data ? (
        <div className="grid h-full gap-4 md:grid-cols-2">
          <Card className="border-cyan-200/40 bg-white/95">
            <CardHeader>
              <CardTitle>Acquisitions Per Day</CardTitle>
            </CardHeader>
            <CardContent>
              <AcquisitionChart data={data.acquisitionDaily} />
            </CardContent>
          </Card>
          <Card className="border-cyan-200/40 bg-white/95">
            <CardHeader>
              <CardTitle>Captures Per Day</CardTitle>
            </CardHeader>
            <CardContent>
              {data.capturedDateCoveragePercent > 0 ? (
                <>
                  <p className="mb-2 text-xs text-slate-500">
                    Coverage: {data.capturedDateCoveragePercent}% have capture timestamps
                  </p>
                  <AcquisitionChart data={data.capturedDaily} />
                </>
              ) : (
                <div className="flex h-[260px] items-center justify-center text-center text-sm text-slate-500">
                  Capture timestamp field not available yet.
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
          <Card className="border-cyan-200/40 bg-white/95">
            <CardHeader>
              <CardTitle>Meeting Runtime Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <HistogramChart data={data.runtimeHistograms.labelRuntime} />
            </CardContent>
          </Card>
          <Card className="border-cyan-200/40 bg-white/95">
            <CardHeader>
              <CardTitle>QT Runtime Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <HistogramChart data={data.runtimeHistograms.qtRuntime} />
            </CardContent>
          </Card>
          <Card className="border-cyan-200/40 bg-white/95">
            <CardHeader>
              <CardTitle>Final Runtime Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <HistogramChart data={data.runtimeHistograms.finalRuntime} />
            </CardContent>
          </Card>
        </div>
      ) : null,
    },
    {
      key: "recent",
      title: "Recent Acquisitions Feed",
      subtitle: "Newest records with runtime + progression flags",
      content: data ? (
        <Card className="h-full border-cyan-200/40 bg-white/95">
          <CardHeader>
            <CardTitle>Top 30 Most Recent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3 grid grid-cols-4 gap-2 text-xs text-slate-500">
              <p>Avg Label RT: <span className="font-semibold text-slate-900">{formatDurationHMSFromMinutes(data.runtimeStats.labelAverage)}</span></p>
              <p>Avg QT RT: <span className="font-semibold text-slate-900">{formatDurationHMSFromMinutes(data.runtimeStats.qtAverage)}</span></p>
              <p>Avg Final RT: <span className="font-semibold text-slate-900">{formatDurationHMSFromMinutes(data.runtimeStats.finalAverage)}</span></p>
              <p>Avg Drift: <span className="font-semibold text-slate-900">{formatDurationHMSFromMinutes(data.runtimeStats.driftAverage)}</span></p>
            </div>
            <div className="overflow-auto" style={{ maxHeight: "42vh" }}>
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="text-left text-slate-500">
                    <th className="py-2">📼</th>
                    <th>Name</th>
                    <th>Acquired</th>
                    <th>Label</th>
                    <th>QT</th>
                    <th>Final</th>
                    <th>C/T/Cb/NAS</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentAcquisitions.slice(0, 30).map((t) => (
                    <tr key={t.id} className="border-t">
                      <td className="py-2 font-mono text-xs">{t.tapeId}</td>
                      <td className="font-medium">{t.tapeName}</td>
                      <td className="font-mono text-xs">{t.acquisitionAt ? format(new Date(t.acquisitionAt), "yyyy-MM-dd HH:mm") : "n/a"}</td>
                      <td>{formatDurationHMSFromMinutes(t.labelRuntimeMinutes)}</td>
                      <td>{formatDurationHMSFromMinutes(t.qtRuntimeMinutes)}</td>
                      <td>{formatDurationHMSFromMinutes(t.finalClipDurationMinutes)}</td>
                      <td className="font-mono text-xs">{t.captured ? "Y" : "N"}/{t.trimmed ? "Y" : "N"}/{t.combined ? "Y" : "N"}/{t.transferredToNas ? "Y" : "N"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null,
    },
  ];

  const current = slides[slide];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 p-6 text-white">
      <div className="mx-auto max-w-[1800px]">
        <SlideHeader
          title={current.title}
          subtitle={`${current.subtitle} • Auto-rotates every ${SLIDE_INTERVAL_MS / 1000}s • Arrow keys navigate`}
          slideIndex={slide}
          slideCount={slides.length}
        />

        {isLoading && (
          <div className="rounded-xl border border-cyan-200/20 bg-white/10 p-8 text-center text-cyan-50">
            Loading presentation data...
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-300/30 bg-rose-950/50 p-8 text-center text-rose-100">
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
            className="inline-flex items-center gap-1 rounded-md border border-cyan-100/30 bg-white/10 px-2 py-1 hover:bg-white/20"
          >
            <RefreshCcw className="h-3.5 w-3.5" /> Refresh Data
          </button>
        </footer>
      </div>
    </div>
  );
}
