import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardKpis } from "@/lib/types";

const items = [
  { key: "totalTapes", label: "Total Tapes" },
  { key: "awaitingCaptureCount", label: "Awaiting Capture" },
  { key: "capturedCount", label: "Captured" },
  { key: "trimmedCount", label: "Trimmed" },
  { key: "combinedCount", label: "Combined" },
  { key: "transferredCount", label: "Transferred to NAS" },
  { key: "receivedToday", label: "Received Today" },
] as const;

const cardTints = ["kpi-tint-1", "kpi-tint-2", "kpi-tint-3", "kpi-tint-4"] as const;

export function KpiGrid({ kpis }: { kpis: DashboardKpis }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item, idx) => (
        <Card key={item.key} className={cardTints[idx % cardTints.length]}>
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
