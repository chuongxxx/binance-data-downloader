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
    case EInterval.One_Minute:
      intervalNumber *= 1;
      break;
    case EInterval.Three_Minute:
      intervalNumber *= 3;
      break;
    case EInterval.Five_Minute:
      intervalNumber *= 5;
      break;
    case EInterval.Fifteen_Minute:
      intervalNumber *= 15;
      break;
    case EInterval.Thirty_Minute:
      intervalNumber *= 30;
      break;
    case EInterval.One_Hour:
      intervalNumber * 60;
      break;
    case EInterval.Two_Hour:
      intervalNumber *= 120;
      break;
    case EInterval.Four_Hour:
      intervalNumber *= 240;
      break;
    case EInterval.One_Day:
      intervalNumber *= 1440;
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
