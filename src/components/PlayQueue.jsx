import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  IconButton,
  Typography,
  Paper,
  Box
} from '@mui/material';
import { PlayArrow, MusicNote } from '@mui/icons-material';
import { useAudio } from '../contexts/AudioContext';

export default function PlayQueue() {
  const { playlist, currentTrack, play } = useAudio();

  if (!playlist.length) {
    return (
      <Paper sx={{ p: 3, height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          Coda di riproduzione
        </Typography>
        <Box textAlign="center" py={4}>
          <MusicNote sx={{ fontSize: 40, color: 'text.disabled' }} />
          <Typography color="text.secondary">
            La coda è vuota
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Coda di riproduzione ({playlist.length})
      </Typography>
      
      <List dense sx={{ maxHeight: 'calc(100% - 48px)', overflow: 'auto' }}>
        {playlist.map((file, index) => (
          <ListItem 
            key={file.filename} 
            secondaryAction={
              <IconButton 
                edge="end" 
                onClick={() => play(file.filename)}
                size="small"
              >
                <PlayArrow />
              </IconButton>
            }
            sx={{
              bgcolor: currentTrack === file.filename ? 'action.selected' : 'transparent',
              borderRadius: 1,
              mb: 0.5
            }}
          >
            <ListItemIcon>
              <MusicNote />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography noWrap>
                  {file.originalName || file.filename}
                </Typography>
              }
              secondary={`${index + 1} di ${playlist.length}`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}