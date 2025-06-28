import { queryFetcher } from "@shared/fetchers/query-fetcher";
import useSWR from "swr";

export function useQuery<T>(url: string) {
  const { data, isLoading, error, mutate } = useSWR<T>(url, queryFetcher);
  return { data, isLoading, error, mutate };
}
