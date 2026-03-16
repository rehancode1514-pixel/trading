import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useMarketStore from '../store/marketStore';
import useAuthStore from '../store/authStore';
import useTradeStore from '../store/tradeStore';
import useWalletStore from '../store/walletStore';
import Chart from '../components/Chart';
import classNames from 'classnames';

const Trade = () => {
  const { pair } = useParams(); // e.g. BTC-USDT
  const formattedPair = pair.replace('-', '/');
  const [baseAsset, quoteAsset] = formattedPair.split('/');

  const { initSocket, setActivePair, tickers, orderBook, recentTrades, disconnectSocket } = useMarketStore();
  const { user } = useAuthStore();
  const { placeOrder, openOrders, orderHistory, fetchOpenOrders, fetchOrderHistory, cancelOrder } = useTradeStore();
  const { wallets, fetchWallets } = useWalletStore();

  const [orderType, setOrderType] = useState('limit'); // limit, market
  const [side, setSide] = useState('buy');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [localError, setLocalError] = useState('');

  const ticker = tickers[formattedPair] || {};
  const currentPrice = ticker.last || 0;

  useEffect(() => {
    initSocket();
    setActivePair(formattedPair);

    if (user?.token) {
      fetchWallets(user.token);
      fetchOpenOrders(user.token);
      fetchOrderHistory(user.token);
    }
    
    return () => {
      // Opt not to disconnect entirely on unmount if we have global socket, but component cleanly handles lifecycle via setActivePair
    };
  }, [formattedPair, initSocket, setActivePair, user, fetchWallets, fetchOpenOrders, fetchOrderHistory]);

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!user) {
      setLocalError('Please login to trade');
      return;
    }

    try {
      await placeOrder(user.token, {
        pair: formattedPair,
        type: orderType,
        side,
        amount: Number(amount),
        price: orderType === 'limit' ? Number(price) : undefined,
      });
      setAmount('');
      if (orderType === 'limit') setPrice('');
      fetchWallets(user.token); // Refresh balance
      alert('Order placed successfully');
    } catch (err) {
      setLocalError('Failed to place order. Check balances.');
    }
  };

  const getBalance = (asset) => {
    const w = wallets.find(w => w.asset === asset);
    return w ? w.balance - w.locked : 0;
  };

  const baseBalance = getBalance(baseAsset);
  const quoteBalance = getBalance(quoteAsset);

  return (
    <div className="flex-grow flex flex-col md:flex-row bg-bg-dark text-white text-sm pb-10">
      {/* Left Column: Chart & Open Orders */}
      <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col border-r border-[#2b3139]">
        {/* Ticker Header */}
        <div className="flex items-center px-4 py-3 bg-[#181a20] border-b border-[#2b3139] space-x-6 overflow-x-auto">
          <h1 className="text-2xl font-bold">{formattedPair}</h1>
          <div>
            <div className="text-gray-400 text-xs">Price</div>
            <div className={classNames('text-lg font-medium', ticker.percentage >= 0 ? 'text-green-neon' : 'text-red-neon')}>
              {currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-xs">24h Change</div>
            <div className={classNames('font-medium', ticker.percentage >= 0 ? 'text-green-neon' : 'text-red-neon')}>
              {ticker.percentage?.toFixed(2)}%
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-xs">24h High</div>
            <div className="font-medium">{ticker.high?.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs">24h Low</div>
            <div className="font-medium">{ticker.low?.toLocaleString()}</div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="w-full relative z-0">
          <Chart pair={formattedPair} />
        </div>

        {/* Orders Table Area */}
        <div className="flex-grow bg-[#181a20] border-t border-[#2b3139] p-4">
          <h3 className="text-lg font-bold mb-4">Open Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 border-b border-[#2b3139]">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Pair</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Side</th>
                  <th className="pb-2 text-right">Price</th>
                  <th className="pb-2 text-right">Amount</th>
                  <th className="pb-2 text-right">Filled</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {openOrders.length === 0 ? (
                  <tr><td colSpan="8" className="py-4 text-center text-gray-500">No open orders</td></tr>
                ) : (
                  openOrders.map(order => (
                    <tr key={order._id} className="border-b border-[#21262d]">
                      <td className="py-2">{new Date(order.createdAt).toLocaleString()}</td>
                      <td className="py-2 font-bold">{order.pair}</td>
                      <td className="py-2 uppercase">{order.type}</td>
                      <td className={classNames('py-2 uppercase font-medium', order.side === 'buy' ? 'text-green-neon' : 'text-red-neon')}>
                        {order.side}
                      </td>
                      <td className="py-2 text-right">{order.price || 'Market'}</td>
                      <td className="py-2 text-right">{order.amount}</td>
                      <td className="py-2 text-right">{(order.filled / order.amount * 100).toFixed(1)}%</td>
                      <td className="py-2 text-right">
                        <button 
                          onClick={() => cancelOrder(user.token, order._id)}
                          className="text-red-neon hover:underline"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Column: Order Book & Order Form */}
      <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col h-[calc(100vh-57px)] sticky top-[57px]">
        {/* Order Form */}
        <div className="p-4 bg-[#181a20] border-b border-[#2b3139]">
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setSide('buy')}
              className={classNames('flex-1 py-2 font-bold rounded transition-colors', side === 'buy' ? 'bg-green-neon text-black' : 'bg-[#2b3139] text-gray-300')}
            >
              Buy
            </button>
            <button
              onClick={() => setSide('sell')}
              className={classNames('flex-1 py-2 font-bold rounded transition-colors', side === 'sell' ? 'bg-red-neon text-black' : 'bg-[#2b3139] text-gray-300')}
            >
              Sell
            </button>
          </div>

          <div className="flex space-x-4 border-b border-[#2b3139] mb-4">
             <button
               onClick={() => setOrderType('limit')}
               className={classNames('pb-2 font-medium', orderType === 'limit' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'text-gray-400')}
             >
               Limit
             </button>
             <button
               onClick={() => setOrderType('market')}
               className={classNames('pb-2 font-medium', orderType === 'market' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'text-gray-400')}
             >
               Market
             </button>
          </div>

          <div className="flex justify-between text-xs text-gray-400 mb-4">
            <span>Avail. {baseBalance.toFixed(4)} {baseAsset}</span>
            <span>Avail. {quoteBalance.toFixed(2)} {quoteAsset}</span>
          </div>

          {localError && <div className="text-red-neon text-xs mb-2">{localError}</div>}

          <form onSubmit={handleOrderSubmit} className="space-y-4">
            {orderType === 'limit' && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">Price</div>
                <input
                  type="number" step="any" required
                  className="w-full bg-[#0b0e11] border border-[#2b3139] rounded px-3 py-2 text-right pl-16 focus:border-yellow-500 outline-none"
                  value={price} onChange={(e) => setPrice(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">{quoteAsset}</div>
              </div>
            )}
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">Amount</div>
              <input
                type="number" step="any" required
                className="w-full bg-[#0b0e11] border border-[#2b3139] rounded px-3 py-2 text-right pl-16 focus:border-yellow-500 outline-none"
                value={amount} onChange={(e) => setAmount(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">{baseAsset}</div>
            </div>

            <button
              type="submit"
              className={classNames('w-full py-3 rounded font-bold text-black transition-colors', side === 'buy' ? 'bg-green-neon hover:bg-[#00e67a]' : 'bg-red-neon hover:bg-[#e62e5c]')}
            >
              {side === 'buy' ? `Buy ${baseAsset}` : `Sell ${baseAsset}`}
            </button>
          </form>
        </div>

        {/* Order Book */}
        <div className="flex-1 flex flex-col bg-[#0b0e11] overflow-hidden text-xs">
          <div className="p-2 border-b border-[#2b3139] font-medium flex justify-between text-gray-400">
            <span>Price ({quoteAsset})</span>
            <span>Quantity ({baseAsset})</span>
          </div>
          
          <div className="flex-1 overflow-y-auto flex flex-col p-2 space-y-[1px]">
            {/* Asks (Sells) - Red */}
            <div className="flex flex-col-reverse justify-end overflow-hidden" style={{ flexBasis: '50%' }}>
              {orderBook.asks.slice(0, 15).map((ask, i) => (
                <div key={i} className="flex justify-between items-center hover:bg-[#21262d] cursor-pointer" onClick={() => setPrice(ask[0])}>
                  <span className="text-red-neon">{Number(ask[0]).toFixed(2)}</span>
                  <span className="text-gray-300">{Number(ask[1]).toFixed(4)}</span>
                </div>
              ))}
            </div>

            {/* Current Price Divider */}
            <div className="py-2 text-center text-lg font-bold border-y border-[#21262d] bg-[#181a20]">
              <span className={ticker.percentage >= 0 ? 'text-green-neon' : 'text-red-neon'}>
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Bids (Buys) - Green */}
            <div className="overflow-hidden" style={{ flexBasis: '50%' }}>
              {orderBook.bids.slice(0, 15).map((bid, i) => (
                <div key={i} className="flex justify-between items-center hover:bg-[#21262d] cursor-pointer" onClick={() => setPrice(bid[0])}>
                  <span className="text-green-neon">{Number(bid[0]).toFixed(2)}</span>
                  <span className="text-gray-300">{Number(bid[1]).toFixed(4)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trade;
