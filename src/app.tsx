import * as ReactDOM from "react-dom";
import {
  Outlet,
  RouterProvider,
  createHashRouter,
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
import { CustomersList } from "./pages/customer/customersList";
import { ToastContainer } from "react-toastify";

const App = () => {
  return (
    <>
      <Navbar />
      <Box style={{
        marginTop: "60px"
      }}>
        <Outlet />
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
        />      </Box>
    </>
  );
};

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "products/create",
        element: <ProductForm />,
      },
      {
        path: "products/:productID",
        element: <ProductForm />,
      },
      {
        path: "suppliers/create",
        element: <SupplierForm />,
      },
      {
        path: "suppliers/:supplierID",
        element: <SupplierForm />,
      },
      {
        path: "customers/create",
        element: <CustomerForm />,
      },
      {
        path: "customers/:customerID",
        element: <CustomerForm />,
      },
      {
        path: "productCategories",
        element: <ProductCategories />,
      },
      {
        path: "units",
        element: <Units />,
      },
      {
        path: "products",
        element: <ProductList />,
      },
      {
        path: "suppliers",
        element: <SupplierList />,
      },
      {
        path: "customers",
        element: <CustomersList />,
      }
    ],
  },
]);

function render() {
  ReactDOM.render(
    <>
      <React.StrictMode>
        <RouterProvider router={router} />
      </React.StrictMode>
    </>,

    document.body
  );
}

render();
