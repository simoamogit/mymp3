import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Alert,
  Box,
  Tabs,
  Tab,
  Typography
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

function LoginForm({ open, onClose }) {
  const [tab, setTab] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (tab === 0) {
      // Login
      const result = await login(formData.username, formData.password);
      if (result.success) {
        onClose();
        setFormData({ username: '', email: '', password: '', confirmPassword: '' });
      } else {
        setError(result.error);
      }
    } else {
      // Registrazione
      if (formData.password !== formData.confirmPassword) {
        setError('Le password non coincidono');
        setLoading(false);
        return;
      }

      const result = await register(formData.username, formData.email, formData.password);
      if (result.success) {
        setTab(0);
        setError('');
        setFormData({ ...formData, email: '', password: '', confirmPassword: '' });
        alert('Registrazione completata! Ora puoi effettuare il login.');
      } else {
        setError(result.error);
      }
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
          <Tab label="Login" />
          <Tab label="Registrati" />
        </Tabs>
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <TabPanel value={tab} index={0}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Conferma Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
          </TabPanel>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? 'Caricamento...' : (tab === 0 ? 'Accedi' : 'Registrati')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default LoginForm;