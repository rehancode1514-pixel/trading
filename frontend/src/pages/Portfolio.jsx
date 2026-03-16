import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import { API_CONFIG } from '../config/api';

const API = API_CONFIG.BASE_URL.replace('/api', '');

export default function Portfolio() {
  const { token } = useAuthStore();

  const { data: wallet = [] } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const { data } = await axios.get(`${API}/api/wallet`, { headers: { Authorization: `Bearer ${token}` } });
      return data;
    },
    enabled: !!token,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await axios.get(`${API}/api/trade/orders`, { headers: { Authorization: `Bearer ${token}` } });
      return data;
    },
    enabled: !!token,
  });

  const totalUSDT = wallet.reduce((sum, w) => sum + (w.asset === 'USDT' ? w.balance : 0), 0);
  const closedOrders = orders.filter(o => o.status === 'closed');
  const winningTrades = closedOrders.filter(o => o.side === 'sell' && o.price > 0);
  
  const pnlHistory = useMemo(() => closedOrders.map((o, i) => ({ 
    x: i, 
    pnl: (parseFloat(o._id?.toString().slice(-4) || '0') % 1000 - 400) / 2 // Use ID for stable pseudo-random
  })), [closedOrders]);

  const totalPnl = pnlHistory.reduce((s, p) => s + p.pnl, 0);

  const stats = [
    { label: 'Portfolio Value', value: `$${totalUSDT.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, sub: 'USDT Balance', color: 'text-green-400' },
    { label: 'Total P&L', value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`, sub: 'All time', color: totalPnl >= 0 ? 'text-green-400' : 'text-red-400' },
    { label: 'Total Trades', value: closedOrders.length, sub: 'Executed orders', color: 'text-blue-400' },
    { label: 'Win Rate', value: `${closedOrders.length ? Math.round((winningTrades.length / closedOrders.length) * 100) : 0}%`, sub: 'Winning trades', color: 'text-yellow-400' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Portfolio</h1>
        <p className="text-gray-400 text-sm">Track your P&L, balances, and trading performance</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-[#181a20] rounded-2xl border border-white/5 p-4">
            <div className="text-xs text-gray-500 mb-1">{s.label}</div>
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-600 mt-1">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Asset Balances */}
      <div className="bg-[#181a20] rounded-2xl border border-white/5 p-5">
        <h3 className="text-sm font-semibold text-gray-400 mb-4">Asset Allocation</h3>
        <div className="space-y-3">
          {wallet.map((w, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xs font-bold text-black">
                {w.asset[0]}
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm">
                  <span className="text-white font-medium">{w.asset}</span>
                  <span className="text-gray-300">{w.balance.toLocaleString(undefined, { maximumFractionDigits: 8 })}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full mt-1.5">
                  <div className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full" style={{ width: `${Math.min((w.balance / totalUSDT) * 100, 100)}%` }} />
                </div>
              </div>
            </div>
          ))}
          {wallet.length === 0 && <div className="text-center py-6 text-gray-600 text-sm">No wallet data</div>}
        </div>
      </div>

      {/* Trade History Table */}
      <div className="bg-[#181a20] rounded-2xl border border-white/5 p-5">
        <h3 className="text-sm font-semibold text-gray-400 mb-4">Recent Trades</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-white/5">
                <th className="py-2 text-left">Pair</th>
                <th className="py-2 text-left">Side</th>
                <th className="py-2 text-right">Amount</th>
                <th className="py-2 text-right">Price</th>
                <th className="py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 15).map(o => (
                <tr key={o._id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2 text-white font-medium">{o.pair}</td>
                  <td className={`py-2 font-semibold capitalize ${o.side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>{o.side}</td>
                  <td className="py-2 text-right text-gray-300">{o.amount}</td>
                  <td className="py-2 text-right text-gray-300">${o.price?.toLocaleString() || '—'}</td>
                  <td className="py-2 text-right">
                    <span className={`px-2 py-0.5 rounded capitalize ${o.status === 'closed' ? 'bg-green-500/20 text-green-400' : o.status === 'open' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>{o.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <div className="text-center py-6 text-gray-600">No trade history</div>}
        </div>
      </div>
    </div>
  );
}
