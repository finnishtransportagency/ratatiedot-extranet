import { create } from 'zustand';
import axios from 'axios';

export const getBanners = async () => {
  const response = await axios.get('/api/banners').catch((err) => {
    return { data: null, error: err };
  });
  console.log('response: ', response);
  return { data: response, error: null };
};

export type BannerStore = {
  isLoading: boolean;
  banners?: any | null;
  error?: any | null;
  getBanners: () => void;
};

export const useBannerStore = create<BannerStore>((set) => ({
  isLoading: false,
  banners: [],
  error: null,
  getBanners: async () => {
    set({ isLoading: true });
    const { error, data } = await getBanners();
    set({ banners: data, error: error });
    set({ isLoading: false });
  },
}));
