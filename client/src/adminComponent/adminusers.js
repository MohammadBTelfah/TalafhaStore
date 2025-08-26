// adminusers.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Button,
  Avatar,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";

const API_BASE = process.env.REACT_APP_API_URL || "http://127.0.0.1:5002";
const IMG_BASE  = `${API_BASE}/uploads`;

// ✅ دالة موحّدة: تتعامل مع URL كامل أو filename قديم + تستبدل backslashes
const getImageUrl = (v, fallback = "https://i.pravatar.cc/150?u=default") => {
  if (!v) return fallback;
  const s = String(v);
  return s.startsWith("http") ? s : `${IMG_BASE}/${s.replace(/\\/g, "/")}`;
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editedUser, setEditedUser] = useState({});
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const token = localStorage.getItem("token");
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const showNotif = (message, severity = "info") =>
    setNotification({ open: true, message, severity });

  const closeNotif = () => setNotification((n) => ({ ...n, open: false }));

  // ============= Fetch users =============
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/users/get-all-user`, {
        headers: authHeader,
      });
      setUsers(res.data?.users || res.data || []);
    } catch (err) {
      console.error("Fetch users error:", err);
      showNotif(err.response?.data?.message || "Failed to fetch users", "error");
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============= Edit handlers =============
  const startEdit = (idx) => {
    setEditIndex(idx);
    setEditedUser(users[idx]);
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setEditedUser({});
  };

  const handleChange = (field, value) => {
    setEditedUser({ ...editedUser, [field]: value });
  };

  // ============= Save (PUT) =============
  const handleSave = async () => {
    try {
      const res = await axios.put(
        `${API_BASE}/api/users/update/${editedUser._id}`,
        editedUser,
        { headers: authHeader }
      );

      const updatedList = [...users];
      const updatedUser = res.data?.user || editedUser;
      updatedList[editIndex] = updatedUser;
      setUsers(updatedList);

      setEditIndex(null);
      setEditedUser({});
      showNotif("User updated", "success");
    } catch (err) {
      console.error("Update error:", err);
      showNotif(err.response?.data?.message || "Failed to update", "error");
    }
  };

  // ============= Delete (DELETE) =============
  const confirmDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this user?");
    if (!ok) return;

    try {
      await axios.delete(`${API_BASE}/api/users/delete/${id}`, {
        headers: authHeader,
      });
      setUsers((prev) => prev.filter((u) => u._id !== id));
      showNotif("User deleted", "success");
    } catch (err) {
      console.error("Delete error:", err);
      showNotif(err.response?.data?.message || "Failed to delete", "error");
    }
  };

  // ============= Helpers =============
  const userAvatar = (u) => getImageUrl(u?.profileImage);

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
        >
          <h2 style={{ margin: 0 }}>Users</h2>
          <Button variant="outlined" onClick={fetchUsers}>
            Refresh
          </Button>
        </Stack>
      </Paper>

      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Avatar</strong></TableCell>
              <TableCell><strong>Full Name</strong></TableCell>
              <TableCell><strong>Username</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Phone</strong></TableCell>
              <TableCell><strong>Role</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map((u, i) => (
              <TableRow key={u._id || i}>
                <TableCell>
                  <Avatar
                    src={userAvatar(u)}
                    alt="user avatar"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://i.pravatar.cc/150?u=default";
                    }}
                  />
                </TableCell>

                <TableCell>
                  {editIndex === i ? (
                    <TextField
                      value={editedUser.fullName || ""}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      size="small"
                    />
                  ) : (
                    u.fullName
                  )}
                </TableCell>

                <TableCell>
                  {editIndex === i ? (
                    <TextField
                      value={editedUser.username || ""}
                      onChange={(e) => handleChange("username", e.target.value)}
                      size="small"
                    />
                  ) : (
                    u.username
                  )}
                </TableCell>

                <TableCell>
                  {editIndex === i ? (
                    <TextField
                      value={editedUser.email || ""}
                      onChange={(e) => handleChange("email", e.target.value)}
                      size="small"
                    />
                  ) : (
                    u.email
                  )}
                </TableCell>

                <TableCell>
                  {editIndex === i ? (
                    <TextField
                      value={editedUser.phone || ""}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      size="small"
                    />
                  ) : (
                    u.phone
                  )}
                </TableCell>

                <TableCell>
                  {editIndex === i ? (
                    <TextField
                      value={editedUser.role || "user"}
                      onChange={(e) => handleChange("role", e.target.value)}
                      size="small"
                    />
                  ) : (
                    u.role || "user"
                  )}
                </TableCell>

                <TableCell align="right">
                  {editIndex === i ? (
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={handleSave}
                      >
                        Save
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </Button>
                    </Stack>
                  ) : (
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => startEdit(i)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => confirmDelete(u._id)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  )}
                </TableCell>
              </TableRow>
            ))}

            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Snackbar
        open={notification.open}
        autoHideDuration={2500}
        onClose={closeNotif}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeNotif}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
