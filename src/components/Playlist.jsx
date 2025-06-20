import React, { useEffect, useState } from 'react';
import {
  List,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Paper,
  Box,
  Alert,
  ListItemIcon
} from '@mui/material';
import { Delete as DeleteIcon, PlayArrow, Pause, MusicNote } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useAudio } from '../contexts/AudioContext';

function Playlist() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const { currentTrack, isPlaying, play } = useAudio();

  const fetchFiles = async () => {
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
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [token]);

  const deleteFile = async (filename) => {
    if (window.confirm('Sei sicuro di voler eliminare questo file?')) {
      try {
        const response = await fetch(`http://localhost:5000/delete/${filename}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          fetchFiles(); // Ricarica la lista
        } else {
          alert('Errore durante l\'eliminazione del file');
        }
      } catch (err) {
        alert('Errore di connessione');
      }
    }
  };

  const getDisplayName = (filename) => {
    // Rimuove il prefisso user_id_ dal nome del file
    return filename.replace(/^\d+_/, '');
  };

  const getTrackStatus = (filename) => {
    if (currentTrack === filename) {
      return isPlaying ? '🎵 In riproduzione' : '⏸️ In pausa';
    }
    return '';
  };

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        La tua Playlist 🎵
      </Typography>
      
      {files.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Nessun file MP3 trovato. Carica i tuoi brani preferiti!
          </Typography>
        </Paper>
      ) : (
        <Paper>
          <List>
            {files.map((file, index) => (
              <ListItemButton
                key={file}
                onClick={() => play(file)}
                selected={currentTrack === file}
                divider={index < files.length - 1}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    },
                  },
                }}
              >
                <ListItemIcon>
                  {currentTrack === file ? (
                    isPlaying ? <Pause color="primary" /> : <PlayArrow color="primary" />
                  ) : (
                    <MusicNote />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={getDisplayName(file)}
                  secondary={getTrackStatus(file)}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFile(file);
                    }}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}

export default Playlist;