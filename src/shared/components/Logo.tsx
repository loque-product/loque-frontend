import { cn } from "@/shared/utils/cn"

/** Logo Loque: kotak teal dengan lima daun putih. */
export function Logo({ className, title = "Loque" }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 736 736"
      role="img"
      aria-label={title}
      className={cn("size-10 shrink-0", className)}
    >
      <rect width="736" height="736" rx="130" fill="#086E70" />
      <g fill="#fff">
        <path d="M248 128H368A120 120 0 0 1 488 248H368A120 120 0 0 1 248 128Z" />
        <path d="M248 248V368A120 120 0 0 1 128 488V368A120 120 0 0 1 248 248Z" />
        <path d="M608 248V368A120 120 0 0 1 488 488V368A120 120 0 0 1 608 248Z" />
        <path d="M248 488H368A120 120 0 0 1 488 608H368A120 120 0 0 1 248 488Z" />
        <path d="M291 329H368A77 77 0 0 1 445 406H368A77 77 0 0 1 291 329Z" />
      </g>
    </svg>
  )
}
