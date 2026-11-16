import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query"
import { ApiError } from "@/shared/api/errors"

export function createQueryClient(onApiError: (e: ApiError) => void): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (e) => onApiError(ApiError.from(e)),
    }),
    mutationCache: new MutationCache({
      onError: (e) => onApiError(ApiError.from(e)),
    }),
    defaultOptions: {
      queries: {
        staleTime: 5000,
        refetchOnWindowFocus: false,
        retry: (count, err) => ApiError.is(err) && err.code === "NETWORK" && count < 2,
      },
    },
  })
}
