import { AvailableExchanges, BtcPrices } from './types';

/**
 * Exchange class and its implementations for fetching cryptocurrency prices.
 * This module provides a base class for exchanges and specific implementations
 * for Kraken, Coinbase, CoinGecko, Binance, and Bitstamp.
 * Each exchange class implements the `getTicker` method to fetch the current price of Bitcoin in USD.
 * Additionally, the `Kraken` and `Mempool` classes provide a method to fetch historical ticker data.
 * @class Exchange
 * @type {Exchange}
 */
export abstract class Exchange {
  public name: string;
  public apiUrl: string;

  constructor(name: string, apiUrl: string) {
    this.name = name;
    this.apiUrl = apiUrl;
  }

  abstract getTicker(): Promise<number>;
  abstract getTickerHistory(): Promise<BtcPrices>;

  public static async getTickerHistory(): Promise<BtcPrices> {
    return await new Kraken().getTickerHistory();
  }

  static getExchangeInstance(name: AvailableExchanges): Exchange {
    switch (name.toLowerCase()) {
      case 'kraken': return new Kraken();
      case 'mempool': return new Mempool();
      case 'coinbase': return new Coinbase();
      case 'coingecko': return new CoinGecko();
      case 'binance': return new Binance();
      case 'bitstamp': return new Bitstamp();
      default: throw new Error(`Exchange '${name}' not supported.`);
    }
  }
}

/**
 * Concrete implementation of the Exchange class for Kraken.
 * @class Kraken
 * @type {Kraken}
 * @extends Exchange
 */
export class Kraken extends Exchange {
  constructor() {
    super('kraken', 'https://api.kraken.com/0/public');
  }

  public async getTicker(): Promise<number> {
    const res = await fetch(`${this.apiUrl}/Ticker?pair=XBTUSD`);
    const data = await res.json();
    return parseFloat(data.result.XXBTZUSD.c[0]);
  }

  public async getTickerHistory(interval: number = 5): Promise<BtcPrices> {
    try {
      const res = await fetch(`${this.apiUrl}/OHLC?pair=XBTUSD&interval=${interval}`);
      const data = await res.json();
      const ohlc = data.result?.XXBTZUSD || [];

      return ohlc.slice(-50).map(([time, open]: [number, string]) => ({
        time  : time * 1000,
        price : parseFloat(open),
      }));
    } catch (error) {
      console.error('Error fetching ticker history from Kraken:', error);
      return [];
    }
  }
}

/**
 * Concrete implementation of the Exchange class for Mempool.
 * @class Mempool
 * @type {Mempool}
 * @extends Exchange
 */
export class Mempool extends Exchange {
  constructor() {
    super('mempool', 'https://mempool.space/api/v1');
  }

  public async getTicker(): Promise<number> {
    const res = await fetch(`${this.apiUrl}/prices`);
    const data = await res.json();
    return parseFloat(data.USD);
  }

  public async getTickerHistory(timestamp: number = Date.now() - (24 * 60 * 60 * 1000)): Promise<BtcPrices> {
    try {
      const history: BtcPrices = [];
      let i = 0;
      do {
        const timestampSeconds = Math.floor(timestamp / 1000);
        const res = await fetch(`${this.apiUrl}/historical-price?currency=USD&timestamp=${timestampSeconds}`);
        const data = await res.json();
        if (data.prices && data.prices.length > 0) {
          const { time, USD } = data.prices[0];
          history.push({ time: time * 1000, price: parseFloat(USD) });
        } else {
          console.warn(`No price data for timestamp ${timestampSeconds}`);
        }
        timestamp += 60 * 60 * 1000; // Increment by 1 hour
        i++;
      } while (i <= 24);
      return history;
    } catch (error) {
      console.error('Error fetching ticker history from Mempool:', error);
      return [];
    }
  }
}

/**
 * Concrete implementation of the Exchange class for Coinbase.
 * @class Coinbase
 * @type {Coinbase}
 * @extends Exchange
 */
export class Coinbase extends Exchange {
  constructor() {
    super('coinbase', 'https://api.coinbase.com/v2');
  }

  public async getTicker(): Promise<number> {
    const res = await fetch(`${this.apiUrl}/prices/BTC-USD/spot`);
    const data = await res.json();
    return parseFloat(data.data.amount);
  }

  public async getTickerHistory(): Promise<BtcPrices> {
    return await Exchange.getTickerHistory();
  }
}

/**
 * Concrete implementation of the Exchange class for CoinGecko.
 * @class CoinGecko
 * @type {CoinGecko}
 * @extends Exchange
 */
export class CoinGecko extends Exchange {
  constructor() {
    super('coingecko', 'https://api.coingecko.com/api/v3');
  }

  public async getTicker(): Promise<number> {
    const res = await fetch(`${this.apiUrl}/simple/price?ids=bitcoin&vs_currencies=usd`);
    const data = await res.json();
    return data.bitcoin.usd;
  }

  public async getTickerHistory(): Promise<BtcPrices> {
    return await Exchange.getTickerHistory();
  }
}

/**
 * Concrete implementation of the Exchange class for Binance.
 * @class Binance
 * @type {Binance}
 * @extends Exchange
 */
export class Binance extends Exchange {
  constructor() {
    super('binance', 'https://api.binance.com/api/v3');
  }

  public async getTicker(): Promise<number> {
    const res = await fetch(`${this.apiUrl}/ticker/price?symbol=BTCUSDT`);
    const data = await res.json();
    return parseFloat(data.price);
  }

  public async getTickerHistory(): Promise<BtcPrices> {
    return await Exchange.getTickerHistory();
  }
}

/**
 * Concrete implementation of the Exchange class for Bitstamp.
 * @class Bitstamp
 * @type {Bitstamp}
 * @extends Exchange
 */
export class Bitstamp extends Exchange {
  constructor() {
    super('bitstamp', 'https://www.bitstamp.net/api/v2');
  }

  public async getTicker(): Promise<number> {
    const res = await fetch(`${this.apiUrl}/ticker/btcusd`);
    const data = await res.json();
    return parseFloat(data.last);
  }

  public async getTickerHistory(): Promise<BtcPrices> {
    return await Exchange.getTickerHistory();
  }
}