import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const root = process.cwd();
    const gigsBase = path.join(root, "src/data/gigs_base.json");
    const usersBase = path.join(root, "src/data/users_base.json");
    const chatsBase = path.join(root, "src/data/chats_base.json");
    const gigsPath = path.join(root, "src/data/gigs.json");
    const usersPath = path.join(root, "src/data/users.json");
    const chatsPath = path.join(root, "src/data/chats.json");

    const [gigsRaw, usersRaw, chatsRaw] = await Promise.all([
      fs.readFile(gigsBase, "utf8"),
      fs.readFile(usersBase, "utf8"),
      fs.readFile(chatsBase, "utf8"),
    ]);

    const gigsTmp = gigsPath + ".tmp";
    const usersTmp = usersPath + ".tmp";
    const chatsTmp = chatsPath + ".tmp";

    await Promise.all([
      fs.writeFile(gigsTmp, gigsRaw),
      fs.writeFile(usersTmp, usersRaw),
      fs.writeFile(chatsTmp, chatsRaw),
    ]);

    await Promise.all([
      fs.rename(gigsTmp, gigsPath),
      fs.rename(usersTmp, usersPath),
      fs.rename(chatsTmp, chatsPath),
    ]);

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "Unknown error" }), { status: 500 });
  }
}

