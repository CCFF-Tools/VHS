"use client";

import { cn } from "@/lib/utils";

const KEY = "vhs_internal_password";

export function Topbar({
  title,
  subtitle,
  titleClassName,
  subtitleClassName,
}: {
  title: string;
  subtitle?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}) {
  return (
    <header className="mb-5">
      <div>
        <h2 className={cn("text-3xl font-semibold tracking-tight", titleClassName)}>{title}</h2>
        {subtitle ? (
          <p className={cn("mt-1 text-sm text-muted-foreground", subtitleClassName)}>{subtitle}</p>
        ) : null}
      </div>
    </header>
  );
}

export function getStoredPassword() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(KEY) ?? "";
}

export function setStoredPassword(password: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, password);
}
