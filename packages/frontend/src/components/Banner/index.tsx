import { useEffect } from 'react';
import { useBannerStore } from '../../store/bannerStore';
import { Alert } from '@mui/material';
import { Colors } from '../../constants/Colors';

export const Banner = () => {
  const banners = useBannerStore((state) => state.banners);
  const getBanners = useBannerStore((state) => state.getBanners);

  useEffect(() => {
    getBanners();
  }, [getBanners]);

  return (
    <>
      {banners?.map((banner) => (
        <Alert
          key={banner.id}
          sx={{ backgroundColor: Colors.yellow, color: Colors.black, margin: '16px 32px' }}
          severity="info"
          variant="filled"
        >
          <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
            <span>{banner.title}</span>
          </div>
        </Alert>
      ))}
    </>
  );
};
