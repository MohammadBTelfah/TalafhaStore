import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Container, Box, Grid, Card, CardContent, Typography, Chip, Stack, Avatar,
  Divider, Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
  Paper, CircularProgress, Alert, IconButton, Tooltip
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import RefreshIcon from "@mui/icons-material/Refresh";
import ShoppingCartOutlined from "@mui/icons-material/ShoppingCartOutlined";
import MonetizationOnOutlined from "@mui/icons-material/MonetizationOnOutlined";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";
import { LineChart } from "@mui/x-charts/LineChart";
import { PieChart } from "@mui/x-charts/PieChart";

// baseURL للـ API
axios.defaults.baseURL = "http://127.0.0.1:5002";

const API = {
  summary: "/api/admin/stats/summary",
  timeseries: "/api/admin/stats/sales-timeseries?range=30d",
  status: "/api/admin/stats/orders-by-status",
  top: (limit = 5) => `/api/admin/stats/top-products?limit=${limit}`,
  recent: (limit = 8) => `/api/admin/stats/recent-orders?limit=${limit}`,
};

export default function DashboardStats() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const token = localStorage.getItem("token") || "";
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [summary, setSummary] = useState(null);
  const [series, setSeries] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  const fetchAll = async () => {
    setErr(""); setLoading(true);
    try {
      const [sum, ts, st, top, recent] = await Promise.all([
        axios.get(API.summary, { headers }),
        axios.get(API.timeseries, { headers }),
        axios.get(API.status, { headers }),
        axios.get(API.top(5), { headers }),
        axios.get(API.recent(8), { headers }),
      ]);
      setSummary(sum.data);
      setSeries(Array.isArray(ts.data) ? ts.data : []);
      setStatusCounts(st.data || {});
      setTopProducts(Array.isArray(top.data) ? top.data : []);
      setRecentOrders(Array.isArray(recent.data) ? recent.data : []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); /* eslint-disable-line */ }, []);

  const xDates      = series.map(r => r.date);
  const ordersData  = series.map(r => Number(r.orders || 0));
  const revenueData = series.map(r => Number(r.revenue || 0));

  const pieData = useMemo(() => {
    const keys = ["pending","processing","shipped","completed","cancelled"];
    return keys
      .map((k, i) => ({ id: i, value: Number(statusCounts[k] || 0), label: k[0].toUpperCase()+k.slice(1) }))
      .filter(e => e.value > 0);
  }, [statusCounts]);

  const StatCard = ({ icon, title, primary, secondary, color }) => (
    <Card
      sx={{
        height: "100%",
        bgcolor: alpha(theme.palette[color || "primary"].main, isDark ? 0.12 : 0.08),
        border: `1px solid ${alpha(theme.palette[color || "primary"].main, 0.25)}`
      }}
    >
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
            <Typography variant="h5" fontWeight={800}>{primary}</Typography>
            {secondary != null && (
              <Typography variant="caption" color="text.secondary">{secondary}</Typography>
            )}
          </Stack>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette[color || "primary"].main, 0.25),
              color: theme.palette[color || "primary"].main
            }}
          >
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:"60vh" }}>
        <CircularProgress/>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <Box sx={{ width: "100%", maxWidth: 1280, px: { xs: 2, md: 3 }, py: 4, mx: "auto" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800}>Dashboard</Typography>
          <Tooltip title="Reload">
            <IconButton onClick={fetchAll}><RefreshIcon/></IconButton>
          </Tooltip>
        </Stack>

        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

        {/* الإحصائيات العلوية */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <StatCard
              icon={<PeopleAltOutlined/>}
              title="Users"
              primary={summary?.usersTotal ?? "—"}
              secondary={`+${summary?.usersNew7d ?? 0} last 7d`}
              color="info"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              icon={<ShoppingCartOutlined/>}
              title="Orders"
              primary={summary?.ordersTotal ?? "—"}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              icon={<MonetizationOnOutlined/>}
              title="Revenue (all time)"
              primary={(summary?.revenueTotal ?? 0).toLocaleString()}
              secondary={`7d: ${(summary?.revenue7d ?? 0).toLocaleString()}`}
              color="success"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              icon={<Inventory2Outlined/>}
              title="Products"
              primary={summary?.productsTotal ?? "—"}
              secondary={`${summary?.outOfStock ?? 0} out of stock`}
              color="warning"
            />
          </Grid>
        </Grid>

        {/* الرسوم والاحصائيات */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={8}>
            <Card sx={{ height: 360 }}>
              <CardContent sx={{ height: "100%" }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1, textAlign: "center" }}>
                  Sales - last 30 days
                </Typography>
                <LineChart
                  height={280}
                  series={[
                    { id: 'orders', data: ordersData, label: 'Orders' },
                    { id: 'revenue', data: revenueData, label: 'Revenue' },
                  ]}
                  xAxis={[{ data: xDates, scaleType: 'point' }]}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: 360 }}>
              <CardContent sx={{ height: "100%" }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1, textAlign: "center" }}>
                  Orders by status
                </Typography>
                {pieData.length ? (
                  <PieChart height={280} series={[{ data: pieData, innerRadius: 40, paddingAngle: 4 }]} />
                ) : (
                  <Stack alignItems="center" justifyContent="center" sx={{ height: 280 }}>
                    <Typography color="text.secondary">No data</Typography>
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Top products */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: 360 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1, textAlign: "center" }}>
                  Top products
                </Typography>
                <Stack spacing={1} divider={<Divider flexItem />}>
                  {topProducts.map((p) => (
                    <Stack key={p.productId} direction="row" alignItems="center" spacing={1} sx={{ py: 0.5 }}>
                      <Avatar
                        variant="rounded"
                        src={p.prodImage ? `http://localhost:5002/uploads/${p.prodImage}` : undefined}
                        sx={{ width: 44, height: 44, mr: 1.5 }}
                      />
                      <Typography sx={{ flex: 1 }} noWrap title={p.prodName}>
                        {p.prodName}
                      </Typography>
                      <Chip label={`Sold ${Number(p.soldQty ?? p.totalQty ?? 0)}`} size="small" />
                      <Chip label={`Stock ${Number(p.prodStock ?? 0)}`} size="small" color="warning" />
                      <Chip
                        label={`$${Number(p.revenue || 0).toLocaleString()}`}
                        size="small"
                        color="success"
                      />
                    </Stack>
                  ))}
                  {!topProducts.length && (
                    <Typography color="text.secondary">No data</Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent orders */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: 360 }}>
              <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1, textAlign: "center" }}>
                  Recent orders
                </Typography>
                <TableContainer component={Paper} sx={{ flex: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Order</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentOrders.map((o) => (
                        <TableRow key={o._id}>
                          <TableCell>{String(o._id).slice(-6)}</TableCell>
                          <TableCell>{o?.user?.name || o?.user?.fullName || "—"}</TableCell>
                          <TableCell>
                            <Chip
                              label={String(o.status).charAt(0).toUpperCase() + String(o.status).slice(1)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">${Number(o.total || 0).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      {!recentOrders.length && (
                        <TableRow>
                          <TableCell colSpan={4}>
                            <Typography color="text.secondary">No recent orders</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
