"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import { fireConfetti } from "@/lib/confetti";
import { useLocale } from "@/context/LocaleContext";
import { getDict } from "@/lib/i18n";

type Props = {
  gig: {
    id: string;
    createdBy: string;
    status: "OPEN" | "ASSIGNED" | "DONE";
    assignedTo?: string | null;
  };
  onChange?: (update: Partial<{ status: "OPEN" | "ASSIGNED" | "DONE"; assignedTo: string | null; dateCompleted: string }>) => void;
};

export function GigActions({ gig, onChange }: Props) {
  const { locale } = useLocale();
  const t = getDict(locale);
  const { userId } = useUser();
  const [pending, setPending] = React.useState(false);

  const viewerIsCreator = !!userId && userId === gig.createdBy;
  const canApply = !!userId && !viewerIsCreator && gig.status === "OPEN" && !gig.assignedTo;
  const canMarkDone = !!userId && viewerIsCreator && gig.status === "ASSIGNED";

  async function apply() {
    if (!userId) return;
    try {
      setPending(true);
      const prev = { status: gig.status, assignedTo: gig.assignedTo ?? null };
      onChange?.({ status: "ASSIGNED", assignedTo: userId });
      const res = await fetch(`/api/gigs/${gig.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success(t.toasts.applied);
      setPending(false);
    } catch (e) {
      toast.error(t.toasts.failedApply);
      onChange?.({ status: "OPEN", assignedTo: null });
      setPending(false);
    }
  }

  async function done() {
    if (!userId) return;
    try {
      setPending(true);
      const now = new Date().toISOString();
      onChange?.({ status: "DONE", dateCompleted: now });
      const res = await fetch(`/api/gigs/${gig.id}/done`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success(t.toasts.markedDone, { className: "toast-success" });
      fireConfetti();
      setPending(false);
    } catch (e) {
      toast.error(t.toasts.failedDone);
      onChange?.({ status: "ASSIGNED" });
      setPending(false);
    }
  }

  if (!canApply && !canMarkDone) return null;

  return (
    <div className="flex gap-2 ml-auto">
      {canApply ? (
        <Button size="sm" onClick={apply} disabled={pending}>{t.actions.apply}</Button>
      ) : null}
      {canMarkDone ? (
        <Button size="sm" variant="secondary" onClick={done} disabled={pending}>{t.actions.markDone}</Button>
      ) : null}
    </div>
  );
}
