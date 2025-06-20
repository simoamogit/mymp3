import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Divider
} from '@mui/material';
import { Person, ExitToApp } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

function UserMenu() {
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  return (
    <>
      <Button
        onClick={handleClick}
        startIcon={<Avatar sx={{ width: 24, height: 24 }}><Person /></Avatar>}
        color="inherit"
      >
        {user?.username}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem disabled>
          <Typography variant="body2" color="text.secondary">
            Connesso come: {user?.username}
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ExitToApp sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}

export default UserMenu;