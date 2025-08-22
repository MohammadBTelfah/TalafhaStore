// src/component/Navbar.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  AppBar, Box, Toolbar, IconButton, Typography, Menu, Avatar,
  Button, Tooltip, MenuItem, Badge, useMediaQuery, useTheme,
  Drawer, List, ListItem, ListItemText, ListItemAvatar,
  Avatar as MUIAvatar, Divider, Snackbar, Alert
} from "@mui/material";
import { styled } from "@mui/system";
import {
  FiMenu, FiShoppingCart, FiMoon, FiSun, FiHome, FiPackage,
  FiInfo, FiPhone, FiMinus, FiPlus, FiTrash2
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const GRAD = "linear-gradient(135deg, #71b7e6, #9b59b6)";

/* شعار متدرّج */
const Brand = styled(Typography)({
  fontWeight: 900,
  cursor: "pointer",
  background: GRAD,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  letterSpacing: ".3px",
  userSelect: "none",
});

/* زر رابط مع underline متدرّج */
const NavBtn = styled(Button)({
  position: "relative",
  fontWeight: 700,
  textTransform: "none",
  paddingInline: 12,
  "&::after": {
    content: '""',
    position: "absolute",
    left: 10, right: 10, bottom: 6, height: 2, borderRadius: 2,
    backgroundImage: GRAD,
    transform: "scaleX(0)",
    transformOrigin: "left",
    transition: "transform .35s ease",
  },
  "&:hover::after": { transform: "scaleX(1)" },
  "&.active::after": { transform: "scaleX(1)" },
});

/* زر كميات في السلة */
const QuantityButton = styled(IconButton)({
  border: "1px solid #e0e0e0",
  borderRadius: 6,
  padding: 4
});

// ----- helpers -----
const cleanToken = (raw) => {
  if (!raw) return "";
  return raw.startsWith("Bearer ") ? raw.slice(7) : raw;
};

export default function Navbar({ darkMode, toggleDarkMode }) {
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(() => cleanToken(localStorage.getItem("token")));
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [snackbarKey, setSnackbarKey] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const pages = useMemo(() => ([
    { name: "Home",      path: "/",         icon: <FiHome /> },
    { name: "About Us",  path: "/about",    icon: <FiInfo /> },
    { name: "Products",  path: "/products", icon: <FiPackage /> },
    { name: "Contact Us",path: "/contact",  icon: <FiPhone /> },
  ]), []);

  // ألوان وخلفيات
  const isDark = !!darkMode;
  const appbarBg     = isDark ? "rgba(13,16,32,0.80)" : "rgba(255,255,255,0.75)";
  const appbarBorder = isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.10)";
  const textColor    = isDark ? "#ffffff" : "#0e1020";
  const iconBg       = isDark ? "rgba(255,255,255,.10)" : "rgba(0,0,0,.06)";
  const iconBorder   = isDark ? "rgba(255,255,255,.25)" : "rgba(0,0,0,.12)";

  const openUserMenu  = (e) => setAnchorElUser(e.currentTarget);
  const closeUserMenu = () => setAnchorElUser(null);

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const resetAuthState = () => {
    setUser(null);
    setCartItems([]);
    setCartCount(0);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken("");
    resetAuthState();
    navigate("/");
  };

  const fetchCart = async () => {
  if (!token) { setCartItems([]); setCartCount(0); return; }
  try {
    const res = await axios.get("http://127.0.0.1:5002/api/cart/get-cart", { headers: authHeader });
    const data = res.data || {};
    const items = Array.isArray(data.items)
      ? data.items
      : (Array.isArray(data?.cart?.items) ? data.cart.items : []);
    setCartItems(items);
    setCartCount(items.reduce((s, it) => s + Number(it.quantity || 0), 0));
  } catch {
    setCartItems([]); setCartCount(0);
  }
};

 const changeQty = async (productId, change) => {
  if (!token) return;

  // الكمية الحالية من الـ state
  const current = cartItems.find(it => it.product._id === productId)?.quantity || 0;
  const nextQty = current + change;

  try {
    if (change > 0) {
      // زيادة 1
      await axios.post(
        "http://127.0.0.1:5002/api/cart/add-to-cart",
        { productId, quantity: 1 },
        { headers: authHeader }
      );

      // تحديث محلي فوري
      setCartItems(prev =>
        prev.map(it =>
          it.product._id === productId ? { ...it, quantity: it.quantity + 1 } : it
        )
      );
      setCartCount(c => c + 1);

    } else {
      // تنقيص
      if (nextQty <= 0) {
        // احذف العنصر نهائياً
        await axios.delete("http://127.0.0.1:5002/api/cart/remove-from-cart", {
          headers: authHeader,
          data: { productId },
        });

        // تحديث محلي
        setCartItems(prev => prev.filter(it => it.product._id !== productId));
        setCartCount(c => Math.max(0, c - current)); // نقصنا كل الكمية
      } else {
        // ما في endpoint لتعديل مباشر → نحذف ثم نضيف بالكمية الجديدة
        await axios.delete("http://127.0.0.1:5002/api/cart/remove-from-cart", {
          headers: authHeader,
          data: { productId },
        });

        await axios.post(
          "http://127.0.0.1:5002/api/cart/add-to-cart",
          { productId, quantity: nextQty },
          { headers: authHeader }
        );

        // تحديث محلي
        setCartItems(prev =>
          prev.map(it =>
            it.product._id === productId ? { ...it, quantity: nextQty } : it
          )
        );
setCartCount(c => c + change);
      }
    }
  } catch (e) {
    console.error(e?.response?.data || e);
    // fallback للتزامن مع السيرفر إذا صار أي تعارض
    fetchCart();
  }
};



  const removeItem = async (item) => {
  if (!token) return;
  try {
    await axios.delete("http://127.0.0.1:5002/api/cart/remove-from-cart", {
      headers: authHeader,
      data: { productId: item.product._id },
    });

    setCartItems(prev => prev.filter(it => it.product._id !== item.product._id));
    setCartCount(c => Math.max(0, c - Number(item.quantity || 0)));
  } catch (e) {
    console.error(e?.response?.data || e);
    fetchCart();
  }
};
// احسب الإجمالي
const total = useMemo(() => {
  if (!Array.isArray(cartItems)) return 0;
  return cartItems.reduce((sum, it) => {
    const price = Number(it?.product?.prodPrice || 0);
    const qty   = Number(it?.quantity || 0);
    return sum + price * qty;
  }, 0);
}, [cartItems]);
useEffect(() => {
  const onCartDelta = (e) => {
    const delta = Number(e?.detail?.delta || 0);
    if (!delta) return;
    // حدّث العداد فوراً
    setCartCount((c) => Math.max(0, c + delta));
    // وإذا السلة مفتوحة، رجّع آخر حالة من السيرفر
    if (cartOpen) fetchCart();
  };
  window.addEventListener("cart:delta", onCartDelta);
  return () => window.removeEventListener("cart:delta", onCartDelta);
}, [cartOpen]);


  const placeOrder = async () => {
    if (!token) return;
    try {
      await axios.post("http://127.0.0.1:5002/api/orders/place-order", {}, {
        headers: authHeader,
      });
      setCartItems([]); setCartCount(0);
      setSnackbarKey(k => k + 1); setSuccessOpen(true);
    } catch {
      alert("Something went wrong while placing the order. Please try again.");
    }
  };

  // (1) اسحب البروفايل كل ما تغيّر التوكن
  useEffect(() => {
    const run = async () => {
      if (!token) { resetAuthState(); return; }
      try {
        const res = await axios.get("http://127.0.0.1:5002/api/users/profile", {
          headers: authHeader,
          // لو بتستخدم كوكيز:
          // withCredentials: true,
        });
        setUser(res.data);
        fetchCart();
      } catch {
        resetAuthState();
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // (2) التقط تغيّر التوكن عند التنقل داخل SPA (مثل /google-success ثم /)
  useEffect(() => {
    setToken(cleanToken(localStorage.getItem("token")));
  }, [location.key]);

  // (3) التقط تغيّر التوكن من تبويبات أخرى
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "token") setToken(cleanToken(e.newValue));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const initials = (user?.fullName || "Guest User")
    .split(" ").slice(0,2).map(s => s[0]?.toUpperCase()).join("");

  return (
    <>
      <AppBar
        elevation={0}
        color="transparent"
        position="sticky"
        sx={{
          top: 0,
          background: appbarBg,
          color: textColor,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow: "0 10px 30px rgba(0,0,0,.25)",
          borderBottom: `1px solid ${appbarBorder}`,
          transition: "background .25s ease, color .25s ease, border-color .25s ease",
          zIndex: 1200,
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Box
            sx={{
              maxWidth: 1120,
              mx: "auto",
              width: "100%",
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr", // يسار | وسط | يمين
              alignItems: "center",
              gap: 1,
              color: textColor,
            }}
          >
            {/* يسار: Brand + Burger */}
            <Box sx={{ display:"flex", alignItems:"center", gap:1, justifySelf:"start" }}>
              {isMobile && (
                <IconButton aria-label="menu" onClick={() => setNavOpen(true)} sx={{ color: textColor }}>
                  <FiMenu />
                </IconButton>
              )}
              <Brand variant="h6" onClick={() => navigate("/")}>Talafha</Brand>
            </Box>

            {/* وسط: روابط الديسكتوب */}
            {!isMobile && (
              <Box sx={{ display:"flex", gap:1.5, justifyContent:"center", justifySelf:"center" }}>
                {pages.map(p => {
                  const active = location.pathname === p.path;
                  return (
                    <NavBtn
                      key={p.name}
                      onClick={() => navigate(p.path)}
                      className={active ? "active" : undefined}
                      startIcon={p.icon}
                      sx={{
                        color: textColor,
                        "&:hover": { backgroundColor: isDark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.06)" },
                      }}
                    >
                      {p.name}
                    </NavBtn>
                  );
                })}
              </Box>
            )}

            {/* يمين: theme + cart + profile */}
            <Box sx={{ display:"flex", alignItems:"center", gap:1, justifySelf:"end" }}>
              <IconButton
                aria-label="toggle theme"
                onClick={toggleDarkMode}
                sx={{
                  color: textColor,
                  border: `1px solid ${iconBorder}`,
                  background: iconBg,
                  width: 40, height: 40, borderRadius: 8,
                  "&:hover": {
                    background: isDark ? "rgba(255,255,255,.18)" : "rgba(0,0,0,.08)"
                  }
                }}
              >
                {isDark ? <FiSun/> : <FiMoon/>}
              </IconButton>

<IconButton
  onClick={() => { fetchCart(); setCartOpen(true); }}
  sx={{ color: textColor }}
  aria-label="cart"
>
                <Badge badgeContent={cartCount} color="primary">
                  <FiShoppingCart />
                </Badge>
              </IconButton>

              <Tooltip title="Account">
                <IconButton onClick={openUserMenu} sx={{ p:0 }}>
                  <Avatar
                    alt={user?.fullName || "Guest"}
                    src={
                      user?.profileImage
                        ? `http://127.0.0.1:5002/uploads/${String(user.profileImage).replace(/\\/g,"/")}`
                        : undefined
                    }
                    sx={{
                      width: 36, height: 36,
                      bgcolor: isDark ? "rgba(255,255,255,.2)" : "rgba(0,0,0,.08)",
                      color: isDark ? "#fff" : "#0e1020",
                      fontWeight: 800
                    }}
                  >
                    {!user?.profileImage && initials}
                  </Avatar>
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorElUser}
                open={Boolean(anchorElUser)}
                onClose={closeUserMenu}
              >
                {!user ? (
                  <>
                    <MenuItem onClick={()=>{ closeUserMenu(); navigate("/login"); }}>
                      <Typography>Login</Typography>
                    </MenuItem>
                    <MenuItem onClick={()=>{ closeUserMenu(); navigate("/register"); }}>
                      <Typography>Register</Typography>
                    </MenuItem>
                  </>
                ) : (
                  <>
                    <MenuItem disabled><Typography>{user.fullName}</Typography></MenuItem>
                    <MenuItem onClick={()=>{ closeUserMenu(); navigate("/profile"); }}>
                      <Typography>My Profile</Typography>
                    </MenuItem>
                    <MenuItem onClick={()=>{ closeUserMenu(); navigate("/order-history"); }}>
                      <Typography>Order History</Typography>
                    </MenuItem>
                    <MenuItem onClick={()=>{ closeUserMenu(); logout(); }}>
                      <Typography color="error">Sign Out</Typography>
                    </MenuItem>
                  </>
                )}
              </Menu>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Nav Drawer */}
      <Drawer anchor="left" open={navOpen} onClose={()=>setNavOpen(false)}>
        <Box sx={{
          width:260, p:1.5,
          bgcolor: appbarBg, color: textColor, height:"100%",
          backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)"
        }}>
          <Typography sx={{ px:.5, pb:1, fontWeight:800 }}>Menu</Typography>
          <Divider sx={{ borderColor: appbarBorder, mb:1 }} />
          <List>
            {pages.map(p => {
              const active = location.pathname === p.path;
              return (
                <ListItem
                  key={p.path}
                  onClick={()=>{ setNavOpen(false); navigate(p.path); }}
                  sx={{
                    borderRadius: 1.5, mb:.5,
                    bgcolor: active ? (isDark ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.06)") : "transparent",
                    "&:hover": { bgcolor: isDark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.04)" }
                  }}
                  button
                >
                  <ListItemAvatar sx={{ minWidth:36 }}>
                    <MUIAvatar sx={{ width:26, height:26, bgcolor: iconBg, color: textColor }}>
                      {p.icon}
                    </MUIAvatar>
                  </ListItemAvatar>
                  <ListItemText primary={p.name} />
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>

      {/* Cart Drawer */}
      <Drawer anchor="right" open={cartOpen} onClose={() => setCartOpen(false)}>
        <Box sx={{
          width: 360, bgcolor: appbarBg, color: textColor, height:"100%",
          display:"flex", flexDirection:"column",
          backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)"
        }}>
          <Box sx={{ p:2, borderBottom:`1px solid ${appbarBorder}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <Typography variant="h6">Your Cart</Typography>
            <Badge badgeContent={cartCount} color="primary"><FiShoppingCart/></Badge>
          </Box>

          <Box sx={{ p:2, flex:1, overflow:"auto" }}>
            {cartItems.length === 0 ? (
              <Typography sx={{ mt: 2, opacity:.85 }}>Cart is empty</Typography>
            ) : (
              <>
                <List>
                  {cartItems.map((item) => (
                    <ListItem key={item.product._id} alignItems="flex-start" sx={{ py: 1 }}>
<ListItemAvatar sx={{ minWidth: 72 }}>
  <MUIAvatar
    variant="rounded"
    alt={item.product.prodName}
    src={`http://127.0.0.1:5002/uploads/${String(item.product.prodImage).replace(/\\/g,"/")}`}
    sx={{
      width: 64,
      height: 64,
      borderRadius: 2,
      bgcolor: "#0e101a",
      border: "1px solid rgba(255,255,255,.18)",
      boxShadow: "0 2px 10px rgba(0,0,0,.25)",
      overflow: "hidden",
      "& img": {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block"
      }
    }}
  />
</ListItemAvatar>
                      <ListItemText
  primary={<Typography fontWeight="bold">{item.product.prodName}</Typography>}
                        secondary={
    <Box component="div" sx={{ color: isDark ? "#cfd3e0" : "#333" }}>
      <Typography variant="body2">JD {item.product.prodPrice}</Typography>
                            <Box sx={{ display:"flex", alignItems:"center", mt:1 }}>
                              <QuantityButton onClick={()=>changeQty(item.product._id, -1)} disabled={item.quantity <= 1}><FiMinus/></QuantityButton>
                              <Typography sx={{ mx:1 }}>{item.quantity}</Typography>
                              <QuantityButton onClick={()=>changeQty(item.product._id, 1)}><FiPlus/></QuantityButton>
                              <IconButton color="error" onClick={()=>removeItem(item)} sx={{ ml:1 }}><FiTrash2 /></IconButton>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>

                <Divider sx={{ my:1, borderColor: appbarBorder }} />

                <Box sx={{ display:"flex", justifyContent:"space-between", mb:1 }}>
                  <Typography>Total:</Typography>
<Box sx={{ display:"flex", justifyContent:"space-between", mb:1 }}>
  <Typography>Total:</Typography>
  <Typography fontWeight="bold">JD {Number(total || 0).toFixed(2)}</Typography>
</Box>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={placeOrder}
                  sx={{
                    mt:.5,
                    backgroundImage: GRAD,
                    color: "#0e1020",
                    fontWeight: 800
                  }}
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
            <Alert onClose={() => setSuccessOpen(false)} severity="success" variant="filled" sx={{ width: '100%' }}>
              ✅ Order placed successfully!
            </Alert>
          </Snackbar>
        </Box>
      </Drawer>
    </>
  );
}
