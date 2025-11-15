import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center px-3 py-1 text-xs font-black transition-all duration-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 neo-badge",
  {
    variants: {
      variant: {
        default:
          "neo-blue",
        secondary:
          "neo-yellow",
        destructive:
          "neo-red",
        success:
          "neo-green",
        warning:
          "neo-orange",
        outline: "bg-white text-black border-2 border-black shadow-[2px_2px_0px_black]",
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