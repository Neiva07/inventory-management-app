import * as ReactDOM from "react-dom";
import { Home } from "./home";
import {
  Outlet,
  RouterProvider,
  createHashRouter,
  useLocation,
} from "react-router-dom";
import React from "react";
import { Navbar } from "./pages/routes/navbar";
import { ProdutForm } from "./pages/product/productForm";

const App = () => {
  return (
    <>
      <h1>
        <Navbar />
      </h1>
      <Outlet />
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
