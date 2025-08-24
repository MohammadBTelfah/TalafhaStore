import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Paper, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography, Stack
} from '@mui/material';

export function Category() {
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [rows, setRows] = useState([]);

  // Get all categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get('https://talafhastore.onrender.com/api/categories/getAll');
      setRows(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Load on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Add new category
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newRow = { name };
      await axios.post('https://talafhastore.onrender.com/api/categories/create', newRow, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      await fetchCategories(); // safer than manual state update
      setName('');
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await axios.delete(`https://talafhastore.onrender.com/api/categories/delete/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setRows(prev => prev.filter(r => r._id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  // Start editing
  const handleUpdate = (id, currentName) => {
    setEditingId(id);
    setEditName(currentName);
  };

  // Save changes
  const handleSave = async (id) => {
    if (!id) {
      console.warn("Missing _id in category row.");
      return;
    }

    try {
      await axios.put(`https://talafhastore.onrender.com/api/categories/update/${id}`, { name: editName }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setRows(prev =>
        prev.map(r =>
          r._id === id ? { ...r, name: editName } : r
        )
      );
      setEditingId(null);
      setEditName('');
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Add New Category
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="Category Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
            />
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </Stack>
        </form>
      </Paper>

      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row._id || Math.random()}>
                  <TableCell>
                    {editingId === row._id ? (
                      <TextField
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        size="small"
                        fullWidth
                      />
                    ) : (
                      row.name
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {editingId === row._id ? (
                        <>
                          <Button
                            size="small"
                            color="success"
                            variant="contained"
                            onClick={() => handleSave(row._id)}
                          >
                            Save
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleUpdate(row._id, row.name)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleDelete(row._id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
