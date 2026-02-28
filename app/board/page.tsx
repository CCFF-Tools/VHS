"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Topbar } from "@/components/layout/topbar";
import { KanbanCard } from "@/components/board/kanban-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTapes } from "@/lib/hooks/use-api";
import { pipelineStages } from "@/lib/schema";
import { stageLabel } from "@/lib/stage-label";

function acquisitionTime(tape: { acquisitionAt?: string }) {
  if (!tape.acquisitionAt) return 0;
  const ms = new Date(tape.acquisitionAt).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

export default function BoardPage() {
  const [search, setSearch] = useState("");

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    return params.toString();
  }, [search]);

  const { data, isLoading, error } = useTapes(query);

  const grouped = useMemo(() => {
    const list = data?.items ?? [];
    return pipelineStages.reduce<Record<string, typeof list>>((acc, stage) => {
      acc[stage] = list
        .filter((t) => t.stage === stage)
        .sort((a, b) => acquisitionTime(b) - acquisitionTime(a));
      return acc;
    }, {});
  }, [data?.items]);

  return (
    <div>
      <Topbar
        title="Production Board"
        subtitle="Grouped by stage and sorted by newest cataloged entry first."
      />

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by 📼 sticker or tape name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </CardContent>
      </Card>

      {isLoading && <Skeleton className="h-[420px]" />}
      {error && <p className="text-sm text-danger">{error.message}</p>}

      {data && (
        <section className="grid gap-3 lg:grid-cols-3 xl:grid-cols-6">
          {pipelineStages.map((stage) => (
            <div key={stage} className="rounded-lg border bg-white p-2">
              <div className="mb-2 border-b pb-2">
                <p className="text-sm font-semibold">{stageLabel(stage)}</p>
                <p className="text-xs text-muted-foreground">{grouped[stage]?.length ?? 0} tapes</p>
              </div>
              <div className="space-y-2">
                {(grouped[stage] || []).map((tape) => (
                  <KanbanCard key={tape.id} tape={tape} />
                ))}
                {(grouped[stage] || []).length === 0 && (
                  <p className="p-2 text-xs text-muted-foreground">No tapes in this stage.</p>
                )}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
