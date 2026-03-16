import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore';

const NAV_LINKS = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/markets', label: 'Markets', icon: '📊' },
  { to: '/trade/BTC-USDT', label: 'Trade', icon: '💱' },
  { to: '/futures', label: 'Futures', icon: '⚡' },
  { to: '/portfolio', label: 'Portfolio', icon: '💼' },
  { to: '/wallet', label: 'Wallet', icon: '💰' },
  { to: '/analytics', label: 'Analytics', icon: '📈' },
  { to: '/copy-trading', label: 'Copy Trade', icon: '📋' },
  { to: '/airdrop', label: 'Airdrop', icon: '🪂' },
  { to: '/mobile', label: 'Mobile', icon: '📱' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const primaryLinks = NAV_LINKS.slice(0, 6);
  const moreLinks = NAV_LINKS.slice(6);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-[#0b0e11]/95 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mr-2 flex-shrink-0">
          <span className="text-xl">🌐</span>
          <span className="font-bold text-white text-lg">CryptoX</span>
        </Link>

        {/* Primary links - desktop */}
        <div className="hidden lg:flex items-center gap-1 flex-1">
          {primaryLinks.map(({ to, label, icon }) => {
            const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
            return (
              <Link key={to} to={to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all relative ${active ? 'text-green-400 bg-green-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                <span className="text-xs">{icon}</span>
                {label}
              </Link>
            );
          })}

          {/* More dropdown */}
          <div className="relative">
            <button onClick={() => setMoreOpen(!moreOpen)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              More ▾
            </button>
            <AnimatePresence>
              {moreOpen && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="absolute top-10 left-0 bg-[#181a20] border border-white/10 rounded-2xl py-2 min-w-[180px] shadow-2xl z-50"
                  onMouseLeave={() => setMoreOpen(false)}>
                  {moreLinks.map(({ to, label, icon }) => (
                    <Link key={to} to={to} onClick={() => setMoreOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                      <span>{icon}</span>{label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-2 mr-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-xs font-bold text-black">
                  {user.email?.[0]?.toUpperCase()}
                </div>
                <span className="text-xs text-gray-400 max-w-[120px] truncate">{user.email}</span>
              </div>
              <button onClick={handleLogout} className="text-xs bg-red-500/20 hover:bg-red-500/40 text-red-400 px-3 py-1.5 rounded-lg transition-all">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg transition-all">Login</Link>
              <Link to="/register" className="text-sm bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-1.5 rounded-lg transition-all">Register</Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden text-gray-400 hover:text-white ml-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="lg:hidden border-t border-white/5 bg-[#0b0e11] overflow-hidden">
            <div className="py-2 px-4 grid grid-cols-2 gap-1">
              {NAV_LINKS.map(({ to, label, icon }) => (
                <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                  <span>{icon}</span>{label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
