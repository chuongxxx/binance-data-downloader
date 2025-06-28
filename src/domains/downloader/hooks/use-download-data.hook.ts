import { useMutation } from "@shared/hooks/use-mutation.hook";
import { ServerResponse } from "@shared/interfaces/response.interface";

const pathKey = "/api/binance";

export function useDownloadMutation<T>() {
  const { trigger, isMutating, data } = useMutation<ServerResponse<T>>(pathKey);

  return { trigger, data: data?.data || data?.error?.message, isMutating };
}
