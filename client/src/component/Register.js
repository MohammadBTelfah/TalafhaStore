import React, { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Avatar,
  Grid
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Upload,
  Person,
  Email,
  Lock,
  Phone,
  Home,
  CameraAlt
} from '@mui/icons-material';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    profileImage: null
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, profileImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\+]?\d{7,15}$/;

    if (!formData.firstName.trim()) newErrors.firstName = 'Required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Required';
    if (!formData.username.trim() || formData.username.length < 3) newErrors.username = 'Username too short';
    if (!formData.email.trim() || !emailRegex.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.phone.trim() || !phoneRegex.test(formData.phone)) newErrors.phone = 'Invalid phone';
    if (!formData.address.trim()) newErrors.address = 'Required';
    if (!formData.password || !passwordRegex.test(formData.password)) newErrors.password = 'Weak password';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords don\'t match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) alert('Registration Successful');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea, #764ba2)', p: 2 }}>
      <Container maxWidth="md">
        <Card elevation={10} sx={{ borderRadius: 5 }}>
          <CardContent>
            <Typography variant="h4" textAlign="center" gutterBottom fontWeight={700}>Create Account</Typography>
            <form onSubmit={handleSubmit}>
              <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4}>
                <Box flex={1}>
                  <Box display="flex" justifyContent="center" mb={2}>
                    <Avatar
                      src={previewImage}
                      sx={{ width: 100, height: 100, border: '3px solid #667eea' }}
                    >
                      <CameraAlt />
                    </Avatar>
                  </Box>
                  <Box textAlign="center" mb={3}>
                    <label htmlFor="profile-image-upload">
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="profile-image-upload"
                        type="file"
                        onChange={handleImageUpload}
                      />
                      <Button component="span" startIcon={<Upload />} variant="outlined">
                        Upload Profile
                      </Button>
                    </label>
                  </Box>

                  <TextField fullWidth label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} error={!!errors.firstName} helperText={errors.firstName} sx={{ mb: 2 }} />
                  <TextField fullWidth label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} error={!!errors.lastName} helperText={errors.lastName} sx={{ mb: 2 }} />
                  <TextField fullWidth label="Username" name="username" value={formData.username} onChange={handleInputChange} error={!!errors.username} helperText={errors.username} InputProps={{ startAdornment: (<InputAdornment position="start"><Person /></InputAdornment>) }} />
                </Box>

                <Box flex={1}>
                  <TextField fullWidth label="Email Address" name="email" value={formData.email} onChange={handleInputChange} error={!!errors.email} helperText={errors.email} sx={{ mb: 2 }} InputProps={{ startAdornment: (<InputAdornment position="start"><Email /></InputAdornment>) }} />
                  <TextField fullWidth label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} error={!!errors.phone} helperText={errors.phone} sx={{ mb: 2 }} InputProps={{ startAdornment: (<InputAdornment position="start"><Phone /></InputAdornment>) }} />
                  <TextField fullWidth label="Address" name="address" multiline rows={3} value={formData.address} onChange={handleInputChange} error={!!errors.address} helperText={errors.address} InputProps={{ startAdornment: (<InputAdornment position="start"><Home /></InputAdornment>) }} />
                </Box>
              </Box>

              <Box mt={4}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      error={!!errors.password}
                      helperText={errors.password || 'At least 8 characters with upper/lowercase and number'}
                      InputProps={{
                        startAdornment: (<InputAdornment position="start"><Lock /></InputAdornment>),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)}>
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword}
                      InputProps={{
                        startAdornment: (<InputAdornment position="start"><Lock /></InputAdornment>),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box textAlign="center" mt={5}>
                <Button type="submit" variant="contained" size="large" sx={{ px: 6, py: 1.5, fontSize: '1rem', borderRadius: 3, background: 'linear-gradient(to right, #667eea, #764ba2)' }}>
                  Create Account
                </Button>
              </Box>

              <Box textAlign="center" mt={3}>
                <Typography variant="body2">
                  Already have an account? <Button variant="text" sx={{ textTransform: 'none', color: '#667eea' }}>Sign In</Button>
                </Typography>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Register;
