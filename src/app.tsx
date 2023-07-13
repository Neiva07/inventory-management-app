import * as ReactDOM from "react-dom";
import {
  Outlet,
  RouterProvider,
  createHashRouter,
} from "react-router-dom";
import React from "react";
import { Navbar } from "./pages/routes/navbar";
import { ProdutForm } from "./pages/product/productForm";
import { SupplierForm } from "./pages/supplier/supplierForm";
import { ProductCategories } from "./pages/productCategory/productCategory";
import { Units } from "./pages/unit/Unit";
import { Box } from "@mui/system";

const App = () => {
  return (
    <>
      <Navbar />
      <Box style={{
        marginTop: "60px"
      }}>
        <Outlet />
      </Box>
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
        element: <ProdutForm />,
      },
      {
        path: "suppliers",
        element: <SupplierForm />,
      },
      {
        path: "productCategories",
        element: <ProductCategories />,
      },
      {
        path: "units",
        element: <Units />,
      },
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
