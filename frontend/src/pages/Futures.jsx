import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import useMarketStore from '../store/marketStore';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const LEVERAGE_PRESETS = [1, 2, 3, 5, 10, 20, 50, 100, 125];
const PAIRS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'DOGE/USDT', 'XRP/USDT'];

export default function Futures() {
  const { token } = useAuthStore();
  const { tickers } = useMarketStore();
  const [pair, setPair] = useState('BTC/USDT');
  const [side, setSide] = useState('long');
  const [leverage, setLeverage] = useState(10);
  const [marginType, setMarginType] = useState('isolated');
  const [size, setSize] = useState('');
  const [tpPrice, setTpPrice] = useState('');
  const [slPrice, setSlPrice] = useState('');
  const [positions, setPositions] = useState([]);
  const [funding, setFunding] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const currentPrice = tickers?.[pair]?.last || 0;
  const margin = size ? (parseFloat(size) / leverage).toFixed(2) : '0.00';
  
  // Liquidation estimate
  const mmr = 0.005;
  const liqPrice = currentPrice 
    ? side === 'long' 
      ? (currentPrice * (1 - (1/leverage) + mmr)).toFixed(2)
      : (currentPrice * (1 + (1/leverage) - mmr)).toFixed(2)
    : '—';

  useEffect(() => {
    if (token) fetchPositions();
    fetchFunding();
  }, [token]);

  const fetchPositions = async () => {
    try {
      const { data } = await axios.get(`${API}/api/futures/positions`, { headers: { Authorization: `Bearer ${token}` } });
      setPositions(data);
    } catch {}
  };

  const fetchFunding = async () => {
    try {
      const { data } = await axios.get(`${API}/api/futures/funding-rates`);
      setFunding(data);
    } catch {}
  };

  const handleOpen = async () => {
    if (!size || !currentPrice) return;
    setLoading(true);
    setMsg('');
    try {
      await axios.post(`${API}/api/futures/open`, {
        pair, side, leverage, marginType,
        size: parseFloat(size), entryPrice: currentPrice,
        takeProfitPrice: tpPrice ? parseFloat(tpPrice) : null,
        stopLossPrice: slPrice ? parseFloat(slPrice) : null,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setMsg(`✅ ${side.toUpperCase()} position opened at $${currentPrice}`);
      setSize(''); setTpPrice(''); setSlPrice('');
      fetchPositions();
    } catch (e) {
      setMsg(`❌ ${e.response?.data?.message || 'Error opening position'}`);
    }
    setLoading(false);
  };

  const handleClose = async (positionId) => {
    try {
      await axios.post(`${API}/api/futures/close`, { positionId, closePrice: currentPrice }, { headers: { Authorization: `Bearer ${token}` } });
      fetchPositions();
    } catch {}
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Futures Trading</h1>
        <p className="text-gray-400 text-sm">Trade with up to 125x leverage on perpetual contracts</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Order Panel */}
        <div className="bg-[#181a20] rounded-2xl border border-white/5 p-5 space-y-4">
          {/* Pair Selector */}
          <select value={pair} onChange={e => setPair(e.target.value)}
            className="w-full bg-[#0b0e11] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
            {PAIRS.map(p => <option key={p}>{p}</option>)}
          </select>

          {/* Side */}
          <div className="grid grid-cols-2 gap-2">
            {['long', 'short'].map(s => (
              <button key={s} onClick={() => setSide(s)}
                className={`py-2.5 rounded-xl font-semibold text-sm capitalize transition-all ${side === s ? (s === 'long' ? 'bg-green-500 text-black' : 'bg-red-500 text-white') : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                {s === 'long' ? '🔼 Long' : '🔽 Short'}
              </button>
            ))}
          </div>

          {/* Margin Type */}
          <div className="grid grid-cols-2 gap-2">
            {['isolated', 'cross'].map(m => (
              <button key={m} onClick={() => setMarginType(m)}
                className={`py-1.5 rounded-lg text-xs capitalize transition-all ${marginType === m ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-white/5 text-gray-500'}`}>
                {m}
              </button>
            ))}
          </div>

          {/* Leverage */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>Leverage</span><span className="text-yellow-400 font-bold">{leverage}x</span>
            </div>
            <input type="range" min="1" max="125" value={leverage} onChange={e => setLeverage(parseInt(e.target.value))}
              className="w-full accent-yellow-400" />
            <div className="flex gap-1 mt-2 flex-wrap">
              {LEVERAGE_PRESETS.map(l => (
                <button key={l} onClick={() => setLeverage(l)}
                  className={`px-2 py-0.5 rounded text-xs ${leverage === l ? 'bg-yellow-400 text-black' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}>
                  {l}x
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Position Size (USDT)</label>
            <input value={size} onChange={e => setSize(e.target.value)} type="number" placeholder="e.g. 500"
              className="w-full bg-[#0b0e11] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-400" />
          </div>

          {/* TP / SL */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-green-400 mb-1 block">Take Profit</label>
              <input value={tpPrice} onChange={e => setTpPrice(e.target.value)} type="number" placeholder="Price"
                className="w-full bg-[#0b0e11] border border-green-500/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-400" />
            </div>
            <div>
              <label className="text-xs text-red-400 mb-1 block">Stop Loss</label>
              <input value={slPrice} onChange={e => setSlPrice(e.target.value)} type="number" placeholder="Price"
                className="w-full bg-[#0b0e11] border border-red-500/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-400" />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-black/30 rounded-xl p-3 space-y-1.5 text-xs">
            <div className="flex justify-between"><span className="text-gray-400">Mark Price</span><span className="text-white">${Number(currentPrice).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Margin Required</span><span className="text-yellow-300">${margin} USDT</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Liquidation Price</span><span className="text-red-400">${liqPrice}</span></div>
          </div>

          {msg && <p className={`text-xs ${msg.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>{msg}</p>}

          <button onClick={handleOpen} disabled={loading || !size}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${side === 'long' ? 'bg-green-500 hover:bg-green-400 text-black' : 'bg-red-500 hover:bg-red-400 text-white'} disabled:opacity-50`}>
            {loading ? 'Opening...' : `Open ${side === 'long' ? 'Long 🔼' : 'Short 🔽'}`}
          </button>
        </div>

        {/* Right Column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Funding Rates */}
          <div className="bg-[#181a20] rounded-2xl border border-white/5 p-5">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Funding Rates</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {funding.map(f => (
                <div key={f.pair} className="bg-black/20 rounded-xl p-3">
                  <div className="text-xs text-gray-500">{f.pair}</div>
                  <div className={`text-sm font-bold ${parseFloat(f.rate) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(parseFloat(f.rate) * 100).toFixed(4)}%
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">Next: 8h</div>
                </div>
              ))}
            </div>
          </div>

          {/* Open Positions */}
          <div className="bg-[#181a20] rounded-2xl border border-white/5 p-5">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Open Positions ({positions.length})</h3>
            {positions.length === 0 ? (
              <div className="text-center py-8 text-gray-600 text-sm">No open positions</div>
            ) : (
              <div className="space-y-3">
                {positions.map(pos => {
                  const priceDiff = currentPrice - pos.entryPrice;
                  const pnl = (pos.side === 'long' ? priceDiff : -priceDiff) / pos.entryPrice * pos.size;
                  const pnlPct = (pnl / pos.margin * 100).toFixed(2);
                  return (
                    <motion.div key={pos._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="bg-black/20 rounded-xl p-4 flex items-center gap-4">
                      <div>
                        <span className={`text-xs px-2 py-0.5 rounded font-bold ${pos.side === 'long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {pos.side.toUpperCase()} {pos.leverage}x
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white">{pos.pair}</div>
                        <div className="text-xs text-gray-500">Entry: ${pos.entryPrice.toLocaleString()} · Liq: ${pos.liquidationPrice?.toFixed(2)}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} USDT
                        </div>
                        <div className={`text-xs ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>{pnlPct}%</div>
                      </div>
                      <button onClick={() => handleClose(pos._id)}
                        className="text-xs bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-gray-400 px-3 py-1.5 rounded-lg transition-all">
                        Close
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
