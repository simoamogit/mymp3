import React, { useEffect, useState } from 'react';
import { List, ListItemButton, ListItemText } from '@mui/material';
import { Howl } from 'howler';

let sound = null;

function Playlist() {
  const [files, setFiles] = useState([]);
  const [current, setCurrent] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/files')
      .then(res => res.json())
      .then(data => setFiles(data));
  }, []);

  const playSong = (file) => {
    if (sound) sound.stop();

    sound = new Howl({
      src: [`http://localhost:5000/uploads/${file}`],
      html5: true
    });

    sound.play();
    setCurrent(file);
  };

  return (
    <>
      <h2>Playlist</h2>
      <List>
        {files.map(file => (
          <ListItemButton key={file} onClick={() => playSong(file)}>
            <ListItemText primary={file} />
          </ListItemButton>
        ))}
      </List>
      {current && <p>🎶 In riproduzione: {current}</p>}
    </>
  );
}

export default Playlist;
