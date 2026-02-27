"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredPassword, setStoredPassword } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SimpleSelect } from "@/components/ui/select";
import type { Stage } from "@/lib/types";

const stageOptions = [
  { value: "Intake", label: "Awaiting Capture" },
  { value: "Capture", label: "Capture" },
  { value: "Trim", label: "Trim" },
  { value: "Combine", label: "Combine" },
  { value: "Transfer", label: "Transfer" },
  { value: "Archived", label: "Archived" },
];

export function ActionPanel({ tapeId, defaultStage }: { tapeId: string; defaultStage: Stage }) {
  const router = useRouter();
  const [stage, setStage] = useState(defaultStage);
  const [note, setNote] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const post = async (url: string, body: unknown) => {
    const password = getStoredPassword();
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-password": password,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
  };

  const updateStage = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await post("/api/actions/status", { id: tapeId, stage });
      setMessage("Stage updated");
      router.refresh();
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const addNote = async () => {
    if (!note.trim()) return;
    setBusy(true);
    setMessage(null);
    try {
      await post("/api/actions/notes", { id: tapeId, note });
      setMessage("Note added");
      setNote("");
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Action Password</p>
        <div className="flex gap-2">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter internal action password"
          />
          <Button
            onClick={() => {
              if (!password.trim()) return;
              setStoredPassword(password.trim());
              setPassword("");
              setMessage("Password saved for this browser");
            }}
            variant="secondary"
          >
            Save
          </Button>
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Update Stage</p>
        <div className="flex gap-2">
          <SimpleSelect
            value={stage}
            onChange={(e) => setStage(e.target.value as Stage)}
            options={stageOptions}
          />
          <Button onClick={updateStage} disabled={busy}>
            Save
          </Button>
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Internal Note</p>
        <div className="flex gap-2">
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a quick note" />
          <Button onClick={addNote} disabled={busy || !note.trim()} variant="secondary">
            Add
          </Button>
        </div>
      </div>

      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>
  );
}
