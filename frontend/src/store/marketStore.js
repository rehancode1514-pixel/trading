import { create } from 'zustand';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

const useMarketStore = create((set, get) => ({
  tickers: {},
  orderBook: { bids: [], asks: [] },
  recentTrades: [],
  socket: null,
  activePair: 'BTC/USDT',

  initSocket: () => {
    if (get().socket) return;
    const socket = io(SOCKET_URL);
    
    socket.on('connect', () => {
      console.log('Connected to market socket');
      socket.emit('subscribe_pair', get().activePair);
    });

    socket.on('ticker_update', ({ pair, data }) => {
      set((state) => ({
        tickers: { ...state.tickers, [pair]: data }
      }));
    });

    socket.on('order_book_update', ({ pair, data }) => {
      if (pair === get().activePair) {
        set({ orderBook: { bids: data.bids || [], asks: data.asks || [] } });
      }
    });

    socket.on('recent_trade', ({ pair, data }) => {
      if (pair === get().activePair) {
        set((state) => {
          const newTrades = [data, ...state.recentTrades].slice(0, 50);
          return { recentTrades: newTrades };
        });
      }
    });

    set({ socket });
  },

  setActivePair: (pair) => {
    const { socket, activePair } = get();
    if (socket && activePair !== pair) {
      socket.emit('unsubscribe_pair', activePair);
      socket.emit('subscribe_pair', pair);
    }
    set({ activePair: pair, orderBook: { bids: [], asks: [] }, recentTrades: [] });
  },

  fetchTickers: async () => {
    try {
      const response = await axios.get(`${API_URL}/m-data/tickers`);
      set({ tickers: response.data });
    } catch (error) {
      console.error('Error fetching tickers', error);
    }
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  }
}));

export default useMarketStore;
