import styled from '@emotion/styled';
import { Box, Grid, Link, Typography } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { Colors } from '../../constants/Colors';
import FacebookIcon from '../../assets/icons/Facebook.svg';
import TwitterIcon from '../../assets/icons/Twitter.svg';
import InstagramIcon from '../../assets/icons/Instagram.svg';
import LinkedinIcon from '../../assets/icons/Linkedin.svg';
import FlickrIcon from '../../assets/icons/Flickr.svg';
import YoutubeIcon from '../../assets/icons/Youtube.svg';

const FooterWrapper = styled(Box)(() => ({
  backgroundColor: Colors.lightgrey,
  marginTop: 'auto',
  padding: '32px',
  width: 'calc(100% - 65px)',
}));

const LinkStyle = {
  textDecoration: 'none',
  boxShadow: 'none',
  color: Colors.darkblue,
  display: 'block',
  fontWeight: 'bold',
  width: 'fit-content',
};

const LinkIconStyle = {
  width: '13px',
  height: '13px',
  marginLeft: '5px',
};

const SocialMediaIconStyle = {
  margin: '0 8px',
};

export const Footer = () => {
  return (
    <FooterWrapper>
      <Typography variant="body1">Väylävirasto</Typography>
      <Grid container spacing={{ tablet: 3, desktop: 3 }}>
        <Grid item mobile={12} tablet={6} desktop={6}>
          <Typography variant="body1" sx={{ marginTop: '24px' }}>
            Väyläviraston julkinen verkkopalvelu
            <Link href="https://vayla.fi/" target="_blank" rel="noopener noreferrer" style={LinkStyle}>
              vayla.fi
              <OpenInNewIcon sx={LinkIconStyle} />
            </Link>
          </Typography>
        </Grid>
        <Grid item mobile={12} tablet={6} desktop={6}>
          <Typography variant="body1" sx={{ marginTop: '24px' }}>
            Väyläviraston extranet-palvelu
            <Link href="https://extranet.vayla.fi/" target="_blank" rel="noopener noreferrer" style={LinkStyle}>
              extranet.vayla.fi
              <OpenInNewIcon sx={LinkIconStyle} />
            </Link>
          </Typography>
        </Grid>
      </Grid>
      <Typography variant="body1" sx={{ marginTop: '24px', textAlign: 'center' }}>
        <Link
          href="https://www.facebook.com/vaylafi/"
          target="_blank"
          rel="noopener noreferrer"
          style={SocialMediaIconStyle}
        >
          <Box component="img" src={FacebookIcon} alt="facebook" />
        </Link>
        <Link href="https://twitter.com/vaylafi" target="_blank" rel="noopener noreferrer" style={SocialMediaIconStyle}>
          <Box component="img" src={TwitterIcon} alt="twitter" />
        </Link>
        <Link
          href="https://www.instagram.com/vaylafi/"
          target="_blank"
          rel="noopener noreferrer"
          style={SocialMediaIconStyle}
        >
          <Box component="img" src={InstagramIcon} alt="instagram" />
        </Link>
        <Link
          href="https://www.linkedin.com/company/vaylafi"
          target="_blank"
          rel="noopener noreferrer"
          style={SocialMediaIconStyle}
        >
          <Box component="img" src={LinkedinIcon} alt="linkedin" />
        </Link>
        <Link
          href="https://www.flickr.com/photos/vaylafi"
          target="_blank"
          rel="noopener noreferrer"
          style={SocialMediaIconStyle}
        >
          <Box component="img" src={FlickrIcon} alt="flickr" />
        </Link>
        <Link
          href="https://www.youtube.com/c/vaylafi"
          target="_blank"
          rel="noopener noreferrer"
          style={SocialMediaIconStyle}
        >
          <Box component="img" src={YoutubeIcon} alt="youtube" />
        </Link>
      </Typography>
    </FooterWrapper>
  );
};
