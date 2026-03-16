import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_CONFIG } from '../config/api';

const API = API_CONFIG.BASE_URL.replace('/api', '');

export default function CopyTrading() {
  const [period, setPeriod] = useState('weekly');
  const [following, setFollowing] = useState(new Set());

  const { data: leaders = [] } = useQuery({
    queryKey: ['leaderboard', period],
    queryFn: async () => {
      const { data } = await axios.get(`${API}/api/social/leaderboard?period=${period}&limit=20`);
      return data;
    },
  });

  const toggleFollow = (id) => {
    setFollowing(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const PERIODS = [
    { value: 'daily', label: '24h' },
    { value: 'weekly', label: '7D' },
    { value: 'monthly', label: '30D' },
    { value: 'all-time', label: 'All Time' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Copy Trading & Leaderboard</h1>
          <p className="text-gray-400 text-sm">Follow top traders and auto-copy their strategies</p>
        </div>
        <div className="flex gap-2">
          {PERIODS.map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${period === p.value ? 'bg-green-500 text-black' : 'bg-white/5 text-gray-400'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {leaders.map((trader, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }}
            className="bg-[#181a20] rounded-2xl border border-white/5 p-5 flex items-center gap-5">
            {/* Rank */}
            <div className="w-10 text-center">
              <span className="text-2xl">{trader.badge || `#${trader.rank}`}</span>
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {trader.username?.[0]?.toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white">{trader.username}</div>
              <div className="text-xs text-gray-500 flex gap-3 mt-0.5">
                <span>✅ Win Rate: <span className="text-green-400">{trader.winRate}%</span></span>
                <span>🔄 Trades: {trader.totalTrades}</span>
                <span>👥 {trader.followers?.toLocaleString()} followers</span>
              </div>
            </div>

            {/* PnL */}
            <div className="text-right">
              <div className={`text-lg font-bold ${trader.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {trader.pnl >= 0 ? '+' : ''}${trader.pnl?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className={`text-xs ${trader.pnlPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trader.pnlPercent >= 0 ? '+' : ''}{trader.pnlPercent?.toFixed(1)}%
              </div>
            </div>

            {/* Follow Button */}
            <button onClick={() => toggleFollow(idx)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${following.has(idx) ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
              {following.has(idx) ? '✓ Following' : 'Follow'}
            </button>
          </motion.div>
        ))}
        {leaders.length === 0 && (
          <div className="text-center py-16 text-gray-600">Loading leaderboard data...</div>
        )}
      </div>
    </div>
  );
}
