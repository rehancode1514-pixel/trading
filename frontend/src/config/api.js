// API Configuration
const VITE_API_URL = import.meta.env.VITE_API_URL || 'https://trading-production-2538.up.railway.app';
const API_BASE_URL = `${VITE_API_URL}/api`;

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  SOCKET_URL: VITE_API_URL
};

export default API_CONFIG;
