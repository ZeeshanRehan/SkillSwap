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
    const gigsRaw = await fs.readFile(gigsPath, "utf8");
    const gigs = JSON.parse(gigsRaw) as any[];

    const idx = gigs.findIndex((g) => g.id === id);
    if (idx === -1) {
      return new Response(JSON.stringify({ error: "Gig not found" }), { status: 404 });
    }

    const gig = gigs[idx];
    if (gig.status !== "OPEN") {
      return new Response(JSON.stringify({ error: "Gig is not open" }), { status: 400 });
    }

    gig.status = "ASSIGNED";
    gig.assignedTo = userId;

    const tmp = gigsPath + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(gigs, null, 2));
    await fs.rename(tmp, gigsPath);

    return new Response(JSON.stringify({ ok: true, gig }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? "Unknown error" }), { status: 500 });
  }
}
