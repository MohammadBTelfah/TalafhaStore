import React, { useState, useEffect } from "react";
import {
  Box, Container, Typography, TextField, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, IconButton,
  Select, MenuItem, InputLabel, FormControl, CssBaseline, Dialog,
  DialogTitle, DialogContent, DialogActions, Switch
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Delete, Edit } from "@mui/icons-material";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import '../styles/productMangment.css';

const ProductManagement = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    prodName: "", prodPrice: "", prodDescription: "", prodCategory: "",
    prodStock: "", prodBrand: "", prodImage: null, discount: 0, isFeatured: false
  });

  const theme = createTheme({ palette: { mode: darkMode ? "dark" : "light" } });

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5002/api/products/getall");
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5002/api/categories/getAll");
      setCategories(res.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const onDrop = (acceptedFiles) => {
    setFormData(prev => ({ ...prev, prodImage: acceptedFiles[0] }));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "discount" || name === "prodPrice" || name === "prodStock"
          ? Number(value)
          : value
    }));
  };

  const appendFormData = (data, form) => {
    Object.entries(form).forEach(([key, val]) => {
      if (typeof val === "boolean") {
        data.append(key, val.toString());
      } else {
        data.append(key, val);
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    appendFormData(data, formData);
    try {
      await axios.post("http://localhost:5002/api/products/create", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      fetchProducts();
      setFormData({
        prodName: "", prodPrice: "", prodDescription: "", prodCategory: "",
        prodStock: "", prodBrand: "", prodImage: null, discount: 0, isFeatured: false
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5002/api/products/delete/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const openEditDialog = (product) => {
    setEditingProduct(product);
    setFormData({
      prodName: product.prodName,
      prodPrice: product.prodPrice,
      prodDescription: product.prodDescription,
      prodCategory: product.prodCategory?._id || "",
      prodStock: product.prodStock,
      prodBrand: product.prodBrand,
      discount: product.discount || 0,
      isFeatured: product.isFeatured || false,
      prodImage: null
    });
    setDialogOpen(true);
  };

  const handleUpdate = async () => {
    const data = new FormData();
    appendFormData(data, formData);
    try {
      await axios.put(
        `http://localhost:5002/api/products/update/${editingProduct._id}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      setDialogOpen(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter(p =>
    p.prodName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container>
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={4} mb={2}>
          <Typography variant="h4">Product Management</Typography>
          <Button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "Light Mode" : "Dark Mode"}
          </Button>
        </Box>

        <Paper className="product-form">
          <Typography variant="h6" gutterBottom>Add New Product</Typography>
          <form onSubmit={handleSubmit}>
            <TextField fullWidth name="prodName" label="Product Name" value={formData.prodName} onChange={handleChange} margin="normal" />
            <TextField fullWidth name="prodPrice" label="Price" value={formData.prodPrice} onChange={handleChange} margin="normal" />
            <TextField fullWidth name="discount" label="Discount (%)" value={formData.discount} onChange={handleChange} margin="normal" />
            <TextField fullWidth name="prodDescription" label="Description" value={formData.prodDescription} onChange={handleChange} margin="normal" />
            <TextField fullWidth name="prodStock" label="Stock" value={formData.prodStock} onChange={handleChange} margin="normal" />
            <TextField fullWidth name="prodBrand" label="Brand" value={formData.prodBrand} onChange={handleChange} margin="normal" />

            <FormControl fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select name="prodCategory" value={formData.prodCategory} onChange={handleChange} label="Category">
                {categories.map((cat) => (
                  <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl margin="normal">
              <Typography variant="body1">Featured:</Typography>
              <Switch checked={formData.isFeatured} onChange={handleChange} name="isFeatured" />
            </FormControl>

            <Box {...getRootProps()} className="dropzone">
              <input {...getInputProps()} />
              {isDragActive ? "Drop the image here ..." : "Drag 'n' drop product image, or click to select"}
            </Box>

            <Button variant="contained" type="submit" sx={{ mt: 2 }}>Create Product</Button>
          </form>
        </Paper>

        <TextField
          fullWidth
          className="search-bar"
          label="Search Products"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <TableContainer component={Paper} className="product-table" sx={{ mt: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>Final Price</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Brand</TableCell>
                <TableCell>Featured</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((prod) => {
                const finalPrice = prod.prodPrice - (prod.prodPrice * (prod.discount || 0) / 100);
                return (
                  <TableRow key={prod._id}>
                    <TableCell>{prod.prodName}</TableCell>
                    <TableCell>
                      {prod.discount > 0 ? (
                        <>
                          <del style={{ opacity: 0.6 }}>{prod.prodPrice}</del>
                        </>
                      ) : (
                        prod.prodPrice
                      )}
                    </TableCell>
                    <TableCell>{prod.discount || 0}%</TableCell>
                    <TableCell>{finalPrice.toFixed(2)}</TableCell>
                    <TableCell>{prod.prodCategory?.name || "N/A"}</TableCell>
                    <TableCell>{prod.prodStock}</TableCell>
                    <TableCell>{prod.prodBrand}</TableCell>
                    <TableCell>{prod.isFeatured ? "✅" : "❌"}</TableCell>
                    <TableCell>
                      <img
                        src={`http://localhost:5002/uploads/${prod.prodImage}`}
                        alt="prod"
                        width="40"
                        style={{ borderRadius: "6px" }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => openEditDialog(prod)}><Edit /></IconButton>
                      <IconButton onClick={() => handleDelete(prod._id)}><Delete /></IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogContent>
            <TextField fullWidth name="prodName" label="Product Name" value={formData.prodName} onChange={handleChange} margin="dense" />
            <TextField fullWidth name="prodPrice" label="Price" value={formData.prodPrice} onChange={handleChange} margin="dense" />
            <TextField fullWidth name="discount" label="Discount" value={formData.discount} onChange={handleChange} margin="dense" />
            <TextField fullWidth name="prodDescription" label="Description" value={formData.prodDescription} onChange={handleChange} margin="dense" />
            <TextField fullWidth name="prodStock" label="Stock" value={formData.prodStock} onChange={handleChange} margin="dense" />
            <TextField fullWidth name="prodBrand" label="Brand" value={formData.prodBrand} onChange={handleChange} margin="dense" />

            <FormControl fullWidth margin="dense">
              <InputLabel>Category</InputLabel>
              <Select name="prodCategory" value={formData.prodCategory} onChange={handleChange} label="Category">
                {categories.map((cat) => (
                  <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl margin="dense">
              <Typography variant="body1">Featured:</Typography>
              <Switch checked={formData.isFeatured} onChange={handleChange} name="isFeatured" />
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleUpdate}>Update</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
};

export default ProductManagement;
