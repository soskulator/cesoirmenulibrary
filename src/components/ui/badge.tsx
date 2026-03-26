import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        copper: "border-transparent bg-copper text-primary-foreground",
        gold: "border-transparent bg-copper text-charcoal",
        cream: "border-transparent bg-cream-dark text-charcoal",
        sage: "border-transparent bg-sage-light text-sage",
        allergen: "border-transparent bg-amber-100 text-amber-800",
        "allergen-gluten": "border-transparent bg-amber-100 text-amber-800",
        "allergen-dairy": "border-transparent bg-blue-100 text-blue-800",
        "allergen-egg": "border-transparent bg-yellow-100 text-yellow-800",
        "allergen-nuts": "border-transparent bg-orange-100 text-orange-800",
        "allergen-shellfish": "border-transparent bg-red-100 text-red-800",
        "allergen-fish": "border-transparent bg-cyan-100 text-cyan-800",
        "allergen-soy": "border-transparent bg-green-100 text-green-800",
        "allergen-sesame": "border-transparent bg-stone-100 text-stone-800",
        "allergen-allium": "border-transparent bg-purple-100 text-purple-800",
        "allergen-nightshade": "border-transparent bg-rose-100 text-rose-800",
        "allergen-vegetarian": "border-transparent bg-emerald-100 text-emerald-800",
        "allergen-vegan": "border-transparent bg-lime-100 text-lime-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
