import { EInterval } from "../enums/binance.enum";
import { IBinanceDatePair } from "../interfaces/binance.interface";

export const calculateDeltaTime = (
  start: number,
  end: number,
  limit: number,
  interval: EInterval
): IBinanceDatePair[] => {
  //Convert interval to ms
  let intervalNumber = 60 * 1000;
  switch (interval) {
    case EInterval.Five_Minute:
      intervalNumber *= 5;
      break;
    case EInterval.Three_Minute:
      intervalNumber *= 3;
      break;
    default:
      break;
  }
  //Seperate time
  const numberCandles = (end - start) / intervalNumber;
  const result = new Array<IBinanceDatePair>();
  if (numberCandles <= 0) {
    return result;
  }
  if (numberCandles < limit) {
    result.push({ startDate: start, endDate: end });
    return result;
  }
  const segments = numberCandles / limit;
  for (let i = 0; i < segments; i++) {
    result.push({
      startDate: start + i * limit * intervalNumber,
      endDate:
        start + (i + 1) * limit * intervalNumber - end <= 0
          ? start + (i + 1) * limit * intervalNumber
          : end,
    });
  }

  return result;
};
