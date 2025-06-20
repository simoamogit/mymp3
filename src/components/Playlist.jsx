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
  Alert
} from '@mui/material';
import { Delete as DeleteIcon, PlayArrow, Pause } from '@mui/icons-material';
import { Howl } from 'howler';
import { useAuth } from '../contexts/AuthContext';

let sound = null;

function Playlist() {
  const [files, setFiles] = useState([]);
  const [current, setCurrent] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();

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

  const playSong = (file) => {
    if (sound) {
      sound.stop();
    }

    if (current === file && isPlaying) {
      setIsPlaying(false);
      setCurrent('');
      return;
    }

    sound = new Howl({
      src: [`http://localhost:5000/uploads/${file}`],
      html5: true,
      onplay: () => setIsPlaying(true),
      onpause: () => setIsPlaying(false),
      onend: () => {
        setIsPlaying(false);
        setCurrent('');
      }
    });

    sound.play();
    setCurrent(file);
  };

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
          if (current === filename) {
            if (sound) sound.stop();
            setCurrent('');
            setIsPlaying(false);
          }
        } else {
          alert('Errore durante l\'eliminazione del file');
        }
      } catch (err) {
        alert('Errore di connessione');
      }
    }
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
                onClick={() => playSong(file)}
                selected={current === file}
                divider={index < files.length - 1}
              >
                <ListItemText
                  primary={file.replace(/^\d+_/, '')} // Rimuove il prefisso user_id
                  secondary={current === file ? (isPlaying ? '🎵 In riproduzione' : '⏸️ In pausa') : ''}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFile(file);
                    }}
                    color="error"
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