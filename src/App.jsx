import React, { useState, useMemo, useEffect } from 'react';
import { Container, CssBaseline, ThemeProvider, Switch, FormControlLabel } from '@mui/material';
import Upload from './components/Upload';
import Playlist from './components/Playlist';
import PlayerControls from './components/PlayerControls';
import { getTheme } from './theme';

function App() {
  const [mode, setMode] = useState('light');

  useEffect(() => {
    const savedMode = localStorage.getItem('theme') || 'light';
    setMode(savedMode);
  }, []);

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('theme', newMode);
  };

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <FormControlLabel
          control={<Switch checked={mode === 'dark'} onChange={toggleTheme} />}
          label="🌗 Modalità scura"
        />
        <h1>SimoMP3 🎧</h1>
        <Upload />
        <Playlist />
        <PlayerControls />
      </Container>
    </ThemeProvider>
  );
}

export default App;
