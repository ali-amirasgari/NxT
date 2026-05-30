import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-[loading=true]:pointer-events-none data-[loading=true]:opacity-80 data-[active=true]:ring-3 data-[active=true]:ring-ring/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "",
        outline:
          "border-border border-2 bg-background shadow-xs hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "underline-offset-4 hover:underline",
      },
      tone: {
        primary: "",
        secondary: "",
        tertiary: "",
        neutral: "",
      },
      size: {
        default:
          "h-9 gap-1.5 px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),8px)] px-2 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5",
        lg: "h-10 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-9",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),8px)] in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-md",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      tone: "primary",
      size: "default",
    },
    compoundVariants: [
      {
        variant: "default",
        tone: "primary",
        className:
          "bg-primary text-primary-foreground hover:bg-primary/90 aria-expanded:bg-primary aria-expanded:text-primary-foreground",
      },
      {
        variant: "default",
        tone: "secondary",
        className:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
      },
      {
        variant: "default",
        tone: "tertiary",
        className:
          "border-border bg-tertiary text-tertiary-foreground hover:bg-muted aria-expanded:bg-muted aria-expanded:text-foreground",
      },
      {
        variant: "default",
        tone: "neutral",
        className:
          "bg-muted text-foreground hover:bg-muted/80 aria-expanded:bg-muted aria-expanded:text-foreground",
      },
      {
        variant: "outline",
        tone: "primary",
        className: "border-primary/30 text-primary border-primary hover:bg-primary/10",
      },
      {
        variant: "outline",
        tone: "secondary",
        className: "border-secondary/30 text-secondary border-secondary hover:bg-secondary/10",
      },
      {
        variant: "outline",
        tone: "tertiary",
        className: "border-border text-tertiary-foreground border-tertiary hover:bg-muted",
      },
      {
        variant: "outline",
        tone: "neutral",
        className: "border-border text-foreground hover:bg-muted",
      },
      {
        variant: "ghost",
        tone: "primary",
        className: "text-primary hover:bg-primary/10",
      },
      {
        variant: "ghost",
        tone: "secondary",
        className: "text-secondary hover:bg-secondary/10",
      },
      {
        variant: "ghost",
        tone: "tertiary",
        className: "text-tertiary-foreground hover:bg-muted",
      },
      {
        variant: "ghost",
        tone: "neutral",
        className: "text-foreground hover:bg-muted",
      },
      {
        variant: "link",
        tone: "primary",
        className: "text-primary",
      },
      {
        variant: "link",
        tone: "secondary",
        className: "text-secondary",
      },
      {
        variant: "link",
        tone: "tertiary",
        className: "text-tertiary-foreground",
      },
      {
        variant: "link",
        tone: "neutral",
        className: "text-foreground",
      },
    ],
  }
)

function Button({
  children,
  className,
  variant = "default",
  tone = "primary",
  size = "default",
  asChild = false,
  loading = false,
  loadingText,
  active,
  disabled,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    loading?: boolean
    loadingText?: string
    active?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"
  const isDisabled = Boolean(disabled) || loading

  const content = asChild ? (
    children
  ) : (
    <>
      {loading ? <Spinner className="mr-2 size-4" /> : null}
      {loading && loadingText ? loadingText : children}
    </>
  )

  return (
    <Comp
      {...props}
      data-slot="button"
      data-variant={variant}
      data-tone={tone}
      data-size={size}
      data-loading={loading || undefined}
      data-active={active || undefined}
      aria-busy={loading || undefined}
      aria-pressed={typeof active === "boolean" ? active : undefined}
      disabled={asChild ? undefined : isDisabled}
      aria-disabled={asChild && isDisabled ? true : undefined}
      className={cn(buttonVariants({ variant, tone, size, className }))}
    >
      {content}
    </Comp>
  )
}

export { Button, buttonVariants }
