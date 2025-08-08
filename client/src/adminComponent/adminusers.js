import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, TextField, Switch, Avatar, Snackbar, Alert, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button
} from "@mui/material";
import { FiEdit2, FiTrash2, FiSave } from "react-icons/fi";
import axios from "axios";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editedUser, setEditedUser] = useState({});
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5002/api/users/get-all-user", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setEditedUser(users[index]);
  };

  const handleChange = (field, value) => {
    setEditedUser({ ...editedUser, [field]: value });
  };

  const handleSave = async () => {
    try {
      const res = await axios.put(
        `http://127.0.0.1:5002/api/users/update/${editedUser._id}`,
        editedUser,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const updated = [...users];
      updated[editIndex] = res.data.user;
      setUsers(updated);
      setEditIndex(null);
      setNotification({ open: true, message: "User updated", severity: "success" });
    } catch (err) {
      console.error("Update error:", err);
      setNotification({ open: true, message: "Failed to update", severity: "error" });
    }
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://127.0.0.1:5002/api/users/delete/${selectedUserId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });

      setUsers(users.filter((user) => user._id !== selectedUserId));
      setNotification({ open: true, message: "User deleted", severity: "success" });
    } catch (err) {
      console.error("Delete error:", err);
      setNotification({ open: true, message: "Failed to delete", severity: "error" });
    } finally {
      setConfirmOpen(false);
      setSelectedUserId(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <>
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Avatar</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user, index) => (
              <TableRow key={user._id}>
                <TableCell>
                  <Avatar
                    src={
                      user.profileImage?.startsWith("http")
                        ? user.profileImage
                        : `http://127.0.0.1:5002/uploads/${user.profileImage}`
                    }
                    alt="user avatar"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://i.pravatar.cc/150?u=default";
                    }}
                  />
                </TableCell>
                <TableCell>
                  {editIndex === index ? (
                    <TextField
                      size="small"
                      value={editedUser.username}
                      onChange={(e) => handleChange("username", e.target.value)}
                    />
                  ) : (
                    user.username
                  )}
                </TableCell>
                <TableCell>
                  {editIndex === index ? (
                    <TextField
                      size="small"
                      value={editedUser.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                    />
                  ) : (
                    user.email
                  )}
                </TableCell>
                <TableCell>
                  {editIndex === index ? (
                    <TextField
                      size="small"
                      value={editedUser.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                    />
                  ) : (
                    user.fullName
                  )}
                </TableCell>
                <TableCell>
                  {editIndex === index ? (
                    <TextField
                      size="small"
                      value={editedUser.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                    />
                  ) : (
                    user.phone
                  )}
                </TableCell>
                <TableCell>
                  {editIndex === index ? (
                    <Switch
                      checked={editedUser.role === "admin"}
                      onChange={(e) => handleChange("role", e.target.checked ? "admin" : "user")}
                    />
                  ) : (
                    user.role === "admin" ? "Admin" : "User"
                  )}
                </TableCell>
                <TableCell>
                  {editIndex === index ? (
                    <Tooltip title="Save">
                      <IconButton onClick={handleSave}>
                        <FiSave />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEdit(index)}>
                        <FiEdit2 />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Delete">
                    <IconButton
                      onClick={() => {
                        setSelectedUserId(user._id);
                        setConfirmOpen(true);
                      }}
                      color="error"
                    >
                      <FiTrash2 />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 🔒 Dialog تأكيد الحذف */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this account? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ Snackbar للإشعارات */}
      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
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
    </>
  );
};

export default UserManagement;
