import React, { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import useWalletStore from '../store/walletStore';
import { Wallet as WalletIcon, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

const Wallet = () => {
  const { user } = useAuthStore();
  const { wallets, fetchWallets, deposit, isLoading } = useWalletStore();
  const [depositAmount, setDepositAmount] = useState('');
  const [depositAsset, setDepositAsset] = useState('USDT');

  useEffect(() => {
    if (user?.token) {
      fetchWallets(user.token);
    }
  }, [user, fetchWallets]);

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositAmount || isNaN(depositAmount) || Number(depositAmount) <= 0) return;
    
    try {
      await deposit(user.token, depositAsset, Number(depositAmount));
      setDepositAmount('');
      alert(`Successfully deposited ${depositAmount} ${depositAsset}`);
    } catch (err) {
      alert('Deposit failed');
    }
  };

  const calculateTotalUSDT = () => {
    // In a real app we'd fetch prices, here we assume all except USDT have unknown mock value
    // or we just show their balances. Let's simplify and just sum known stable value logic.
    return wallets.filter(w => w.asset === 'USDT').reduce((acc, w) => acc + w.balance, 0);
  };

  return (
    <div className="flex-grow p-4 md:p-8 bg-bg-dark">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
          <WalletIcon size={32} className="text-yellow-500" />
          <span>My Portfolio</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-bg-darker border border-[#2b3139] p-6 rounded-lg shadow-xl md:col-span-2">
            <h2 className="text-xl font-bold text-white mb-6">Asset Balances</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 text-sm border-b border-[#2b3139]">
                    <th className="pb-3 font-medium">Asset</th>
                    <th className="pb-3 font-medium text-right">Total Balance</th>
                    <th className="pb-3 font-medium text-right">Available</th>
                    <th className="pb-3 font-medium text-right">In Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2b3139]">
                  {wallets.length > 0 ? (
                    wallets.map((w) => (
                      <tr key={w.asset} className="hover:bg-[#21262d] transition-colors">
                        <td className="py-4 font-bold text-white text-lg">{w.asset}</td>
                        <td className="py-4 text-right text-gray-300">
                          {w.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                        </td>
                        <td className="py-4 text-right text-green-neon drop-shadow-md">
                          {(w.balance - w.locked).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                        </td>
                        <td className="py-4 text-right text-gray-500">
                          {w.locked.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-gray-500">
                        {isLoading ? 'Loading balances...' : 'No balances found. Try depositing mock funds.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-bg-darker border border-[#2b3139] p-6 rounded-lg shadow-xl h-fit">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <ArrowDownToLine size={20} className="text-green-neon" />
              <span>Mock Deposit</span>
            </h2>
            <p className="text-sm text-gray-400 mb-6">Add virtual funds to your account for testing.</p>

            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Select Asset</label>
                <select 
                  className="w-full bg-[#2b3139] border border-transparent focus:border-yellow-500 rounded px-4 py-3 text-white outline-none"
                  value={depositAsset}
                  onChange={(e) => setDepositAsset(e.target.value)}
                >
                  <option value="USDT">USDT</option>
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Amount</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  className="w-full bg-[#2b3139] border border-transparent focus:border-yellow-500 rounded px-4 py-3 text-white outline-none"
                  placeholder="e.g. 1000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400 transition-colors mt-2"
              >
                Deposit Mock Funds
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
