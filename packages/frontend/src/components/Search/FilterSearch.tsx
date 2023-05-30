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
  TextField,
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

import { SearchParameterName, FilterSearchData, IItem } from './FilterSearchData';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Colors } from '../../constants/Colors';
import { SearchContext } from '../../contexts/SearchContext';
import { ButtonWrapper } from '../../styles/common';
import { useTranslation } from 'react-i18next';
import { EMimeType, SortDataType } from '../../constants/Data';
import { AppBarContext } from '../../contexts/AppBarContext';
import { mapSortTypeToValue } from '../../utils/helpers';

interface IFilterSearchItem extends IItem {
  checkboxes: any;
  handleCheckboxes: any;
}

const FilterSearchItem = (props: IFilterSearchItem) => {
  const { t } = useTranslation(['search']);
  const [open, setOpen] = useState(false);
  const { savedCheckboxes } = useContext(SearchContext);

  const handleClick = () => {
    setOpen((prevState: boolean) => !prevState);
  };

  const isDefaultChecked = (name: SearchParameterName, value: string) => {
    return savedCheckboxes[name]?.indexOf(value) !== -1;
  };

  const isChecked = (name: SearchParameterName, value: string) => {
    return checkboxes[name]?.indexOf(value) !== -1;
  };

  const { name, type, items, handleCheckboxes, checkboxes } = props;

  const getTranslatedItemText = (text: string) => {
    if (text === EMimeType.Image) return t('search:image');
    return text;
  };

  return (
    <>
      <ListItem key={`${name}-ListItem`} onClick={handleClick}>
        <ListItemText
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
        <List component="li" disablePadding>
          {items?.map((item: string, index: number) => {
            return (
              <ListItem key={index}>
                <Checkbox
                  defaultChecked={isDefaultChecked(type, item)}
                  checked={isChecked(type, item)}
                  onChange={() => handleCheckboxes(type, item)}
                />
                <ListItemText primary={getTranslatedItemText(item)} />
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

  const {
    savedCheckboxes,
    savedCheckboxesHandler,
    years,
    yearsHandler,
    sort,
    sortHandler,
    pageHandler,
    contentSearch,
    contentSearchHandler,
  } = useContext(SearchContext);
  const [from, setFrom] = useState<Date | null>(years[0] ? years[0] : null);
  const [to, setTo] = useState<Date | null>(years[1] ? years[1] : null);
  // Currently, sort array contains only 1 object
  const [sortType, setSortType] = useState<string>(() => mapSortTypeToValue(sort[0]));
  const [checkboxes, setCheckboxes] = useState<{ [name in SearchParameterName]: string[] }>(savedCheckboxes);
  const [isContentSearched, setIsContentSearched] = useState(contentSearch);

  const clearFilters = () => {
    setFrom(null);
    setTo(null);
    setSortType(() => mapSortTypeToValue(null));
    setCheckboxes({
      [SearchParameterName.MIME]: [],
      [SearchParameterName.CATEGORY]: [],
    });
    setIsContentSearched(false);
  };

  const handleCheckboxes = (name: SearchParameterName, value: EMimeType) => {
    const index = checkboxes[name].indexOf(value);
    if (index === -1) {
      // Temporary: only let 1 aineistoluokka/category be selected at a time
      // TODO: select and filter by multiple ainestoluokka/category
      if (name === SearchParameterName.CATEGORY) {
        setCheckboxes({ ...checkboxes, [name]: [value] });
      } else {
        setCheckboxes({ ...checkboxes, [name]: [...checkboxes[name], value] });
      }
    } else {
      setCheckboxes({ ...checkboxes, [name]: checkboxes[name].filter((item) => item !== value) });
    }
  };

  const saveFilters = () => {
    savedCheckboxesHandler(checkboxes);
    yearsHandler(from, to);
    sortHandler(sortType);
    contentSearchHandler(isContentSearched);
    // reset pagination
    pageHandler(0);
    toggleFilter();
  };

  return (
    <DrawerWrapper anchor="right" open={openFilter} disableEnforceFocus>
      <Toolbar>
        <ButtonWrapper
          color="primary"
          variant="contained"
          onClick={() => {
            filtersApplied();
            saveFilters();
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
          <Checkbox
            defaultChecked={contentSearch}
            checked={isContentSearched}
            onChange={() => setIsContentSearched(!isContentSearched)}
          />
          <ListItemText primary={t('search:content_search_checkbox')} />
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
            onChange={(event) => setSortType(event.target.value)}
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
              onChange={(newValue) => setFrom(newValue)}
              renderInput={(params) => <TextField {...params} helperText={null} />}
            />
            <DatePicker
              views={['year']}
              label={t('search:to_year')}
              minDate={new Date('2002-01-01')}
              maxDate={new Date()}
              value={to}
              shouldDisableYear={(year: any) => (from ? year < from : true)}
              onChange={(newValue) => setTo(newValue)}
              renderInput={(params) => <TextField {...params} helperText={null} />}
            />
          </LocalizationProvider>
        </ListItem>
        {FilterSearchData.map((data: IItem, index: number) => (
          <FilterSearchItem key={index} {...data} checkboxes={checkboxes} handleCheckboxes={handleCheckboxes} />
        ))}
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
