import React, { useState } from 'react';
import { 
  Button, 
  LinearProgress, 
  Box, 
  Typography,
  Collapse
} from '@mui/material';
import { 
  CloudUpload, 
  Close
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

function Upload({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [uploadResults, setUploadResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const { token } = useAuth();
  const { addNotification } = useNotifications();

  const handleMultipleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const mp3Files = files.filter(file => file.name.toLowerCase().endsWith('.mp3'));
    
    if (mp3Files.length === 0) {
      addNotification('Nessun file MP3', 'warning', 'Seleziona solo file MP3 validi');
      return;
    }

    if (mp3Files.length !== files.length) {
      addNotification(
        'File ignorati', 
        'warning', 
        `${files.length - mp3Files.length} file non MP3 sono stati ignorati`
      );
    }

    setUploading(true);
    setUploadQueue(mp3Files.map(file => ({ name: file.name, status: 'pending' })));
    setUploadResults([]);
    setShowResults(true);

    const results = [];

    for (let i = 0; i < mp3Files.length; i++) {
      const file = mp3Files[i];
      
      setUploadQueue(prev => prev.map((item, idx) => ({
        ...item,
        status: idx === i ? 'uploading' : (idx < i ? 'completed' : 'pending')
      })));

        const fileFormData = new FormData();
        fileFormData.append("file", file);

      try {
        const response = await fetch("http://localhost:5000/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: fileFormData
        });

        if (response.ok) {
          results.push({ name: file.name, status: 'success', message: 'Caricato' });
        } else {
          const data = await response.json();
          results.push({ name: file.name, status: 'error', message: data.error || 'Errore' });
        }
      } catch (err) {
      results.push({ 
        name: file.name, 
        status: 'error', 
        message: 'Errore di rete: ' + err.message 
      });
    }
  }

    setUploadResults(results);
    setUploading(false);
    
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    
    if (successCount > 0) {
      addNotification(
        'Caricamento completato', 
        'success', 
        `${successCount} file caricati con successo`,
        results
      );
      
      if (onUploadSuccess) onUploadSuccess();
      setTimeout(() => window.dispatchEvent(new CustomEvent('playlistUpdate')), 1000);
    }
    
    if (errorCount > 0) {
      addNotification(
        'Errori di caricamento', 
        'error', 
        `${errorCount} file non sono stati caricati`,
        results.filter(r => r.status === 'error')
      );
    }

    e.target.value = '';
  };

  const closeResults = () => {
    setShowResults(false);
    setUploadQueue([]);
    setUploadResults([]);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Button
        variant="contained"
        component="label"
        startIcon={<CloudUpload />}
        disabled={uploading}
        fullWidth
      >
        {uploading ? 'Caricamento...' : 'Carica MP3'}
        <input
          type="file"
          hidden
          onChange={handleMultipleUpload}
          accept=".mp3"
          disabled={uploading}
          multiple
        />
      </Button>

      <Collapse in={showResults}>
        <Box sx={{ 
          border: 1, 
          borderColor: 'divider', 
          borderRadius: 1, 
          p: 2, 
          mt: 2,
          bgcolor: 'background.paper'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2">
              Stato Upload
            </Typography>
            <Button 
              size="small" 
              onClick={closeResults}
              startIcon={<Close />}
            >
              Chiudi
            </Button>
          </Box>

          {uploading && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Caricamento in corso... ({uploadQueue.filter(q => q.status === 'completed').length + 1}/{uploadQueue.length})
              </Typography>
            </Box>
          )}

          <Box sx={{ maxHeight: 150, overflow: 'auto' }}>
            {(uploading ? uploadQueue : uploadResults).map((item, index) => (
              <Box 
                key={index} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  py: 0.5,
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Typography 
                  variant="caption" 
                  sx={{ 
                    flexGrow: 1,
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {item.name}
                </Typography>
                <Typography 
                  variant="caption" 
                  color={item.status === 'error' ? 'error' : item.status === 'success' ? 'success' : 'text.secondary'}
                  sx={{ ml: 1 }}
                >
                  {item.status === 'uploading' ? 'Caricamento...' : 
                   item.status === 'success' ? 'Completato' : 'Errore'}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}

export default Upload;