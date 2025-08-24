import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  TablePagination,
  Grid,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { format } from "date-fns";
import { FaSearch, FaEdit } from "react-icons/fa";

const API_ROOT = "http://127.0.0.1:5002/api/orders";
const ADMIN_LIST = `${API_ROOT}/admin/orders`;
const UPDATE_STATUS = (id) => `${API_ROOT}/admin/orders/${id}/status`;

// enum عندك بالـ model (lowercase)
const API_STATUSES = ["pending", "processing", "shipped", "completed", "cancelled"];

// للعرض فقط
const toUi = (api) =>
  ({ pending: "Pending", processing: "Processing", shipped: "Shipped", completed: "Completed", cancelled: "Cancelled" }[
    String(api || "").toLowerCase()
  ] || "Pending");

const toApi = (ui) =>
  ({ Pending: "pending", Processing: "processing", Shipped: "shipped", Completed: "completed", Cancelled: "cancelled" }[
    ui
  ] || "pending");

const getStatusColor = (statusApi) => {
  const s = String(statusApi || "").toLowerCase();
  if (s === "pending") return "warning";
  if (s === "processing") return "info";
  if (s === "shipped") return "primary";
  if (s === "completed") return "success";
  if (s === "cancelled") return "error";
  return "default";
};

const shippingInline = (addr) => {
  if (!addr) return "—";
  if (typeof addr === "string") return addr;
  const parts = [addr.line1, addr.line2, addr.city, addr.state, addr.country, addr.postalCode].filter(Boolean);
  return parts.join(", ");
};

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [pendingStatusUI, setPendingStatusUI] = useState("Pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all | one of API_STATUSES
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const token = localStorage.getItem("token") || "";
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  // ===== Fetch from API =====
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(ADMIN_LIST, { headers: authHeader });
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        setSnackbar({
          open: true,
          message: error?.response?.data?.message || "Error fetching orders",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusChange = (orderId, newStatusUI) => {
    setSelectedOrder((prev) => (prev && prev._id === orderId ? prev : orders.find((o) => o._id === orderId)));
    setPendingStatusUI(newStatusUI);
    setOpenConfirmDialog(true);
  };

const confirmStatusChange = async () => {
  if (!selectedOrder) return;
  const id = selectedOrder._id;                   // مهم: _id
  const apiStatus = toApi(pendingStatusUI);       // ينتج lowercase

  // Debug مهم جداً:
  console.log("PATCH URL =>", UPDATE_STATUS(id));
  console.log("PATCH BODY =>", { status: apiStatus });

  const prev = [...orders];
  setOrders((cur) => cur.map((o) => (o._id === id ? { ...o, status: apiStatus } : o)));

  try {
    await axios.patch(
      UPDATE_STATUS(id),
      { status: apiStatus },
      { headers: { "Content-Type": "application/json", ...authHeader } }
    );
    setOpenConfirmDialog(false);
    setSnackbar({ open: true, message: "Order status updated successfully", severity: "success" });
  } catch (error) {
    setOrders(prev);
    console.error("PATCH ERROR =>", error?.response?.status, error?.response?.data);
    setSnackbar({
      open: true,
      message: error?.response?.data?.message || "Failed to update status",
      severity: "error",
    });
  }
};

  const currency = (n) => {
    const x = Number(n);
    if (Number.isNaN(x)) return n ?? "—";
    try {
      return x.toLocaleString("en-US", { style: "currency", currency: "USD" });
    } catch {
      return `$${x.toFixed(2)}`;
    }
  };

  const orderTotal = (o) => {
    if (typeof o?.total === "number") return o.total;
    const items = Array.isArray(o?.items) ? o.items : [];
    return items.reduce(
      (acc, it) => acc + Number(it?.product?.prodPrice ?? it?.product?.price ?? 0) * Number(it?.qty ?? 1),
      0
    );
  };

  // ===== Filters / Pagination =====
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      (o?.user?.name || o?.user?.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(o?._id || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || String(o?.status || "").toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const paginatedOrders = filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Orders Management
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Search orders"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => {
              setPage(0);
              setSearchTerm(e.target.value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FaSearch />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Select
            fullWidth
            value={filterStatus}
            onChange={(e) => {
              setPage(0);
              setFilterStatus(e.target.value);
            }}
            variant="outlined"
          >
            <MenuItem value="all">All Statuses</MenuItem>
            {API_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {toUi(s)}
              </MenuItem>
            ))}
          </Select>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer Name</TableCell>
              <TableCell>Order Date</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOrders.map((o) => {
              const created = o?.createdAt ? new Date(o.createdAt) : null;
              const name = o?.user?.name || o?.user?.fullName || "—";
              return (
                <TableRow
                  key={o._id}
                  hover
                  onClick={() => {
                    setSelectedOrder(o);
                    setPendingStatusUI(toUi(o?.status));
                    setOpenModal(true);
                  }}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>{o._id}</TableCell>
                  <TableCell>{name}</TableCell>
                  <TableCell>{created ? format(created, "MMM dd, yyyy") : "—"}</TableCell>
                  <TableCell>{currency(orderTotal(o))}</TableCell>
                  <TableCell>
                    <Chip label={toUi(o?.status)} color={getStatusColor(o?.status)} size="small" />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(o);
                        setPendingStatusUI(toUi(o?.status));
                        setOpenModal(true);
                      }}
                    >
                      <FaEdit />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={filteredOrders.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Order Details */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Stack spacing={2}>
              <Typography variant="h6">Customer Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography>
                    <strong>Name:</strong> {selectedOrder?.user?.name || selectedOrder?.user?.fullName || "—"}
                  </Typography>
                  <Typography>
                    <strong>Email:</strong> {selectedOrder?.user?.email || "—"}
                  </Typography>
                  <Typography>
                    <strong>Phone:</strong> {selectedOrder?.user?.phone || "—"}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography>
                    <strong>Shipping Address:</strong>
                  </Typography>
                  <Typography>{shippingInline(selectedOrder?.shippingAddress || selectedOrder?.address)}</Typography>
                </Grid>
              </Grid>

              <Typography variant="h6">Order Items</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedOrder.items || []).map((it, idx) => {
                      const p = it?.product || {};
                      const title = p.prodName || p.title || p.name || `Item ${idx + 1}`;
                      const price = Number(p.prodPrice ?? p.price ?? it?.price ?? 0);
                      const qty = Number(it?.qty ?? it?.quantity ?? 1);
                      const img = p.prodImage ? `http://localhost:5002/uploads/${p.prodImage}` : null;
                      return (
                        <TableRow key={idx}>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              {img && (
                                <img
                                  src={img}
                                  alt="prod"
                                  width="40"
                                  style={{ borderRadius: 6, display: "block" }}
                                />
                              )}
                              <span>{title}</span>
                            </Stack>
                          </TableCell>
                          <TableCell>{qty}</TableCell>
                          <TableCell>{currency(price)}</TableCell>
                          <TableCell>{currency(price * qty)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box mt={2}>
                <Select
                  value={pendingStatusUI}
                  onChange={(e) => setPendingStatusUI(e.target.value)}
                  fullWidth
                >
                  {API_STATUSES.map((s) => (
                    <MenuItem key={s} value={toUi(s)}>
                      {toUi(s)}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Close</Button>
          <Button
            onClick={() => {
              // حفظ الحالة من الديالوج مباشرة
              if (selectedOrder) handleStatusChange(selectedOrder._id, pendingStatusUI);
            }}
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm */}
      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to change the order status?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>Cancel</Button>
          <Button onClick={confirmStatusChange} color="primary" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrdersManagement;
