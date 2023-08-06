import {
  AppBar,
  Box,
  Button,
  Container,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
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


  return (
    <AppBar position="fixed">
      <Container maxWidth="xl">
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
            LOGO
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


        </Toolbar>
      </Container>
    </AppBar>
  );
};
