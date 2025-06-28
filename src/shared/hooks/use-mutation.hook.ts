import { mutationFetcher } from "@shared/fetchers/mutation-fetcher";
import useSWRMutation from "swr/mutation";

export function useMutation<T>(pathKey: string) {
  const { trigger, isMutating, data, error } = useSWRMutation<T>(
    pathKey,
    mutationFetcher
  );
  return {
    trigger,
    isMutating,
    data,
    error,
  };
}
