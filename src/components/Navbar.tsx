"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocale } from "@/context/LocaleContext";
import { getDict } from "@/lib/i18n";
import users from "@/data/users.json";
import { useUser } from "@/context/UserContext";

export default function Navbar() {
  const { locale, setLocale } = useLocale();
  const t = getDict(locale);
  const { userId } = useUser();
  const viewer = users.find((u) => u.id === userId) ?? users[0];

  return (
    <header className="sticky top-0 z-20 bg-background header-gradient header-shadow">
      <div className="max-w-xl mx-auto flex items-center gap-3 px-4 py-2">
        <Link href="/" className="font-semibold text-sm">SkillSwap PHL</Link>
        <nav className="ml-2 hidden sm:flex items-center gap-2 text-xs">
          <Link href="/profile" className="underline-offset-4 hover:underline">{t.actions.profile}</Link>
          <Link href="/reset" className="underline-offset-4 hover:underline">Reset</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => setLocale(locale === "en" ? "es" : "en")}>{locale.toUpperCase()}</Button>
          <Link href="/profile" className="hidden sm:flex items-center gap-2 rounded-full border px-2 py-1 text-xs bg-accent/60 hover:bg-accent transition-colors">
            <Image src="/coinlogo.png" alt="tokens" width={14} height={14} />
            <span className="font-medium tabular-nums">{viewer.wallet}</span>
            <span className="text-[10px] opacity-70">XP {viewer.xp}</span>
          </Link>
          <Link href="/profile" aria-label="Profile" className="shrink-0">
            <Avatar>
              <AvatarImage src={viewer.pfp} alt={viewer.name} />
              <AvatarFallback>
                <img src="https://github.com/evilrabbit.png" alt="fallback" className="aspect-square size-full" />
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
}
