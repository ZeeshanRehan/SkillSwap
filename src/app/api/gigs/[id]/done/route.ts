import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const { userId } = await request.json();
    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), { status: 400 });
    }

    const gigsPath = path.join(process.cwd(), "src/data/gigs.json");
    const usersPath = path.join(process.cwd(), "src/data/users.json");

    const [gigsRaw, usersRaw] = await Promise.all([
      fs.readFile(gigsPath, "utf8"),
      fs.readFile(usersPath, "utf8"),
    ]);

    const gigs = JSON.parse(gigsRaw) as any[];
    const users = JSON.parse(usersRaw) as any[];

    const idx = gigs.findIndex((g) => g.id === id);
    if (idx === -1) {
      return new Response(JSON.stringify({ error: "Gig not found" }), { status: 404 });
    }

    const gig = gigs[idx];

    if (gig.status !== "ASSIGNED") {
      return new Response(JSON.stringify({ error: "Gig is not assigned" }), { status: 400 });
    }

    if (gig.assignedTo !== userId && gig.createdBy !== userId) {
      return new Response(JSON.stringify({ error: "Not authorized" }), { status: 403 });
    }

    gig.status = "DONE";
    gig.dateCompleted = new Date().toISOString();

    const creator = users.find((u) => u.id === gig.createdBy);
    const worker = users.find((u) => u.id === gig.assignedTo);

    if (creator && typeof creator.wallet === "number") {
      creator.wallet = Math.max(0, creator.wallet - gig.tokenReward);
    }
    if (worker && typeof worker.wallet === "number") {
      worker.wallet = worker.wallet + gig.tokenReward;
      worker.xp = (worker.xp ?? 0) + gig.tokenReward;
      worker.gigsDone = Array.isArray(worker.gigsDone)
        ? [...worker.gigsDone, gig.id]
        : [gig.id];
    }

    const gigsTmp = gigsPath + ".tmp";
    const usersTmp = usersPath + ".tmp";
    await Promise.all([
      fs.writeFile(gigsTmp, JSON.stringify(gigs, null, 2)),
      fs.writeFile(usersTmp, JSON.stringify(users, null, 2)),
    ]);
    await Promise.all([
      fs.rename(gigsTmp, gigsPath),
      fs.rename(usersTmp, usersPath),
    ]);

    return new Response(JSON.stringify({ ok: true, gig }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? "Unknown error" }), { status: 500 });
  }
}
