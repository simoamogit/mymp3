import React, { useEffect, useState } from 'react';
import { Paper, Box, Typography, Slider, IconButton } from '@mui/material';
import { PlayArrow, Pause, SkipNext, SkipPrevious } from '@mui/icons-material';
import { useAudio } from '../contexts/AudioContext';

export default function BottomPlayer() {
  const {
    currentTrack,
    isPlaying,
    duration,
    currentTime,
    play,
    pause,
    seek,
    next,
    previous
  } = useAudio();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleSeek = (e, newValue) => seek(newValue);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isMounted || !currentTrack) return null;

  return (
    <Paper sx={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      p: 1,
      borderRadius: 0,
      boxShadow: 3
    }}>
      <Box display="flex" alignItems="center" width="100%">
        <IconButton onClick={previous} size="small">
          <SkipPrevious />
        </IconButton>

        <IconButton onClick={isPlaying ? pause : () => play(currentTrack)} size="small">
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>

        <IconButton onClick={next} size="small">
          <SkipNext />
        </IconButton>

        <Typography variant="body2" sx={{ mx: 1, minWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {currentTrack.replace(/^\d+_/, '')}
        </Typography>

        <Slider
          value={currentTime}
          min={0}
          max={duration}
          onChange={handleSeek}
          size="small"
          sx={{ flexGrow: 1, mx: 2 }}
        />

        <Typography variant="caption" sx={{ minWidth: 70 }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </Typography>
      </Box>
    </Paper>
  );
}
