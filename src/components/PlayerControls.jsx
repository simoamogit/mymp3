import React from 'react';
import { Button, Stack } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import { Howler } from 'howler';

function PlayerControls() {
  return (
    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
      <Button variant="contained" color="primary" startIcon={<StopIcon />} onClick={() => Howler.stop()}>
        Stop
      </Button>
      <Button variant="contained" color="primary" startIcon={<PlayArrowIcon />} onClick={() => Howler._howls[0]?.play()}>
        Play
      </Button>
      <Button variant="contained" color="primary" startIcon={<PauseIcon />} onClick={() => Howler._howls[0]?.pause()}>
        Pause
      </Button>
    </Stack>
  );
}

export default PlayerControls;
