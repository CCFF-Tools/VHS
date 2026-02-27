import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardKpis } from "@/lib/types";

const items = [
  { key: "totalTapes", label: "Total Tapes" },
  { key: "intakeQueue", label: "Intake Queue" },
  { key: "captureQueue", label: "Capture Queue" },
  { key: "processingQueue", label: "Trim + Combine Queue" },
  { key: "transferQueue", label: "Transfer Queue" },
  { key: "blockedQueue", label: "Needs Review (Inferred)" },
  { key: "archivedTotal", label: "Archived Total" },
  { key: "receivedToday", label: "Received Today" },
  { key: "avgQueueAgeDays", label: "Avg Queue Age (days)" },
  { key: "avgRuntimeDriftMinutes", label: "Avg Runtime Drift (min)" },
  { key: "archiveCompletionRate", label: "Transferred to NAS (%)" },
] as const;

export function KpiGrid({ kpis }: { kpis: DashboardKpis }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, idx) => (
        <Card key={item.key} className="animate-floatIn" style={{ animationDelay: `${idx * 40}ms` }}>
          <CardHeader>
            <CardTitle className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold leading-none">{kpis[item.key]}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
