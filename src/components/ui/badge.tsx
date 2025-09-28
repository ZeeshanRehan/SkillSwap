import * as React from "react"

import { cn } from "@/lib/utils"

type BadgeProps = React.ComponentProps<"span"> & {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
        variant === "default" && "bg-muted text-foreground border-transparent",
        variant === "secondary" && "bg-secondary text-secondary-foreground border-transparent",
        variant === "destructive" && "bg-destructive text-destructive-foreground border-transparent",
        variant === "outline" && "bg-transparent text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Badge }
