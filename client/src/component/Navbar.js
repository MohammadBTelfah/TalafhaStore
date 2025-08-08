import React, { useState, useEffect } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Badge,
  Switch,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar as MUIAvatar,
  Divider,
  Snackbar,
  Alert
} from "@mui/material";
import { styled } from "@mui/system";
import {
  FiMenu,
  FiShoppingCart,
  FiMoon,
  FiSun,
  FiHome,
  FiPackage,
  FiInfo,
  FiPhone,
  FiMinus,
  FiPlus,
  FiTrash2
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const StyledAppBar = styled(AppBar)(() => ({
  background: "#ffffff",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
}));

export default function Navbar({ darkMode, toggleDarkMode }) {
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [snackbarKey, setSnackbarKey] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const QuantityButton = styled(IconButton)(() => ({
  border: "1px solid #e0e0e0",
  borderRadius: "4px",
  padding: "4px"
}));


  const pages = [
    { name: "Home", path: "/", icon: <FiHome /> },
    { name: "Products", path: "/products", icon: <FiPackage /> },
    { name: "About Us", path: "/about", icon: <FiInfo /> },
    { name: "Contact Us", path: "/contact", icon: <FiPhone /> },
  ];

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
    window.location.reload();
  };

  const fetchCartCount = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5002/api/cart/get-cart", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const items = res.data?.items || [];
      setCartItems(items);
      const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalCount);
    } catch (err) {
      console.error("Error fetching cart count:", err);
      setCartItems([]);
      setCartCount(0);
    }
  };

  const handleQuantityChange = async (productId, change) => {
    try {
      await axios.post("http://127.0.0.1:5002/api/cart/add-to-cart", {
        productId,
        quantity: change,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchCartCount();
      if (window.updateCartCount) window.updateCartCount();
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  const handleDeleteClick = async (item) => {
    try {
      await axios.delete("http://127.0.0.1:5002/api/cart/remove-from-cart", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        data: { productId: item.product._id },
      });
      fetchCartCount();
      if (window.updateCartCount) window.updateCartCount();
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  const calculateTotal = () => {
  return cartItems.reduce((total, item) => total + item.product.prodPrice * item.quantity, 0);
};

  const PlaceOrder = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:5002/api/orders/place-order", {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("Order placed successfully:", response.data);
      setCartItems([]);
      setCartCount(0);
      if (window.updateCartCount) window.updateCartCount();

      setSuccessOpen(false);
      setSnackbarKey(prev => prev + 1);
      setSuccessOpen(true);
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Something went wrong while placing the order. Please try again.");
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:5002/api/users/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUser(res.data);
        fetchCartCount();
      } catch (err) {
        console.error("Error fetching user profile", err);
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    window.updateCartCount = fetchCartCount;
  }, [cartCount]);

  return (
    <>
      <StyledAppBar position="static">
        <Container maxWidth="xl">
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                variant="h6"
                noWrap
                sx={{ color: "#1976d2", fontWeight: 700, cursor: "pointer" }}
                onClick={() => navigate("/")}
              >
                Talafha
              </Typography>
            </Box>

            {!isMobile && (
              <Box sx={{ display: "flex", gap: 2 }}>
                {pages.map((page) => {
                  const isActive = location.pathname === page.path;
                  return (
                    <Button
                      key={page.name}
                      onClick={() => navigate(page.path)}
                      sx={{
                        color: isActive ? "#1976d2" : "#000000",
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        borderBottom: isActive ? "2px solid #1976d2" : "none",
                        borderRadius: 0,
                        "&:hover": {
                          backgroundColor: "rgba(0,0,0,0.04)",
                        },
                      }}
                    >
                      <Box component="span">{page.icon}</Box>
                      {page.name}
                    </Button>
                  );
                })}
              </Box>
            )}

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Switch
                checked={darkMode}
                onChange={toggleDarkMode}
                icon={<FiSun />}
                checkedIcon={<FiMoon />}
              />

              <IconButton onClick={() => setCartOpen(true)}>
                <Badge badgeContent={cartCount} color="primary">
                  <FiShoppingCart />
                </Badge>
              </IconButton>

              <Tooltip title="Account">
                <IconButton onClick={handleOpenUserMenu}>
                  <Avatar
                    alt={user?.fullName || "Guest"}
                    src={
  user?.profileImage
    ? `http://127.0.0.1:5002/uploads/${user.profileImage.replace(/\\/g, "/")}`
    : ""
}

                  />
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorElUser}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {!user ? (
                  <>
                    <MenuItem onClick={() => { handleCloseUserMenu(); setTimeout(() => navigate("/login"), 50); }}>
                      <Typography textAlign="center">Login</Typography>
                    </MenuItem>
                    <MenuItem onClick={() => { handleCloseUserMenu(); setTimeout(() => navigate("/register"), 50); }}>
                      <Typography textAlign="center">Register</Typography>
                    </MenuItem>
                  </>
                ) : (
                  <>
                    <MenuItem disabled>
                      <Typography textAlign="center">{user.fullName}</Typography>
                    </MenuItem>
                    <MenuItem onClick={() => { navigate("/profile"); handleCloseUserMenu(); }}>
                      <Typography textAlign="center">My Profile</Typography>
                    </MenuItem>
                    <MenuItem onClick={() => { navigate("/order-history"); handleCloseUserMenu(); }}>
                      <Typography textAlign="center">Order History</Typography>
                    </MenuItem>
                    <MenuItem onClick={() => { handleLogout(); handleCloseUserMenu(); }}>
                      <Typography textAlign="center" color="error">Sign Out</Typography>
                    </MenuItem>
                  </>
                )}
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </StyledAppBar>

      {/* ✅ Drawer for Cart */}
      <Drawer anchor="right" open={cartOpen} onClose={() => setCartOpen(false)}>
        <Box sx={{ width: 350, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Your Cart</Typography>
          <Divider />

          {cartItems.length === 0 ? (
            <Typography sx={{ mt: 2 }}>Cart is empty</Typography>
          ) : (
            <>
              <List>
                {cartItems.map((item, index) => (
                  <ListItem key={item.product._id} alignItems="flex-start" sx={{ py: 1 }}>
                    <ListItemAvatar>
                      <MUIAvatar
                        src={`http://127.0.0.1:5002/${item.product.prodImage}`}
                        variant="square"
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography fontWeight="bold">{item.product.prodName}</Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2">JD {item.product.prodPrice}</Typography>
                          <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                            <QuantityButton
                              onClick={() => handleQuantityChange(item.product._id, -1)}
                              disabled={item.quantity <= 1}
                            >
                              <FiMinus />
                            </QuantityButton>
                            <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                            <QuantityButton onClick={() => handleQuantityChange(item.product._id, 1)}>
                              <FiPlus />
                            </QuantityButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteClick(item)}
                              sx={{ ml: 1 }}
                            >
                              <FiTrash2 />
                            </IconButton>
                          </Box>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ mt: 2, mb: 1 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography>Total:</Typography>
                <Typography fontWeight="bold">JD {calculateTotal().toFixed(2)}</Typography>
              </Box>

              <Button
                variant="contained"
                fullWidth
                color="primary"
                onClick={PlaceOrder}
              >
                Proceed to Checkout
              </Button>
            </>
          )}
        </Box>

        <Snackbar
          key={snackbarKey}
          open={successOpen}
          autoHideDuration={4000}
          onClose={() => setSuccessOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSuccessOpen(false)}
            severity="success"
            variant="filled"
            sx={{ width: '100%' }}
          >
            ✅ Order placed successfully!
          </Alert>
        </Snackbar>
      </Drawer>
    </>
  );
}
