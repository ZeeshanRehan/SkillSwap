"use client";

import gigs from "@/data/gigs.json";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import users from "@/data/users.json";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
// avatar moved to Navbar
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { calculateSuggestedTokens } from "@/lib/rewards";
import { getDict } from "@/lib/i18n";
import { useLocale } from "@/context/LocaleContext";
import { getChipClasses } from "@/lib/utils";
import Onboarding from "@/components/Onboarding";

export default function Home() {
  const { locale } = useLocale();
  const t = getDict(locale);
  const { userId } = useUser();
  const viewer = users.find((u) => u.id === userId) ?? users[0];
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [status, setStatus] = useState<"OPEN" | "ASSIGNED" | "DONE" | undefined>(undefined);

  const neighborhoodOptions = useMemo(() => Array.from(new Set(gigs.map((g) => g.neighborhood))), []);
  const skillOptions = useMemo(() => Array.from(new Set(gigs.map((g) => g.skill))), []);

  const filtered = useMemo(() => {
    return [...gigs].filter((g) => {
      if (selectedNeighborhoods.length && !selectedNeighborhoods.includes(g.neighborhood)) return false;
      if (selectedSkills.length && !selectedSkills.includes(g.skill)) return false;
      if (status && g.status !== status) return false;
      // By default hide DONE items on home unless explicitly filtered
      if (!status && g.status === "DONE") return false;
      // Hide own-created tasks on the main list
      if (!status && g.createdBy === userId) return false;
      return true;
    }).sort((a, b) => {
      const rank = (s: string) => (s === "OPEN" ? 0 : s === "ASSIGNED" ? 1 : 2);
      const r = rank(a.status) - rank(b.status);
      if (r !== 0) return r;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [selectedNeighborhoods, selectedSkills, status]);

  async function apply(gigId: string) {
    if (!userId) return;
    try {
      const res = await fetch(`/api/gigs/${gigId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Applied to gig");
    } catch (e) {
      toast.error("Failed to apply");
    }
  }

  async function done(gigId: string) {
    if (!userId) return;
    try {
      const res = await fetch(`/api/gigs/${gigId}/done`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Marked as done");
    } catch (e) {
      toast.error("Failed to mark done");
    }
  }

  return (
    <div className="min-h-screen w-full p-4">
      <div className="flex flex-col gap-3 max-w-xl mx-auto">
        {/* Hero */}
        <section className="min-h-[50vh] hero-bg rounded-xl border p-5 flex items-center">
          <div className="flex-1 pr-4">
            <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs hero-badge">
              <Image src="/coinlogo.png" alt="coin" width={14} height={14} />
              Earn tokens helping your neighbors
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-[--philly-green]">
              Small Acts. 
              <br />Big Impact.
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-prose">
              A lightweight mutual-aid network. <br />Post what you need, pitch in where you can,
              and see your block get stronger—one exchange at a time.
            </p>
            <div className="mt-4 flex gap-2 items-center flex-wrap">
              <a href="#create-jawn-cta" className="inline-flex items-center rounded-md border bg-[--philly-green] text-white px-3 py-2 text-sm pressable">
                Post a Jawn
              </a>
              <a href="#gigs-list" className="inline-flex items-center rounded-md border px-3 py-2 text-sm pressable">
                Browse gigs
              </a>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="text-xs underline underline-offset-4 opacity-80 hover:opacity-100" aria-label="What are $EAGLE tokens?">
                    About $EAGLE
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>About $EAGLE</DialogTitle>
                  </DialogHeader>
                  <div className="text-sm space-y-2">
                    <p>
                      $EAGLE tokens have <strong>no monetary value</strong>. They are a simple
                      medium of barter used within SkillSwap to acknowledge effort.
                    </p>
                    <p>
                      The blockchain provides a verifiable record — a <em>certificate of work</em> —
                      showing who helped whom and when. Think of it as receipts for
                      community-good, not currency.
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">Designed for generosity and accountability, not speculation.</div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="hidden sm:block flex-1 pl-4">
            <div className="hero-collage justify-end">
              <img src="/pfp/ava.jpeg" alt="neighbor" />
              <img src="/pfp/ben.jpeg" alt="neighbor" />
              <img src="/pfp/carla.jpeg" alt="neighbor" />
              <img src="/window.svg" alt="community" />
              <img src="/globe.svg" alt="community" />
              <img src="/file.svg" alt="community" />
            </div>
          </div>
        </section>
        <Onboarding
          active={true}
          steps={[
            { element: "#create-jawn-cta", intro: "Post a Jawn: Ask for neighborhood help (auto-suggested tokens)." },
            { element: ".pitch-in-btn:first-of-type", intro: "Pitch in: Apply to help a neighbor." },
            { element: ".all-set-btn:first-of-type", intro: "All set!: Mark your Jawn complete when done." },
          ]}
        />
        <div className="mt-6 pb-0 bg-background space-y-2">
          <div className="flex items-center gap-1">
            <Button
              variant={status === undefined ? "secondary" : "outline"}
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => setStatus(undefined)}
            >
              {t.filters.all}
            </Button>
            <Button
              variant={status === "OPEN" ? "secondary" : "outline"}
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => setStatus("OPEN")}
            >
              {t.filters.open}
            </Button>
            <Button
              variant={status === "ASSIGNED" ? "secondary" : "outline"}
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => setStatus("ASSIGNED")}
            >
              {t.filters.assigned}
            </Button>
            <Button
              variant={status === "DONE" ? "secondary" : "outline"}
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => setStatus("DONE")}
            >
              {t.filters.done}
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 px-2 text-xs border-[--philly-green] text-[--philly-green]">{t.filters.filter}</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>{t.filters.filter}</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-3 mt-2">
                    <div>
                      <div className="text-xs mb-1">{t.filters.neighborhoods}</div>
                      <div className="flex flex-wrap gap-1">
                        {neighborhoodOptions.map((n) => {
                          const active = selectedNeighborhoods.includes(n);
                          return (
                            <Button
                              key={n}
                              variant={active ? "secondary" : "outline"}
                              size="sm"
                              className="h-8 px-2 text-xs"
                              onClick={() =>
                                setSelectedNeighborhoods((prev) =>
                                  prev.includes(n) ? prev.filter((v) => v !== n) : [...prev, n]
                                )
                              }
                            >
                              {n}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs mb-1">{t.filters.skills}</div>
                      <div className="flex flex-wrap gap-1">
                        {skillOptions.map((s) => {
                          const active = selectedSkills.includes(s);
                          return (
                            <Button
                              key={s}
                              variant={active ? "secondary" : "outline"}
                              size="sm"
                              className="h-8 px-2 text-xs"
                              onClick={() =>
                                setSelectedSkills((prev) =>
                                  prev.includes(s) ? prev.filter((v) => v !== s) : [...prev, s]
                                )
                              }
                            >
                              {s}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <SheetClose asChild>
                        <Button size="sm" className="h-8 px-3">{t.filters.apply}</Button>
                      </SheetClose>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3"
                        onClick={() => {
                          setSelectedNeighborhoods([]);
                          setSelectedSkills([]);
                          setStatus(undefined);
                        }}
                      >
                        {t.filters.clear}
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
        <div className="mt-1" id="create-jawn-cta">
          <Dialog>
            <DialogTrigger asChild>
              <button className="w-full rounded-md border bg-accent/60 hover:bg-accent transition-colors text-sm py-2 px-3 flex items-center justify-center gap-2">
                <span className="text-base">+</span>
                <span>{t.actions.createJawn}</span>
              </button>
            </DialogTrigger>
            <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t.actions.createJawnTitle}</DialogTitle>
                  </DialogHeader>
              <CreateGigInline onCreated={() => toast.success(t.toasts.created)} />
            </DialogContent>
          </Dialog>
        </div>
        <div id="gigs-list"></div>
        {filtered.map((gig, idx) => {
          const author = users.find((u) => u.id === gig.createdBy);
          const viewerIsCreator = !!userId && userId === gig.createdBy;
          const canApply = !!userId && !viewerIsCreator && gig.status === "OPEN" && !gig.assignedTo;
          const canDone = !!userId && viewerIsCreator && gig.status === "ASSIGNED";
          return (
            <Card key={gig.id} className="py-4 gap-3 relative card-hover animate-in-up" style={{ animationDelay: `${idx * 40}ms` }}>
              <div className="absolute right-3 top-3 flex items-center gap-2">
                <Badge className="h-5 min-w-5 rounded-full px-2 font-mono tabular-nums philly-accent flex items-center gap-1" title={`Suggested ${calculateSuggestedTokens(gig.timeCommitmentMinutes, gig.skill).suggested} tokens`}>
                  <Image src="/coinlogo.png" alt="coin" width={12} height={12} />
                  <span className="opacity-90">+</span>
                  {gig.tokenReward}
                </Badge>
              </div>
              <CardHeader className="px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  {gig.name}
                  {gig.timeCommitmentMinutes ? (
                    <Badge variant="outline" className="h-5 px-1 text-[10px]">
                      {Math.round(gig.timeCommitmentMinutes)}m
                    </Badge>
                  ) : null}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] hover:scale-[1.02] transition-transform">
                    {author?.id === userId ? t.common.you : author?.name ?? "Unknown"}
                  </Badge>
                  <Badge variant="outline" className={`text-[10px] hover:scale-[1.02] transition-transform ${getChipClasses("neighborhood", gig.neighborhood)}`}>
                    {gig.neighborhood}
                  </Badge>
                  <Badge variant="outline" className={`text-[10px] hover:scale-[1.02] transition-transform ${getChipClasses("skill", gig.skill)}`}>
                    {gig.skill}
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
                {gig.description}
              </CardContent>
              <CardFooter className="px-4 pt-0 text-xs justify-between relative">
                <span className={`uppercase tracking-wide text-[10px] px-2 py-0.5 rounded-full border ${gig.status === "OPEN" ? "status-open" : gig.status === "ASSIGNED" ? "status-assigned" : "status-done"}`}>
                  {t.status[gig.status as keyof typeof t.status]}
                </span>
                <div className="absolute right-4 bottom-2 flex gap-2">
                  {/* Chat icon visible when task is OPEN (viewer can pitch in) or ASSIGNED (creator or assignee) */}
                  {((gig.status === "OPEN" && !!userId && userId !== gig.createdBy) ||
                    (gig.status === "ASSIGNED" && !!userId && (userId === gig.createdBy || userId === gig.assignedTo))) ? (
                    <button
                      className="h-7 w-7 grid place-items-center rounded-md border bg-accent/60 hover:bg-accent transition-colors"
                      aria-label="Text"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const otherId = gig.status === "OPEN" ? gig.createdBy : (userId === gig.createdBy ? gig.assignedTo : gig.createdBy);
                        if (!otherId) return;
                        fetch(`/api/chats?gigId=${gig.id}&userA=${userId}&userB=${otherId}`).then(async (r) => {
                          const existing = await r.json();
                          if (Array.isArray(existing) && existing.length) {
                            location.href = `/chats/${existing[0].id}`;
                          } else {
                            const created = await fetch(`/api/chats`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ gigId: gig.id, participants: [userId, otherId] }),
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
                  ) : null}
                  {canApply ? (
                    <Button size="sm" className="h-7 px-2 text-xs pitch-in-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); apply(gig.id); }}>{t.actions.apply}</Button>
                  ) : null}
                  {canDone ? (
                    <Button size="sm" variant="secondary" className="h-7 px-2 text-xs all-set-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); done(gig.id); }}>{t.actions.markDone}</Button>
                  ) : null}
                </div>
              </CardFooter>
              <Link href={`/gigs/${gig.id}`} className="absolute inset-0" aria-label={`View ${gig.name}`}></Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function CreateGigInline({ onCreated }: { onCreated: () => void }) {
  const { userId } = useUser();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [skill, setSkill] = useState<string | undefined>(undefined);
  const [neighborhood, setNeighborhood] = useState<string | undefined>(undefined);
  const [timeCommitmentMinutes, setTimeCommitmentMinutes] = useState("");
  const [pending, setPending] = useState(false);
  const suggestion = calculateSuggestedTokens(Number(timeCommitmentMinutes || 0), skill);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) {
      toast.error("Select a user on Login first");
      return;
    }
    if (!name || !description || !skill || !neighborhood) {
      toast.error("Fill all required fields");
      return;
    }
    try {
      setPending(true);
      const res = await fetch("/api/gigs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          skill,
          neighborhood,
          timeCommitmentMinutes: timeCommitmentMinutes ? Number(timeCommitmentMinutes) : undefined,
          createdBy: userId,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      onCreated();
      // naive refresh: just reload to pick updated JSON (keeps code minimal for hackathon)
      setTimeout(() => location.reload(), 300);
    } catch (e) {
      toast.error("Failed to create gig");
    } finally {
      setPending(false);
    }
  }

  const neighborhoods = Array.from(new Set(gigs.map((g) => g.neighborhood)));
  const skills = Array.from(new Set(gigs.map((g) => g.skill)));

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div>
        <Label htmlFor="name_inline">Name</Label>
        <Input id="name_inline" value={name} onChange={(e) => setName(e.target.value)} placeholder="What needs doing?" />
      </div>
      <div>
        <Label htmlFor="desc_inline">Description</Label>
        <Textarea id="desc_inline" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add details" />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <Label>Skill</Label>
          <Select value={skill} onValueChange={setSkill}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a skill" />
            </SelectTrigger>
            <SelectContent>
              {skills.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Label>Neighborhood</Label>
          <Select value={neighborhood} onValueChange={setNeighborhood}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select neighborhood" />
            </SelectTrigger>
            <SelectContent>
              {neighborhoods.map((n) => (
                <SelectItem key={n} value={n}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="time_inline">Time (min)</Label>
          <Input id="time_inline" type="number" min="0" value={timeCommitmentMinutes} onChange={(e) => setTimeCommitmentMinutes(e.target.value)} />
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm mt-1">
        <img src="/coinlogo.png" alt="coin" width="14" height="14" />
        <span className="font-medium">Estimated $EAGLE:</span>
        <span className="tabular-nums">{suggestion.suggested}</span>
        <span className="text-xs text-muted-foreground">({suggestion.minutes} min × {suggestion.multiplier}x)</span>
      </div>
      <div className="pt-2">
        <Button type="submit" disabled={pending}>Create gig</Button>
      </div>
    </form>
  );
}
