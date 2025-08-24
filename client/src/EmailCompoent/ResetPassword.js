import React, { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Typography,
  Button,
  Paper,
  Snackbar,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import LockResetIcon from '@mui/icons-material/LockReset';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// ✅ قاعدة الـ API (env في المحلي/Vercel) مع fallback للإنتاج
const API_BASE = process.env.REACT_APP_API_URL || 'https://talafhastore.onrender.com';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [loading, setLoading] = useState(false);

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  // ✅ تحقق من صلاحية التوكن قبل عرض الصفحة
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        navigate('/forgot-password');
        return;
      }

      try {
        const res = await axios.post(`${API_BASE}/api/users/verify-reset-token`, { token });
        if (!res.data.valid) {
          navigate('/forgot-password');
        }
      } catch {
        navigate('/forgot-password');
      }
    };

    checkToken();
  }, [token, navigate]);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!passwordRegex.test(newPassword)) {
      return setSnackbar({
        open: true,
        message: 'Password must be at least 8 characters and include uppercase, lowercase, and a number.',
        severity: 'warning'
      });
    }

    if (newPassword !== confirmPassword) {
      return setSnackbar({ open: true, message: "Passwords do not match", severity: "warning" });
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/api/users/reset-password`, {
        token,
        newPassword
      });
      setSnackbar({ open: true, message: res.data.message, severity: 'success' });
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to reset password.',
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
          Reset Password
        </Typography>
        <Typography variant="body1" mb={3} color="text.secondary">
          Enter your new password below.
        </Typography>

        <form onSubmit={handleReset}>
          <TextField
            fullWidth
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            required
            sx={{ mb: 2 }}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <TextField
            fullWidth
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            required
            sx={{ mb: 3 }}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            endIcon={<LockResetIcon />}
            disabled={loading || !token}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
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
