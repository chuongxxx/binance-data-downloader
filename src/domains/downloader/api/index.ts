import { NextRequest, NextResponse } from "next/server";
import path from "path";
import Binance, { CandleChartResult } from "binance-api-node";
import { createObjectCsvWriter } from "csv-writer";
import { existsSync } from "fs";
import { calculateDeltaTime } from "../utils/date.util";
import { ServerResponse } from "@shared/interfaces/response.interface";
import { EResponseStatus } from "@shared/enums/response.enum";

const UPLOAD_DIR = path.join(process.cwd(), "upload");
const LIMIT = 1500;

export const handleDownloadDataRequest = async (request: NextRequest) => {
  const body = await request.json();
  const { pathToSave, interval, symbol, isAllSymbol, ...rest } = body;

  const now = new Date();
  const oneMonthAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    now.getDate()
  );

  const currentYear = now.getFullYear();
  const startYear = 2019;

  const binance = Binance();
  const exchangeInfo = await binance.futuresExchangeInfo();

  let symbols = [{ symbol }];
  if (isAllSymbol) {
    symbols = exchangeInfo.symbols.filter((x) => x.quoteAsset === "USDT");
  }

  //Calculate logic to make sure api will get right data here
  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];
    console.log(`${i + 1}/${symbols.length} - processing ${symbol.symbol}`);

    for (let year = startYear; year <= currentYear; year++) {
      try {
        const yearStart = new Date(year, 0, 1).getTime();
        const yearEnd =
          year < currentYear
            ? new Date(year, 11, 31, 23, 59, 59).getTime()
            : oneMonthAgo.getTime();

        const fileName = `${symbol.symbol}_${interval}_${year}.csv`;
        const fullPath = `${UPLOAD_DIR}/${fileName}`;
        if (existsSync(fullPath)) {
          console.log(`  ↪ Skip ${symbol.symbol} ${year} (already exists)`);
          continue;
        }

        console.log(`  ↪ Downloading ${symbol.symbol} ${year}`);
        const datePairs = calculateDeltaTime(
          yearStart,
          yearEnd,
          LIMIT,
          interval
        );

        let yearData: CandleChartResult[] = [];

        for (const pair of datePairs) {
          await new Promise((resolve) => setTimeout(resolve, 150)); // Delay để tránh bị rate limit

          try {
            const response = await binance.futuresCandles({
              symbol: symbol.symbol,
              interval,
              limit: LIMIT,
              startTime: pair.startDate,
              endTime: pair.endDate,
              ...rest,
            });
            yearData.push(...response);
          } catch (error) {
            console.log(
              `    ⚠️ Error fetching ${symbol.symbol} from ${new Date(
                pair.startDate
              ).toISOString()} to ${new Date(pair.endDate).toISOString()}`
            );
            continue;
          }
        }

        if (yearData.length > 0) {
          const writer = createObjectCsvWriter({
            path: fullPath,
            header: Object.keys(yearData[0]).map((key) => ({
              id: key,
              title: key,
            })),
          });
          await writer.writeRecords(yearData);
          console.log(`    ✅ Saved ${fileName}`);
        } else {
          console.log(`    ⚠️ No data for ${symbol.symbol} in ${year}`);
        }
      } catch (err) {
        console.log(`    ❌ Error processing ${symbol.symbol} ${year}:`, err);
        continue;
      }
    }
  }
  console.log("🎉 All data is downloaded by symbol and year");

  return NextResponse.json(
    new ServerResponse(EResponseStatus.Success, "All data is downloaded")
  );
};
