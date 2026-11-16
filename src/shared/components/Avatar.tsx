import { cn } from "@/shared/utils/cn"
import { ImageWithFallback } from "./ImageWithFallback"

export function Avatar({
  name,
  src,
  className,
}: {
  name: string
  src?: string | null
  className?: string
}) {
  const initial = name.trim().slice(0, 1).toUpperCase() || "?"
  return (
    <span
      className={cn(
        "relative inline-flex size-10 shrink-0 overflow-hidden rounded-full bg-primary-100 text-sm font-semibold text-primary-800",
        className,
      )}
    >
      {src ? (
        <ImageWithFallback
          src={src}
          alt={name}
          className="size-full"
          fallback={<span className="flex size-full items-center justify-center">{initial}</span>}
        />
      ) : (
        <span className="flex size-full items-center justify-center" aria-hidden>
          {initial}
        </span>
      )}
    </span>
  )
}
