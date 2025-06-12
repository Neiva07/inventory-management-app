import React, { useState } from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Collapse, IconButton, Divider, Toolbar, Box } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CategoryIcon from '@mui/icons-material/Category';
import ScaleIcon from '@mui/icons-material/Scale';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaidIcon from '@mui/icons-material/Paid';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HistoryIcon from '@mui/icons-material/History';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SettingsIcon from '@mui/icons-material/Settings';
import logo from '../../../assets/icons/logo.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

const drawerWidth = 270;

const cadastros = [
  { text: 'Produtos', icon: <InventoryIcon />, path: '/products' },
  { text: 'Clientes', icon: <PeopleIcon />, path: '/customers' },
  { text: 'Fornecedores', icon: <PeopleIcon />, path: '/suppliers' },
  { text: 'Funcionários', icon: <PeopleIcon />, path: '/employees' }, // Placeholder
  { text: 'Categoria de Produtos', icon: <CategoryIcon />, path: '/productCategories' },
  { text: 'Unidades', icon: <ScaleIcon />, path: '/units' },
];

const movimentos = [
  { text: 'Lista de Compras', icon: <AssignmentIcon />, path: '/purchase-list' }, // Placeholder
  { text: 'Compras de Mercadorias', icon: <ShoppingCartIcon />, path: '/purchases' }, // Placeholder
  { text: 'Requisição de Clientes', icon: <AssignmentIcon />, path: '/customer-requests' }, // Placeholder
  { text: 'Vendas de Mercadorias', icon: <ShoppingCartIcon />, path: '/orders' },
  { text: 'Emissão de Recibos', icon: <ReceiptIcon />, path: '/receipts' }, // Placeholder
  { text: 'Vales e Adiantamentos', icon: <PaidIcon />, path: '/advances' }, // Placeholder
  { text: 'Contas a Receber', icon: <AccountBalanceWalletIcon />, path: '/accounts-receivable' }, // Placeholder
  { text: 'Contas a Pagar', icon: <MoneyOffIcon />, path: '/accounts-payable' }, // Placeholder
  { text: 'Movimento Financeiro', icon: <SwapHorizIcon />, path: '/financial-movements' }, // Placeholder
  { text: 'Fluxo das Contas', icon: <AccountBalanceIcon />, path: '/account-flows' }, // Placeholder
  { text: 'Caixa Diário', icon: <CalendarTodayIcon />, path: '/daily-cash' }, // Placeholder
  { text: 'Caixa Retroativo', icon: <HistoryIcon />, path: '/retroactive-cash' }, // Placeholder
  { text: 'Fluxo de Caixa', icon: <TrendingUpIcon />, path: '/cash-flow' }, // Placeholder
];

export const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const [openCadastros, setOpenCadastros] = useState(true);
  const [openMovimentos, setOpenMovimentos] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? drawerWidth : 64,
        flexShrink: 0,
        position: 'fixed',
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : 64,
          boxSizing: 'border-box',
          transition: 'width 0.2s',
          overflowX: 'hidden',
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          borderRight: 0,
          position: 'fixed',
          height: '100vh',
        },
      }}
    >
      <Toolbar
        sx={{
          flexDirection: open ? 'row' : 'column',
          justifyContent: open ? 'space-between' : 'center',
          alignItems: 'center',
          px: 1,
          minHeight: 64,
          py: open ? 0 : 1.5,
          gap: open ? 0 : 1.5,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: open ? '100%' : 'auto',
            justifyContent: open ? 'flex-start' : 'center',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/')}
        >
          <img src={logo} alt="Logo" style={{ height: 36, marginRight: open ? 10 : 0, marginTop: open ? 0 : 24, marginBottom: open ? 0 : -18, transition: 'margin 0.2s' }} />
          {open && (
            <Box sx={{ fontWeight: 700, fontSize: 20, color: theme.palette.primary.contrastText, letterSpacing: 1 }}>
              Stockify
            </Box>
          )}
        </Box>
        <IconButton
          onClick={() => setOpen(!open)}
          sx={{
            color: theme.palette.primary.contrastText,
            ml: open ? 1 : 0,
            mt: open ? 0 : 1.5,
          }}
        >
          {open ? <MenuOpenIcon /> : <MenuIcon />}
        </IconButton>
      </Toolbar>
      <Divider sx={{ borderColor: theme.palette.primary.light, opacity: 0.2 }} />
      <List>
        <ListItemButton onClick={() => setOpenCadastros(!openCadastros)} sx={{ color: theme.palette.primary.contrastText }}>
          <ListItemText primary={open ? 'Cadastros' : ''} primaryTypographyProps={{ fontWeight: 700 }} />
          {open ? (openCadastros ? <ExpandLess /> : <ExpandMore />) : null}
        </ListItemButton>
        <Collapse in={openCadastros} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {cadastros.map((item) => (
              <ListItemButton
                key={item.text}
                sx={{
                  pl: open ? 4 : 2,
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.08)',
                  },
                  backgroundColor: isActive(item.path) ? theme.palette.primary.dark : 'inherit',
                }}
                selected={isActive(item.path)}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon sx={{ color: theme.palette.primary.contrastText, minWidth: 36 }}>{item.icon}</ListItemIcon>
                {open && <ListItemText primary={item.text} />}
              </ListItemButton>
            ))}
          </List>
        </Collapse>
        <Divider sx={{ my: 1, borderColor: theme.palette.primary.light, opacity: 0.2 }} />
        <ListItemButton onClick={() => setOpenMovimentos(!openMovimentos)} sx={{ color: theme.palette.primary.contrastText }}>
          <ListItemText primary={open ? 'Movimentos' : ''} primaryTypographyProps={{ fontWeight: 700 }} />
          {open ? (openMovimentos ? <ExpandLess /> : <ExpandMore />) : null}
        </ListItemButton>
        <Collapse in={openMovimentos} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {movimentos.map((item) => (
              <ListItemButton
                key={item.text}
                sx={{
                  pl: open ? 4 : 2,
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.08)',
                  },
                  backgroundColor: isActive(item.path) ? theme.palette.primary.dark : 'inherit',
                }}
                selected={isActive(item.path)}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon sx={{ color: theme.palette.primary.contrastText, minWidth: 36 }}>{item.icon}</ListItemIcon>
                {open && <ListItemText primary={item.text} />}
              </ListItemButton>
            ))}
          </List>
        </Collapse>
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <List sx={{ mb: 2 }}>
        <ListItemButton
          sx={{
            color: theme.palette.primary.contrastText,
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
            backgroundColor: isActive('/settings') ? theme.palette.primary.dark : 'inherit',
            pl: open ? 4 : 2,
          }}
          selected={isActive('/settings')}
          onClick={() => navigate('/settings')}
        >
          <ListItemIcon sx={{ color: theme.palette.primary.contrastText, minWidth: 36 }}>
            <SettingsIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Configurações" />}
        </ListItemButton>
      </List>
    </Drawer>
  );
}; 