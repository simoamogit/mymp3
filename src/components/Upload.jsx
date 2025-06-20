import React from 'react';
import { Button } from '@mui/material';
import axios from 'axios';

function Upload() {
  const handleUpload = (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    axios.post('http://localhost:5000/upload', formData)
      .then(() => window.location.reload())
      .catch(err => console.error(err));
  };

  return (
    <div>
      <Button variant="contained" component="label" sx={{ mt: 2 }}>
        Carica MP3
        <input type="file" hidden onChange={handleUpload} accept=".mp3" />
      </Button>
    </div>
  );
}

export default Upload;
