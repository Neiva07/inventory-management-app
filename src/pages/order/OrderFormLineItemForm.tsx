import { Autocomplete, Box, Button, Grid, TextField } from "@mui/material";
import { useAuth } from "context/auth";
import { calcItemTotalCost } from "model/orders";
import { getProducts, Product, ProductUnit, Variant } from "model/products";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { ItemDataInterface, OrderFormDataInterface } from "./useOrderForm";
import { add, divide, integerDivide, multiply, subtract } from "lib/math";


export const OrderFormLineItemForm = ({ calculateBaseUnitInventory }: { calculateBaseUnitInventory: (product: Product) => number }) => {
  const { user } = useAuth();
  const formMethods = useFormContext<OrderFormDataInterface>();

  const [products, setProducts] = useState<Array<Product>>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product>(null);

  // Ref for the product selection Autocomplete
  const productSelectRef = React.useRef<HTMLDivElement>(null);

  const [quantity, setQuantity] = useState<number>();
  const [inventory, setInventory] = useState<number>(0);
  const [descount, setDescount] = useState<number>(0);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [productComission, setProductComission] = useState<number>(0);
  const [variant, setVariant] = useState<Variant>(null);
  const [unitPrice, setUnitPrice] = useState<number>(0);

  const paymentMethod = formMethods.watch("paymentMethod")

  useEffect(() => {
    if (selectedProduct && variant) {
      // Calculate available inventory for this variant
      const availableInventory = integerDivide(calculateBaseUnitInventory(selectedProduct), variant.conversionRate);
      setInventory(availableInventory);
      setProductComission(selectedProduct.sailsmanComission);
      setUnitCost(variant.unitCost);
    }
  }, [selectedProduct, variant, paymentMethod]);


  const queryProducts = React.useCallback(() => {
    getProducts({
      pageSize: 10000,
      status: 'active',
      userID: user.id,
    }).then(result => {
      setProducts(result[0].map(p => p as Product))
    })

  }, [user]);

  React.useEffect(() => {
    queryProducts();
  }, [user]);

  const handleSelectProduct = (_: React.SyntheticEvent<Element, Event>, value: Product) => {
    setSelectedProduct(value)
    if(value) {
      setVariant(value.variants[0])
      setUnitPrice(value.variants[0].prices.find(p => p.paymentMethod.id === paymentMethod.value)?.value ?? 0)
    }
  }

  const handleSelectVariant = (_: React.SyntheticEvent<Element, Event>, value: Variant) => {
    setVariant(value)
    if (value) {
      setUnitCost(value.unitCost)
      // Calculate available inventory for this variant
      const availableInventory = integerDivide(calculateBaseUnitInventory(selectedProduct), value.conversionRate);
      setInventory(availableInventory)
      setUnitPrice(value.prices.find(p => p.paymentMethod.id === paymentMethod.value)?.value ?? 0)
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

  const calculateBaseUnitBalance = (product: Product, itemVariant: Variant, submittedItemQuantity: number) => {
      const prevBalance = calculateBaseUnitInventory(product)

    return subtract(prevBalance, multiply(submittedItemQuantity, itemVariant.conversionRate))
  } 
  
  const submitItem = () => {
    const prevItems = formMethods.getValues("items")

    // Calculate the new balance in base units
    const baseUnitBalance = calculateBaseUnitBalance(selectedProduct, variant, quantity);

    const itemsFromSameProduct = prevItems.filter(item => item.productID === selectedProduct.id)

    const updatedItems = itemsFromSameProduct.map(item => {
      return {
        ...item,
        balance: integerDivide(baseUnitBalance, item.variant.conversionRate)
      }
    })

    const itemsFromOtherProducts = prevItems.filter(item => item.productID !== selectedProduct.id)

    formMethods.setValue("items", [...itemsFromOtherProducts, ...updatedItems, {
      quantity,
      cost: unitCost,
      descount,
      variant,
      unitPrice,
      itemTotalCost,
      title: selectedProduct.title,
      productID: selectedProduct.id,
      commissionRate: productComission,
      balance: integerDivide(baseUnitBalance, variant.conversionRate),
    } as ItemDataInterface])

    const prevCommission = formMethods.getValues("totalComission")
    const prevTotalCost = formMethods.getValues("totalCost")

    formMethods.setValue("totalComission", add(prevCommission, divide(multiply(productComission, itemTotalCost), 100)))
    formMethods.setValue("totalCost", add(prevTotalCost, itemTotalCost))

    const nextIndex = products.findIndex(p => p.id === selectedProduct.id) + 1
    const nextProduct = nextIndex === products.length ? products[0] : products[nextIndex]
    handleSelectProduct(null, nextProduct);
    setQuantity(0);
    
    // Focus the product selection component after a short delay to ensure state updates
    setTimeout(() => {
      if (productSelectRef.current) {
        const inputElement = productSelectRef.current.querySelector('input');
          inputElement?.focus();
      }
    }, 100);
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
              onFocus={(e) => e.target.select()}
            />
          )}
          isOptionEqualToValue={(option, value) =>
            option.id === value.id
          }
          onChange={handleSelectProduct}
          ref={productSelectRef}
        />
      </Grid>
      <Grid item xs={3}>
        <Autocomplete
          id="unit-select"
          options={selectedProduct?.variants ?? []}
          getOptionLabel={(option) => option.unit.name}
          value={variant}
          fullWidth
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              value={variant}
              variant="outlined"
              label="Unidade"
            />
          )}
          isOptionEqualToValue={(option, value) =>
            option.unit.id === value.unit.id
          }
          disabled={!selectedProduct}
          onChange={handleSelectVariant}
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
          onChange={(e) => setQuantity(!isNaN(Number(e.target.value)) ? Number(e.target.value) : 0)}
          onFocus={(e) => e.target.select()}
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
          onChange={(e) => setDescount(!isNaN(Number(e.target.value)) ? Number(e.target.value) : 0)}
          value={descount}
          onFocus={(e) => e.target.select()}
        />
      </Grid>
      <Grid item xs={2}>
        <TextField
          label="Comissão do Vendedor (%)"
          fullWidth
          variant="outlined"
          onChange={(e) => setProductComission(!isNaN(Number(e.target.value)) ? Number(e.target.value) : 0)}
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
