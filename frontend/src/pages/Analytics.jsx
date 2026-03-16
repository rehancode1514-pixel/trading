import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useMarketStore from '../store/marketStore';
import { API_CONFIG } from '../config/api';

const API = API_CONFIG.BASE_URL.replace('/api', '');

const StatCard = ({ label, value, sub, color = 'text-white' }) => (
  <div className="bg-[#181a20] rounded-2xl border border-white/5 p-4">
    <div className="text-xs text-gray-500 mb-1">{label}</div>
    <div className={`text-xl font-bold ${color}`}>{value}</div>
    {sub && <div className="text-xs text-gray-600 mt-1">{sub}</div>}
  </div>
);

export default function Analytics() {
  const { tickers } = useMarketStore();
  const [funding, setFunding] = useState([]);

  useEffect(() => {
    axios.get(`${API}/api/futures/funding-rates`).then(r => setFunding(r.data)).catch(() => {});
  }, []);

  const pairs = Object.entries(tickers || {});
  const gainers = [...pairs].sort((a, b) => (b[1]?.percentage || 0) - (a[1]?.percentage || 0)).slice(0, 5);
  const losers = [...pairs].sort((a, b) => (a[1]?.percentage || 0) - (b[1]?.percentage || 0)).slice(0, 5);
  const topVolume = [...pairs].sort((a, b) => (b[1]?.quoteVolume || 0) - (a[1]?.quoteVolume || 0)).slice(0, 5);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 text-sm">Global market data, trends, and insights</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Pairs" value={pairs.length} sub="Active markets" color="text-blue-400" />
        <StatCard label="Market Up" value={`${pairs.filter(([, d]) => (d?.percentage || 0) >= 0).length}`} sub="Coins gaining" color="text-green-400" />
        <StatCard label="Market Down" value={`${pairs.filter(([, d]) => (d?.percentage || 0) < 0).length}`} sub="Coins losing" color="text-red-400" />
        <StatCard label="Total Volume" value={`$${((pairs.reduce((s, [, d]) => s + (d?.quoteVolume || 0), 0)) / 1e9).toFixed(2)}B`} sub="24h volume" color="text-yellow-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Gainers */}
        <div className="bg-[#181a20] rounded-2xl border border-white/5 p-5">
          <h3 className="text-sm font-semibold text-green-400 mb-4">🚀 Top Gainers</h3>
          <div className="space-y-3">
            {gainers.map(([pair, d]) => (
              <div key={pair} className="flex justify-between items-center">
                <span className="text-sm text-white font-medium">{pair.split('/')[0]}</span>
                <span className="text-green-400 text-sm font-bold">+{d?.percentage?.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="bg-[#181a20] rounded-2xl border border-white/5 p-5">
          <h3 className="text-sm font-semibold text-red-400 mb-4">📉 Top Losers</h3>
          <div className="space-y-3">
            {losers.map(([pair, d]) => (
              <div key={pair} className="flex justify-between items-center">
                <span className="text-sm text-white font-medium">{pair.split('/')[0]}</span>
                <span className="text-red-400 text-sm font-bold">{d?.percentage?.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Volume */}
        <div className="bg-[#181a20] rounded-2xl border border-white/5 p-5">
          <h3 className="text-sm font-semibold text-blue-400 mb-4">📊 Top Volume</h3>
          <div className="space-y-3">
            {topVolume.map(([pair, d]) => (
              <div key={pair} className="flex justify-between items-center">
                <span className="text-sm text-white font-medium">{pair}</span>
                <span className="text-blue-400 text-sm">${((d?.quoteVolume || 0) / 1e6).toFixed(0)}M</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Funding Rates */}
      <div className="bg-[#181a20] rounded-2xl border border-white/5 p-5">
        <h3 className="text-sm font-semibold text-yellow-400 mb-4">⚡ Futures Funding Rates</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {funding.map(f => (
            <div key={f.pair} className="bg-black/20 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-500">{f.pair.split('/')[0]}</div>
              <div className={`text-sm font-bold mt-1 ${parseFloat(f.rate) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {(parseFloat(f.rate) * 100).toFixed(4)}%
              </div>
              <div className="text-xs text-gray-600 mt-0.5">8h</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
