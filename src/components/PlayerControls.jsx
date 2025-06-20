import React from 'react';
import { Button, Stack } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import { Howler } from 'howler';

function PlayerControls() {
    const handlePlay = () => {
        const howl = Howler._howls[0];
        if (howl && !howl.playing()) {
            howl.play();
        }
    };

    return (
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button variant="contained" color="primary" startIcon={<StopIcon />} onClick={() => Howler.stop()}>
                Stop
            </Button>
            <Button variant="contained" color="primary" startIcon={<PlayArrowIcon />} onClick={handlePlay}>
                Play
            </Button>
            <Button variant="contained" color="primary" startIcon={<PauseIcon />} onClick={() => Howler._howls[0]?.pause()}>
                Pause
            </Button>
        </Stack>
    );
}

export default PlayerControls;
