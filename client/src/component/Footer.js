import React from "react";
import { Box, Container, Grid, IconButton, Typography, Tooltip } from "@mui/material";
import { styled } from "@mui/system";
import { FaFacebook, FaInstagram, FaLinkedin, FaGithub } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

/* ====== Helpers to pass custom prop to styled ====== */
const forward = (p) => p !== "darkMode";

/* ====== Container ====== */
const FooterContainer = styled(Box, { shouldForwardProp: forward })(({ theme, darkMode }) => ({
  background: darkMode
    ? "#0B0D19" // Dark: أسود صافي
    : "linear-gradient(135deg, #71b7e6, #9b59b6)", // Light: التدرّج
  padding: theme.spacing(4, 0),
  color: "#fff",
  boxShadow: darkMode ? "none" : "0px -4px 10px rgba(0, 0, 0, 0.1)",
  borderTop: darkMode ? "1px solid rgba(255,255,255,.08)" : "none",
}));

/* ====== Social icon ====== */
const SocialIcon = styled(IconButton, { shouldForwardProp: forward })(({ theme, darkMode }) => ({
  color: "#fff",
  margin: theme.spacing(0, 1),
  width: 44,
  height: 44,
  borderRadius: "50%",
  border: darkMode ? "1px solid rgba(255,255,255,.25)" : "1px solid rgba(255,255,255,.35)",
  backgroundColor: darkMode ? "rgba(255,255,255,.08)" : "rgba(255,255,255,.15)",
  transition: "transform .25s ease, background-color .25s ease, box-shadow .25s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    backgroundColor: darkMode ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.22)",
    boxShadow: "0 6px 14px rgba(0,0,0,.25)",
  },
}));

/* ====== Nav link ====== */
const NavLink = styled(Typography, { shouldForwardProp: forward })(({ theme }) => ({
  cursor: "pointer",
  padding: theme.spacing(1, 2),
  color: "#fff",
  position: "relative",
  textDecoration: "none",
  userSelect: "none",
  "&:after": {
    content: '""',
    position: "absolute",
    width: 0,
    height: 2,
    bottom: 6,
    left: "50%",
    backgroundColor: "#fff",
    transition: "width .25s ease, left .25s ease",
    opacity: 0.9,
  },
  "&:hover:after": { width: "80%", left: "10%" },
}));

/* ====== Component ====== */
const Footer = ({ darkMode = false }) => {
  const socialLinks = [
    { icon: <FaFacebook size={20} />, label: "Facebook", url: "https://www.facebook.com/mohammed.telfah.35/" },
    { icon: <FaXTwitter size={20} />, label: "X", url: "https://x.com/m7mdte" },
    { icon: <FaInstagram size={20} />, label: "Instagram", url: "https://www.instagram.com/M0_TF/" },
    { icon: <FaLinkedin size={20} />, label: "LinkedIn", url: "https://www.linkedin.com/in/mohammed-telfah-3ba1a7261/" },
    { icon: <FaGithub size={20} />, label: "GitHub", url: "https://github.com/MohammadBTelfah" },
  ];

  // روابط أقسام نفس الصفحة (Scroll داخلي)
  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" }, // حسب طلبك aboutus
    { label: "Products", href: "/products" },
    { label: "Contact Us", href: "/contact" },
    { label: "Profile", href: "/profile" },
  ];

  // سكرول سلس عند الضغط على الروابط
  const handleSmoothScroll = (e, href) => {
    if (!href?.startsWith("#")) return; // لو رابط خارجي، خلّيه طبيعي
    e.preventDefault();
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      // لو بدك تغيّر الـ hash في URL بدون ما تقفّز الصفحة:
      window.history.pushState({}, "", href);
    }
  };

  return (
    <FooterContainer component="footer" darkMode={darkMode}>
      <Container maxWidth="lg">
        <Grid container spacing={4} direction="column" alignItems="center">
          {/* Social */}
          <Grid item>
            <Box display="flex" flexWrap="wrap" justifyContent="center" gap={1.5}>
              {socialLinks.map((s, i) => (
                <Tooltip key={i} title={s.label} placement="top">
                  <SocialIcon
                    darkMode={darkMode}
                    aria-label={s.label}
                    component="a"
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {s.icon}
                  </SocialIcon>
                </Tooltip>
              ))}
            </Box>
          </Grid>

          {/* Nav */}
          <Grid item>
            <Box
              display="flex"
              flexWrap="wrap"
              justifyContent="center"
              gap={1}
              sx={{ flexDirection: { xs: "column", sm: "row" }, alignItems: "center" }}
            >
              {navLinks.map((link, i) => (
                <NavLink
                  key={i}
                  variant="body1"
                  component="a"
                  href={link.href}
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  sx={{ textAlign: { xs: "center", sm: "left" } }}
                >
                  {link.label}
                </NavLink>
              ))}
            </Box>
          </Grid>

          {/* Copy */}
          <Grid item>
            <Typography variant="body2" align="center" sx={{ opacity: 0.9 }}>
              © {new Date().getFullYear()} Talafha. All rights reserved.
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </FooterContainer>
  );
};

export default Footer;
