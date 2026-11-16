import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ApiError } from "@/shared/api/errors"

interface Options<TArgs, TResult> {
  /** Domain query yang diinvalidasi setelah berhasil. */
  invalidate: string[]
  success?: string | ((result: TResult, args: TArgs) => string | undefined)
  /** Tampilkan toast galat otomatis (default true). */
  toastError?: boolean
  onSuccess?: (result: TResult, args: TArgs) => void
}

/** Mutasi dengan invalidasi kunci query dan toast, dengan galat bertipe. */
export function useMutate<TArgs, TResult>(
  fn: (args: TArgs) => Promise<TResult>,
  opts: Options<TArgs, TResult>,
) {
  const qc = useQueryClient()
  return useMutation<TResult, ApiError, TArgs>({
    mutationFn: async (args) => {
      try {
        return await fn(args)
      } catch (e) {
        throw ApiError.from(e)
      }
    },
    onSuccess: (result, args) => {
      for (const key of opts.invalidate) void qc.invalidateQueries({ queryKey: [key] })
      const msg = typeof opts.success === "function" ? opts.success(result, args) : opts.success
      if (msg) toast.success(msg)
      opts.onSuccess?.(result, args)
    },
    onError: (e) => {
      if (opts.toastError !== false && e.code !== "VALIDATION") toast.error(e.message)
    },
  })
}
