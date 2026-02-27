"use client";

const KEY = "vhs_internal_password";

export function Topbar({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="mb-5">
      <div>
        <p className="inline-flex rounded-full bg-amber-100 px-2 py-1 font-mono text-xs uppercase tracking-[0.18em] text-amber-800">
          VHS Digitization Ops
        </p>
        <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
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
