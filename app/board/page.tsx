"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SimpleSelect } from "@/components/ui/select";
import { Topbar } from "@/components/layout/topbar";
import { KanbanCard } from "@/components/board/kanban-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTapes } from "@/lib/hooks/use-api";
import { pipelineStages } from "@/lib/schema";

export default function BoardPage() {
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("all");
  const [hasIssues, setHasIssues] = useState("all");

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (priority !== "all") params.set("priority", priority);
    if (hasIssues !== "all") params.set("hasIssues", String(hasIssues === "yes"));
    return params.toString();
  }, [search, priority, hasIssues]);

  const { data, isLoading, error } = useTapes(query);

  const grouped = useMemo(() => {
    const list = data?.items ?? [];
    return pipelineStages.reduce<Record<string, typeof list>>((acc, stage) => {
      acc[stage] = list.filter((t) => t.stage === stage);
      return acc;
    }, {});
  }, [data?.items]);

  return (
    <div>
      <Topbar
        title="Production Board"
        subtitle="Queue by stage with aging indicators, issue flags, and quick drill-down."
      />

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-3">
          <Input
            placeholder="Search Tape ID or name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <SimpleSelect
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={[
              { label: "All priorities", value: "all" },
              { label: "Rush", value: "rush" },
              { label: "High", value: "high" },
              { label: "Normal", value: "normal" },
              { label: "Low", value: "low" },
            ]}
          />
          <SimpleSelect
            value={hasIssues}
            onChange={(e) => setHasIssues(e.target.value)}
            options={[
              { label: "Issues: Any", value: "all" },
              { label: "Issues: Yes", value: "yes" },
            ]}
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
                <p className="text-sm font-semibold">{stage}</p>
                <p className="text-xs text-muted-foreground">{grouped[stage]?.length ?? 0} tapes</p>
              </div>
              <div className="space-y-2">
                {(grouped[stage] || []).map((tape) => (
                  <KanbanCard key={tape.id} tape={tape} />
                ))}
                {(grouped[stage] || []).length === 0 && <p className="p-2 text-xs text-muted-foreground">No tapes</p>}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
