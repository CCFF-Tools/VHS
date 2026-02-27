import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardKpis } from "@/lib/types";

const items = [
  { key: "totalTapes", label: "Total Tapes" },
  { key: "capturedCount", label: "Captured" },
  { key: "trimmedCount", label: "Trimmed" },
  { key: "combinedCount", label: "Combined" },
  { key: "transferredCount", label: "Transferred to NAS" },
  { key: "receivedToday", label: "Received Today" },
] as const;

export function KpiGrid({ kpis }: { kpis: DashboardKpis }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Card key={item.key}>
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
