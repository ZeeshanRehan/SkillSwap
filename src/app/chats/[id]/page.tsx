"use client";

import { useEffect, useRef, useState } from "react";
import users from "@/data/users.json";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = useUser();
  const [resolved, setResolved] = useState<{ id: string } | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => setResolved(await params))();
  }, [params]);

  useEffect(() => {
    if (!resolved) return;
    let stop = false;
    async function load() {
      const res = await fetch(`/api/chats/${resolved?.id}/messages`);
      if (res.ok) {
        const data = await res.json();
        if (!stop) setMessages(data);
      }
    }
    load();
    const t = setInterval(load, 2500);
    return () => { stop = true; clearInterval(t); };
  }, [resolved]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length]);

  async function send() {
    if (!resolved || !userId || !text.trim()) return;
    const optimistic = { id: "tmp" + Math.random(), senderId: userId, text, createdAt: new Date().toISOString() };
    setMessages((m) => [...m, optimistic]);
    setText("");
    const res = await fetch(`/api/chats/${resolved.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId: userId, text: optimistic.text }),
    });
    if (!res.ok) {
      // rollback simple
      setMessages((m) => m.filter((x) => x !== optimistic));
    } else {
      const saved = await res.json();
      setMessages((m) => m.map((x) => (x === optimistic ? saved : x)));
    }
  }

  const me = users.find((u) => u.id === userId) ?? users[0];

  return (
    <div className="min-h-screen w-full p-4">
      <div className="max-w-xl mx-auto flex flex-col h-[70vh] border rounded-lg">
        <div className="px-3 py-2 border-b text-sm font-medium">Chat</div>
        <div ref={listRef} className="flex-1 overflow-auto p-3 bg-background/50 flex flex-col gap-2">
          {messages.map((m) => {
            const mine = m.senderId === me.id;
            return (
              <div key={m.id} className={`max-w-[75%] w-fit break-words rounded-md px-2 py-1 text-sm ${mine ? "self-end bg-[--philly-green]/20" : "self-start bg-accent/50"}`}>
                <div className={`text-[10px] opacity-60 ${mine ? "text-right" : "text-left"}`}>{new Date(m.createdAt).toLocaleTimeString()}</div>
                <div className="text-current">{m.text}</div>
              </div>
            );
          })}
          {!messages.length && (
            <div className="text-sm text-muted-foreground">No messages yet. Say hi!</div>
          )}
        </div>
        <div className="p-2 border-t flex items-center gap-2">
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message" onKeyDown={(e) => { if (e.key === "Enter") send(); }} />
          <Button size="sm" onClick={send}>Send</Button>
        </div>
      </div>
    </div>
  );
}


