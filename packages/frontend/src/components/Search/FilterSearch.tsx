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
  Radio,
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

import { Sort, useFiltersStore } from './filterStore';
import { Area, categories } from '../../utils/categories';
import { Category } from './FilterSearchData';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Colors } from '../../constants/Colors';
import { ButtonWrapper } from '../../styles/common';
import { useTranslation } from 'react-i18next';
import { FileFormats, SortDataType } from '../../constants/Data';
import { AppBarContext } from '../../contexts/AppBarContext';
import { areas } from '../../utils/helpers';

interface CategoryFilterProps {
  title: string;
  categories?: Category[];
}

const AreaFilter = () => {
  const { t } = useTranslation(['search']);
  const [open, setOpen] = useState(false);
  const activeArea = useFiltersStore((state) => state.area);
  const updateArea = useFiltersStore((state) => state.updateArea);

  const handleAreaUpdate = (area: Area) => {
    if (area.area === activeArea?.area) {
      updateArea(null);
      return;
    }
    updateArea(area);
  };

  return (
    <>
      <ListItem key={'categories'} onClick={() => setOpen(!open)}>
        <ListItemText
          disableTypography
          primary={
            <Typography variant="body1" textTransform="uppercase" sx={{ color: Colors.darkgrey }}>
              {t('search:area')}
            </Typography>
          }
        />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="li" disablePadding>
          {areas().map((area: Area) => {
            return (
              <ListItem>
                <Radio
                  defaultChecked={false}
                  checked={area.area === activeArea?.area}
                  onClick={() => handleAreaUpdate(area)}
                />
                <ListItemText primary={area.title} style={{ textTransform: 'capitalize' }} />
              </ListItem>
            );
          })}
        </List>
      </Collapse>
    </>
  );
};

const CategoryFilter = (props: CategoryFilterProps) => {
  const { categories } = props;

  const { t } = useTranslation(['search']);

  const [open, setOpen] = useState(false);
  const activeCategory = useFiltersStore((state) => state.category);
  const updateCategory = useFiltersStore((state) => state.updateCategory);

  const handleCategoryUpdate = (category: Category) => {
    if (category.id === activeCategory?.id) {
      updateCategory(null);
      return;
    }
    updateCategory(category);
  };

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
          {categories?.map((category: Category) => {
            return (
              <ListItem>
                <Radio
                  defaultChecked={false}
                  checked={category.id === activeCategory?.id}
                  onClick={() => handleCategoryUpdate(category)}
                />
                <ListItemText primary={category.name} style={{ textTransform: 'capitalize' }} />
              </ListItem>
            );
          })}
        </List>
      </Collapse>
    </>
  );
};

const MimeFilter = () => {
  const { t } = useTranslation(['search']);

  const [open, setOpen] = useState(false);

  const selectedMimeTypes = useFiltersStore((state) => state.mimeTypes);
  const toggleMimeType = useFiltersStore((state) => state.toggleMimeType);

  return (
    <>
      <ListItem onClick={() => setOpen(!open)}>
        <ListItemText
          disableTypography
          primary={
            <Typography variant="body1" textTransform="uppercase" sx={{ color: Colors.darkgrey }}>
              {t('search:format')}
            </Typography>
          }
        />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="li" disablePadding>
          {FileFormats.map((format) => {
            return (
              <ListItem>
                <Checkbox
                  checked={selectedMimeTypes.includes(format.value)}
                  onChange={() => toggleMimeType(format.value)}
                />
                <ListItemText primary={format.name} />
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
  const sort = useFiltersStore((state) => state.sort);

  // actions
  const updateContentSearch = useFiltersStore((state) => state.updateContentSearch);
  const updateNameSearch = useFiltersStore((state) => state.updateNameSearch);
  const updateTitleSearch = useFiltersStore((state) => state.updateTitleSearch);
  const updateDescriptionSearch = useFiltersStore((state) => state.updateDescriptionSearch);
  const updateFrom = useFiltersStore((state) => state.updateFrom);
  const updateTo = useFiltersStore((state) => state.updateTo);
  const updateSort = useFiltersStore((state) => state.updateSort);

  const clearFilter = useFiltersStore((state) => state.resetFilter);

  const saveFilters = () => {
    toggleFilter();
    console.log('save filters');
  };

  const handleToChange = (newValue: Date | null) => {
    updateTo(newValue);
    from ?? updateFrom(new Date('2000-01-01'));
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
        <Button sx={{ textTransform: 'none' }} color="primary" onClick={clearFilter}>
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
          <Checkbox
            onChange={(event) => updateContentSearch(event.target.checked)}
            value={contentSearch}
            checked={contentSearch}
          />
          <ListItemText primary={t('search:content_search_checkbox')} />
        </ListItem>
        <ListItem>
          <Checkbox
            onChange={(event) => updateNameSearch(event.target.checked)}
            value={nameSearch}
            checked={nameSearch}
          />
          <ListItemText primary={t('search:name_search_checkbox')} />
        </ListItem>
        <ListItem>
          <Checkbox
            onChange={(event) => updateTitleSearch(event.target.checked)}
            value={titleSearch}
            checked={titleSearch}
          />
          <ListItemText primary={t('search:title_search_checkbox')} />
        </ListItem>
        <ListItem>
          <Checkbox
            onChange={(event) => updateDescriptionSearch(event.target.checked)}
            value={descriptionSearch}
            checked={descriptionSearch}
          />
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
            value={sort}
            onChange={(event) => updateSort(event.target.value as Sort)}
            input={<OutlinedInput />}
            sx={{ width: '100%' }}
          >
            <MenuItem value={SortDataType.NONE as any}>{t('search:no_sort')}</MenuItem>
            <MenuItem value={SortDataType.ASC_NAME as any}>{t('search:A-Z')}</MenuItem>
            <MenuItem value={SortDataType.DESC_NAME as any}>{t('search:Z-A')}</MenuItem>
            <MenuItem value={SortDataType.DESC_MODIFIED as any}>{t('search:latest_first')}</MenuItem>
            <MenuItem value={SortDataType.ASC_MODIFIED as any}>{t('search:oldest_first')}</MenuItem>
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
              minDate={new Date('2000-01-01')}
              maxDate={new Date()}
              value={from ?? null}
              onChange={(newValue) => updateFrom(newValue)}
            />
            <DatePicker
              views={['year']}
              label={t('search:to_year')}
              minDate={from ?? new Date('2000-01-01')}
              maxDate={new Date()}
              value={to}
              onChange={(newValue) => handleToChange(newValue)}
            />
          </LocalizationProvider>
        </ListItem>
        <CategoryFilter title="AINEISTOLUOKKA" categories={categories} />
        <AreaFilter />
        <MimeFilter />
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
