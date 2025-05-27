import * as ReactDOM from "react-dom";
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

declare module '@mui/material/styles' {
  interface Components {
    MuiDataGrid?: {
      styleOverrides?: {
        root?: {
          fontFamily?: string;
          '& .MuiDataGrid-cell'?: {
            fontWeight?: number;
          };
          '& .MuiDataGrid-columnHeader'?: {
            fontWeight?: number;
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
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '0em',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '0.00735em',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '0em',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '0.0075em',
    },
    subtitle1: {
      fontWeight: 500,
      letterSpacing: '0.00938em',
    },
    subtitle2: {
      fontWeight: 500,
      letterSpacing: '0.00714em',
    },
    body1: {
      fontWeight: 400,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontWeight: 400,
      letterSpacing: '0.01071em',
    },
    button: {
      fontWeight: 500,
      letterSpacing: '0.02857em',
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          '& .MuiDataGrid-cell': {
            fontWeight: 400,
          },
          '& .MuiDataGrid-columnHeader': {
            fontWeight: 600,
          },
        },
      },
    },
  },
});

const App = () => {
  const { layout } = useUI();
  return (
    <>
      <Box style={{
        marginTop: "60px"
      }}>
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
        {layout === 'navbar' ? <Navbar /> : <Sidebar />}
        <Outlet />
      </Box>
    </>
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
  ReactDOM.render(
    <>
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
    </>,
    document.body
  );
}

render();
