import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

function getPaths() {
  const root = process.cwd();
  const chatsPath = path.join(root, "src/data/chats.json");
  return { chatsPath };
}

export async function GET(req: Request) {
  const { chatsPath } = getPaths();
  const url = new URL(req.url);
  const gigId = url.searchParams.get("gigId");
  const userA = url.searchParams.get("userA");
  const userB = url.searchParams.get("userB");
  const raw = await fs.readFile(chatsPath, "utf8");
  const chats = JSON.parse(raw);
  let result = chats;
  if (gigId) result = result.filter((c: any) => c.gigId === gigId);
  if (userA && userB) {
    result = result.filter((c: any) => c.participants.includes(userA) && c.participants.includes(userB));
  }
  return new Response(JSON.stringify(result), { status: 200, headers: { "Content-Type": "application/json" } });
}

export async function POST(req: Request) {
  const { chatsPath } = getPaths();
  const body = await req.json();
  const { gigId, participants } = body as { gigId: string; participants: string[] };
  if (!gigId || !participants || participants.length !== 2) {
    return new Response("Invalid payload", { status: 400 });
  }
  const raw = await fs.readFile(chatsPath, "utf8");
  const chats = JSON.parse(raw);
  const existing = chats.find((c: any) => c.gigId === gigId && participants.every((p) => c.participants.includes(p)));
  if (existing) {
    return new Response(JSON.stringify(existing), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  const id = `c_${gigId}`;
  const now = new Date().toISOString();
  const newChat = { id, gigId, participants, createdAt: now, messages: [] };
  const tmp = chatsPath + ".tmp";
  await fs.writeFile(tmp, JSON.stringify([...chats, newChat], null, 2));
  await fs.rename(tmp, chatsPath);
  return new Response(JSON.stringify(newChat), { status: 201, headers: { "Content-Type": "application/json" } });
}

