import React from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import { MusicNote, Album, Person, AccessTime } from '@mui/icons-material';

export default function MediaMetadata({ metadata }) {
  if (!metadata) {
    return (
      <Paper sx={{ p: 3, height: '100%' }}>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
          <MusicNote sx={{ fontSize: 80, color: 'text.disabled' }} />
          <Typography variant="h6" color="text.secondary" mt={2}>
            Nessun brano selezionato
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Seleziona un brano per visualizzare i dettagli
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
        <Box
          component="img"
          src={metadata.artwork || 'https://via.placeholder.com/300'}
          alt={metadata.title}
          sx={{ 
            width: '100%', 
            maxWidth: 300, 
            borderRadius: 2,
            boxShadow: 3,
            mb: 2
          }}
        />
        
        <Typography variant="h5" fontWeight="bold">
          {metadata.title || 'Titolo sconosciuto'}
        </Typography>
        
        <Typography variant="subtitle1" color="text.secondary">
          {metadata.artist || 'Artista sconosciuto'}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          {metadata.album || 'Album sconosciuto'}
        </Typography>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box>
        <Box display="flex" alignItems="center" mb={1}>
          <Album sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2">
            <strong>Album:</strong> {metadata.album || 'N/A'}
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center" mb={1}>
          <Person sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2">
            <strong>Artista:</strong> {metadata.artist || 'N/A'}
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center" mb={1}>
          <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2">
            <strong>Anno:</strong> {metadata.year || 'N/A'}
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center">
          <MusicNote sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2">
            <strong>Genere:</strong> {metadata.genre || 'N/A'}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}