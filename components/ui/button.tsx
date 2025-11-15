import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-black text-sm transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 neo-button",
  {
    variants: {
      variant: {
        default: "neo-blue text-white",
        destructive:
          "neo-red text-white",
        outline:
          "bg-white text-black border-2 border-black shadow-[4px_4px_0px_black] hover:shadow-[8px_8px_0px_black] hover:translate-y-[-4px] hover:translate-x-[-4px] focus:shadow-[8px_8px_0px_black] focus:translate-y-[-2px] focus:translate-x-[-2px]",
        secondary:
          "neo-yellow text-black",
        ghost: "bg-white text-black border-2 border-black shadow-[4px_4px_0px_black] hover:shadow-[8px_8px_0px_black] hover:translate-y-[-4px] hover:translate-x-[-4px] focus:shadow-[8px_8px_0px_black] focus:translate-y-[-2px] focus:translate-x-[-2px] hover:bg-yellow-100",
        link: "text-black underline-offset-4 hover:underline font-bold bg-transparent border-transparent shadow-none",
        neo: "bg-white text-black",
        success: "neo-green text-white",
        warning: "neo-orange text-white",
      },
      size: {
        default: "h-12 px-6 py-3 text-sm",
        sm: "h-10 px-4 py-2 text-xs",
        lg: "h-14 px-8 py-4 text-base",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "neo",
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