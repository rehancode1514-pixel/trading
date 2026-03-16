import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: '📊', title: 'Live Charts', desc: 'Real-time TradingView charts on any device' },
  { icon: '⚡', title: 'Instant Orders', desc: 'Market & limit orders execute in milliseconds' },
  { icon: '🔐', title: 'Biometric Login', desc: 'Face ID & Touch ID for fast secure access' },
  { icon: '📱', title: 'PWA App', desc: 'Install directly on your homescreen' },
  { icon: '🔔', title: 'Push Alerts', desc: 'Get price alerts and order notifications' },
  { icon: '💰', title: 'Full Portfolio', desc: 'Manage all assets from your phone' },
];

export default function Mobile() {
  const handleInstall = () => {
    alert('To install: On iOS tap Share → Add to Home Screen. On Android tap the browser menu → Install App.');
  };

  return (
    <div className="p-4 md:p-6 space-y-8">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 rounded-3xl relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0b0e11, #0f2a1a, #0b0e11)' }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#00ff8820_0%,_transparent_70%)]" />
        <div className="relative">
          <div className="text-7xl mb-4">📱</div>
          <h1 className="text-4xl font-bold text-white mb-3">CryptoX Mobile</h1>
          <p className="text-gray-400 max-w-md mx-auto text-lg">
            Trade anytime, anywhere. The full power of CryptoX in your pocket.
          </p>
          <div className="flex gap-4 justify-center mt-8">
            <button onClick={handleInstall}
              className="bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-3 rounded-2xl text-lg transition-all">
              📲 Install App
            </button>
            <Link to="/trade/BTC-USDT" className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-2xl text-lg transition-all font-semibold">
              Start Trading
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Features */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6 text-center">Everything in your pocket</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
              className="bg-[#181a20] rounded-2xl border border-white/5 p-5 hover:border-green-500/20 transition-all">
              <div className="text-3xl mb-3">{f.icon}</div>
              <div className="font-semibold text-white text-sm mb-1">{f.title}</div>
              <div className="text-xs text-gray-500">{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* PWA Install Guide */}
      <div className="bg-[#181a20] rounded-2xl border border-white/5 p-6">
        <h3 className="font-bold text-white mb-4">📋 How to Install</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-green-400 text-sm font-semibold mb-2">🍎 iOS (Safari)</h4>
            <ol className="space-y-1 text-sm text-gray-400">
              <li>1. Open in Safari browser</li>
              <li>2. Tap the <span className="text-white">Share</span> button (box with arrow)</li>
              <li>3. Scroll down and tap <span className="text-white">Add to Home Screen</span></li>
              <li>4. Tap <span className="text-white">Add</span> to confirm</li>
            </ol>
          </div>
          <div>
            <h4 className="text-blue-400 text-sm font-semibold mb-2">🤖 Android (Chrome)</h4>
            <ol className="space-y-1 text-sm text-gray-400">
              <li>1. Open in Chrome browser</li>
              <li>2. Tap the <span className="text-white">⋮</span> menu (3 dots)</li>
              <li>3. Tap <span className="text-white">Add to Home screen</span></li>
              <li>4. Tap <span className="text-white">Add</span> to install</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
