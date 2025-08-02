import { Exchange } from '@/lib/exchange';

const exchange = Exchange.getExchangeInstance('mempool');

const history = await exchange.getTickerHistory();
console.log(history);