import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useMarketStore from '../store/marketStore';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const { tickers, fetchTickers } = useMarketStore();

  useEffect(() => {
    fetchTickers();
    // Poll every 10 seconds for updated dashboard data
    const interval = setInterval(fetchTickers, 10000);
    return () => clearInterval(interval);
  }, [fetchTickers]);

  const topPairs = Object.entries(tickers || {})
    .filter(([pair]) => pair.endsWith('/USDT'))
    .sort((a, b) => (b[1]?.quoteVolume || 0) - (a[1]?.quoteVolume || 0))
    .slice(0, 15);

  return (
    <div className="flex-grow p-4 md:p-8 bg-bg-dark">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Market Overview</h1>
          <p className="text-gray-400">Track Top Cryptocurrency Prices, Volumes, and Data</p>
        </div>

        <div className="bg-bg-darker rounded-lg border border-[#2b3139] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#21262d] text-gray-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Pair</th>
                  <th className="px-6 py-4 font-medium text-right">Price</th>
                  <th className="px-6 py-4 font-medium text-right">24h Change</th>
                  <th className="px-6 py-4 font-medium text-right hidden md:table-cell">24h Volume</th>
                  <th className="px-6 py-4 font-medium text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2b3139]">
                {topPairs.map(([pair, data]) => {
                  const changeColor = data.percentage >= 0 ? 'text-green-neon' : 'text-red-neon';
                  const ChangeIcon = data.percentage >= 0 ? TrendingUp : TrendingDown;

                  return (
                    <tr key={pair} className="hover:bg-[#21262d] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-white text-base">
                            {pair.split('/')[0]}
                          </span>
                          <span className="text-gray-500 text-sm">/ USDT</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-white">
                        ${data.last ? data.last.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : '...'}
                      </td>
                      <td className={`px-6 py-4 text-right font-medium flex items-center justify-end space-x-1 ${changeColor}`}>
                        <span>{data.percentage ? data.percentage.toFixed(2) : '0.00'}%</span>
                        <ChangeIcon size={16} />
                      </td>
                      <td className="px-6 py-4 text-right text-gray-400 hidden md:table-cell">
                        ${data.quoteVolume ? (data.quoteVolume / 1000000).toFixed(2) + 'M' : '...'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link
                          to={`/trade/${pair.replace('/', '-')}`}
                          className="bg-[#2b3139] text-gray-300 hover:text-black hover:bg-yellow-500 rounded px-4 py-2 font-medium text-sm transition-colors inline-flex items-center space-x-2 opacity-0 group-hover:opacity-100"
                        >
                          <span>Trade</span>
                          <ArrowRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {topPairs.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Loading market data...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
