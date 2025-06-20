import React, { useEffect, useState } from 'react';
import {
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Paper,
  Box,
  Alert,
  ListItemIcon,
  Chip,
  Stack,
  CircularProgress
} from '@mui/material';
import { 
  PlayArrow, 
  Pause, 
  MusicNote
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useAudio } from '../contexts/AudioContext';
import { useNotifications } from '../contexts/NotificationContext';

function Playlist() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const { currentTrack, isPlaying, play } = useAudio();
  const { addNotification } = useNotifications();

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/files', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      } else {
        setError('Errore nel caricamento dei file');
      }
    } catch (err) {
      setError('Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchFiles();
    }
  }, [token]);

  const handlePlayTrack = (filename) => {
    play(filename);
  };

  const deleteFile = async (filename) => {
    try {
      const response = await fetch(`http://localhost:5000/delete/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        fetchFiles();
        addNotification('File eliminato', 'success', `${filename} è stato rimosso con successo`);
      } else {
        const errorData = await response.json();
        addNotification('Errore eliminazione', 'error', errorData.error || 'Errore durante l\'eliminazione');
      }
    } catch (err) {
      addNotification('Errore di rete', 'error', 'Impossibile connettersi al server');
    }
  };

  if (error) {
    return (
      <Paper sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          Brani ({files.length})
        </Typography>
        
        <Chip 
          label={`${files.length} brani`} 
          color="primary" 
          variant="outlined"
          size="small"
        />
      </Stack>

      {files.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Nessun file presente
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Carica i tuoi primi brani musicali per iniziare!
          </Typography>
        </Box>
      ) : (
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {files.map((file) => (
            <ListItemButton
              key={file.filename}
              selected={currentTrack === file.filename}
              onClick={() => handlePlayTrack(file.filename)}
              sx={{
                borderRadius: 1,
                mb: 1,
                backgroundColor: currentTrack === file.filename ? 'action.selected' : 'transparent',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon>
                {currentTrack === file.filename && isPlaying ? (
                  <Pause color="primary" />
                ) : (
                  <PlayArrow color={currentTrack === file.filename ? "primary" : "action"} />
                )}
              </ListItemIcon>
              <ListItemIcon>
                <MusicNote />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography noWrap>
                    {file.originalName || file.filename}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {new Date(file.uploadDate).toLocaleDateString('it-IT')}
                  </Typography>
                }
              />
            </ListItemButton>
          ))}
        </List>
      )}
    </Paper>
  );
}

export default Playlist;