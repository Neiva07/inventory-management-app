import { Autocomplete, Box, Button, Grid, TextField } from "@mui/material";
import { calcItemTotalCost } from "model/orders";
import { getProducts, Product, ProductUnit, SellingOption } from "model/products";
import React, { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { ItemDataInterface, OrderFormDataInterface } from "./useOrderForm";

export const OrderFormLineItemForm = () => {

  const [products, setProducts] = useState<Array<Product>>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product>();


  const [quantity, setQuantity] = useState<number>();
  const [inventory, setInventory] = useState<number>(0);
  const [descount, setDescount] = useState<number>(0);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [productComission, setProductComission] = useState<number>(0);
  const [productUnit, setProductUnit] = useState<ProductUnit>();
  const [unitPrice, setUnitPrice] = useState<number>(0);

  const queryProducts = React.useCallback(() => {
    getProducts({
      pageSize: 10000,
      status: 'active'
    }).then(result => {
      setProducts(result[0].docs.map(qr => qr.data() as Product))
    })

  }, [])

  React.useEffect(() => {
    queryProducts();
  }, []);

  const handleSelectProduct = (_: React.SyntheticEvent<Element, Event>, value: Product) => {
    setSelectedProduct(value)

    if (!value) {
      setInventory(0);
      return;
    }
    setProductComission(value.sailsmanComission);
    setInventory(value.inventory);
  }

  const handleSelectSellingOption = (_: React.SyntheticEvent<Element, Event>, value: SellingOption) => {
    if (value) {
      setUnitCost(value.unitCost)
      setProductUnit(value.unit)

    }
  }

  const itemTotalCost = useMemo(() => {
    const totalCost = calcItemTotalCost({
      unitPrice,
      descount,
      quantity: quantity || 0,
    })
    return totalCost

  }, [quantity, descount, unitPrice])

  const formMethods = useFormContext<OrderFormDataInterface>();

  const submitItem = () => {

    const prevItems = formMethods.getValues("items")

    formMethods.setValue("items", [...prevItems, {
      quantity,
      cost: unitCost,
      descount,
      unit: productUnit,
      unitPrice,
      itemTotalCost,
      title: selectedProduct.title,
      productID: selectedProduct.id,
      commissionRate: productComission,
      balance: inventory - quantity,
    } as ItemDataInterface])

    const prevCommission = formMethods.getValues("totalComission")
    const prevTotalCost = formMethods.getValues("totalCost")

    formMethods.setValue("totalComission", prevCommission + (productComission * itemTotalCost) / 100)
    formMethods.setValue("totalCost", prevTotalCost + itemTotalCost)

  }

  const isFormCompleted = useMemo(() => itemTotalCost > 0, [itemTotalCost])

  return <Box>
    <Grid container spacing={1}>
      <Grid item xs={3}>
        <Autocomplete
          id="product-select"
          options={products}
          getOptionLabel={(option) => option.title}
          fullWidth
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              variant="outlined"
              label="Produto"
            />
          )}
          isOptionEqualToValue={(option, value) =>
            option.id === value.id
          }
          onChange={handleSelectProduct}
        />
      </Grid>
      <Grid item xs={3}>
        <TextField
          label="Invantário"
          fullWidth
          variant="outlined"
          disabled
          value={inventory}
        />

      </Grid>
      <Grid item xs={3}>
        <TextField
          label="Quantidade"
          fullWidth
          variant="outlined"
          onChange={(e) => setQuantity(Number(e.target.value))}
          value={quantity}
        />
      </Grid>

      <Grid item xs={3}>
        <Autocomplete
          id="unit-select"
          options={selectedProduct?.sellingOptions || []}
          getOptionLabel={(option) => option.unit.name}
          fullWidth
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              variant="outlined"
              label="Unidade"
            />
          )}
          isOptionEqualToValue={(option, value) =>
            option.unit.id === value.unit.id
          }
          disabled={!selectedProduct}
          onChange={handleSelectSellingOption}
        />
      </Grid>
      <Grid item xs={2}>
        <TextField
          label="Custo Unitário"
          fullWidth
          variant="outlined"
          disabled
          value={unitCost}
        />
      </Grid>

      <Grid item xs={2}>
        <TextField
          label="Preço"
          fullWidth
          variant="outlined"
          onChange={(e) => setUnitPrice(Number(e.target.value))}
          value={unitPrice}
        />
      </Grid>

      <Grid item xs={2}>
        <TextField
          label="Desconto (%)"
          fullWidth
          variant="outlined"
          onChange={(e) => setDescount(Number(e.target.value))}
          value={descount}
        />
      </Grid>

      <Grid item xs={2}>
        <TextField
          label="Comissão do Vendedor (%)"
          fullWidth
          variant="outlined"
          onChange={(e) => setInventory(Number(e.target.value))}
          value={productComission}
        />

      </Grid>
      <Grid item xs={2}>
        <TextField
          label="Total do produto"
          fullWidth
          variant="outlined"
          disabled
          value={itemTotalCost}
        />
      </Grid>
      <Grid item xs={2}>
        <Button onClick={submitItem} fullWidth style={{ height: "100%" }} variant="outlined" disabled={!isFormCompleted} > Adicionar Item </Button>


      </Grid>
    </Grid>
  </Box>
}
