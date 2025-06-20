import React from 'react';
import { 
  Box, 
  Grid, 
  useMediaQuery, 
  useTheme 
} from '@mui/material';

export default function ResponsiveLayout({ 
  metadataPanel, 
  playlistPanel, 
  queuePanel 
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isWatch = useMediaQuery('(max-width: 300px)');

  // Grid v2: Usiamo gridColumn e gridRow invece di xs/md
  const gridStyles = {
    mobile: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: 2
    },
    tablet: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 2
    },
    desktop: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 3
    },
    watch: {
      display: 'block'
    }
  };

  if (isWatch) {
    return (
      <Box sx={gridStyles.watch}>
        {playlistPanel}
      </Box>
    );
  }

  if (isMobile) {
    return (
      <Box sx={gridStyles.mobile}>
        {metadataPanel}
        {playlistPanel}
        {queuePanel}
      </Box>
    );
  }

  if (isTablet) {
    return (
      <Box sx={gridStyles.tablet}>
        <Box>{metadataPanel}</Box>
        <Box>
          <Box mb={2}>{playlistPanel}</Box>
          <Box>{queuePanel}</Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={gridStyles.desktop}>
      {metadataPanel}
      {playlistPanel}
      {queuePanel}
    </Box>
  );
}