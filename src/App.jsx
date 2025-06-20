import React, { useState, useMemo } from 'react';
import {
  Container,
  CssBaseline,
  ThemeProvider,
  Switch,
  FormControlLabel,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  CircularProgress
} from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import Upload from './components/Upload';
import Playlist from './components/Playlist';
import PlayerControls from './components/PlayerControls';
import LoginForm from './components/LoginForm';
import UserMenu from './components/UserMenu';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AudioProvider } from './contexts/AudioContext';
import { getTheme } from './theme';

function AppContent() {
  const [mode, setMode] = useState('light');
  const [loginOpen, setLoginOpen] = useState(false);
  const { user, loading } = useAuth();

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
  };

  const theme = useMemo(() => getTheme(mode), [mode]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            SimoMP3 🎧
          </Typography>
          <FormControlLabel
            control={<Switch checked={mode === 'dark'} onChange={toggleTheme} />}
            label="🌗"
            sx={{ mr: 2 }}
          />
          {user ? (
            <UserMenu />
          ) : (
            <Button
              color="inherit"
              startIcon={<LoginIcon />}
              onClick={() => setLoginOpen(true)}
            >
              Accedi
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, pb: 4 }}>
        {user ? (
          <AudioProvider>
            <Typography variant="h4" gutterBottom>
              Benvenuto, {user.username}! 👋
            </Typography>
            <Upload />
            <Playlist />
            <PlayerControls />
          </AudioProvider>
        ) : (
          <Box textAlign="center" sx={{ mt: 8 }}>
            <Typography variant="h4" gutterBottom>
              Benvenuto su SimoMP3! 🎵
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
              Effettua il login per iniziare ad ascoltare la tua musica
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              onClick={() => setLoginOpen(true)}
            >
              Accedi o Registrati
            </Button>
          </Box>
        )}
      </Container>

      <LoginForm open={loginOpen} onClose={() => setLoginOpen(false)} />
    </ThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;