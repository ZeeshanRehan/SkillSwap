import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

function getPaths() {
  const root = process.cwd();
  const chatsPath = path.join(root, "src/data/chats.json");
  return { chatsPath };
}

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const id = (await ctx.params).id;
  const body = await req.json();
  const { senderId, text } = body as { senderId: string; text: string };
  if (!senderId || !text) return new Response("Invalid payload", { status: 400 });
  const { chatsPath } = getPaths();
  const raw = await fs.readFile(chatsPath, "utf8");
  const chats = JSON.parse(raw);
  const chat = chats.find((c: any) => c.id === id);
  if (!chat) return new Response("Not found", { status: 404 });
  const msgId = "m" + Math.random().toString(36).slice(2, 8);
  const message = { id: msgId, senderId, text, createdAt: new Date().toISOString() };
  chat.messages.push(message);
  const tmp = chatsPath + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(chats, null, 2));
  await fs.rename(tmp, chatsPath);
  return new Response(JSON.stringify(message), { status: 201, headers: { "Content-Type": "application/json" } });
}

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const id = (await ctx.params).id;
  const { chatsPath } = getPaths();
  const raw = await fs.readFile(chatsPath, "utf8");
  const chats = JSON.parse(raw);
  const chat = chats.find((c: any) => c.id === id);
  if (!chat) return new Response("Not found", { status: 404 });
  return new Response(JSON.stringify(chat.messages || []), { status: 200, headers: { "Content-Type": "application/json" } });
}

