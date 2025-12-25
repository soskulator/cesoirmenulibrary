import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-copper text-white hover:bg-copper-light shadow-sm hover:shadow-md",
        destructive: "bg-destructive text-white hover:bg-destructive/90 shadow-sm",
        outline: "border border-input bg-white text-foreground hover:bg-muted hover:text-foreground",
        secondary: "bg-white text-charcoal border border-border hover:bg-cream shadow-sm",
        ghost: "text-foreground hover:bg-muted hover:text-foreground",
        link: "text-copper underline-offset-4 hover:underline",
        gold: "bg-copper text-white hover:bg-copper-light shadow-sm hover:shadow-md font-semibold",
        burgundy: "bg-copper text-white hover:bg-copper-light shadow-sm hover:shadow-md",
        "burgundy-outline": "border-2 border-copper text-copper bg-white hover:bg-copper hover:text-white",
        success: "bg-jade text-white hover:bg-jade-light shadow-sm",
        cream: "bg-white text-charcoal border border-border hover:bg-cream shadow-sm",
        "hero-outline": "border border-white/30 text-white bg-transparent hover:bg-white/10 font-medium",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
