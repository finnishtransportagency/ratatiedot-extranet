import { create } from 'zustand';
import axios from 'axios';

/*
  const getActivityList = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/database/activities');
      const { data } = response.data;

      setModifiedFiles(data);
      setIsLoading(false);
    } catch (error: any) {
      setError(error);
      setIsLoading(false);
    }
  };

  */

export const getBanners = async () => {
  try {
    const response = await axios.get('/api/banners');
    console.log('response: ', response);
    return { data: response, error: null };
  } catch (error: any) {
    console.log('error: ', error);
    return { data: error, error: error };
  }
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
