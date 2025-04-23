import { useEffect, useState } from 'react';
import { IBanner, useBannerStore } from '../../store/bannerStore';
import { Alert } from '@mui/material';
import { Colors } from '../../constants/Colors';
import { useNavigate } from 'react-router-dom';
import { Routes } from '../../constants/Routes';
import { format } from 'date-fns';
import { URIFriendlyDateFormat } from '../../constants/Formats';

export const Banner = () => {
  const banners = useBannerStore((state) => state.banners);
  const getBanners = useBannerStore((state) => state.getBanners);
  const navigate = useNavigate();
  const [visibleBanners, setVisibleBanners] = useState<IBanner[]>([]);

  useEffect(() => {
    getBanners();
  }, [getBanners]);

  useEffect(() => {
    const hiddenBanners = JSON.parse(sessionStorage.getItem('hiddenBanners') as string) || [];
    const visible = banners?.filter((banner) => !hiddenBanners.includes(banner.id));
    setVisibleBanners(visible || []);
  }, [banners]);

  const handleAlertClick = (banner: IBanner) => {
    navigate(`${Routes.NOTICES}/${banner.id}/${format(new Date(banner.publishTimeStart), URIFriendlyDateFormat)}`, {
      state: { noticeId: banner.id },
    });
  };

  const hideBanner = (id: string) => {
    const hiddenBanners = JSON.parse(sessionStorage.getItem('hiddenBanners') as string) || [];
    hiddenBanners.push(id);
    sessionStorage.setItem('hiddenBanners', JSON.stringify(hiddenBanners));
    const visible = banners?.filter((banner) => !hiddenBanners.includes(banner.id));
    setVisibleBanners(visible || []);
  };

  return (
    <>
      {visibleBanners?.map((banner) => (
        <Alert
          key={banner.id}
          sx={{ backgroundColor: Colors.darkred, color: Colors.white, margin: '16px 32px', cursor: 'pointer' }}
          severity="info"
          variant="filled"
          onClick={() => handleAlertClick(banner)}
          onClose={(event) => {
            event.stopPropagation();
            hideBanner(banner.id);
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
            <span>{banner.title}</span>
          </div>
        </Alert>
      ))}
    </>
  );
};
