import { useEffect, useState } from 'react';
import { useBannerStore } from '../../store/bannerStore';
import { Alert, Collapse, IconButton } from '@mui/material';
import { Colors } from '../../constants/Colors';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import InfoIcon from '@mui/icons-material/Info';
import './styles.css';

export const Banner = () => {
  const banners = useBannerStore((state) => state.banners);
  const getBanners = useBannerStore((state) => state.getBanners);

  const [open, setOpen] = useState(true);

  useEffect(() => {
    getBanners();
  }, [getBanners]);

  return (
    <>
      <div style={{ margin: '20px 32px 0 32px' }}>
        <IconButton onClick={() => setOpen(!open)} className="banner-alert">
          <InfoIcon color="primary" />
        </IconButton>
      </div>
      {banners?.map((banner) => (
        <Collapse in={open}>
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
        </Collapse>
      ))}
    </>
  );
};
