import React, { useState } from 'react';
import {
  Container,
  TextField,
  Typography,
  Button,
  Box,
  Paper,
  Snackbar,
  Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5002/api/users/request-password-reset', { email });
      setSnackbar({ open: true, message: res.data.message, severity: 'success' });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Something went wrong.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Forgot Password?
        </Typography>
        <Typography variant="body1" mb={3} color="text.secondary">
          Enter your email to receive a password reset link.
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email Address"
            variant="outlined"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Button
            fullWidth
            variant="contained"
            type="submit"
            color="primary"
            endIcon={<SendIcon />}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
      </Paper>

      <Snackbar
  open={snackbar.open}
  autoHideDuration={5000}
  onClose={() => setSnackbar({ ...snackbar, open: false })}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
>

      <Alert
  onClose={() => setSnackbar({ ...snackbar, open: false })}
  severity={snackbar.severity}
  sx={{
    width: '100%',
    fontSize: '1.1rem',
    py: 2,
    px: 3,
    borderRadius: 2
  }}
>

          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
