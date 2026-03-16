import { create } from 'zustand';
import axios from 'axios';
import { API_CONFIG } from '../config/api';

const API_URL = API_CONFIG.BASE_URL;

const useWalletStore = create((set, get) => ({
  wallets: [],
  isLoading: false,

  fetchWallets: async (token) => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`${API_URL}/wallet`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ wallets: response.data, isLoading: false });
    } catch (error) {
      console.error('Error fetching wallets:', error);
      set({ isLoading: false });
    }
  },

  deposit: async (token, asset, amount) => {
    try {
      await axios.post(`${API_URL}/wallet/deposit`, { asset, amount }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh wallets after deposit
      await get().fetchWallets(token);
    } catch (error) {
      console.error('Error depositing funds:', error);
      throw error;
    }
  },

  updateWalletFromSocket: (walletData) => {
    set((state) => {
      let updatedWallets = [...state.wallets];
      
      const updateOrAdd = (wallet) => {
        if (!wallet) return;
        const index = updatedWallets.findIndex(w => w.asset === wallet.asset);
        if (index !== -1) {
          updatedWallets[index] = wallet;
        } else {
          updatedWallets.push(wallet);
        }
      };

      if (walletData.base) updateOrAdd(walletData.base);
      if (walletData.quote) updateOrAdd(walletData.quote);
      if (walletData.deposit) updateOrAdd(walletData.deposit);

      return { wallets: updatedWallets };
    });
  }
}));

export default useWalletStore;
