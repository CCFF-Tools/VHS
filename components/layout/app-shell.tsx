"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, AreaChart, ClipboardList, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Overview", icon: Activity },
  { href: "/board", label: "Production Board", icon: ClipboardList },
  { href: "/analytics", label: "Analytics", icon: AreaChart },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto grid min-h-screen w-full max-w-[1400px] grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[220px_1fr] lg:px-8">
      <aside className="rounded-xl border panel-gradient p-4 shadow-panel">
        <div className="mb-6">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">VHS Pipeline</p>
          <h1 className="mt-2 text-xl font-bold">Data Is Beautiful</h1>
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
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 rounded-md bg-muted p-3 text-xs text-muted-foreground">
          <div className="mb-1 flex items-center gap-2 font-semibold text-foreground">
            <ShieldCheck className="h-3.5 w-3.5" /> Internal-only
          </div>
          Airtable keys stay server-side. Optional writes require the internal password.
        </div>
      </aside>

      <main>{children}</main>
    </div>
  );
}
