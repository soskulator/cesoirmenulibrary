import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-copper text-white hover:bg-copper-light shadow-sm hover:shadow-md dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90 shadow-sm dark:bg-destructive dark:text-destructive-foreground",
        outline: "border border-input bg-white text-foreground hover:bg-muted hover:text-foreground dark:bg-card dark:text-foreground dark:border-border dark:hover:bg-muted",
        secondary: "bg-white text-charcoal border border-border hover:bg-cream shadow-sm dark:bg-secondary dark:text-secondary-foreground dark:border-border dark:hover:bg-secondary/80",
        ghost: "text-foreground hover:bg-muted hover:text-foreground dark:text-foreground dark:hover:bg-muted",
        link: "text-copper underline-offset-4 hover:underline dark:text-primary",
        gold: "bg-copper text-white hover:bg-copper-light shadow-sm hover:shadow-md font-semibold dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90",
        burgundy: "bg-copper text-white hover:bg-copper-light shadow-sm hover:shadow-md dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90",
        "burgundy-outline": "border-2 border-copper text-copper bg-white hover:bg-copper hover:text-white dark:border-primary dark:text-primary dark:bg-transparent dark:hover:bg-primary dark:hover:text-primary-foreground",
        success: "bg-jade text-white hover:bg-jade-light shadow-sm dark:bg-jade dark:text-white dark:hover:bg-jade-light",
        cream: "bg-white text-charcoal border border-border hover:bg-cream shadow-sm dark:bg-card dark:text-foreground dark:border-border dark:hover:bg-muted",
        "hero-outline": "border border-white/30 text-white bg-transparent hover:bg-white/10 font-medium dark:border-primary/50 dark:text-primary dark:hover:bg-primary/10",
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
