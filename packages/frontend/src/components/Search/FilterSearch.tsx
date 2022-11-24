import { useState } from 'react';
import styled from '@emotion/styled';
import { Box, Checkbox, Collapse, Drawer, IconButton, Typography } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import TuneIcon from '@mui/icons-material/Tune';

import { FilterSearchData, IItem, ItemTypeEnum } from './FilterSearchData';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Colors } from '../../constants/Colors';

type FilterSearchProps = {
  openFilter: boolean;
  toggleFilter: any;
};

const FilterSearchItem = (props: IItem) => {
  // TODO: handle checkbox
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen((prevState: boolean) => !prevState);
  };

  const { name, type, items } = props;
  return (
    <>
      <ListItem key={`${name}-ListItem`} onClick={handleClick}>
        {type && type === ItemTypeEnum.CHECKBOX && (
          <Checkbox key={`${name}-Checkbox`} onChange={() => console.log('TODO:')} />
        )}
        <ListItemText
          key={`${name}-ListItemText`}
          disableTypography
          primary={
            <Typography variant="body1" textTransform="uppercase" sx={{ color: Colors.darkgrey }}>
              {name}
            </Typography>
          }
        />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse key={`${name}-Collapse`} in={open} timeout="auto" unmountOnExit>
        <List key={`${name}-Collapse-List`} component="li" disablePadding>
          {items?.map((item: IItem, index: number) => {
            if (item.items) {
              return <FilterSearchItem key={index} name={item.name} type={item.type} items={item.items} />;
            }
            return (
              <ListItem sx={{ pl: 4 }} key={index}>
                {item.type && item.type === ItemTypeEnum.CHECKBOX && (
                  <Checkbox key={`${name}-Collapse-Checkbox`} onChange={() => console.log('TODO:')} />
                )}
                <ListItemText key={`${name}-Collapse-ListItemText`} primary={item.name} />
              </ListItem>
            );
          })}
        </List>
      </Collapse>
    </>
  );
};

export const FilterSearch = ({ openFilter, toggleFilter }: FilterSearchProps) => {
  return (
    <DrawerWrapper anchor="right" open={openFilter} disableEnforceFocus>
      <IconButton sx={{ alignSelf: 'end' }} size="large" area-label="filter" onClick={toggleFilter}>
        <TuneIcon color="primary" />
      </IconButton>
      <Box>
        {FilterSearchData.map((data: IItem, index: number) => (
          <FilterSearchItem key={index} {...data} />
        ))}
      </Box>
    </DrawerWrapper>
  );
};

const DrawerWrapper = styled(Drawer)(({ theme }) => ({
  [theme.breakpoints.only('mobile')]: {
    '& .MuiPaper-root': {
      width: '100%',
    },
  },
  [theme.breakpoints.only('tablet')]: {
    '& .MuiPaper-root': {
      width: '50%',
    },
  },
  [theme.breakpoints.only('desktop')]: {
    '& .MuiPaper-root': {
      width: '375px',
    },
  },
}));
