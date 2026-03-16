import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import { API_CONFIG } from '../config/api';

const API = API_CONFIG.BASE_URL.replace('/api', '');

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-[#181a20] rounded-2xl border border-white/5 p-5">
    <div className="flex items-center gap-3 mb-2">
      <span className="text-2xl">{icon}</span>
      <span className="text-sm text-gray-400">{label}</span>
    </div>
    <div className={`text-3xl font-bold ${color}`}>{value}</div>
  </div>
);

export default function Admin() {
  const { token, user } = useAuthStore();

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await axios.get(`${API}/api/social/admin/stats`, { headers: { Authorization: `Bearer ${token}` } });
      return data;
    },
    enabled: !!token,
    refetchInterval: 30000,
  });

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64 flex-col gap-4 text-center p-8">
        <div className="text-4xl">🔒</div>
        <h2 className="text-white font-bold text-xl">Admin Access Required</h2>
        <p className="text-gray-500 text-sm">This page is restricted to administrators.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400 text-sm">Exchange system overview and user management</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="👥" label="Total Users" value={stats?.totalUsers ?? '—'} color="text-blue-400" />
        <StatCard icon="✅" label="Verified KYC" value={stats?.verifiedUsers ?? '—'} color="text-green-400" />
        <StatCard icon="⏳" label="Pending KYC" value={stats?.pendingKYC ?? '—'} color="text-yellow-400" />
        <StatCard icon="⚡" label="Uptime" value={stats ? `${Math.floor(stats.uptime / 3600)}h` : '—'} color="text-purple-400" />
      </div>

      {/* Recent Users */}
      <div className="bg-[#181a20] rounded-2xl border border-white/5 p-5">
        <h3 className="text-sm font-semibold text-gray-400 mb-4">Recent Registrations</h3>
        <div className="space-y-2">
          {(stats?.recentUsers || []).map((u, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                {u.email?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-sm text-white">{u.email}</div>
                <div className="text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${u.kycStatus === 'verified' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {u.kycStatus}
              </span>
            </div>
          ))}
          {(!stats?.recentUsers?.length) && <div className="text-center py-4 text-gray-600 text-sm">No user data available</div>}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-[#181a20] rounded-2xl border border-white/5 p-5">
        <h3 className="text-sm font-semibold text-gray-400 mb-4">System Status</h3>
        <div className="space-y-3">
          {[
            { service: 'API Server', status: 'operational', icon: '🟢' },
            { service: 'MongoDB', status: 'operational', icon: '🟢' },
            { service: 'Redis Cache', status: 'connecting', icon: '🟡' },
            { service: 'RabbitMQ Queue', status: 'connecting', icon: '🟡' },
            { service: 'Binance WebSocket', status: 'operational', icon: '🟢' },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>{s.icon}</span>
                <span className="text-sm text-white">{s.service}</span>
              </div>
              <span className={`text-xs ${s.icon === '🟢' ? 'text-green-400' : 'text-yellow-400'}`}>{s.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
