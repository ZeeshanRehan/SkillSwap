"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ResetPage() {
  async function onReset() {
    try {
      const res = await fetch("/api/admin/reset", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Demo data reset");
    } catch (e) {
      toast.error("Failed to reset");
    }
  }

  return (
    <div className="min-h-screen w-full p-6 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="text-sm text-muted-foreground">Reload seed data.</div>
        <Button onClick={onReset}>Reset data</Button>
      </div>
    </div>
  );
}

