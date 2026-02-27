import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardKpis } from "@/lib/types";

const items: Array<{ key: keyof DashboardKpis; label: string; progress?: boolean }> = [
  { key: "totalTapes", label: "Total Tapes" },
  { key: "awaitingCaptureCount", label: "Awaiting Capture" },
  { key: "capturedCount", label: "Captured", progress: true },
  { key: "trimmedCount", label: "Trimmed", progress: true },
  { key: "combinedCount", label: "Combined", progress: true },
  { key: "transferredCount", label: "Transferred to NAS", progress: true },
  { key: "receivedToday", label: "Received Today" },
] as const;

const cardTints = ["kpi-tint-1", "kpi-tint-2", "kpi-tint-3", "kpi-tint-4"] as const;

function progressColor(percent: number) {
  const p = Math.max(0, Math.min(100, percent));
  let r = 0;
  let g = 0;

  if (p <= 50) {
    const t = p / 50;
    r = 239;
    g = Math.round(68 + (193 - 68) * t);
  } else {
    const t = (p - 50) / 50;
    r = Math.round(239 + (34 - 239) * t);
    g = Math.round(193 + (197 - 193) * t);
  }

  const b = 68;
  return `rgb(${r}, ${g}, ${b})`;
}

function progressHue(percent: number) {
  const p = Math.max(0, Math.min(100, percent));
  return Math.round((p / 100) * 120);
}

export function KpiGrid({ kpis }: { kpis: DashboardKpis }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item, idx) => (
        <Card
          key={item.key}
          className={item.progress ? undefined : cardTints[idx % cardTints.length]}
          style={
            item.progress
              ? (() => {
                  const percent = kpis.totalTapes ? (Number(kpis[item.key]) / Number(kpis.totalTapes)) * 100 : 0;
                  const hue = progressHue(percent);
                  return {
                    background: `linear-gradient(145deg, hsl(${hue} 90% 95%), hsl(${hue} 90% 98%))`,
                    borderColor: `hsl(${hue} 45% 72%)`,
                  };
                })()
              : undefined
          }
        >
          <CardHeader>
            <CardTitle className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-semibold leading-none">{kpis[item.key]}</p>
            {item.progress && (
              <div
                className="inline-flex rounded-full px-3 py-1 text-xs font-semibold text-white"
                style={{
                  backgroundColor: progressColor(
                    kpis.totalTapes ? (Number(kpis[item.key]) / Number(kpis.totalTapes)) * 100 : 0
                  ),
                }}
              >
                {kpis.totalTapes
                  ? `${Math.round((Number(kpis[item.key]) / Number(kpis.totalTapes)) * 100)}% complete`
                  : "0% complete"}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
