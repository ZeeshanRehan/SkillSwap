export type SkillCategory =
  | "Design"
  | "Bike Repair"
  | "Tutoring"
  | "Gardening"
  | "Dog Walking"
  | "Writing"
  | "Photography"
  | "Translation"
  | "Handyman"
  | "Cooking"
  | string

export function getSkillMultiplier(skill: SkillCategory): number {
  const normalized = (skill || "").toLowerCase()
  const technical = ["handyman", "bike repair", "design"]
  const skilled = ["tutoring", "writing", "translation", "photography"]

  if (technical.some((s) => normalized.includes(s))) return 1.5
  if (skilled.some((s) => normalized.includes(s))) return 1.25
  return 1.0
}

export function calculateSuggestedTokens(
  timeCommitmentMinutes?: number,
  skill?: SkillCategory
): { suggested: number; baseline: number; multiplier: number; minutes: number } {
  const minutes = Math.max(0, Math.floor(timeCommitmentMinutes || 0))
  const baselineRatePerMinute = 1 // 1 token per minute
  const baseline = Math.max(0, minutes * baselineRatePerMinute)
  const multiplier = getSkillMultiplier(skill || "")
  const raw = Math.ceil(baseline * multiplier)
  const floored = Math.max(10, raw) // minimum 10 tokens
  const roundedToFive = Math.ceil(floored / 5) * 5 // round UP to nearest 5
  return { suggested: roundedToFive, baseline, multiplier, minutes }
}
