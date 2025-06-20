import React, { createContext, useContext, useState, useRef } from 'react';
import { Howl } from 'howler';
import { useAuth } from './AuthContext';

const AudioContext = createContext();

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio deve essere usato all\'interno di AudioProvider');
  }
  return context;
};

export const AudioProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const soundRef = useRef(null);
  const { token } = useAuth();

  const play = async (filename) => {
  try {
    if (soundRef.current) {
      soundRef.current.stop();
      soundRef.current.unload();
    }

    // Se clicchiamo sulla stessa canzone che sta suonando
    if (currentTrack === filename && soundRef.current) {
      if (isPlaying) {
        soundRef.current.pause();
        setIsPlaying(false);
      } else {
        soundRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    // 🔐 Richiesta fetch con token per ottenere il file protetto
    const response = await fetch(`http://localhost:5000/uploads/${filename}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('File non autorizzato o errore nel server');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const sound = new Howl({
      src: [url],
      html5: true,
      preload: true,
      onload: () => {
        setDuration(sound.duration());
      },
      onplay: () => {
        setIsPlaying(true);
        setCurrentTrack(filename);
      },
      onpause: () => {
        setIsPlaying(false);
      },
      onend: () => {
        setIsPlaying(false);
        setCurrentTrack(null);
        setCurrentTime(0);
      },
      onplayerror: (id, error) => {
        console.error('Errore nella riproduzione:', error);
        alert('Errore nella riproduzione del file audio');
      }
    });

    soundRef.current = sound;
    sound.play();
  } catch (error) {
    console.error('Errore durante la riproduzione del file protetto:', error);
    alert('Errore durante la riproduzione. Controlla se sei loggato.');
  }
};


  const pause = () => {
    if (soundRef.current && isPlaying) {
      soundRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resume = () => {
    if (soundRef.current && !isPlaying) {
      soundRef.current.play();
      setIsPlaying(true);
    }
  };

  const stop = () => {
    if (soundRef.current) {
      soundRef.current.stop();
      setIsPlaying(false);
      setCurrentTrack(null);
      setCurrentTime(0);
    }
  };

  const setVolume = (volume) => {
    if (soundRef.current) {
      soundRef.current.volume(volume);
    }
  };

  const seek = (time) => {
    if (soundRef.current) {
      soundRef.current.seek(time);
      setCurrentTime(time);
    }
  };

  // Aggiorna il tempo corrente
  React.useEffect(() => {
    let interval;
    if (isPlaying && soundRef.current) {
      interval = setInterval(() => {
        setCurrentTime(soundRef.current.seek());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const value = {
    currentTrack,
    isPlaying,
    duration,
    currentTime,
    play,
    pause,
    resume,
    stop,
    setVolume,
    seek
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};