import React from "react";
import { Box, Container, Grid, IconButton, Typography, Tooltip } from "@mui/material";
import { styled } from "@mui/system";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaGithub } from "react-icons/fa";

const FooterContainer = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #71b7e6, #9b59b6)",
  padding: theme.spacing(4, 0),
  color: "#fff",
  boxShadow: "0px -4px 10px rgba(0, 0, 0, 0.1)"
}));

const SocialIcon = styled(IconButton)(({ theme }) => ({
  color: "#fff",
  margin: theme.spacing(0, 1),
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "scale(1.1)",
    backgroundColor: "rgba(255, 255, 255, 0.1)"
  }
}));

const NavLink = styled(Typography)(({ theme }) => ({
  cursor: "pointer",
  padding: theme.spacing(1, 2),
  transition: "all 0.3s ease",
  position: "relative",
  color: "#fff",
  textDecoration: "none", // <-- هذا هو المهم
  "&:after": {
    content: '""',
    position: "absolute",
    width: 0,
    height: "2px",
    bottom: 0,
    left: "50%",
    backgroundColor: "#fff",
    transition: "all 0.3s ease"
  },
  "&:hover": {
    "&:after": {
      width: "80%",
      left: "10%"
    }
  }
}));


const Footer = () => {
  const socialLinks = [
    { icon: <FaFacebook size={24} />, label: "Facebook", url: "#" },
    { icon: <FaTwitter size={24} />, label: "Twitter", url: "#" },
    { icon: <FaInstagram size={24} />, label: "Instagram", url: "#" },
    { icon: <FaLinkedin size={24} />, label: "LinkedIn", url: "#" },
    { icon: <FaGithub size={24} />, label: "GitHub", url: "#" }
  ];

  const navLinks = ["Home", "About Us", "Products", "Contact Us", "Profile"];

  return (
    <FooterContainer component="footer">
      <Container maxWidth="lg">
        <Grid container spacing={4} direction="column" alignItems="center">
          <Grid item>
            <Box display="flex" flexWrap="wrap" justifyContent="center" gap={2}>
              {socialLinks.map((social, index) => (
                <Tooltip key={index} title={social.label} placement="top">
                  <SocialIcon
                    aria-label={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {social.icon}
                  </SocialIcon>
                </Tooltip>
              ))}
            </Box>
          </Grid>

          <Grid item>
            <Box
              display="flex"
              flexWrap="wrap"
              justifyContent="center"
              gap={2}
              sx={{
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "center"
              }}
            >
              {navLinks.map((link, index) => (
                <NavLink
                  key={index}
                  variant="body1"
                  component="a"
                  href="#"
                  sx={{
                    textAlign: { xs: "center", sm: "left" }
                  }}
                >
                  {link}
                </NavLink>
              ))}
            </Box>
          </Grid>

          <Grid item>
            <Typography variant="body2" align="center">
              © {new Date().getFullYear()} Your Company Name. All rights reserved.
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </FooterContainer>
  );
};

export default Footer;