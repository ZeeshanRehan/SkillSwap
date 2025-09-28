"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import { calculateSuggestedTokens } from "@/lib/rewards";
import { getDict } from "@/lib/i18n";
import { useLocale } from "@/context/LocaleContext";

const neighborhoods = [
  "Fishtown",
  "South Philly",
  "University City",
  "Fairmount",
  "Northern Liberties",
  "Center City",
  "Kensington",
  "West Philly",
  "Queen Village",
];

const skills = [
  "Design",
  "Bike Repair",
  "Tutoring",
  "Gardening",
  "Dog Walking",
  "Writing",
  "Photography",
  "Translation",
  "Handyman",
  "Cooking",
];

export default function NewGigPage() {
  const router = useRouter();
  const { userId } = useUser();
  const { locale } = useLocale();
  const t = getDict(locale);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [skill, setSkill] = useState<string | undefined>(undefined);
  const [neighborhood, setNeighborhood] = useState<string | undefined>(undefined);
  const [timeCommitmentMinutes, setTimeCommitmentMinutes] = useState("");
  const [pending, setPending] = useState(false);

  const suggestion = calculateSuggestedTokens(
    Number(timeCommitmentMinutes || 0),
    skill
  );

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
          // tokenReward omitted; server will calculate suggested minimum
          timeCommitmentMinutes: timeCommitmentMinutes ? Number(timeCommitmentMinutes) : undefined,
          createdBy: userId,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Gig created");
      router.push("/");
    } catch (e) {
      toast.error("Failed to create gig");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen w-full p-4">
      <form onSubmit={onSubmit} className="max-w-xl mx-auto flex flex-col gap-3">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="What needs doing?" />
        </div>
        <div>
          <Label htmlFor="desc">Description</Label>
          <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add details" />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <Label>{t.labels.skill}</Label>
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
            <Label>{t.labels.neighborhood}</Label>
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
            <Label htmlFor="time">{t.labels.timeMin}</Label>
            <Input id="time" type="number" min="0" value={timeCommitmentMinutes} onChange={(e) => setTimeCommitmentMinutes(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm mt-1">
          <img src="/coinlogo.png" alt="coin" width="14" height="14" />
          <span className="font-medium">{t.labels.estimatedEagle}</span>
          <span className="tabular-nums">{suggestion.suggested}</span>
          <span className="text-xs text-muted-foreground">({suggestion.minutes} min × {suggestion.multiplier}x)</span>
        </div>
        <div className="pt-2">
          <Button type="submit" disabled={pending}>Create gig</Button>
        </div>
      </form>
    </div>
  );
}
