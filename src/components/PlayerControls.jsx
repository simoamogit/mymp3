import React from 'react';
import { 
  Button, 
  Stack, 
  Paper, 
  Typography, 
  Slider, 
  Box,
  IconButton
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  VolumeUp,
  VolumeDown
} from '@mui/icons-material';
import { useAudio } from '../contexts/AudioContext';

function PlayerControls() {
  const { 
    currentTrack, 
    isPlaying, 
    duration, 
    currentTime, 
    play, 
    pause, 
    resume, 
    stop, 
    setVolume, 
    seek 
  } = useAudio();

  const [volume, setVolumeState] = React.useState(1);

  const handleVolumeChange = (event, newValue) => {
    setVolumeState(newValue);
    setVolume(newValue);
  };

  const handleSeekChange = (event, newValue) => {
    seek(newValue);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDisplayName = (filename) => {
    if (!filename) return 'Nessun brano selezionato';
    return filename.replace(/^\d+_/, '');
  };

  if (!currentTrack) {
    return (
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6" align="center" color="text.secondary">
          Seleziona un brano dalla playlist per iniziare 🎵
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom align="center">
        🎵 {getDisplayName(currentTrack)}
      </Typography>
      
      {/* Controlli principali */}
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
        <Button
          variant="contained"
          color="error"
          startIcon={<Stop />}
          onClick={stop}
        >
          Stop
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={isPlaying ? <Pause /> : <PlayArrow />}
          onClick={isPlaying ? pause : resume}
          size="large"
        >
          {isPlaying ? 'Pausa' : 'Play'}
        </Button>
      </Stack>

      {/* Barra di progresso */}
      <Box sx={{ mb: 2 }}>
        <Slider
          value={currentTime}
          max={duration}
          onChange={handleSeekChange}
          aria-label="Posizione brano"
          size="small"
        />
        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            {formatTime(currentTime)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatTime(duration)}
          </Typography>
        </Box>
      </Box>

      {/* Controllo volume */}
      <Box display="flex" alignItems="center" gap={1}>
        <VolumeDown />
        <Slider
          value={volume}
          onChange={handleVolumeChange}
          aria-label="Volume"
          min={0}
          max={1}
          step={0.1}
          size="small"
          sx={{ flexGrow: 1 }}
        />
        <VolumeUp />
      </Box>
    </Paper>
  );
}

export default PlayerControls;