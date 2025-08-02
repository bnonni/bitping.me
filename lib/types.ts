import { Alert, Invoice } from '@/prisma/generated';

export type Maybe<T> = T | any;
export type AlertInvoice = Alert & { invoice: Invoice };
export type BtcPrice = { time: number; price: number };
export type AvailableExchanges = 'kraken' | 'mempool' | 'coinbase' | 'coingecko' | 'binance' | 'bitstamp';
export type BtcPrices = Array<{
  time: number; // Timestamp in milliseconds
  price: number; // Price in USD
}>;