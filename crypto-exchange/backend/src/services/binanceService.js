const ccxt = require('ccxt');
const WebSocket = require('ws');

const exchange = new ccxt.binance();

const getMarkets = async () => {
  return await exchange.loadMarkets();
};

const getTickers = async (symbols = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT']) => {
  try {
    const tickers = await exchange.fetchTickers(symbols);
    return tickers;
  } catch (error) {
    console.error('Error fetching tickers', error);
    throw error;
  }
};

const getKlines = async (symbol, timeframe = '1h', limit = 100) => {
  try {
    const ohlcv = await exchange.fetchOHLCV(symbol, timeframe, undefined, limit);
    return ohlcv.map(candle => ({
      time: candle[0] / 1000,
      open: candle[1],
      high: candle[2],
      low: candle[3],
      close: candle[4],
      volume: candle[5],
    }));
  } catch (error) {
    console.error('Error fetching klines', error);
    throw error;
  }
};

// WebSocket connection for real-time market data
let binanceWs;

const startBinanceWebSockets = (io) => {
  // Symbols to track
  const symbols = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'XRP/USDT', 'ADA/USDT', 'DOGE/USDT', 'DOT/USDT', 'MATIC/USDT', 'LTC/USDT'];
  
  // Format for Binance streams (btcusdt@ticker)
  const streams = symbols.map(s => s.toLowerCase().replace('/', '') + '@ticker').concat(
    symbols.map(s => s.toLowerCase().replace('/', '') + '@depth20@100ms'),
    symbols.map(s => s.toLowerCase().replace('/', '') + '@trade')
  ).join('/');

  binanceWs = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

  binanceWs.on('open', () => {
    console.log('Connected to Binance WebSocket');
  });

  binanceWs.on('message', (data) => {
    const parsedData = JSON.parse(data);
    const stream = parsedData.stream;
    const raw = parsedData.data;

    // Standardize mapping to CCXT format used in frontend
    if (stream.includes('@ticker')) {
      const pair = stream.split('@')[0].toUpperCase().replace('USDT', '/USDT');
      io.to('global').to(pair).emit('ticker_update', {
        pair,
        data: {
          symbol: pair,
          last: parseFloat(raw.c),
          percentage: parseFloat(raw.p),
          high: parseFloat(raw.h),
          low: parseFloat(raw.l),
          baseVolume: parseFloat(raw.v),
          quoteVolume: parseFloat(raw.q),
          change: parseFloat(raw.p),
        }
      });
    }

    if (stream.includes('@depth')) {
      const pair = stream.split('@')[0].toUpperCase().replace('USDT', '/USDT');
      io.to(pair).emit('order_book_update', {
        pair,
        data: {
          bids: raw.bids.map(b => [parseFloat(b[0]), parseFloat(b[1])]),
          asks: raw.asks.map(a => [parseFloat(a[0]), parseFloat(a[1])])
        }
      });
    }

    if (stream.includes('@trade')) {
      const pair = stream.split('@')[0].toUpperCase().replace('USDT', '/USDT');
      io.to(pair).emit('recent_trade', {
        pair,
        data: {
          id: raw.t,
          price: parseFloat(raw.p),
          amount: parseFloat(raw.q),
          side: raw.m ? 'sell' : 'buy', // m: true if the buyer is the market maker (sell order)
          time: raw.T
        }
      });
    }
  });

  binanceWs.on('error', (err) => {
    console.error('Binance WebSocket Error:', err);
  });

  binanceWs.on('close', () => {
    console.log('Binance WebSocket Closed. Reconnecting...');
    setTimeout(() => startBinanceWebSockets(io), 5000); // Reconnect
  });
};

module.exports = {
  getMarkets,
  getTickers,
  getKlines,
  startBinanceWebSockets,
};
