import {
  AppBar,
  Button,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import { useAuth } from "context/auth";
import React from "react";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const handleClickProductCategories = () => {

    navigate("productCategories");
  }

  const handleClickUnits = () => {
    navigate("units");
  }


  const handleClickProductList = () => {
    navigate("products")
  }
  const handleClickSupplierList = () => {
    navigate("suppliers")
  }
  const handleClickCustomerList = () => {
    navigate("customers")
  }

  const handleSignout = () => {
    auth.signOut();
    navigate("login")
  }

  console.log(location)

  return (
    <AppBar position="fixed">
      <Container maxWidth="xl">
        {auth.user ?

          <Toolbar disableGutters>
            <Typography
              variant="h6"
              noWrap
              component="a"
              href=""
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              Stockify
            </Typography>
            <Button
              key={"products"}
              onClick={handleClickProductList}
              sx={{ my: 2, color: "white", display: "block" }}
            >
              Produtos
            </Button>

            <Button
              key={"suppliers"}
              onClick={handleClickSupplierList}
              sx={{ my: 2, color: "white", display: "block" }}
            >
              Fornecedores
            </Button>
            <Button
              key={"units"}
              onClick={() => navigate("orders")}
              sx={{ my: 2, color: "white", display: "block" }}
            >
              Vendas
            </Button>

            <Button
              key={"customers"}
              onClick={handleClickCustomerList}
              sx={{ my: 2, color: "white", display: "block" }}
            >
              Clientes
            </Button>
            <Button
              key={"productCategories"}
              onClick={handleClickProductCategories}
              sx={{ my: 2, color: "white", display: "block" }}
            >
              Categoria de Produtos
            </Button>
            <Button
              key={"units"}
              onClick={handleClickUnits}
              sx={{ my: 2, color: "white", display: "block" }}
            >
              Unidades
            </Button>
            <Button
              key={"signout"}
              onClick={handleSignout}
              style={{ right: 0, position: 'absolute' }}
              sx={{ my: 2, color: "white" }}
            >
              Deslogar
            </Button>

          </Toolbar>
          : (
            <Button
              key={"login"}
              onClick={() => navigate("login")}
              sx={{ my: 2, color: "white", display: "block" }}
            >
              Logar
            </Button>

          )

        }

      </Container>
    </AppBar>
  );
};
