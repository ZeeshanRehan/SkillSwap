"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type AvatarContextValue = {
  status: "idle" | "loaded" | "error"
  setStatus: (s: "idle" | "loaded" | "error") => void
}

const AvatarContext = React.createContext<AvatarContextValue | null>(null)

function Avatar({ className, children, ...props }: React.ComponentProps<"div">) {
  const [status, setStatus] = React.useState<"idle" | "loaded" | "error">("idle")
  return (
    <AvatarContext.Provider value={{ status, setStatus }}>
      <div
        data-slot="avatar"
        className={cn("relative flex size-8 shrink-0 overflow-hidden rounded-full", className)}
        {...props}
      >
        {children}
      </div>
    </AvatarContext.Provider>
  )
}

function AvatarImage({ className, onLoad, onError, ...props }: React.ComponentProps<"img">) {
  const ctx = React.useContext(AvatarContext)
  return (
    <img
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      onLoad={(e) => {
        ctx?.setStatus("loaded")
        onLoad?.(e)
      }}
      onError={(e) => {
        ctx?.setStatus("error")
        onError?.(e as any)
      }}
      {...props}
    />
  )
}

function AvatarFallback({ className, children, ...props }: React.ComponentProps<"div">) {
  const ctx = React.useContext(AvatarContext)
  const show = ctx?.status !== "loaded"
  if (!show) return null
  return (
    <div
      data-slot="avatar-fallback"
      className={cn("bg-muted flex size-full items-center justify-center rounded-full text-xs", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Avatar, AvatarImage, AvatarFallback }
