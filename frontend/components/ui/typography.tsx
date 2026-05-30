"use client"

import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "scroll-m-20 text-4xl font-semibold tracking-tight lg:text-5xl",
      h2: "scroll-m-20 border-b border-border pb-2 text-3xl font-semibold tracking-tight first:mt-0",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight",
      p: "leading-7",
      lead: "text-xl text-muted-foreground",
      large: "text-lg font-semibold",
      small: "text-sm font-medium leading-none",
      muted: "text-sm text-muted-foreground",
      code: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm",
      blockquote: "mt-6 border-l-2 border-border pl-6 italic",
    },
    tone: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      primary: "text-primary",
      secondary: "text-secondary",
      tertiary: "text-tertiary-foreground",
      destructive: "text-destructive",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
      justify: "text-justify",
    },
  },
  defaultVariants: {
    variant: "p",
    tone: "default",
    align: "left",
  },
})

type TypographyProps = {
  asChild?: boolean
  as?: "p" | "span" | "div" | "label" | "h1" | "h2" | "h3" | "h4"
} & React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof typographyVariants>

function Typography({
  className,
  variant,
  tone,
  align,
  asChild,
  as,
  ...props
}: TypographyProps) {
  const Comp = (asChild ? Slot.Root : (as ?? "p")) as React.ElementType

  return (
    <Comp
      data-slot="typography"
      data-variant={variant ?? undefined}
      className={cn(typographyVariants({ variant, tone, align }), className)}
      {...props}
    />
  )
}

type ProseProps = React.ComponentProps<"article"> & {
  size?: "sm" | "base" | "lg"
  invert?: boolean
}

function Prose({
  className,
  size = "base",
  invert,
  ...props
}: ProseProps) {
  return (
    <article
      data-slot="prose"
      className={cn(
        "prose",
        size === "sm" && "prose-sm",
        size === "lg" && "prose-lg",
        invert && "dark:prose-invert",
        className
      )}
      {...props}
    />
  )
}

export { Typography, Prose, typographyVariants }

