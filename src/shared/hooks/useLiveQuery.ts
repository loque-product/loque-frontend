import { useQuery } from "@tanstack/react-query"
import { POLL_INTERVAL_MS } from "@/shared/constants"

/** Polling 30 detik. Dibungkus agar bisa diganti SSE atau WebSocket tanpa mengubah layar. */
export function useLiveQuery<T>(key: unknown[], fn: () => Promise<T>) {
  return useQuery({
    queryKey: key,
    queryFn: fn,
    refetchInterval: POLL_INTERVAL_MS,
  })
}
