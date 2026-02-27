import type { ReactNode } from "react";
import { Coffee, Flame, Siren } from "lucide-react";
import { cn } from "@/lib/utils";

type MemeMode = "fine" | "watch" | "flames";

const modeMap: Record<
  MemeMode,
  {
    label: string;
    icon: typeof Coffee;
    container: string;
    badge: string;
  }
> = {
  fine: {
    label: "This is fine",
    icon: Coffee,
    container: "border-emerald-200 bg-emerald-50/70",
    badge: "bg-emerald-100 text-emerald-800",
  },
  watch: {
    label: "This is fine (but monitor)",
    icon: Siren,
    container: "border-amber-200 bg-amber-50/70",
    badge: "bg-amber-100 text-amber-800",
  },
  flames: {
    label: "Elmo with flames",
    icon: Flame,
    container: "border-rose-200 bg-rose-50/70",
    badge: "bg-rose-100 text-rose-800",
  },
};

export function MemeAlert({
  mode,
  title,
  description,
  right,
}: {
  mode: MemeMode;
  title: string;
  description: string;
  right?: ReactNode;
}) {
  const config = modeMap[mode];
  const Icon = config.icon;

  return (
    <section className={cn("mb-4 rounded-xl border p-4 shadow-panel", config.container)}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className={cn("mb-2 inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold", config.badge)}>
            <Icon className="h-3.5 w-3.5" /> {config.label}
          </div>
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {right && <div className="text-sm text-muted-foreground">{right}</div>}
      </div>
    </section>
  );
}
