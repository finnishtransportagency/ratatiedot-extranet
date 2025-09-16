import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  Box,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { MoreVert, Download, Add, Delete, Lock, LockOpen, History } from '@mui/icons-material';
import { ProtectedContainerWrapper } from '../../styles/common';
import { mockData as initialMockData, IBalise } from './mockData';

interface CollapsibleRowProps {
  row: IBalise;
  onLockToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const CollapsibleRow: React.FC<CollapsibleRowProps> = ({ row, onLockToggle, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuAction = (action: string) => {
    if (action === 'toggle-history') {
      setOpen(!open);
    } else if (action === 'toggle-lock') {
      onLockToggle(row.id);
    } else if (action === 'delete') {
      onDelete(row.id);
    } else {
      console.log(`Action: ${action} for item: ${row.secondaryId}`);
    }
    handleMenuClose();
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell sx={{ fontSize: '14px' }} component="th" scope="row">
          {row.secondaryId}
        </TableCell>
        <TableCell sx={{ fontSize: '14px' }}>{row.version}</TableCell>
        <TableCell sx={{ fontSize: '14px' }}>{row.description}</TableCell>
        <TableCell sx={{ fontSize: '14px' }}>{row.createdTime}</TableCell>
        <TableCell sx={{ fontSize: '14px' }}>{row.createdBy}</TableCell>
        <TableCell sx={{ fontSize: '14px' }}>{row.editedTime}</TableCell>
        <TableCell sx={{ fontSize: '14px' }}>{row.editedBy}</TableCell>
        <TableCell sx={{ fontSize: '14px' }}>{row.locked ? '🔒' : ''}</TableCell>
        <TableCell sx={{ textAlign: 'right' }}>
          <IconButton aria-label="more actions" size="small" onClick={handleMenuClick}>
            <MoreVert />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={() => handleMenuAction('download')}>
              <ListItemIcon>
                <Download fontSize="small" />
              </ListItemIcon>
              <ListItemText>Lataa</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleMenuAction('toggle-history')}>
              <ListItemIcon>
                <History fontSize="small" />
              </ListItemIcon>
              <ListItemText>{open ? 'Piilota historia' : 'Näytä historia'}</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleMenuAction('create-version')}>
              <ListItemIcon>
                <Add fontSize="small" />
              </ListItemIcon>
              <ListItemText>Luo uusi versio</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleMenuAction('delete')}>
              <ListItemIcon>
                <Delete fontSize="small" />
              </ListItemIcon>
              <ListItemText>Poista</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleMenuAction('toggle-lock')}>
              <ListItemIcon>{row.locked ? <LockOpen fontSize="small" /> : <Lock fontSize="small" />}</ListItemIcon>
              <ListItemText>{row.locked ? 'Poista lukitus' : 'Lukitse'}</ListItemText>
            </MenuItem>
          </Menu>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="body1" gutterBottom component="div">
                Historia
              </Typography>
              <Table size="small" aria-label="details">
                <TableBody>
                  <TableCell sx={{ fontSize: '12px' }}>Versio</TableCell>
                  <TableCell sx={{ fontSize: '12px' }}>Kuvaus</TableCell>
                  <TableCell sx={{ fontSize: '12px' }}>Luontiaika</TableCell>
                  <TableCell sx={{ fontSize: '12px' }}>Luonut</TableCell>
                  {row.versions?.map((version) => {
                    return (
                      <TableRow>
                        <TableCell sx={{ fontSize: '14px' }}>{version.version}</TableCell>
                        <TableCell sx={{ fontSize: '14px' }}>{version.description}</TableCell>
                        <TableCell sx={{ fontSize: '14px' }}>{version.createdTime}</TableCell>
                        <TableCell sx={{ fontSize: '14px' }}>{version.createdBy}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export const Balise = () => {
  const [data, setData] = useState<IBalise[]>(initialMockData);

  const handleLockToggle = (id: string) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.id === id
          ? {
              ...item,
              locked: !item.locked,
              lockedTime: !item.locked
                ? new Date().toLocaleDateString('fi-FI') +
                  ' ' +
                  new Date().toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })
                : '',
              lockedBy: !item.locked ? 'LX000001' : '',
            }
          : item,
      ),
    );
  };

  const handleDelete = (id: string) => {
    setData((prevData) => prevData.filter((item) => item.id !== id));
  };

  return (
    <ProtectedContainerWrapper>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Baliisisanomat
        </Typography>
        <TableContainer component={Paper}>
          <Table aria-label="collapsible table" size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: '12px' }}>ID</TableCell>
                <TableCell sx={{ fontSize: '12px' }}>Versio</TableCell>
                <TableCell sx={{ fontSize: '12px' }}>Kuvaus</TableCell>
                <TableCell sx={{ fontSize: '12px' }}>Luontiaika</TableCell>
                <TableCell sx={{ fontSize: '12px' }}>Luonut</TableCell>
                <TableCell sx={{ fontSize: '12px' }}>Muokkausaika</TableCell>
                <TableCell sx={{ fontSize: '12px' }}>Muokannut</TableCell>
                <TableCell sx={{ fontSize: '12px' }}>Lukittu?</TableCell>
                <TableCell sx={{ fontSize: '12px' }}>Toiminnot</TableCell>
              </TableRow>
            </TableHead>
            <TableBody sx={{ fontSize: '12px' }}>
              {data.map((row) => (
                <CollapsibleRow key={row.id} row={row} onLockToggle={handleLockToggle} onDelete={handleDelete} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </ProtectedContainerWrapper>
  );
};
