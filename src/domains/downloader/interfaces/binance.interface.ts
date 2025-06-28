import { EInterval, ETradingStatus } from "../enums/binance.enum";

export interface IGetDataParams {
  interval: EInterval;
  symbol: string;
  isAllSymbol: boolean;
}

export interface IBinanceSymbol {
  symbol: string;
  status: ETradingStatus;
}

export interface IBinanceDatePair {
  startDate: number;
  endDate: number;
}

export interface IBinancePosition {
  price?: number;
}
