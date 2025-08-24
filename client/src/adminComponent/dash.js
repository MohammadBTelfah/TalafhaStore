import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { createTheme } from '@mui/material/styles';
import CloudCircleIcon from '@mui/icons-material/CloudCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout, ThemeSwitcher } from '@toolpad/core/DashboardLayout';
import { DemoProvider, useDemoRouter } from '@toolpad/core/internal';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminProfile from './adminProfile';
import AllUsers from './adminusers';
import ProductDashboard from './ProductManagement';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { Category } from '../adminComponent/AddCategory';
import axios from 'axios';
import RedeemIcon from '@mui/icons-material/Redeem';
import CategoryIcon from '@mui/icons-material/Category';
import OrdersManagement from '../adminComponent/adminOrders';
import DashboardStats from './DashboardStats';

const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: { xs: 0, sm: 600, md: 600, lg: 1200, xl: 1536 },
  },
});

function DemoPageContent({ pathname, profileData }) {
  return (
    <Box
      sx={{
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      {pathname === "/dashboard" && (
        <Typography variant="h4" gutterBottom>
          <DashboardStats/>
        </Typography>
      )}

      {pathname ==="/Profile" && (
      <AdminProfile profileData={profileData} />
    )}

    
      {pathname === "/Product" && (
        <Typography variant="h4" gutterBottom>
          <ProductDashboard/>
        </Typography>
      )}
       {pathname === "/category" && (
        <Typography variant="h4" gutterBottom>
          <Category/>
        </Typography>
      )}
       {pathname === "/users" && (
        <Typography variant="h4" gutterBottom>
          <AllUsers/>
        </Typography>
      )}
    {pathname === "/orders" && (
        <Typography variant="h4" gutterBottom>
          <OrdersManagement/>
        </Typography>
      )}
    
    

    </Box>
  );
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

function ToolbarActionsSearch({ onLogout, role }) {
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Typography variant="body1" sx={{ fontWeight: 'bold', mr: 2 }}>
        {role === 'admin' ? '👋 Welcome Admin' : '👋 Welcome User'}
      </Typography>

      <TextField
        label="Search"
        variant="outlined"
        size="small"
        sx={{ display: { xs: 'none', md: 'inline-flex' }, mr: 1 }}
        InputProps={{
          endAdornment: (
            <IconButton type="button" aria-label="search" size="small">
              <SearchIcon />
            </IconButton>
          ),
        }}
      />

      <ThemeSwitcher />

      <Tooltip title="Logout">
        <IconButton color="error" onClick={onLogout}>
          <LogoutIcon />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

function SidebarFooter({ mini }) {
  return (
    <Typography
      variant="caption"
      sx={{ m: 1, whiteSpace: 'nowrap', overflow: 'hidden' }}
    >
      {mini ? '© MUI' : `© ${new Date().getFullYear()} Made with love by MUI`}
    </Typography>
  );
}

SidebarFooter.propTypes = {
  mini: PropTypes.bool.isRequired,
};

function CustomAppTitle() {
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <CloudCircleIcon fontSize="large" color="primary" />
<Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
  Talafha
</Typography>
<Chip size="small" label="LIVE" color="success" />
      <Tooltip title="Connected to production">
        <CheckCircleIcon color="success" fontSize="small" />
      </Tooltip>
    </Stack>
  );
}

function DashboardLayoutSlots(props) {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');      // 🔥 مهم جداً
  // localStorage.removeItem('darkMode');  // لو بدك تمسحها كمان
  navigate('/login');
};


  const NAVIGATION = [
    {
      kind: 'header',
      title: 'Main items',
    },
    {
      segment: 'dashboard',
      title: 'Dashboard',
      icon: <DashboardIcon />,
    },
    {
      segment: 'orders',
      title: 'Orders',
      icon: <ShoppingCartIcon />,
    },
    {
      segment: 'Profile',
      title: 'Profile',
      icon: <AccountBoxIcon />,
    },
    ...(isAdmin
      ? [
          {
            segment: 'Product',
            title: 'Product',
            icon: <RedeemIcon />,
          },
          {
            segment: 'category',
            title: 'Category',
            icon: <CategoryIcon />,
          },
          {
            segment:'users',
            title:'Users',
            icon: <AccountBoxIcon />,
          },
        ]
      : []),
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      async function fetchData() {
        try {
          const res = await axios.get("http://127.0.0.1:5002/api/users/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("Profile data:", res);
          setIsAdmin(res.data.role === 'admin');
          setProfileData(res.data);
        } catch (error) {
          console.error("Error fetching profile data:", error);
          navigate('/login');
        }
      }
      fetchData();
    } else {
      navigate('/login');
    }
  }, []);

  const { window } = props;
  const router = useDemoRouter('/dashboard');
  const demoWindow = window !== undefined ? window() : undefined;

  return (
    <DemoProvider window={demoWindow}>
      <AppProvider
        navigation={NAVIGATION}
        router={router}
        theme={demoTheme}
        window={demoWindow}
      >
        <DashboardLayout
          slots={{
            appTitle: CustomAppTitle,
            toolbarActions: () => (
              <ToolbarActionsSearch onLogout={handleLogout} role={profileData.role} />
            ),
            sidebarFooter: SidebarFooter,
          }}
        >
          <DemoPageContent profileData={profileData} pathname={router.pathname} />
        </DashboardLayout>
      </AppProvider>
    </DemoProvider>
  );
}

DashboardLayoutSlots.propTypes = {
  window: PropTypes.func,
};

export default DashboardLayoutSlots;
