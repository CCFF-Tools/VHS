"use client";

import { useMemo, useState } from "react";
import { Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const KEY = "vhs_internal_password";

export function Topbar({ title, subtitle }: { title: string; subtitle: string }) {
  const [value, setValue] = useState("");

  const isSet = useMemo(() => {
    if (typeof window === "undefined") return false;
    return Boolean(window.localStorage.getItem(KEY));
  }, []);

  const save = () => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(KEY, value);
    setValue("");
    window.location.reload();
  };

  return (
    <header className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">Operations Intelligence</p>
        <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="flex w-full max-w-md items-center gap-2 rounded-md border bg-white p-2 md:w-auto">
        <Lock className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={isSet ? "Password saved for actions" : "Set internal action password"}
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Button size="sm" onClick={save} disabled={!value.trim()}>
          Save
        </Button>
      </div>
    </header>
  );
}

export function getStoredPassword() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(KEY) ?? "";
}
