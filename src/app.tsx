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
        path: "products",
        element: <ProductForm />,
        children: [
          {
            path: ":productID",
            element: <ProductForm />,
          }
        ]
      },
      {
        path: "suppliers",
        element: <SupplierForm />,
        children: [
          {
            path: ":supplierID",
            element: <SupplierForm />,
          }
        ]

      },
      {
        path: "customers",
        element: <CustomerForm />,
        children: [
          {
            path: ":customerID",
            element: <CustomerForm />,
          }
        ]
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
        path: "productList",
        element: <ProductList />,
      },
      {
        path: "supplierList",
        element: <SupplierList />,
      },
      {
        path: "customerList",
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
