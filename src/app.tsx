import * as ReactDOM from "react-dom/client";
import {
  Outlet,
  Route,
  Navigate,
  Routes,
  HashRouter as Router,
} from "react-router-dom";
import React from "react";
import { Navbar } from "./pages/routes/navbar";
import { ProductForm } from "./pages/product/productForm";
import { SupplierForm } from "./pages/supplier/supplierForm";
import { ProductCategories } from "./pages/productCategory/productCategory";
import { Units } from "./pages/unit/Unit";
import { Box } from "@mui/system";
import { ProductList } from "./pages/product/ProductList";
import { SupplierList } from "./pages/supplier/supplierList";
import { CustomerForm } from "./pages/customer/customerForm";
import { CustomerList } from "./pages/customer/customersList";
import { ToastContainer } from "react-toastify";
import { AuthContextProvider, useAuth } from "./context/auth";
import { Login } from "pages/auth/Login";
import { OrderForm } from "pages/order/OrderForm";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { OrderList } from "pages/order/OrderList";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Home } from "home";
import ptBRDateFns from 'date-fns/locale/pt-BR';
import { UpdateNotification } from './components/UpdateNotification';
import { Settings } from "pages/routes/settings";
import { UIContextProvider, useUI } from './context/ui';
import { Sidebar } from './pages/routes/Sidebar';
import { OfflineIndicator } from './components/OfflineIndicator';
import { InboundOrderForm } from "pages/inboundOrder/InboundOrderForm";
import { InboundOrderList } from "pages/inboundOrder/InboundOrderList";
import { SupplierBillList } from "pages/supplierBill/SupplierBillList";
import { SupplierBillDetail } from "pages/supplierBill/SupplierBillDetail";
import { InstallmentPaymentList } from "pages/installmentPayment/InstallmentPaymentList";
import { InstallmentPaymentDetail } from "pages/installmentPayment/InstallmentPaymentDetail";
import { useOverdueCheck } from "./lib/overdueCheck";

declare module '@mui/material/styles' {
  interface Components {
    MuiDataGrid?: {
      styleOverrides?: {
        root?: {
          fontFamily?: string;
          border?: string;
          height?: string;
          width?: string;
          '& .MuiDataGrid-cell'?: {
            fontWeight?: number;
            borderBottom?: string;
            padding?: string;
          };
          '& .MuiDataGrid-columnHeader'?: {
            fontWeight?: number;
            backgroundColor?: string;
            borderBottom?: string;
            padding?: string;
            justifyContent?: string;
            textAlign?: string;
          };
          '& .MuiDataGrid-row:hover'?: {
            backgroundColor?: string;
          };
          '& .MuiDataGrid-columnHeaders'?: {
            minHeight?: string;
          };
          '& .MuiDataGrid-virtualScroller'?: {
            overflowX?: string;
          };
          '& .MuiDataGrid-virtualScrollerContent'?: {
            minWidth?: string;
          };
          '& .MuiDataGrid-virtualScrollerRenderZone'?: {
            minWidth?: string;
          };
        };
      };
    };
  }
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#1A237E', // Deep Indigo
      light: '#534BAE',
      dark: '#000051',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00897B', // Teal
      light: '#4DB6AC',
      dark: '#005B4F',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
    },
    error: {
      main: '#EF4444',
      light: '#FCA5A5',
      dark: '#B91C1C',
    },
    warning: {
      main: '#F59E0B',
      light: '#FCD34D',
      dark: '#B45309',
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.01562em',
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.00833em',
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '0em',
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '0.00735em',
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '0em',
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '0.0075em',
      fontSize: '1rem',
    },
    subtitle1: {
      fontWeight: 500,
      letterSpacing: '0.00938em',
      fontSize: '1rem',
    },
    subtitle2: {
      fontWeight: 500,
      letterSpacing: '0.00714em',
      fontSize: '0.875rem',
    },
    body1: {
      fontWeight: 400,
      letterSpacing: '0.00938em',
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontWeight: 400,
      letterSpacing: '0.01071em',
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
    button: {
      fontWeight: 500,
      letterSpacing: '0.02857em',
      textTransform: 'none',
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          padding: '8px 16px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 0,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          border: 'none',
          width: '100%',
          '& .MuiDataGrid-cell': {
            fontWeight: 400,
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
            padding: '16px',
          },
          '& .MuiDataGrid-columnHeader': {
            fontWeight: 600,
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            padding: '16px',
            justifyContent: 'flex-start',
            textAlign: 'left',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
          },
          '& .MuiDataGrid-columnHeaders': {
            minHeight: '52px !important',
          },
          '& .MuiDataGrid-virtualScroller': {
            overflowX: 'hidden',
          },
          '& .MuiDataGrid-virtualScrollerContent': {
            minWidth: '100% !important',
          },
          '& .MuiDataGrid-virtualScrollerRenderZone': {
            minWidth: '100% !important',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(0, 0, 0, 0.2)',
              },
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
  },
});

const App = () => {
  const { layout } = useUI();
  const { checkOverdue } = useOverdueCheck();
  
  // Check for overdue installments when app loads
  React.useEffect(() => {
    checkOverdue();
  }, [checkOverdue]);
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <OfflineIndicator />
      {layout === 'navbar' ? <Navbar /> : <Sidebar />}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0.5,
          width: { sm: '100%' },
          ml: { sm: 0 },
          transition: 'margin 0.2s',
          mt: layout === 'navbar' ? '60px' : 0,
          maxWidth: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          icon
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        <UpdateNotification />
        <Outlet />
      </Box>
    </Box>
  );
};

function PrivateRoute() {
  const auth = useAuth();
  if (!auth.user) {
    return <Navigate to="/login" />
  }
  return <Outlet />
}

const AppRouter = () => {
  return <>
    <Router>
      <Routes>
        <Route
          path="/" element={<App />}
        >
          <Route path="login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Home />} />

            <Route path="products/:productID" element={<ProductForm />} />
            <Route path="orders/create" element={<OrderForm />} />
            <Route path="orders/:orderID" element={<OrderForm />} />
            <Route path="products/create" element={<ProductForm />} />

            <Route path="inbound-orders/:inboundOrderID" element={<InboundOrderForm />} />
            <Route path="inbound-orders/create" element={<InboundOrderForm />} />
            <Route path="inbound-orders" element={<InboundOrderList />} />

            <Route path="supplier-bills/:supplierBillID" element={<SupplierBillDetail />} />
            <Route path="supplier-bills" element={<SupplierBillList />} />

            <Route path="installment-payments/:installmentPaymentID" element={<InstallmentPaymentDetail />} />
            <Route path="installment-payments" element={<InstallmentPaymentList />} />

            <Route path="suppliers/:supplierID" element={<SupplierForm />} />
            <Route path="suppliers/create" element={<SupplierForm />} />

            <Route path="customers/:customerID" element={<CustomerForm />} />
            <Route path="customers/create" element={<CustomerForm />} />


            <Route path="productCategories" element={<ProductCategories />} />
            <Route path="units" element={<Units />} />

            <Route path="products" element={<ProductList />} />
            <Route path="suppliers" element={<SupplierList />} />
            <Route path="customers" element={<CustomerList />} />
            <Route path="orders" element={<OrderList />} />

            <Route path="settings" element={<Settings />} />

            <Route path="*" element={<p>Página não encontrada! 404!</p>} />
          </Route>
        </Route>
      </Routes>
    </Router>
  </>
}

function render() {
  // Create a root container if it doesn't exist
  let rootContainer = document.getElementById('root');
  if (!rootContainer) {
    rootContainer = document.createElement('div');
    rootContainer.id = 'root';
    document.body.appendChild(rootContainer);
  }

  const root = ReactDOM.createRoot(rootContainer);
  root.render(
    <React.StrictMode>
      <AuthContextProvider>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBRDateFns}>
            <UIContextProvider>
              <AppRouter />
            </UIContextProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </AuthContextProvider>
    </React.StrictMode>
  );
}

render();
