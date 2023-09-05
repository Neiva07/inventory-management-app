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

const App = () => {
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
        <Navbar />
        <Outlet />

      </Box>
    </>
  );
};



function PrivateRoute() {
  const auth = useAuth();
  if (!auth.user) {
    return <Navigate to="/" />
  }
  console.log('hereuhreru', auth)

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
          <Route path="products/:productID" element={<PrivateRoute />}>
            <Route element={<ProductForm />} />
          </Route>
          <Route element={<PrivateRoute />}>

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

            <Route path="*" element={<p>There's nothing here: 404!</p>} />
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
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <AppRouter />
          </LocalizationProvider>
        </AuthContextProvider>
      </React.StrictMode>
    </>,

    document.body
  );
}

render();
