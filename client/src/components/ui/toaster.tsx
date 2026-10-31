import React from "react"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast"
import { useToast } from "./use-toast"
import { CheckCircle2, AlertCircle, Info } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3 w-full pr-4">
              {variant === "success" && (
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#00ba63] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
                </div>
              )}
              {variant === "destructive" && (
                <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <AlertCircle className="h-4 w-4 stroke-[2.5]" />
                </div>
              )}
              {(!variant || variant === "default") && (
                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Info className="h-4 w-4" />
                </div>
              )}
              <div className="grid gap-1 min-w-0 flex-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
