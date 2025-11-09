import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a stable, subtle color class for chip-like badges
export function getChipClasses(kind: "skill" | "neighborhood", value: string): string {
  const PALETTES = [
    "bg-emerald-50/60 text-emerald-900/80 border-emerald-200",
    "bg-teal-50/60 text-teal-900/80 border-teal-200",
    "bg-cyan-50/60 text-cyan-900/80 border-cyan-200",
    "bg-sky-50/60 text-sky-900/80 border-sky-200",
    "bg-blue-50/60 text-blue-900/80 border-blue-200",
    "bg-indigo-50/60 text-indigo-900/80 border-indigo-200",
    "bg-violet-50/60 text-violet-900/80 border-violet-200",
    "bg-fuchsia-50/60 text-fuchsia-900/80 border-fuchsia-200",
    "bg-rose-50/60 text-rose-900/80 border-rose-200",
    "bg-orange-50/60 text-orange-900/80 border-orange-200",
    "bg-amber-50/60 text-amber-900/80 border-amber-200",
    "bg-lime-50/60 text-lime-900/80 border-lime-200",
  ] as const;
  let hash = 0;
  const key = `${kind}:${value}`.toLowerCase();
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return PALETTES[hash % PALETTES.length];
}
