"use client";

import gigs from "@/data/gigs.json";
import users from "@/data/users.json";
import { notFound } from "next/navigation";
import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { GigActions } from "./GigActions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { InfoIcon } from "lucide-react";

export default function GigDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const initial = React.useMemo(() => gigs.find((g) => g.id === id), [id]);
  if (!initial) return notFound();
  const [gig, setGig] = React.useState(initial as any);

  const author = users.find((u) => u.id === gig.createdBy);
  const assignee = gig.assignedTo ? users.find((u) => u.id === gig.assignedTo) : undefined;

  return (
    <div className="min-h-screen w-full p-4">
      <div className="max-w-xl mx-auto flex flex-col gap-3">
        <div className="h-1 w-full rounded-sm bg-[--philly-green]/80" />
        <div className="flex items-center gap-2">
          <Link href="/" className="text-xs text-muted-foreground hover:underline">
            ← Back
          </Link>
        </div>

        <Card className="py-4 gap-3 relative card-hover">
          <div className="absolute right-3 top-3 flex items-center gap-2">
            <Badge className="h-5 min-w-5 rounded-full px-2 font-mono tabular-nums philly-accent flex items-center gap-1">
              <img src="/coinlogo.png" alt="coin" width="12" height="12" />
              <span className="opacity-90">+</span>
              {gig.tokenReward}
            </Badge>
          </div>
          <CardHeader className="px-4">
            <div className="flex items-start gap-2 justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                {gig.name}
                {gig.timeCommitmentMinutes ? (
                  <Badge variant="outline" className="h-5 px-1 text-[10px]">
                    {Math.round(gig.timeCommitmentMinutes)}m
                  </Badge>
                ) : null}
              </CardTitle>
              {/* actions moved to footer */}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">
                {author?.name ?? "Unknown"}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {gig.neighborhood}
              </Badge>
              {author?.availability ? (
                <Badge variant="outline" className="text-[10px]">
                  {author.availability}
                </Badge>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="px-4 text-sm text-muted-foreground">
            <p className="mb-3 whitespace-pre-wrap">{gig.description}</p>
            <div className="grid grid-cols-2 gap-y-2 text-xs">
              <div className="opacity-70">Skill</div>
              <div>{gig.skill}</div>
              <div className="opacity-70">Status</div>
              <div className={`uppercase px-2 py-0.5 rounded-full border w-fit ${gig.status === "OPEN" ? "status-open" : gig.status === "ASSIGNED" ? "status-assigned" : "status-done"}`}>{gig.status}</div>
              <div className="opacity-70">Availability</div>
              <div>{author?.availability ?? "—"}</div>
              <div className="opacity-70">Created by</div>
              <div>{author?.name ?? gig.createdBy}</div>
              <div className="opacity-70">Assigned to</div>
              <div>{assignee ? assignee.name : "—"}</div>
            </div>
          </CardContent>
          <CardFooter className="px-4 pt-0 text-xs justify-between relative">
            <span className="opacity-70">Created {new Date(gig.createdAt).toLocaleDateString()}</span>
            {gig.dateCompleted ? (
              <span className="opacity-70">Done {new Date(gig.dateCompleted).toLocaleDateString()}</span>
            ) : null}
            <div className="absolute right-4 bottom-2 flex items-center gap-2">
              {(() => {
                const canChat = (gig.status === "OPEN") || (gig.status === "ASSIGNED");
                if (!canChat) return null;
                const viewer = users.find((u) => u.id === (gig as any).assignedTo) || users.find((u) => u.id === gig.createdBy);
                return (
                  <button
                    className="h-7 w-7 grid place-items-center rounded-md border bg-accent/60 hover:bg-accent transition-colors"
                    aria-label="Text"
                    onClick={() => {
                      const userA = (gig as any).assignedTo || gig.createdBy;
                      const userB = gig.createdBy;
                      const otherId = userA === userB ? undefined : userB;
                      const a = userA;
                      const b = otherId ?? gig.createdBy;
                      fetch(`/api/chats?gigId=${gig.id}&userA=${a}&userB=${b}`).then(async (r) => {
                        const existing = await r.json();
                        if (Array.isArray(existing) && existing.length) {
                          location.href = `/chats/${existing[0].id}`;
                        } else {
                          const created = await fetch(`/api/chats`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ gigId: gig.id, participants: [a, b] }),
                          });
                          if (created.ok) {
                            const chat = await created.json();
                            location.href = `/chats/${chat.id}`;
                          }
                        }
                      });
                    }}
                  >
                    <span className="text-base leading-none" style={{ color: "inherit" }}>💬</span>
                  </button>
                );
              })()}
              <GigActions gig={{ id: gig.id, createdBy: gig.createdBy, status: gig.status as any, assignedTo: (gig as any).assignedTo }} onChange={(u) => setGig((prev: any) => ({ ...prev, ...u }))} />
            </div>
          </CardFooter>
        </Card>
        <div className="flex items-center justify-center mt-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs gap-1 text-[--philly-green]"
            onClick={() => toast("Thanks! We'll review your report.")}
            aria-label="Report a concern"
            title="Report a concern"
          >
            <InfoIcon className="size-4" />
            Report a concern?
          </Button>
        </div>
      </div>
    </div>
  );
}
