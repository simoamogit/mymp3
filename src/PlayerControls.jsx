import React from 'react';
import { 
  Button, 
  Stack, 
  Paper, 
  Typography, 
  Slider, 
  Box,
  IconButton,
  Tooltip,
  Chip,
  useMediaQuery
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  VolumeUp,
  VolumeDown,
  SkipNext,
  SkipPrevious,
  Shuffle,
  Repeat,
  RepeatOne
} from '@mui/icons-material';
import { useAudio } from '../contexts/AudioContext';

function PlayerControls() {
  const { 
    currentTrack, 
    isPlaying, 
    duration, 
    currentTime,
    shuffle,
    repeat,
    play, 
    pause, 
    resume, 
    stop,
    next,
    previous,
    toggleShuffle,
    toggleRepeat,
    setVolume, 
    seek
  } = useAudio();
  
  const [volume, setVolumeState] = React.useState(0.7);
  const isMobile = useMediaQuery('(max-width:600px)');

  const handleVolumeChange = (event, newValue) => {
    setVolumeState(newValue);
    setVolume(newValue);
  };

  const handleSeekChange = (event, newValue) => {
    seek(newValue);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRepeatIcon = () => {
    switch (repeat) {
      case 'one': return <RepeatOne />;
      case 'all': return <Repeat />;
      default: return <Repeat />;
    }
  };

  const getRepeatColor = () => repeat !== 'none' ? 'primary' : 'default';

  if (!currentTrack) {
    return null;
  }

  return (
    <Paper sx={{ p: isMobile ? 1 : 2, mt: 2 }}>
      <Box sx={{ textAlign: 'center', mb: isMobile ? 1 : 2 }}>
        <Typography variant={isMobile ? 'subtitle1' : 'h6'} noWrap>
          🎵 {currentTrack.replace(/^\d+_/, '')}
        </Typography>
      </Box>
      
      <Box sx={{ mb: isMobile ? 1 : 2 }}>
        <Slider
          value={currentTime}
          max={duration}
          onChange={handleSeekChange}
          aria-label="Posizione brano"
          size="small"
          sx={{
            '& .MuiSlider-thumb': {
              width: isMobile ? 12 : 16,
              height: isMobile ? 12 : 16,
            },
          }}
        />
        <Box display="flex" justifyContent="space-between">
          <Typography variant="caption" color="text.secondary">
            {formatTime(currentTime)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatTime(duration)}
          </Typography>
        </Box>
      </Box>

      <Stack 
        direction="row" 
        spacing={1} 
        justifyContent="center" 
        sx={{ mb: isMobile ? 1 : 2 }}
        flexWrap="wrap"
      >
        <Tooltip title={shuffle ? 'Disattiva casuale' : 'Attiva casuale'}>
          <IconButton
            onClick={toggleShuffle}
            color={shuffle ? 'primary' : 'default'}
            size={isMobile ? 'small' : 'medium'}
          >
            <Shuffle fontSize={isMobile ? 'small' : 'medium'} />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Brano precedente">
          <IconButton onClick={previous} size={isMobile ? 'small' : 'medium'}>
            <SkipPrevious fontSize={isMobile ? 'small' : 'medium'} />
          </IconButton>
        </Tooltip>

        <Button
          variant="contained"
          color="primary"
          onClick={isPlaying ? pause : resume}
          size={isMobile ? 'small' : 'medium'}
          sx={{ minWidth: isMobile ? 60 : 80 }}
        >
          {isPlaying ? <Pause /> : <PlayArrow />}
        </Button>

        <Button
          variant="outlined"
          color="error"
          onClick={stop}
          size={isMobile ? 'small' : 'medium'}
          sx={{ minWidth: isMobile ? 60 : 80 }}
        >
          <Stop />
        </Button>

        <Tooltip title="Brano successivo">
          <IconButton onClick={next} size={isMobile ? 'small' : 'medium'}>
            <SkipNext fontSize={isMobile ? 'small' : 'medium'} />
          </IconButton>
        </Tooltip>

        <Tooltip title={`Ripeti: ${repeat === 'none' ? 'No' : repeat === 'all' ? 'Playlist' : 'Brano'}`}>
          <IconButton
            onClick={toggleRepeat}
            color={getRepeatColor()}
            size={isMobile ? 'small' : 'medium'}
          >
            {getRepeatIcon()}
          </IconButton>
        </Tooltip>
      </Stack>

      {!isMobile && (
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
            sx={{ 
              flexGrow: 1,
              '& .MuiSlider-thumb': {
                width: 14,
                height: 14,
              },
            }}
          />
          <VolumeUp />
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40 }}>
            {Math.round(volume * 100)}%
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

export default PlayerControls;