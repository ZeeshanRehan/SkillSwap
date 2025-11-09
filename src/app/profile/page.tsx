"use client";

import users from "@/data/users.json";
import gigs from "@/data/gigs.json";
import { useUser } from "@/context/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useLocale } from "@/context/LocaleContext";
import { getDict } from "@/lib/i18n";
import { calculateSuggestedTokens } from "@/lib/rewards";
import { getChipClasses } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { locale } = useLocale();
  const t = getDict(locale);
  const { userId } = useUser();
  const user = users.find((u) => u.id === userId) ?? users[0];
  const level = Math.floor((user?.xp ?? 0) / 100);

  const created = gigs.filter((g) => g.createdBy === user.id);
  const assigned = gigs.filter((g) => g.assignedTo === user.id && g.status === "ASSIGNED");
  const done = gigs.filter((g) => g.assignedTo === user.id && g.status === "DONE");

  const [tab, setTab] = useState<"created" | "assigned" | "done">("created");

  const ledgerEntries = [
    ...done.map((g) => ({
      id: g.id,
      label: g.name,
      date: (g as any).dateCompleted || (g as any).createdAt,
      amount: g.tokenReward,
      kind: "credit" as const,
    })),
    ...gigs
      .filter((g) => g.createdBy === user.id && g.status === "DONE")
      .map((g) => ({
        id: g.id,
        label: g.name,
        date: (g as any).dateCompleted || (g as any).createdAt,
        amount: g.tokenReward,
        kind: "debit" as const,
      })),
  ].sort((a, b) => new Date((b as any).date).getTime() - new Date((a as any).date).getTime());

  const router = useRouter();

  return (
    <div className="min-h-screen w-full p-4">
      <div className="max-w-xl mx-auto flex flex-col gap-4">
        <div className="h-1 w-full rounded-sm bg-[--philly-green]/80" />
        <div className="flex items-center gap-3">
          <Avatar className="size-16">
            <AvatarImage src={user.pfp} alt={user.name} />
            <AvatarFallback>
              <img src="https://github.com/evilrabbit.png" alt="fallback" className="aspect-square size-full" />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-lg font-semibold">{user.name}</div>
            <div className="text-sm text-muted-foreground">Level {level} • {user.wallet} tokens</div>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Ledger</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="flex flex-col divide-y">
              {ledgerEntries.slice(0, 8).map((e) => (
                <div key={`${e.kind}-${e.id}`} className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Image src="/coinlogo.png" alt="coin" width={14} height={14} />
                    <div>
                      <div className="font-medium">{e.kind === "credit" ? "Earned" : "Paid"} $EAGLE</div>
                      <div className="text-xs opacity-70">{new Date(e.date as any).toLocaleDateString()} • {e.label}</div>
                    </div>
                  </div>
                  <div className={`font-mono tabular-nums ${e.kind === "credit" ? "text-green-600" : "text-red-600"}`}>
                    {e.kind === "credit" ? "+" : "-"}{e.amount}
                  </div>
                </div>
              ))}
              {!ledgerEntries.length && (
                <div className="py-2 text-muted-foreground">No transactions yet. Testnet explorer coming soon.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">About</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p className="mb-2">{user.bio}</p>
            <div className="flex flex-wrap gap-2">
              {user.skills?.map((s) => (
                <Badge key={s} variant="outline" className={`text-[10px] ${getChipClasses("skill", s)}`}>{s}</Badge>
              ))}
              {user.availability ? (
                <Badge variant="secondary" className="text-[10px]">{user.availability}</Badge>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-2 mt-2">
          <Button size="sm" variant={tab === "created" ? "secondary" : "outline"} className="h-8 px-3" onClick={() => setTab("created")}>Created</Button>
          <Button size="sm" variant={tab === "assigned" ? "secondary" : "outline"} className="h-8 px-3" onClick={() => setTab("assigned")}>Assigned</Button>
          <Button size="sm" variant={tab === "done" ? "secondary" : "outline"} className="h-8 px-3" onClick={() => setTab("done")}>Done</Button>
        </div>
        <div className="flex flex-col gap-3">
          {(() => {
            const list = tab === "created" ? created : tab === "assigned" ? assigned : done;
            return list.map((g, idx) => {
              const author = users.find((u) => u.id === g.createdBy);
              return (
                <Card key={g.id} className="py-4 gap-3 relative card-hover animate-in-up" style={{ animationDelay: `${idx * 40}ms` }}>
                  <div className="absolute right-3 top-3 flex items-center gap-2">
                    <Badge className="h-5 min-w-5 rounded-full px-2 font-mono tabular-nums philly-accent flex items-center gap-1" title={`Suggested ${calculateSuggestedTokens(g.timeCommitmentMinutes as any, g.skill as any).suggested} tokens`}>
                      <Image src="/coinlogo.png" alt="coin" width={12} height={12} />
                      <span className="opacity-90">+</span>
                      {g.tokenReward}
                    </Badge>
                  </div>
                  <CardHeader className="px-4">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {g.name}
                      {g.timeCommitmentMinutes ? (
                        <Badge variant="outline" className="h-5 px-1 text-[10px]">
                          {Math.round(g.timeCommitmentMinutes as any)}m
                        </Badge>
                      ) : null}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] hover:scale-[1.02] transition-transform">
                        {author?.id === user.id ? t.common.you : author?.name ?? "Unknown"}
                      </Badge>
                      <Badge variant="outline" className={`text-[10px] hover:scale-[1.02] transition-transform ${getChipClasses("neighborhood", g.neighborhood)}`}>
                        {g.neighborhood}
                      </Badge>
                      <Badge variant="outline" className={`text-[10px] hover:scale-[1.02] transition-transform ${getChipClasses("skill", g.skill)}`}>
                        {g.skill}
                      </Badge>
                      {author?.availability ? (
                        <Badge variant="outline" className="text-[10px] hover:scale-[1.02] transition-transform">
                          {(() => {
                            const a = (author.availability || "").toLowerCase();
                            if (a.includes("weeknight")) return t.availability.weeknights;
                            if (a.includes("weekend")) return t.availability.weekends;
                            if (a.includes("afternoon")) return t.availability.afternoons;
                            if (a.includes("morning")) return t.availability.mornings;
                            if (a.includes("evening")) return t.availability.evenings;
                            return t.availability.anytime;
                          })()}
                        </Badge>
                      ) : null}
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 text-[13px] text-muted-foreground line-clamp-2">
                    {g.description}
                  </CardContent>
                  <CardFooter className="px-4 pt-0 text-xs justify-between relative">
                    <span className={`uppercase tracking-wide text-[10px] px-2 py-0.5 rounded-full border ${g.status === "OPEN" ? "status-open" : g.status === "ASSIGNED" ? "status-assigned" : "status-done"}`}>
                      {t.status[g.status as any]}
                    </span>
                    <div className="absolute right-3 bottom-2 flex gap-2">
                      <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // open or create chat for this gig and participants
                        const otherId = author?.id === user.id ? g.assignedTo : author?.id;
                        if (!otherId) return;
                        fetch(`/api/chats?gigId=${g.id}&userA=${user.id}&userB=${otherId}`).then(async (r) => {
                          const existing = await r.json();
                          if (Array.isArray(existing) && existing.length) {
                            router.push(`/chats/${existing[0].id}`);
                          } else {
                            const created = await fetch(`/api/chats`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ gigId: g.id, participants: [user.id, otherId] }),
                            });
                            if (created.ok) {
                              const chat = await created.json();
                              router.push(`/chats/${chat.id}`);
                            }
                          }
                        });
                      }}>Text</Button>
                    </div>
                    <Link href={`/gigs/${g.id}`} className="absolute inset-0" aria-label={`View ${g.name}`}></Link>
                  </CardFooter>
                </Card>
              );
            });
          })()}
          {!((tab === "created" ? created : tab === "assigned" ? assigned : done).length) && (
            <div className="text-sm text-muted-foreground">No items</div>
          )}
        </div>
      </div>
    </div>
  );
}
