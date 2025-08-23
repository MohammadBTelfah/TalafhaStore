import React, { useMemo, useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Route, Routes, Outlet, useLocation } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

import RegistrationForm from "./component/Register";
import LoginForm from "./component/Login";
import Success from "./EmailCompoent/GoogleSuccess";
import DashboardLayoutSlots from "./adminComponent/dash";
import ForgotPassword from "./EmailCompoent/ForgotPassword";
import ResetPassword from "./EmailCompoent/ResetPassword";
import VerifyEmail from "./EmailCompoent/VerifyEmail";
import Navbar from "./component/Navbar";
import Footer from "./component/Footer";
import ContactUs from "./component/contactus";
import AboutUs from "./component/aboutus";
import Home from "./component/Home";
import ProfilePage from "./component/ProfilePage";
import ProductsPage from "./component/proudcts";
function AppBackground({ darkMode }) {
  const location = useLocation();
  useEffect(() => {
    if (location.pathname.startsWith("/dashboard")) return;

    const lightGrad = "linear-gradient(135deg, #71b7e6, #9b59b6)";
    document.body.style.background = darkMode ? "#0e1020" : lightGrad;
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.backgroundSize = "160% 160%";
    document.body.style.transition = "background 250ms ease";
  }, [darkMode, location.pathname]);

  return null;
}

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : true;
  });
  const toggleDarkMode = () => setDarkMode((v) => !v);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: { main: "#71b7e6" },
          secondary: { main: "#9b59b6" },
          background: darkMode
            ? { default: "#0e1020", paper: "#121528" }
            : { default: "#f5f7fb", paper: "#ffffff" },
        },
        shape: { borderRadius: 12 },
        components: {
          MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
        },
        typography: {
          fontFamily:
            'system-ui,-apple-system,"Segoe UI",Roboto,Tahoma,Arial,"Noto Kufi Arabic","Cairo",sans-serif',
        },
      }),
    [darkMode]
  );

  const LayoutWithChrome = () => (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <Outlet />
      <Footer darkMode={darkMode} />
    </>
  );

  return (
    <GoogleOAuthProvider clientId="1084671829453-fa427391f1jfk5fmr07mv57eclobfhfc.apps.googleusercontent.com">
      <BrowserRouter>
        <AppBackground darkMode={darkMode} />

        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Routes>
            <Route element={<LayoutWithChrome />}>
              <Route path="/" element={<Home darkMode={darkMode} />} />
              <Route path="/about" element={<AboutUs darkMode={darkMode} />} />
              <Route path="/contact" element={<ContactUs darkMode={darkMode} />} />
              <Route path="/profile" element={<ProfilePage darkMode={darkMode} />} /> 
               <Route path="/products" element={<ProductsPage darkMode={darkMode} />} />
               {/* <Route path="/checkout" element={<Checkout darkMode={darkMode} />} /> */}




            </Route>

            <Route path="/register" element={<RegistrationForm />} />
            <Route path="/login" element={<LoginForm />} />

            <Route path="/dashboard" element={<DashboardLayoutSlots />} />

            <Route path="/oauth-success" element={<Success />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
