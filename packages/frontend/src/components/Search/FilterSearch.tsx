import { useContext, useState } from 'react';
import styled from '@emotion/styled';
import {
  Box,
  Button,
  Checkbox,
  Collapse,
  Drawer,
  IconButton,
  MenuItem,
  OutlinedInput,
  Select,
  Toolbar,
  Typography,
} from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import TuneIcon from '@mui/icons-material/Tune';
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { useFiltersStore } from './filterStore';
import { categories } from '../../utils/categories';
import { Category, Mime } from './FilterSearchData';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Colors } from '../../constants/Colors';
import { Sort } from '../../constants/Data';
import { ButtonWrapper } from '../../styles/common';
import { useTranslation } from 'react-i18next';
import { SortDataType } from '../../constants/Data';
import { AppBarContext } from '../../contexts/AppBarContext';

interface CategoryFilterProps {
  title: string;
  categories?: Category[];
}

const CategoryFilter = (props: CategoryFilterProps) => {
  const { t } = useTranslation(['search']);
  const [open, setOpen] = useState(false);
  const activeCategory = useFiltersStore((state) => state.category);
  const { categories } = props;

  const updateCategory = useFiltersStore((state) => state.updateCategory);

  return (
    <>
      <ListItem key={'categories'} onClick={() => setOpen(!open)}>
        <ListItemText
          disableTypography
          primary={
            <Typography variant="body1" textTransform="uppercase" sx={{ color: Colors.darkgrey }}>
              {t('search:category')}
            </Typography>
          }
        />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse key={'categories-collapse'} in={open} timeout="auto" unmountOnExit>
        <List component="li" disablePadding>
          {categories?.map((category: Category, index: number) => {
            return (
              <ListItem key={index}>
                <Checkbox
                  defaultChecked={false}
                  checked={category.id === activeCategory?.id}
                  onChange={() => updateCategory(category)}
                />
                <ListItemText primary={category.name} />
              </ListItem>
            );
          })}
        </List>
      </Collapse>
    </>
  );
};

interface FilterSearchProps {
  filtersApplied: () => void;
}

export const FilterSearch = (props: FilterSearchProps) => {
  const { t } = useTranslation(['search']);
  const { openFilter, toggleFilter } = useContext(AppBarContext);
  const { filtersApplied } = props;

  // states
  const contentSearch = useFiltersStore((state) => state.contentSearch);
  const nameSearch = useFiltersStore((state) => state.nameSearch);
  const titleSearch = useFiltersStore((state) => state.titleSearch);
  const descriptionSearch = useFiltersStore((state) => state.descriptionSearch);
  const from = useFiltersStore((state) => state.from);
  const to = useFiltersStore((state) => state.to);
  const sortType = useFiltersStore((state) => state.sort[0]);

  // actions
  //  const updateContentSearch = useFiltersStore(state => state.updateContentSearch);
  //  const updateNameSearch = useFiltersStore(state => state.updateNameSearch);
  //  const updateTitleSearch = useFiltersStore(state => state.updateTitleSearch);
  //  const updateDescriptionSearch = useFiltersStore(state => state.updateDescriptionSearch);
  const updateFrom = useFiltersStore((state) => state.updateFrom);
  const updateTo = useFiltersStore((state) => state.updateTo);
  const updateSortType = useFiltersStore((state) => state.updateSort);

  const saveFilters = () => {
    console.log('save filters');
  };

  const clearFilters = () => {
    console.log('clear filters');
  };

  return (
    <DrawerWrapper anchor="right" open={openFilter} disableEnforceFocus>
      <Toolbar>
        <ButtonWrapper
          color="primary"
          variant="contained"
          onClick={() => {
            saveFilters();
            filtersApplied();
          }}
        >
          {t('search:action.update_results')}
        </ButtonWrapper>
        <Box sx={{ flexGrow: 1 }} />
        <IconButtonWrapper size="large" area-label="filter" onClick={toggleFilter}>
          {openFilter ? <DisabledByDefaultIcon color="primary" /> : <TuneIcon color="primary" />}
        </IconButtonWrapper>
      </Toolbar>
      <Toolbar>
        <Button sx={{ textTransform: 'none' }} color="primary" onClick={clearFilters}>
          {t('search:action.remove_filters')}
        </Button>
      </Toolbar>
      <Box>
        <ListItem>
          <ListItemText disableTypography>
            <Typography variant="body1" textTransform="uppercase" sx={{ color: Colors.darkgrey }}>
              {t('search:content_search')}
            </Typography>
          </ListItemText>
        </ListItem>
        <ListItem>
          <Checkbox value={contentSearch} />
          <ListItemText primary={t('search:content_search_checkbox')} />
        </ListItem>
        <ListItem>
          <Checkbox value={nameSearch} />
          <ListItemText primary={t('search:name_search_checkbox')} />
        </ListItem>
        <ListItem>
          <Checkbox value={titleSearch} />
          <ListItemText primary={t('search:title_search_checkbox')} />
        </ListItem>
        <ListItem>
          <Checkbox value={descriptionSearch} />
          <ListItemText primary={t('search:description_search_checkbox')} />
        </ListItem>

        <ListItem>
          <ListItemText disableTypography>
            <Typography variant="body1" textTransform="uppercase" sx={{ color: Colors.darkgrey }}>
              {t('search:sort_results')}
            </Typography>
          </ListItemText>
        </ListItem>
        <ListItem>
          <Select
            displayEmpty
            label={t('search:sort_results')}
            value={sortType}
            onChange={(event) => updateSortType(event.target.value as Sort)}
            input={<OutlinedInput />}
            sx={{ width: '100%' }}
          >
            <MenuItem value={SortDataType.NONE}>{t('search:no_sort')}</MenuItem>
            <MenuItem value={SortDataType.ASC_NAME}>{t('search:A-Z')}</MenuItem>
            <MenuItem value={SortDataType.DESC_NAME}>{t('search:Z-A')}</MenuItem>
            <MenuItem value={SortDataType.DESC_MODIFIED}>{t('search:latest_first')}</MenuItem>
            <MenuItem value={SortDataType.ASC_MODIFIED}>{t('search:oldest_first')}</MenuItem>
          </Select>
        </ListItem>
        <ListItem>
          <ListItemText disableTypography>
            <Typography variant="body1" textTransform="uppercase" sx={{ color: Colors.darkgrey }}>
              {t('search:time')}
            </Typography>
          </ListItemText>
        </ListItem>
        <ListItem>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              views={['year']}
              label={t('search:from_year')}
              minDate={new Date('2002-01-01')}
              maxDate={new Date()}
              value={from}
              onChange={(newValue) => updateFrom(newValue)}
            />
            <DatePicker
              views={['year']}
              label={t('search:to_year')}
              minDate={new Date('2002-01-01')}
              maxDate={new Date()}
              value={to}
              shouldDisableYear={(year: any) => (from ? year < from : true)}
              onChange={(newValue) => updateTo(newValue)}
            />
          </LocalizationProvider>
        </ListItem>
        <CategoryFilter title="AINEISTOLUOKKA" categories={categories} />
      </Box>
    </DrawerWrapper>
  );
};

const DrawerWrapper = styled(Drawer)(({ theme }) => ({
  [theme.breakpoints.only('mobile')]: {
    '& .MuiPaper-root': {
      width: '100%',
      marginTop: '56px',
    },
  },
  [theme.breakpoints.only('tablet')]: {
    '& .MuiPaper-root': {
      width: '50%',
      marginTop: '56px',
    },
  },
  [theme.breakpoints.only('desktop')]: {
    '& .MuiPaper-root': {
      width: '375px',
    },
  },
}));

const IconButtonWrapper = styled(IconButton)(({ theme }) => ({
  alignSelf: 'end',
  [theme.breakpoints.down('desktop')]: {
    display: 'none',
  },
}));
