import React, { useState, useEffect } from 'react';
import { 
  Alert, 
  Collapse, 
  IconButton, 
  Button, 
  List, 
  ListItem, 
  ListItemText ,
  Typography
} from '@mui/material';
import { Close, ExpandMore, ExpandLess } from '@mui/icons-material';

export default function ExpandedNotification({ 
  message, 
  severity, 
  details,
  onClose 
}) {
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    if (open) {
      const id = setTimeout(() => {
        setOpen(false);
        setTimeout(() => onClose(), 300);
      }, 5000);
      setTimeoutId(id);
    }

    return () => clearTimeout(timeoutId);
  }, [open]);

  const handleExpand = () => {
    setExpanded(!expanded);
    clearTimeout(timeoutId);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(onClose, 300);
  };

  return (
    <Collapse in={open} sx={{ mb: 2 }}>
      <Alert
        severity={severity}
        action={
          <>
            {details && (
              <IconButton size="small" onClick={handleExpand}>
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}
            <IconButton size="small" onClick={handleClose}>
              <Close fontSize="small" />
            </IconButton>
          </>
        }
        sx={{ alignItems: 'center' }}
      >
        {message}
        
        <Collapse in={expanded} sx={{ mt: 1 }}>
          {Array.isArray(details) ? (
            <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
              {details.map((item, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemText primary={item.name} secondary={item.message} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {details}
            </Typography>
          )}
          
          <Button 
            variant="outlined" 
            size="small" 
            onClick={handleClose}
            sx={{ mt: 1 }}
          >
            Chiudi
          </Button>
        </Collapse>
      </Alert>
    </Collapse>
  );
}