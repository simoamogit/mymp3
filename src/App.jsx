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
import BottomPlayer from './components/BottomPlayer';
import LoginForm from './components/LoginForm';
import UserMenu from './components/UserMenu';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AudioProvider } from './contexts/AudioContext';
import { getTheme } from './theme';
import { NotificationProvider, useNotifications } from './contexts/NotificationContext';
import ExpandedNotification from './components/ExpandedNotification';
import HamburgerMenu from './components/HamburgerMenu';
import MediaMetadata from './components/MediaMetadata';
import PlayQueue from './components/PlayQueue';
import ResponsiveLayout from './components/ResponsiveLayout';

function AppContent() {
  const [mode, setMode] = useState('light');
  const [loginOpen, setLoginOpen] = useState(false);
  const { user, loading } = useAuth();
  const { notifications, removeNotification } = useNotifications();
  const [metadata, setMetadata] = useState(null);

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
          <HamburgerMenu 
            onDeleteAll={() => console.log('Delete all')}
            onShufflePlay={() => console.log('Shuffle play')}
            onYouTubeImport={() => console.log('YouTube import')}
          />
          
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

      <Container maxWidth="xl" sx={{ mt: 2, pb: 10 }}>
        <Box sx={{ position: 'fixed', top: 70, right: 20, zIndex: 1200, width: 350 }}>
          {notifications.map(notification => (
            <ExpandedNotification
              key={notification.id}
              message={notification.message}
              severity={notification.severity}
              details={notification.details}
              onClose={() => removeNotification(notification.id)}
            />
          ))}
        </Box>

        {user ? (
          <AudioProvider onMetadataChange={setMetadata}>
            <ResponsiveLayout
              metadataPanel={<MediaMetadata metadata={metadata} />}
              playlistPanel={
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h4" gutterBottom>
                    La tua libreria
                  </Typography>
                  <Upload />
                  <Playlist />
                </Box>
              }
              queuePanel={<PlayQueue />}
            />
            <BottomPlayer />
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
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;