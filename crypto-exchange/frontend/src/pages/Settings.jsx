import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';

const THEMES = [
  { name: 'Neon Dark', primary: '#00ff88', bg: '#0b0e11', label: 'Default' },
  { name: 'Ocean Blue', primary: '#00b4d8', bg: '#03045e', label: 'Blue' },
  { name: 'Sunset Red', primary: '#ff6b6b', bg: '#1a0a0a', label: 'Red' },
  { name: 'Purple Galaxy', primary: '#9b59b6', bg: '#0e0012', label: 'Purple' },
  { name: 'Gold Rush', primary: '#f39c12', bg: '#0f0a00', label: 'Gold' },
  { name: 'Cyber Pink', primary: '#e91e8c', bg: '#12001a', label: 'Pink' },
  { name: 'Arctic White', primary: '#4fc3f7', bg: '#f5f5f5', label: 'Light' },
  { name: 'Forest Green', primary: '#27ae60', bg: '#001a0a', label: 'Green' },
  { name: 'Matrix', primary: '#00ff00', bg: '#001100', label: 'Matrix' },
  { name: 'Bitcoin Orange', primary: '#f7931a', bg: '#0f0800', label: 'BTC' },
];

export default function Settings() {
  const { user } = useAuthStore();
  const [activeTheme, setActiveTheme] = useState(0);
  const [notifications, setNotifications] = useState({ price: true, orders: true, news: false, marketing: false });
  const [twoFA, setTwoFA] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const Section = ({ title, children }) => (
    <div className="bg-[#181a20] rounded-2xl border border-white/5 p-5 space-y-4">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  );

  const Toggle = ({ label, sub, value, onChange }) => (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm text-white">{label}</div>
        {sub && <div className="text-xs text-gray-500">{sub}</div>}
      </div>
      <button onClick={() => onChange(!value)} className={`w-11 h-6 rounded-full transition-all relative ${value ? 'bg-green-500' : 'bg-white/10'}`}>
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${value ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm">Manage your preferences, security, and account</p>
      </div>

      {/* Account */}
      <Section title="Account">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-xl font-bold text-black">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="text-white font-semibold">{user?.email || 'user@example.com'}</div>
            <div className="text-xs text-yellow-400 mt-0.5">⚑ KYC: {user?.kycStatus || 'unverified'}</div>
          </div>
          <button className="ml-auto text-xs bg-white/10 hover:bg-white/20 text-gray-300 px-4 py-2 rounded-lg transition-all">Edit Profile</button>
        </div>
      </Section>

      {/* Themes */}
      <Section title="🎨 Theme">
        <div className="grid grid-cols-5 gap-3">
          {THEMES.map((theme, i) => (
            <button key={i} onClick={() => setActiveTheme(i)}
              className={`relative h-14 rounded-xl border-2 transition-all ${activeTheme === i ? 'border-white' : 'border-transparent'}`}
              style={{ background: `linear-gradient(135deg, ${theme.bg}, ${theme.primary}33)` }}>
              <div className="w-4 h-4 rounded-full absolute top-2 right-2" style={{ background: theme.primary }} />
              <div className="absolute bottom-1 left-0 right-0 text-center text-xs text-white/70">{theme.label}</div>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-600">Selected: {THEMES[activeTheme].name}</p>
      </Section>

      {/* Security */}
      <Section title="🔒 Security">
        <Toggle label="Two-Factor Authentication (2FA)" sub="Adds an extra layer of security" value={twoFA} onChange={setTwoFA} />
        <Toggle label="Biometric Login" sub="Use Face ID / Touch ID to sign in" value={false} onChange={() => {}} />
        <div>
          <label className="text-sm text-white block mb-1">Session Timeout</label>
          <select className="bg-[#0b0e11] border border-white/10 text-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none">
            <option>30 minutes</option><option>1 hour</option><option>4 hours</option><option>Never</option>
          </select>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="🔔 Notifications">
        <Toggle label="Price Alerts" sub="Get notified on significant price moves" value={notifications.price} onChange={v => setNotifications(p => ({ ...p, price: v }))} />
        <Toggle label="Order Fills" sub="Notify when orders are executed" value={notifications.orders} onChange={v => setNotifications(p => ({ ...p, orders: v }))} />
        <Toggle label="Market News" sub="Breaking crypto news" value={notifications.news} onChange={v => setNotifications(p => ({ ...p, news: v }))} />
        <Toggle label="Marketing" sub="Product updates and promotions" value={notifications.marketing} onChange={v => setNotifications(p => ({ ...p, marketing: v }))} />
      </Section>

      {/* API Keys */}
      <Section title="🔑 API Keys">
        <p className="text-xs text-gray-500">Generate a read-only or full-access API key for third-party integrations.</p>
        <div className="flex gap-2">
          <input value={apiKey} readOnly placeholder="Click 'Generate' to create an API key" className="flex-1 bg-[#0b0e11] border border-white/10 rounded-lg px-3 py-2 text-gray-400 text-sm font-mono focus:outline-none" />
          <button onClick={() => setApiKey(`cex_${Math.random().toString(36).slice(2, 18)}`)} className="bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-black px-4 py-2 rounded-lg text-sm font-medium transition-all">
            Generate
          </button>
        </div>
      </Section>
    </div>
  );
}
