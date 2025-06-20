import React, { useState } from 'react';
import { Button, Alert, LinearProgress, Box } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

function Upload({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token } = useAuth();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        setSuccess('File caricato con successo!');
        if (onUploadSuccess) onUploadSuccess();
        // Reset input
        e.target.value = '';
        // Ricarica la pagina per aggiornare la playlist
        window.location.reload();
      } else {
        const data = await response.json();
        setError(data.error || 'Errore durante il caricamento');
      }
    } catch (err) {
      setError('Errore di connessione');
    }

    setUploading(false);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Button
        variant="contained"
        component="label"
        startIcon={<CloudUpload />}
        disabled={uploading}
        sx={{ mb: 2 }}
      >
        {uploading ? 'Caricamento...' : 'Carica MP3'}
        <input
          type="file"
          hidden
          onChange={handleUpload}
          accept=".mp3"
          disabled={uploading}
        />
      </Button>
      
      {uploading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
    </Box>
  );
}

export default Upload;