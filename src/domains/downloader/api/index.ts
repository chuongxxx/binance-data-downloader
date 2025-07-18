import { NextRequest } from "next/server";
import path from "path";
import Binance, {
  CandleChartInterval_LT,
  CandleChartResult,
} from "binance-api-node";
import { createObjectCsvWriter } from "csv-writer";
import { existsSync, mkdirSync } from "fs";
import { calculateDeltaTime } from "../utils/date.util";
import { EInterval } from "../enums/binance.enum";

const UPLOAD_DIR = path.join(process.cwd(), "upload");

const LIMIT = 1500;
const DELAY = 150;

export const handleDownloadDataRequest = async (req: NextRequest) => {
  const url = req.nextUrl;

  const symbol = url.searchParams.get("symbol");
  const isAllSymbol = url.searchParams.get("isAllSymbol") === "true";
  let interval = url.searchParams.get("interval");

  if (!symbol || !interval) {
    return;
  }

  if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const now = new Date();

        const currentYear = now.getFullYear();
        const startYear = 2019;

        const lastFullMonthIndex = now.getMonth() - 2;

        const binance = Binance();
        const exchangeInfo = await binance.futuresExchangeInfo();

        let symbols = [{ symbol }];
        if (isAllSymbol) {
          symbols = exchangeInfo.symbols.filter((x) => x.quoteAsset === "USDT");
        }

        for (let i = 0; i < symbols.length; i++) {
          const sym = symbols[i];
          controller.enqueue(
            `event: log\ndata: ${i + 1}/${symbols.length} - processing ${
              sym.symbol
            }\n\n`
          );

          for (let year = currentYear; year >= startYear; year--) {
            try {
              let yearStartTs: number;
              let yearEndTs: number;

              if (year === currentYear) {
                if (lastFullMonthIndex < 0) {
                  controller.enqueue(
                    `event: log\ndata:   ↪ Skip ${sym.symbol} ${year} (no full month data yet)\n\n`
                  );
                  continue;
                }
                yearStartTs = new Date(year, 0, 1).getTime();
                yearEndTs =
                  new Date(year, lastFullMonthIndex + 1, 1).getTime() - 1;
              } else {
                yearStartTs = new Date(year, 0, 1).getTime();
                yearEndTs = new Date(year, 11, 31, 23, 59, 59).getTime();
              }
              const fileName = `${sym.symbol}_${interval}_${year}.csv`;
              const fullPath = `${UPLOAD_DIR}/${fileName}`;

              if (existsSync(fullPath)) {
                controller.enqueue(
                  `event: log\ndata:   ↪ Skip ${sym.symbol} ${year} (already exists)\n\n`
                );
                continue;
              }

              controller.enqueue(
                `event: log\ndata:   ↪ Downloading ${sym.symbol} ${year}\n\n`
              );
              const datePairs = calculateDeltaTime(
                yearStartTs,
                yearEndTs,
                LIMIT,
                interval as EInterval
              );

              let yearData: CandleChartResult[] = [];

              for (const pair of datePairs) {
                await new Promise((r) => setTimeout(r, DELAY));

                try {
                  const response = await binance.futuresCandles({
                    symbol: sym.symbol,
                    interval: interval as CandleChartInterval_LT,
                    limit: LIMIT,
                    startTime: pair.startDate,
                    endTime: pair.endDate,
                  });
                  yearData.push(...response);
                } catch (err) {
                  controller.enqueue(
                    `event: log\ndata:     ⚠️ Error fetching ${
                      sym.symbol
                    } from ${new Date(
                      pair.startDate
                    ).toISOString()} to ${new Date(
                      pair.endDate
                    ).toISOString()} ${JSON.stringify(err)}\n\n`
                  );
                }
              }

              if (yearData.length === 0) {
                controller.enqueue(
                  `event: log\ndata:   ↪ ❌ No data for ${sym.symbol} in ${year}, skip symbol\n\n`
                );
                break;
              }

              const writer = createObjectCsvWriter({
                path: fullPath,
                header: Object.keys(yearData[0]).map((k) => ({
                  id: k,
                  title: k,
                })),
              });
              await writer.writeRecords(yearData);
              controller.enqueue(
                `event: log\ndata:     ✅ Saved ${fileName}\n\n`
              );
            } catch (err) {
              controller.enqueue(
                `event: log\ndata:     ❌ Error processing ${
                  sym.symbol
                } ${year}: ${JSON.stringify(err)}\n\n`
              );
            }
          }
        }

        controller.enqueue(
          `event: done\ndata: 🎉 All data is downloaded by symbol and year\n\n`
        );
        controller.close();
      } catch (e) {
        controller.enqueue(`event: error\ndata: ❌ ${JSON.stringify(e)}\n\n`);
        controller.close();
      }
    },
  });
  return stream;
};
