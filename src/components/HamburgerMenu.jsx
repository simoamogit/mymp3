import React, { useState } from 'react';
import { 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  Typography 
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Delete, 
  Shuffle, 
  PlaylistPlay,
  YouTube,
  Settings
} from '@mui/icons-material';

export default function HamburgerMenu({ 
  onDeleteAll, 
  onShufflePlay,
  onYouTubeImport
}) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton
        size="large"
        edge="start"
        color="inherit"
        onClick={handleClick}
        sx={{ mr: 2 }}
      >
        <MenuIcon />
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => { onShufflePlay(); handleClose(); }}>
          <ListItemIcon>
            <Shuffle fontSize="small" />
          </ListItemIcon>
          <Typography>Riproduci casuale</Typography>
        </MenuItem>
        
        <MenuItem onClick={() => { onYouTubeImport(); handleClose(); }}>
          <ListItemIcon>
            <YouTube fontSize="small" />
          </ListItemIcon>
          <Typography>Importa da YouTube</Typography>
        </MenuItem>
        
        <MenuItem onClick={() => { onDeleteAll(); handleClose(); }}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <Typography color="error">Elimina tutto</Typography>
        </MenuItem>
        
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <Typography>Impostazioni</Typography>
        </MenuItem>
      </Menu>
    </>
  );
}