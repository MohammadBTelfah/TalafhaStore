import React, { useState } from "react";
import axios from "axios";
import {
  Box, Container, Typography, Avatar, IconButton, TextField,
  Button, Paper, Stack, Collapse, LinearProgress, Snackbar, Alert, InputAdornment
} from "@mui/material";
import { styled } from "@mui/system";
import { FiEdit2, FiLock } from "react-icons/fi";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  transition: "all 0.3s ease"
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 150,
  height: 150,
  cursor: "pointer",
  margin: "0 auto",
  border: `4px solid ${theme.palette.primary.main}`,
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)"
  }
}));

const InfoSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  "&:hover": {
    backgroundColor: theme.palette.action.hover
  }
}));

const AdminProfile = ({ profileData }) => {
  const [editMode, setEditMode] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showFields, setShowFields] = useState({ current: false, new: false, confirm: false });
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });
  const [localProfile, setLocalProfile] = useState(profileData);
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });

  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };

  const handleEdit = (field) => {
    setEditMode({ ...editMode, [field]: true });
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      Object.entries(localProfile).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const res = await axios.put("http://127.0.0.1:5002/api/users/update-profile", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data"
        }
      });

      setEditMode({});
      setLocalProfile(res.data.user);
      showNotification("Profile updated successfully", "success");
    } catch (err) {
      showNotification("Failed to update profile", "error");
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const res = await axios.put("http://127.0.0.1:5002/api/users/update-profile", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data"
        }
      });

      setLocalProfile(res.data.user);
      showNotification("Profile picture updated successfully", "success");
    } catch (err) {
      showNotification("Image upload failed", "error");
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      showNotification("Passwords do not match", "error");
      return;
    }

    try {
      await axios.post("http://127.0.0.1:5002/api/users/change-password", {
        currentPassword: passwordData.current,
        newPassword: passwordData.new
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      showNotification("Password changed successfully", "success");
      setPasswordData({ current: "", new: "", confirm: "" });
      setShowPassword(false);
    } catch (err) {
      showNotification("Password update failed", "error");
    }
  };

  const getPasswordStrength = (password) => {
    const strength = { value: 0, label: "Weak" };
    if (password.length >= 8) strength.value += 33;
    if (/[A-Z]/.test(password)) strength.value += 33;
    if (/[0-9]/.test(password)) strength.value += 34;
    if (strength.value >= 100) strength.label = "Strong";
    else if (strength.value >= 66) strength.label = "Medium";
    return strength;
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Admin Profile
        </Typography>

        <StyledPaper elevation={3}>
          <Box sx={{ position: "relative", mb: 4 }}>
            <input
              type="file"
              accept="image/*"
              id="avatar-upload"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
            <label htmlFor="avatar-upload">
              <StyledAvatar
                src={`http://127.0.0.1:5002/uploads/${localProfile.profileImage}`}
                alt="Admin"
              />
            </label>
          </Box>

          {["username", "email", "fullName", "phone"].map((field) => (
            <InfoSection key={field}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="subtitle1" sx={{ minWidth: 120 }}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}:
                </Typography>
                {editMode[field] ? (
                  <TextField
                    fullWidth
                    value={localProfile[field]}
                    onChange={(e) => setLocalProfile({ ...localProfile, [field]: e.target.value })}
                    size="small"
                  />
                ) : (
                  <Typography variant="body1" sx={{ flexGrow: 1 }}>
                    {localProfile[field]}
                  </Typography>
                )}
                <IconButton onClick={() => handleEdit(field)}>
                  <FiEdit2 />
                </IconButton>
              </Stack>
            </InfoSection>
          ))}

          {Object.values(editMode).includes(true) && (
            <Box mt={2}>
              <Button variant="contained" fullWidth onClick={handleSave}>
                Save Changes
              </Button>
            </Box>
          )}

          <Box sx={{ mt: 4 }}>
            <Button startIcon={<FiLock />} onClick={() => setShowPassword(!showPassword)} variant="outlined" fullWidth>
              Change Password
            </Button>

            <Collapse in={showPassword}>
              <Box sx={{ mt: 2, p: 2 }}>
                <Stack spacing={2}>
                  {["current", "new", "confirm"].map((type) => (
                    <TextField
                      key={type}
                      type={showFields[type] ? "text" : "password"}
                      label={
                        type === "current"
                          ? "Current Password"
                          : type === "new"
                          ? "New Password"
                          : "Confirm Password"
                      }
                      fullWidth
                      value={passwordData[type]}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, [type]: e.target.value })
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                setShowFields((prev) => ({
                                  ...prev,
                                  [type]: !prev[type],
                                }))
                              }
                            >
                              {showFields[type] ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  ))}

                  {passwordData.new && (
                    <>
                      <Typography variant="caption">
                        Password Strength: {getPasswordStrength(passwordData.new).label}
                      </Typography>
                      <LinearProgress value={getPasswordStrength(passwordData.new).value} variant="determinate" />
                    </>
                  )}
                  <Button
                    variant="contained"
                    onClick={handlePasswordChange}
                    disabled={!passwordData.current || !passwordData.new || !passwordData.confirm}
                  >
                    Update Password
                  </Button>
                </Stack>
              </Box>
            </Collapse>
          </Box>
        </StyledPaper>

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification({ ...notification, open: false })}
        >
          <Alert
            onClose={() => setNotification({ ...notification, open: false })}
            severity={notification.severity}
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default AdminProfile;
