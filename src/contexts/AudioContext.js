import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
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
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('none'); // 'none', 'one', 'all'
  const [shuffledPlaylist, setShuffledPlaylist] = useState([]);
  const soundRef = useRef(null);
  const { token } = useAuth();

  // Funzione per mescolare array (Fisher-Yates shuffle)
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Aggiorna playlist quando cambia shuffle
  useEffect(() => {
    if (shuffle && playlist.length > 0) {
      const shuffled = shuffleArray(playlist);
      setShuffledPlaylist(shuffled);
    } else {
      setShuffledPlaylist([]);
    }
  }, [shuffle, playlist]);

  // Ascolta eventi di aggiornamento playlist
  useEffect(() => {
    const handlePlaylistUpdate = () => {
      // Ricarica la playlist senza interrompere la riproduzione
      fetchPlaylist();
    };

    window.addEventListener('playlistUpdate', handlePlaylistUpdate);
    return () => window.removeEventListener('playlistUpdate', handlePlaylistUpdate);
  }, []);

  const fetchPlaylist = async () => {
    try {
      const response = await fetch('http://localhost:5000/files', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const files = await response.json();
        setPlaylist(files);
        
        // Se la canzone corrente non è più nella playlist, ferma la riproduzione
        if (currentTrack && !files.includes(currentTrack)) {
          stop();
        }
      }
    } catch (error) {
      console.error('Errore nel caricamento della playlist:', error);
    }
  };

  // Inizializza playlist
  useEffect(() => {
    if (token) {
      fetchPlaylist();
    }
  }, [token]);

  const getCurrentPlaylist = () => shuffle ? shuffledPlaylist : playlist;

// AudioContext.js (modifica getNextTrack e getPreviousTrack)
const getNextTrack = () => {
  const currentPlaylist = getCurrentPlaylist();
  if (currentPlaylist.length === 0) return null;

  // Modifica: confronta con currentTrack.filename invece di currentTrack
  const trackIndex = currentPlaylist.findIndex(track => track.filename === currentTrack);
  
  if (repeat === 'one') {
    return currentTrack;
  }
  
  if (trackIndex === -1) return currentPlaylist[0].filename;
  
  const nextIndex = (trackIndex + 1) % currentPlaylist.length;
  
  if (repeat === 'none' && nextIndex === 0 && trackIndex === currentPlaylist.length - 1) {
    return null;
  }
  
  return currentPlaylist[nextIndex].filename;
};

const getPreviousTrack = () => {
  const currentPlaylist = getCurrentPlaylist();
  if (currentPlaylist.length === 0) return null;

  // Modifica: confronta con currentTrack.filename invece di currentTrack
  const trackIndex = currentPlaylist.findIndex(track => track.filename === currentTrack);
  
  if (trackIndex === -1) return currentPlaylist[0].filename;
  
  const prevIndex = trackIndex === 0 ? currentPlaylist.length - 1 : trackIndex - 1;
  return currentPlaylist[prevIndex].filename;
};

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
        const response = await fetch(`http://localhost:5000/file-metadata/${filename}`, {
        headers: { Authorization: `Bearer ${token}` }
        });
        const metadata = await response.json();
        setCurrentMetadata(metadata);

      if (!response.ok) {
        throw new Error('File non autorizzato o errore nel server');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const sound = new Howl({
        src: [url],
        html5: true,
        preload: true,
        format: ['mp3'],
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
          setCurrentTime(0);
          
          // Auto-play next track
          const nextTrack = getNextTrack();
          if (nextTrack) {
            play(nextTrack);
          } else {
            setCurrentTrack(null);
          }
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

  const next = () => {
    const nextTrack = getNextTrack();
    if (nextTrack) {
      play(nextTrack);
    }
  };

  const previous = () => {
    const prevTrack = getPreviousTrack();
    if (prevTrack) {
      play(prevTrack);
    }
  };

  const toggleShuffle = () => {
    setShuffle(!shuffle);
  };

  const toggleRepeat = () => {
    const modes = ['none', 'all', 'one'];
    const currentIndex = modes.indexOf(repeat);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeat(modes[nextIndex]);
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

  const [currentMetadata, setCurrentMetadata] = useState(null);

  // Aggiorna il tempo corrente
  useEffect(() => {
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
    playlist,
    shuffle,
    repeat,
    play,
    pause,
    resume,
    stop,
    next,
    previous,
    toggleShuffle,
    toggleRepeat,
    setVolume,
    seek,
    fetchPlaylist,
    currentMetadata,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};