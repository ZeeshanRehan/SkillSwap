import { promises as fs } from "fs";
import path from "path";
import { calculateSuggestedTokens } from "@/lib/rewards";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      skill,
      neighborhood,
      tokenReward,
      timeCommitmentMinutes,
      createdBy,
    } = body || {};

    if (!name || !description || !skill || !neighborhood || !createdBy) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const gigsPath = path.join(process.cwd(), "src/data/gigs.json");
    const gigsRaw = await fs.readFile(gigsPath, "utf8");
    const gigs = JSON.parse(gigsRaw) as any[];

    const id = "g" + crypto.randomBytes(3).toString("hex");
    const now = new Date().toISOString();

    const { suggested } = calculateSuggestedTokens(timeCommitmentMinutes, skill);
    const minTokens = suggested;
    const provided = Number(tokenReward);
    const finalReward = Number.isFinite(provided) && provided > 0 ? Math.max(minTokens, provided) : minTokens;

    const gig = {
      id,
      createdBy,
      name,
      description,
      skill,
      neighborhood,
      status: "OPEN",
      tokenReward: finalReward,
      timeCommitmentMinutes: timeCommitmentMinutes ? Number(timeCommitmentMinutes) : undefined,
      createdAt: now,
      assignedTo: null,
    } as any;

    gigs.unshift(gig);

    const tmp = gigsPath + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(gigs, null, 2));
    await fs.rename(tmp, gigsPath);

    return new Response(JSON.stringify({ ok: true, gig }), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "Unknown error" }), { status: 500 });
  }
}

