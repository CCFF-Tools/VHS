"use client";

import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { SimpleSelect } from "@/components/ui/select";
import { Topbar } from "@/components/layout/topbar";
import { KpiGrid } from "@/components/dashboard/kpi-grid";
import { PipelineFlowChart } from "@/components/charts/pipeline-flow-chart";
import { HistogramChart } from "@/components/charts/histogram-chart";
import { AcquisitionChart } from "@/components/charts/acquisition-chart";
import { useOpsSummary } from "@/lib/hooks/use-api";
import { stageLabel } from "@/lib/stage-label";
import { formatDurationHMSFromMinutes } from "@/lib/runtime-format";

function formatDateTime(value?: string) {
  if (!value) return "n/a";
  try {
    return format(parseISO(value), "MMM d, yyyy h:mm a");
  } catch {
    return value;
  }
}

export default function HomePage() {
  const { data, isLoading, error } = useOpsSummary();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState("50");

  const totalRows = data?.recentAcquisitions.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRows / Number(rowsPerPage)));

  useEffect(() => {
    setPage(1);
  }, [rowsPerPage, totalRows]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pagedAcquisitions = useMemo(() => {
    if (!data) return [];
    const size = Number(rowsPerPage);
    const start = (page - 1) * size;
    return data.recentAcquisitions.slice(start, start + size);
  }, [data, page, rowsPerPage]);

  return (
    <div>
      <Topbar
        title="VHS Operations Snapshot"
        titleClassName="text-4xl font-extrabold tracking-[-0.02em] text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-cyan-700 to-amber-600 md:text-5xl"
      />

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="pt-5 text-sm text-danger">Failed to load dashboard: {error.message}</CardContent>
        </Card>
      )}

      {data && (
        <div className="space-y-4">
          <KpiGrid kpis={data.kpis} />

          <section className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Stage Counts</CardTitle>
              </CardHeader>
              <CardContent>
                <PipelineFlowChart
                  data={data.stageCounts.map((s) => ({ stage: stageLabel(s.stage), count: s.count }))}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cataloged Per Day (30d)</CardTitle>
              </CardHeader>
              <CardContent>
                <AcquisitionChart data={data.acquisitionDaily} />
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Captures Per Day (30d)</CardTitle>
              </CardHeader>
              <CardContent>
                {data.capturedDateCoveragePercent > 0 ? (
                  <>
                    <p className="mb-2 text-xs text-muted-foreground">
                      Capture date coverage: {data.capturedDateCoveragePercent}%
                    </p>
                    <AcquisitionChart data={data.capturedDaily} />
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No captured timestamp data yet. Set `AIRTABLE_CAPTURED_AT_FIELD` to your imported movie file
                    creation-time field when available.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Original Content Recorded Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {data.contentRecordedCoveragePercent > 0 ? (
                  <>
                    <p className="mb-2 text-xs text-muted-foreground">
                      Original content date coverage: {data.contentRecordedCoveragePercent}%
                    </p>
                    <AcquisitionChart data={data.contentRecordedDaily} />
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No original content date data yet. Set `AIRTABLE_CONTENT_DATE_FIELD` to the field that stores the
                    tape meeting/event recording date.
                  </p>
                )}
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Meeting Runtime Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <HistogramChart data={data.runtimeHistograms.labelRuntime} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>QT Runtime Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <HistogramChart data={data.runtimeHistograms.qtRuntime} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Final Runtime Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <HistogramChart data={data.runtimeHistograms.finalRuntime} />
              </CardContent>
            </Card>
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Recent Cataloged Tapes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <p>{totalRows} rows total (newest first)</p>
                <div className="flex items-center gap-2">
                  <SimpleSelect
                    className="h-8 w-[120px] text-xs"
                    value={rowsPerPage}
                    onChange={(e) => setRowsPerPage(e.target.value)}
                    options={[
                      { label: "25 / page", value: "25" },
                      { label: "50 / page", value: "50" },
                      { label: "100 / page", value: "100" },
                    ]}
                  />
                  <Button size="sm" variant="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                    Prev
                  </Button>
                  <span className="font-mono text-xs">
                    {page}/{totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>

              <div className="mb-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground md:grid-cols-4">
                <p>Avg Label RT: <span className="font-semibold text-foreground">{formatDurationHMSFromMinutes(data.runtimeStats.labelAverage)}</span></p>
                <p>Avg QT RT: <span className="font-semibold text-foreground">{formatDurationHMSFromMinutes(data.runtimeStats.qtAverage)}</span></p>
                <p>Avg Final RT: <span className="font-semibold text-foreground">{formatDurationHMSFromMinutes(data.runtimeStats.finalAverage)}</span></p>
                <p>Avg Drift: <span className="font-semibold text-foreground">{formatDurationHMSFromMinutes(data.runtimeStats.driftAverage)}</span></p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-2">📼 Sticker</th>
                      <th>Tape Name</th>
                      <th>Cataloged At</th>
                      <th>Rec Date (Optional)</th>
                      <th>Label</th>
                      <th>QT</th>
                      <th>Final</th>
                      <th>C/T/Cmb/NAS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedAcquisitions.map((tape) => (
                      <tr key={tape.id} className="border-t">
                        <td className="py-2 font-mono text-xs">{tape.tapeId}</td>
                        <td className="font-medium">{tape.tapeName}</td>
                        <td>{formatDateTime(tape.acquisitionAt)}</td>
                        <td>{formatDateTime(tape.receivedDate)}</td>
                        <td>{formatDurationHMSFromMinutes(tape.labelRuntimeMinutes)}</td>
                        <td>{formatDurationHMSFromMinutes(tape.qtRuntimeMinutes)}</td>
                        <td>{formatDurationHMSFromMinutes(tape.finalClipDurationMinutes)}</td>
                        <td className="font-mono text-xs">
                          {tape.captured ? "Y" : "N"}/{tape.trimmed ? "Y" : "N"}/{tape.combined ? "Y" : "N"}/
                          {tape.transferredToNas ? "Y" : "N"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
