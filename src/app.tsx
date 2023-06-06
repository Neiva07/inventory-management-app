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
  let location = useLocation();

  console.log(location);
  return (
    <>
      <h1>
        <Navbar />
        Connection status: <strong id="status"></strong>
      </h1>
      {location.pathname}
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
