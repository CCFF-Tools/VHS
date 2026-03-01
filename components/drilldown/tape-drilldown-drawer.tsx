"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTapes } from "@/lib/hooks/use-api";
import { formatDurationHMSFromMinutes } from "@/lib/runtime-format";
import { stageLabel } from "@/lib/stage-label";

function formatDate(value?: string) {
  if (!value) return "n/a";
  try {
    return format(parseISO(value), "yyyy-MM-dd");
  } catch {
    return "n/a";
  }
}

function runtimeForRow(label?: number, qt?: number, final?: number) {
  return label ?? qt ?? final;
}

export function TapeDrilldownDrawer({
  open,
  title,
  subtitle,
  queryString,
  onClose,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  queryString: string;
  onClose: () => void;
}) {
  const { data, isLoading, error } = useTapes(open ? queryString : null);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close detail drawer"
        className="absolute inset-0 bg-slate-900/35"
        onClick={onClose}
      />

      <aside className="absolute right-0 top-0 h-full w-full max-w-[680px] border-l bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Drilldown</p>
            <h3 className="text-lg font-semibold">{title}</h3>
            {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </header>

        <div className="h-[calc(100%-68px)] overflow-auto p-4">
          {isLoading && <p className="text-sm text-muted-foreground">Loading filtered tapes...</p>}
          {error && <p className="text-sm text-danger">Failed to load drilldown: {error.message}</p>}

          {data && (
            <>
              <p className="mb-3 text-xs text-muted-foreground">
                {data.total} matching tape{data.total === 1 ? "" : "s"}
              </p>
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-50">
                    <tr className="text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      <th className="px-3 py-2">Sticker</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Stage</th>
                      <th className="px-3 py-2">Recorded</th>
                      <th className="px-3 py-2">Runtime</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((tape) => (
                      <tr key={tape.id} className="border-t">
                        <td className="px-3 py-2 font-mono text-xs">{tape.tapeId}</td>
                        <td className="px-3 py-2">
                          <Link href={`/tapes/${tape.id}`} className="font-medium hover:underline">
                            {tape.tapeName}
                          </Link>
                        </td>
                        <td className="px-3 py-2">{stageLabel(tape.stage)}</td>
                        <td className="px-3 py-2 font-mono text-xs">{formatDate(tape.contentRecordedAt)}</td>
                        <td className="px-3 py-2 font-mono text-xs">
                          {formatDurationHMSFromMinutes(
                            runtimeForRow(
                              tape.labelRuntimeMinutes,
                              tape.qtRuntimeMinutes,
                              tape.finalClipDurationMinutes
                            )
                          )}
                        </td>
                      </tr>
                    ))}
                    {data.items.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-3 py-6 text-center text-sm text-muted-foreground">
                          No tapes match the selected chart filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
