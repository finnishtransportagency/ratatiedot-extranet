import { useBannerStore } from '../../store/bannerStore';

export const Banner = () => {
  const banners = useBannerStore((state) => state.banners);
  const getBanners = useBannerStore((state) => state.getBanners);

  // getBanners();

  return (
    <>
      <p>{JSON.stringify(banners)}</p>
    </>
  );
};
