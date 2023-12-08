import { useEffect } from 'react';
import { useBannerStore } from '../../store/bannerStore';
import { Alert } from '@mui/material';
import { Colors } from '../../constants/Colors';
import './styles.css';

export const Banner = () => {
  const banners = useBannerStore((state) => state.banners);
  const getBanners = useBannerStore((state) => state.getBanners);

  useEffect(() => {
    getBanners();
  }, [getBanners]);

  return (
    <>
      {banners?.map((banner) => (
        <Alert sx={{ backgroundColor: Colors.darkblue, margin: '16px 32px' }} severity="info" variant="filled">
          <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
            <span>{banner.title}</span>
            {/*
                  // TODO: Add link to banner when editor is ready
                  <a style={{ color: "white", paddingLeft: "10px" }} href='http://google.com/' target="_blank" rel="noopener noreferrer">
                    <OpenInNewIcon style={{ color: "white", width: "20px" }} color='inherit' />
                  </a>
                  */}
          </div>
        </Alert>
      ))}
    </>
  );
};
