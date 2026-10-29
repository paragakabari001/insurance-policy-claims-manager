import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm",
        primary: "bg-teal-600 text-white hover:bg-teal-700 shadow-sm shadow-teal-600/20",
        destructive: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
        outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-900 shadow-2xs",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200/80",
        ghost: "hover:bg-slate-100 hover:text-slate-900 text-slate-600",
        link: "text-primary underline-offset-4 hover:underline",
        emerald: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs font-semibold",
        lg: "h-11 rounded-xl px-6 text-base",
        icon: "h-9 w-9 rounded-lg",
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
