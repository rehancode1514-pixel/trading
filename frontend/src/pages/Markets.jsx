import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useMarketStore from '../store/marketStore';

const CATEGORIES = ['All', 'DeFi', 'Layer1', 'Layer2', 'Meme', 'Stablecoin'];

export default function Markets() {
  const { tickers } = useMarketStore();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ field: 'volume', dir: -1 });
  const [category, setCategory] = useState('All');

  const pairs = Object.entries(tickers || {})
    .filter(([pair]) => pair.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const av = a[1]?.[sort.field] || 0;
      const bv = b[1]?.[sort.field] || 0;
      return sort.dir * (bv - av);
    });

  const handleSort = (field) => {
    setSort(prev => ({ field, dir: prev.field === field ? -prev.dir : -1 }));
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Markets</h1>
          <p className="text-gray-400 text-sm">Live cryptocurrency market overview</p>
        </div>
        <div className="ml-auto flex gap-3">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search coins..."
            className="bg-[#181a20] border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 w-56 focus:outline-none focus:border-green-400"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${category === cat ? 'bg-green-500 text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#181a20] rounded-2xl border border-white/5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-gray-500">
              <th className="py-3 px-4 text-left">#</th>
              <th className="py-3 px-4 text-left">Pair</th>
              <th className="py-3 px-4 text-right cursor-pointer hover:text-white" onClick={() => handleSort('last')}>Price ⇅</th>
              <th className="py-3 px-4 text-right cursor-pointer hover:text-white" onClick={() => handleSort('percentage')}>24h % ⇅</th>
              <th className="py-3 px-4 text-right cursor-pointer hover:text-white" onClick={() => handleSort('quoteVolume')}>Volume ⇅</th>
              <th className="py-3 px-4 text-right">High / Low</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {pairs.slice(0, 50).map(([pair, data], idx) => (
              <motion.tr key={pair} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.01 }}
                className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-3 px-4 text-gray-500">{idx + 1}</td>
                <td className="py-3 px-4 font-semibold text-white">{pair.replace('/', ' / ')}</td>
                <td className="py-3 px-4 text-right text-white font-mono">${Number(data?.last || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</td>
                <td className={`py-3 px-4 text-right font-semibold ${(data?.percentage || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {(data?.percentage || 0) >= 0 ? '+' : ''}{(data?.percentage || 0).toFixed(2)}%
                </td>
                <td className="py-3 px-4 text-right text-gray-300">${((data?.quoteVolume || 0) / 1e6).toFixed(2)}M</td>
                <td className="py-3 px-4 text-right text-xs">
                  <span className="text-green-400">${Number(data?.high || 0).toLocaleString()}</span>
                  <span className="text-gray-500 mx-1">/</span>
                  <span className="text-red-400">${Number(data?.low || 0).toLocaleString()}</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <Link to={`/trade/${pair.replace('/', '-')}`}
                    className="bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-black px-3 py-1 rounded-lg text-xs font-medium transition-all">
                    Trade
                  </Link>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {pairs.length === 0 && (
          <div className="text-center py-12 text-gray-500">No markets found</div>
        )}
      </div>
    </div>
  );
}
