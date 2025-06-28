import { useQuery } from "@shared/hooks/use-query.hook";
import { IBinanceSymbol } from "../interfaces/binance.interface";

const pathKey = "/api/binance/symbols";
export function useGetSymbols() {
  const { data, isLoading } = useQuery<IBinanceSymbol[]>(pathKey);
  return { data: data || [], isLoading };
}
