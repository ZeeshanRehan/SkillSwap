"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--philly-green)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "border-l-4 border-[--philly-green]",
          success: "border-l-4 border-[--philly-green]",
          error: "border-l-4 border-red-500",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
