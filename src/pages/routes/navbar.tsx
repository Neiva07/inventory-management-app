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
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
    navigate("products");
  };

  const handleClickSuppliers = () => {

    setAnchorElNav(null);
    navigate("suppliers");
  }
  const handleClickProductCategories = () => {

    setAnchorElNav(null);
    navigate("productCategories");
  }

  const handleClickUnits = () => {

    setAnchorElNav(null);
    navigate("units");
  }


  const handleClickProductList = () => {
    setAnchorElNav(null);
    navigate("productList")
  }
  const handleClickSupplierList = () => {
    setAnchorElNav(null);
    navigate("supplierList")
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
            key={"product"}
            onClick={handleCloseNavMenu}
            sx={{ my: 2, color: "white", display: "block" }}
          >
            Produtos
          </Button>

          <Button
            key={"fornecedores"}
            onClick={handleClickSuppliers}
            sx={{ my: 2, color: "white", display: "block" }}
          >
            Fornecedores
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
            key={"productList"}
            onClick={handleClickProductList}
            sx={{ my: 2, color: "white", display: "block" }}
          >
            Lista de Produtos
          </Button>

          <Button
            key={"supplierList"}
            onClick={handleClickSupplierList}
            sx={{ my: 2, color: "white", display: "block" }}
          >
            Lista de Fornecedores
          </Button>



        </Toolbar>
      </Container>
    </AppBar>
  );
};
