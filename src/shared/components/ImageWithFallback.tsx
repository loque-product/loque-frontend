import { useState, type CSSProperties, type ReactNode } from "react"
import { cn } from "@/shared/utils/cn"

/** Gambar lazy dengan rasio tetap dan penampung netral bila gagal dimuat. */
export function ImageWithFallback({
  src,
  alt,
  className,
  ratio,
  fallback,
  eager,
}: {
  src: string | null | undefined
  alt: string
  className?: string
  /** Rasio lebar/tinggi, mis. 4/3. */
  ratio?: number
  fallback?: ReactNode
  eager?: boolean
}) {
  const [failed, setFailed] = useState(false)
  const style: CSSProperties | undefined = ratio ? { aspectRatio: String(ratio) } : undefined
  if (!src || failed)
    return (
      <div
        role="img"
        aria-label={alt}
        style={style}
        className={cn("flex items-center justify-center bg-slate-100 text-slate-500", className)}
      >
        {fallback}
      </div>
    )
  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      style={style}
      onError={() => setFailed(true)}
      className={cn("bg-slate-100 object-cover", className)}
    />
  )
}
