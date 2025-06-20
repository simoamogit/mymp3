import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Stack,
  Paper,
  Divider,
  Collapse,
  CircularProgress
} from '@mui/material';
import {
  YouTube,
  Download,
  CheckCircle,
  Error,
  PlaylistPlay,
  MusicNote,
  Delete
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

function YouTubeMusicSync({ onSyncComplete }) {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [syncStatus, setSyncStatus] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [syncHistory, setSyncHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const { token } = useAuth();

  const downloadPlaylist = async () => {
    if (!playlistUrl.trim()) return;
    
    setIsDownloading(true);
    setDownloadProgress(0);
    setSyncStatus('Download playlist in corso...');
    
    try {
      const response = await fetch('http://localhost:5000/download-youtube-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ playlist_url: playlistUrl })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore nel download della playlist');
      }

      setSyncStatus(`Download completato: ${data.message}`);
      
      // Aggiungi i brani scaricati alla cronologia
      const newHistory = data.downloaded.map(title => ({
        id: Date.now() + Math.random(),
        title,
        status: 'success',
        timestamp: new Date()
      }));
      
      setSyncHistory(prev => [...newHistory, ...prev]);
      
      // Notifica il completamento
      if (onSyncComplete) {
        onSyncComplete();
      }
      
    } catch (error) {
      setSyncStatus(`Errore: ${error.message || 'Errore sconosciuto'}`);
      setSyncHistory(prev => [{
        id: Date.now(),
        title: `Playlist: ${playlistUrl}`,
        status: 'error',
        timestamp: new Date(),
        error: error.message
      }, ...prev]);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const clearHistory = () => {
    setSyncHistory([]);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle color="success" />;
      case 'error': return <Error color="error" />;
      default: return <MusicNote color="disabled" />;
    }
  };

  return (
    <Paper sx={{ p: 3, backgroundColor: 'background.paper', boxShadow: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <YouTube color="error" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h6" fontWeight="bold">Importa Playlist YouTube</Typography>
            <Typography variant="body2" color="text.secondary">
              Aggiungi brani musicali da playlist YouTube
            </Typography>
          </Box>
        </Typography>
        
        {syncStatus && (
          <Alert 
            severity={syncStatus.includes('Errore') ? 'error' : 'success'} 
            sx={{ mb: 2 }}
          >
            {syncStatus}
          </Alert>
        )}
      </Box>

      {/* Input URL Playlist */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="URL Playlist YouTube"
          variant="outlined"
          value={playlistUrl}
          onChange={(e) => setPlaylistUrl(e.target.value)}
          placeholder="Es: https://www.youtube.com/playlist?list=..."
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: <YouTube color="action" sx={{ mr: 1 }} />
          }}
          helperText="Incolla l'URL completo della playlist YouTube"
        />
        
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="contained"
            color="primary"
            onClick={downloadPlaylist}
            disabled={isDownloading || !playlistUrl.trim()}
            startIcon={isDownloading ? <CircularProgress size={20} /> : <Download />}
            sx={{ flex: 1 }}
          >
            {isDownloading ? 'Download in corso...' : 'Importa Playlist'}
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => {
              setPlaylistUrl('');
              setSyncStatus('');
            }}
            disabled={isDownloading}
          >
            Cancella
          </Button>
        </Stack>
        
        {isDownloading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={downloadProgress} 
              color="primary" 
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" textAlign="center" mt={1}>
              {downloadProgress}% completato
            </Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Cronologia Download */}
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Button
            variant="text"
            onClick={() => setShowHistory(!showHistory)}
            startIcon={showHistory ? <Download /> : <MusicNote />}
            sx={{ fontWeight: 'bold' }}
          >
            Cronologia Importazioni
            {showHistory ? ' (nascondi)' : ` (${syncHistory.length})`}
          </Button>
          
          {syncHistory.length > 0 && (
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<Delete />}
              onClick={clearHistory}
            >
              Cancella cronologia
            </Button>
          )}
        </Stack>
        
        <Collapse in={showHistory}>
          {syncHistory.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 4,
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 1
            }}>
              <MusicNote sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body1" color="text.secondary">
                Nessuna importazione effettuata
              </Typography>
            </Box>
          ) : (
            <List sx={{ 
              maxHeight: 300, 
              overflow: 'auto',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 0
            }}>
              {syncHistory.map((item) => (
                <ListItem 
                  key={item.id} 
                  sx={{ 
                    py: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 0 }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {getStatusIcon(item.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography noWrap>
                        {item.title}
                      </Typography>
                    }
                    secondary={
                      item.error ? `Errore: ${item.error}` : item.timestamp.toLocaleString('it-IT')
                    }
                    secondaryTypographyProps={{ 
                      variant: 'caption',
                      color: item.error ? 'error' : 'text.secondary'
                    }}
                  />
                  <Chip 
                    label={item.status === 'success' ? 'Successo' : 'Errore'} 
                    size="small"
                    color={item.status === 'success' ? 'success' : 'error'}
                    variant="outlined"
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Collapse>
      </Box>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          ⚠️ Utilizzare solo contenuti di cui si possiedono i diritti o di pubblico dominio
        </Typography>
      </Box>
    </Paper>
  );
}

export default YouTubeMusicSync;