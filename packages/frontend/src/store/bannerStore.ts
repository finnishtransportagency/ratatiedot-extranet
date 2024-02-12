import { create } from 'zustand';
import axios from 'axios';

export interface IBanner {
  id: string;
  title?: string;
  content: string;
  authorId: string;
  createdTime: Date;
  publishTimeStart: Date;
  publishTimeEnd?: Date;
  showAsBanner: boolean;
}

export const getBanners = async () => {
  try {
    const response = await axios.get('/api/banners');
    return { data: response.data, error: null };
  } catch (error: any) {
    return { data: null, error: error };
  }
};

export type BannerStore = {
  isLoading: boolean;
  banners: IBanner[] | null;
  error: any | null;
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
