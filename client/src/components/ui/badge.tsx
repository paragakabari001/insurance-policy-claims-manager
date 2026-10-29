import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-slate-900 text-white shadow-2xs hover:bg-slate-900/80",
        secondary:
          "border-transparent bg-slate-100 text-slate-800 hover:bg-slate-100/80",
        destructive:
          "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100/80",
        outline: "text-slate-700 border-slate-200 bg-white",
        success:
          "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80",
        warning:
          "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100/80",
        teal:
          "border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100/80",
        indigo:
          "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100/80",
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
