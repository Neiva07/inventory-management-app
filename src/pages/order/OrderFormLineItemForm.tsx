import { Autocomplete, Box, Button, Grid, TextField } from "@mui/material";
import { useAuth } from "context/auth";
import { calcItemTotalCost } from "model/orders";
import { getProducts, Product, SellingOption } from "model/products";
import React, { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { ItemDataInterface, OrderFormDataInterface } from "./useOrderForm";
import { add, divide, multiply } from "lib/math";

export const OrderFormLineItemForm = () => {
  const { user } = useAuth();

  const [products, setProducts] = useState<Array<Product>>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product>(null);


  const [quantity, setQuantity] = useState<number>();
  const [inventory, setInventory] = useState<number>(0);
  const [descount, setDescount] = useState<number>(0);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [productComission, setProductComission] = useState<number>(0);
  const [sellingOption, setSellingOption] = useState<SellingOption>(null);
  const [unitPrice, setUnitPrice] = useState<number>(0);

  const queryProducts = React.useCallback(() => {
    getProducts({
      pageSize: 10000,
      status: 'active',
      userID: user.id,
    }).then(result => {
      setProducts(result[0].map(p => p as Product))
    })

  }, [user])

  React.useEffect(() => {
    queryProducts();
  }, [user]);

  const handleSelectProduct = (_: React.SyntheticEvent<Element, Event>, value: Product) => {
    setSelectedProduct(value)

    console.log(value, "SELECTED_PRODUCT")

    if (!value) {
      setInventory(0);
      setProductComission(0);
      return;
    }
    setProductComission(value.sailsmanComission);
  }

  const handleSelectSellingOption = (_: React.SyntheticEvent<Element, Event>, value: SellingOption) => {
    setSellingOption(value)
    if (value) {
      setUnitCost(value.unitCost)
      setInventory(value.inventory)
    } else {
      setUnitCost(0)
      setInventory(0)
    }
  }

  const itemTotalCost = useMemo(() => {
    const totalCost = calcItemTotalCost({
      unitPrice,
      descount,
      quantity: quantity ?? 0,
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
      unit: sellingOption.unit,
      unitPrice,
      itemTotalCost,
      title: selectedProduct.title,
      productID: selectedProduct.id,
      commissionRate: productComission,
      balance: inventory - quantity,
    } as ItemDataInterface])

    const prevCommission = formMethods.getValues("totalComission")
    const prevTotalCost = formMethods.getValues("totalCost")

    formMethods.setValue("totalComission", add(prevCommission, divide(multiply(productComission, itemTotalCost), 100)))
    formMethods.setValue("totalCost", add(prevTotalCost, itemTotalCost))



    setSelectedProduct(null);
    setUnitCost(null);
    setSellingOption(null);
    setQuantity(0);
    setUnitPrice(0);
    setProductComission(0);
    setUnitCost(0);
    setInventory(0);
  }

  const isFormCompleted = useMemo(() => itemTotalCost > 0, [itemTotalCost])

  return <Box>
    <Grid container spacing={1}>
      <Grid item xs={3}>
        <Autocomplete
          id="product-select"
          value={selectedProduct}
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
        <Autocomplete
          id="unit-select"
          options={selectedProduct?.sellingOptions || []}
          getOptionLabel={(option) => option.unit.name}
          value={sellingOption}
          fullWidth
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              value={sellingOption}
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
      <Grid item xs={3}>
        <TextField
          label="Estoque"
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
          onChange={(e) => setUnitPrice(!isNaN(Number(e.target.value)) ? Number(e.target.value) : 0)}
          onFocus={(e) => e.target.select()}
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
          onFocus={(e) => e.target.select()}
        />
      </Grid>
      <Grid item xs={2}>
        <TextField
          label="Comissão do Vendedor (%)"
          fullWidth
          variant="outlined"
          onChange={(e) => setInventory(Number(e.target.value))}
          value={productComission}
          onFocus={(e) => e.target.select()}
        />
      </Grid>
      <Grid item xs={2}>
        <TextField
          label="Total do produto"
          fullWidth
          variant="outlined"
          disabled
          value={itemTotalCost}
          onFocus={(e) => e.target.select()}
        />
      </Grid>
      <Grid item xs={2}>
        <Button onClick={submitItem} fullWidth style={{ height: "100%" }} variant="outlined" disabled={!isFormCompleted} > Adicionar Item </Button>
      </Grid>
    </Grid>
  </Box>
}
