import React, { useState } from 'react';
import { motion } from 'framer-motion';

const TASKS = [
  { id: 1, title: 'Complete KYC Verification', reward: 50, xp: 200, completed: false, icon: '🪪' },
  { id: 2, title: 'Make Your First Trade', reward: 10, xp: 100, completed: true, icon: '💱' },
  { id: 3, title: 'Deposit $100 USDT', reward: 25, xp: 150, completed: false, icon: '💰' },
  { id: 4, title: 'Follow 3 Traders', reward: 15, xp: 75, completed: false, icon: '👥' },
  { id: 5, title: 'Trade 5 Different Pairs', reward: 30, xp: 180, completed: false, icon: '🔄' },
  { id: 6, title: 'Open a Futures Position', reward: 20, xp: 120, completed: false, icon: '📈' },
  { id: 7, title: 'Refer a Friend', reward: 100, xp: 500, completed: false, icon: '🎁' },
];

export default function Airdrop() {
  const [claimed, setClaimed] = useState(new Set([2]));
  const [totalXP] = useState(TASKS.filter(t => t.completed).reduce((s, t) => s + t.xp, 0));

  const handleClaim = (id) => {
    setClaimed(prev => new Set([...prev, id]));
  };

  const completedCount = claimed.size;
  const progressPct = (completedCount / TASKS.length) * 100;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-8 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0b0e11 0%, #0a2a1a 50%, #0b0e11 100%)' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5" />
        <div className="text-5xl mb-3">🪂</div>
        <h1 className="text-3xl font-bold text-white">CryptoX Airdrop</h1>
        <p className="text-gray-400 mt-2">Complete tasks to earn tokens and exclusive rewards</p>
        <div className="mt-6 inline-flex items-center gap-3 bg-black/30 rounded-full px-6 py-2">
          <span className="text-yellow-400 font-bold text-lg">{totalXP} XP</span>
          <span className="text-gray-500">•</span>
          <span className="text-green-400 font-bold">Level {Math.floor(totalXP / 200) + 1}</span>
        </div>
      </motion.div>

      {/* Progress */}
      <div className="bg-[#181a20] rounded-2xl border border-white/5 p-5">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Overall Progress</span>
          <span className="text-white font-semibold">{completedCount}/{TASKS.length} Tasks</span>
        </div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
            initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ duration: 1, delay: 0.4 }} />
        </div>
      </div>

      {/* Tasks */}
      <div className="grid gap-4">
        {TASKS.map((task, i) => {
          const done = claimed.has(task.id);
          return (
            <motion.div key={task.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className={`bg-[#181a20] rounded-2xl border p-5 flex items-center gap-4 transition-all ${done ? 'border-green-500/20' : 'border-white/5'}`}>
              <div className="text-3xl">{task.icon}</div>
              <div className="flex-1">
                <div className={`font-semibold ${done ? 'text-gray-500 line-through' : 'text-white'}`}>{task.title}</div>
                <div className="flex gap-3 mt-1 text-xs">
                  <span className="text-yellow-400">+{task.xp} XP</span>
                  <span className="text-green-400">+{task.reward} USDT</span>
                </div>
              </div>
              {done ? (
                <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg">✓ Claimed</span>
              ) : task.completed ? (
                <button onClick={() => handleClaim(task.id)}
                  className="text-xs bg-green-500 hover:bg-green-400 text-black px-4 py-1.5 rounded-lg font-semibold transition-all">
                  Claim
                </button>
              ) : (
                <span className="text-xs bg-white/5 text-gray-500 px-3 py-1.5 rounded-lg">Pending</span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Referral */}
      <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl border border-green-500/20 p-6">
        <h3 className="text-lg font-bold text-white mb-1">🎁 Refer Friends, Earn More!</h3>
        <p className="text-gray-400 text-sm mb-4">Share your referral link and earn 100 USDT for each verified referral.</p>
        <div className="flex gap-2">
          <input readOnly value="https://cryptox.io/ref/USER123" className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-gray-300 text-sm font-mono focus:outline-none" />
          <button onClick={() => navigator.clipboard?.writeText('https://cryptox.io/ref/USER123')} className="bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded-lg text-sm font-semibold transition-all">Copy</button>
        </div>
      </div>
    </div>
  );
}
