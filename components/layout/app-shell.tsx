"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, AreaChart, ClipboardList, MonitorPlay } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Overview", icon: Activity },
  { href: "/board", label: "Production Board", icon: ClipboardList },
  { href: "/analytics", label: "Analytics", icon: AreaChart },
  { href: "/presentation", label: "Presentation", icon: MonitorPlay },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPresentation = pathname.startsWith("/presentation");

  if (isPresentation) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="mx-auto grid min-h-screen w-full max-w-[1400px] grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[220px_1fr] lg:px-8">
      <aside className="rounded-xl border panel-gradient p-4 shadow-panel">
        <div className="mb-6">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">Internal Dashboard</p>
          <h1 className="mt-2 text-xl font-bold">VHS Operations Control Room</h1>
        </div>

        <nav className="space-y-2">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-gradient-to-r from-primary to-cyan-700 text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

      </aside>

      <main>{children}</main>
    </div>
  );
}
