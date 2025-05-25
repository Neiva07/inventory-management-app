import {
  AppBar,
  Button,
  Container,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import { useAuth } from "context/auth";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuIcon from '@mui/icons-material/Menu';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CategoryIcon from '@mui/icons-material/Category';
import ScaleIcon from '@mui/icons-material/Scale';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import logo from '../../../assets/icons/logo.png';

export const Navbar = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleMobileMenuClose();
  };

  const handleSignout = () => {
    auth.logout();
    navigate("login");
  };

  const menuItems = [
    { text: 'Produtos', path: 'products', icon: <InventoryIcon /> },
    { text: 'Fornecedores', path: 'suppliers', icon: <PeopleIcon /> },
    { text: 'Vendas', path: 'orders', icon: <ShoppingCartIcon /> },
    { text: 'Clientes', path: 'customers', icon: <PeopleIcon /> },
    { text: 'Categoria de Produtos', path: 'productCategories', icon: <CategoryIcon /> },
    { text: 'Unidades', path: 'units', icon: <ScaleIcon /> },
  ];

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        backgroundColor: 'primary.main',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Container maxWidth="xl">
        {auth.user ? (
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <img src={logo} alt="Logo" style={{ height: 36, marginRight: 10 }} />
              <Typography
                variant="h5"
                component="div"
                onClick={() => navigate("/")}
                sx={{
                  mr: 4,
                  display: { xs: 'none', md: 'flex' },
                  color: 'inherit',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              >
                Stockify
              </Typography>

              {/* Desktop Menu */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                {menuItems.map((item) => (
                  <Button
                    key={item.text}
                    onClick={() => handleNavigation(item.path)}
                    startIcon={item.icon}
                    sx={{
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>
            </Box>

            {/* Mobile Menu Button */}
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMobileMenuOpen}
              sx={{ display: { xs: 'flex', md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            {/* Logout Button */}
            <Button
              onClick={handleSignout}
              startIcon={<LogoutIcon />}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Deslogar
            </Button>

            {/* Mobile Menu */}
            <Menu
              anchorEl={mobileMenuAnchor}
              open={Boolean(mobileMenuAnchor)}
              onClose={handleMobileMenuClose}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 200,
                },
              }}
            >
              {menuItems.map((item) => (
                <MenuItem
                  key={item.text}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    py: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(26, 35, 126, 0.08)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {item.icon}
                    {item.text}
                  </Box>
                </MenuItem>
              ))}
            </Menu>
          </Toolbar>
        ) : (
          <Toolbar>
            <img src={logo} alt="Logo" style={{ height: 36, marginRight: 10 }} />
            <Typography
              variant="h5"
              component="div"
              onClick={() => navigate("/")}
              sx={{
                flexGrow: 1,
                color: 'inherit',
                textDecoration: 'none',
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8,
                },
              }}
            >
              Stockify
            </Typography>
            <Button
              onClick={() => navigate("login")}
              startIcon={<LoginIcon />}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Logar
            </Button>
          </Toolbar>
        )}
      </Container>
    </AppBar>
  );
};
