import Binance from 'binance-api-node';
import { NextResponse } from 'next/server';

export const GET = async () => {
    const binance = Binance();

    const exchangeInfo = await binance.futuresExchangeInfo();
    const symbols = exchangeInfo.symbols;

    return NextResponse.json(symbols || []);
};
