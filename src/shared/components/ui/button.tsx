import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { Slot } from "radix-ui"
import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/shared/utils/cn"

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary-700 text-white hover:bg-primary-800",
        secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200",
        ghost: "text-slate-700 hover:bg-slate-100",
        warning: "bg-warning-600 text-white hover:bg-warning-700",
        danger: "bg-danger-600 text-white hover:bg-danger-700",
        sidebar: "text-primary-50 hover:bg-primary-800",
      },
      size: {
        default: "h-11 px-4",
        sm: "relative h-8 px-3 before:absolute before:inset-x-0 before:-inset-y-1.5 before:content-['']",
        icon: "size-11",
        "icon-sm": "relative size-8 before:absolute before:-inset-1.5 before:content-['']",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild, loading, disabled, children, type = "button", ...props },
  ref,
) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : type}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {children}
        </>
      )}
    </Comp>
  )
})
