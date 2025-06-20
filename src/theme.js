import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            background: {
              default: '#fdfdf9',
              paper: '#efffea',
            },
            text: {
              primary: '#222',
            },
            primary: {
              main: '#9be579',
            },
            secondary: {
              main: '#ffd966',
            },
          }
        : {
            background: {
              default: '#121212',
              paper: '#1a1a1a',
            },
            text: {
              primary: '#eee',
            },
            primary: {
              main: '#9be579',
            },
            secondary: {
              main: '#ffea8a',
            },
          }),
    },
    typography: {
      fontFamily: 'Segoe UI, Roboto, sans-serif',
    },
  });
