import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const useTradeStore = create((set, get) => ({
  openOrders: [],
  orderHistory: [],
  isLoading: false,

  fetchOpenOrders: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/trade/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ openOrders: response.data });
    } catch (error) {
      console.error('Error fetching open orders', error);
    }
  },

  fetchOrderHistory: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/trade/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ orderHistory: response.data });
    } catch (error) {
      console.error('Error fetching order history', error);
    }
  },

  placeOrder: async (token, orderData) => {
    set({ isLoading: true });
    try {
      await axios.post(`${API_URL}/trade/order`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await get().fetchOpenOrders(token);
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  cancelOrder: async (token, orderId) => {
    try {
      await axios.delete(`${API_URL}/trade/order/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await get().fetchOpenOrders(token);
    } catch (error) {
      console.error('Error canceling order', error);
      throw error;
    }
  }
}));

export default useTradeStore;
