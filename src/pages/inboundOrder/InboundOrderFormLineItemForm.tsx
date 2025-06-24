import { Autocomplete, Box, Button, Grid, TextField } from "@mui/material";
import { useAuth } from "context/auth";
import { calcInboundOrderItemTotalCost } from "model/inboundOrder";
import { getProducts, Product, ProductUnit, Variant } from "model/products";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { InboundOrderItemDataInterface, InboundOrderFormDataInterface } from "./useInboundOrderForm";
import { add, divide, integerDivide, multiply, subtract } from "lib/math";
import { DuplicateItemDialog } from "components/DuplicateItemDialog";

export const InboundOrderFormLineItemForm = ({ calculateBaseUnitInventory, deleteLineItemFromForm }: { calculateBaseUnitInventory: (product: Product) => number, deleteLineItemFromForm: (item: InboundOrderItemDataInterface) => void }) => {
  const { user } = useAuth();
  const formMethods = useFormContext<InboundOrderFormDataInterface>();

  const [products, setProducts] = useState<Array<Product>>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product>(null);

  // Ref for the product selection Autocomplete
  const productSelectRef = React.useRef<HTMLDivElement>(null);

  const [quantity, setQuantity] = useState<number>();
  const [inventory, setInventory] = useState<number>(0);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [variant, setVariant] = useState<Variant>(null);
  
  // Dialog state
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);

  console.log(variant)

  useEffect(() => {
    if (selectedProduct && variant) {
      // Calculate available inventory for this variant (inbound orders show current inventory)
      const availableInventory = integerDivide(calculateBaseUnitInventory(selectedProduct), variant.conversionRate);
      setInventory(availableInventory);
      setUnitCost(variant.unitCost);
    }
  }, [selectedProduct, variant]);

  const clearLineItemForm = () => {
    const nextIndex = products.findIndex(p => p.id === selectedProduct.id) + 1
    const nextProduct = nextIndex === products.length ? products[0] : products[nextIndex]
    handleSelectProduct(null, nextProduct);
    setQuantity(0);
    setShowDuplicateDialog(false);
  }

  const queryProducts = React.useCallback(() => {
    getProducts({
      pageSize: 10000,
      status: 'active',
      userID: user.id,
    }).then(result => {
      const queriedProducts = result[0].map(p => p as Product)
      setProducts(queriedProducts);
      if(queriedProducts.length > 0 && !selectedProduct) {
        handleSelectProduct(null, queriedProducts[0])
      }
    })
  }, [user]);

  React.useEffect(() => {
    queryProducts();
  }, [user]);

  const handleSelectProduct = (_: React.SyntheticEvent<Element, Event>, value: Product) => {
    setSelectedProduct(value)
    if(value) {
      setVariant(value.variants[0])
      setUnitCost(value.variants[0].unitCost ?? 0)
    }
  }

  const handleSelectVariant = (_: React.SyntheticEvent<Element, Event>, value: Variant) => {
    setVariant(value)
    if (value) {
      setUnitCost(value.unitCost)
      // Calculate available inventory for this variant
      const availableInventory = integerDivide(calculateBaseUnitInventory(selectedProduct), value.conversionRate);
      setInventory(availableInventory)
    } else {
      setUnitCost(0)
      setInventory(0)
    }
  }

  const itemTotalCost = useMemo(() => {
    const totalCost = calcInboundOrderItemTotalCost({
      unitCost,
      quantity: quantity ?? 0,
    })
    return totalCost
  }, [quantity, unitCost])

  const calculateBaseUnitBalance = (product: Product, itemVariant: Variant, submittedItemQuantity: number) => {
    const prevBalance = calculateBaseUnitInventory(product)
    return add(prevBalance, multiply(submittedItemQuantity, itemVariant.conversionRate))
  } 
  
  const addItemToForm = (overrideExisting: boolean = false) => {
    const prevItems = formMethods.getValues("items")
    
    // Calculate the new balance in base units
    const baseUnitBalance = calculateBaseUnitBalance(selectedProduct, variant, quantity);

    let updatedItems;
    if (overrideExisting) {
      // Remove existing item with same product and unit
      const itemsWithoutDuplicate = prevItems.filter(item => 
        !(item.productID === selectedProduct.id && item.variant.unit.id === variant.unit.id)
      );
      
      const itemsFromSameProduct = itemsWithoutDuplicate.filter(item => item.productID === selectedProduct.id)
      const updatedSameProductItems = itemsFromSameProduct.map(item => {
        return {
          ...item,
          balance: integerDivide(baseUnitBalance, item.variant.conversionRate)
        }
      })
      
      const itemsFromOtherProducts = itemsWithoutDuplicate.filter(item => item.productID !== selectedProduct.id)
      
      updatedItems = [...itemsFromOtherProducts, ...updatedSameProductItems, {
        quantity,
        variant,
        unitCost,
        itemTotalCost,
        title: selectedProduct.title,
        productID: selectedProduct.id,
        balance: integerDivide(baseUnitBalance, variant.conversionRate),
      } as InboundOrderItemDataInterface]
    } else {
      // Add as new item (existing logic)
      const itemsFromSameProduct = prevItems.filter(item => item.productID === selectedProduct.id)
      const updatedSameProductItems = itemsFromSameProduct.map(item => {
        return {
          ...item,
          balance: integerDivide(baseUnitBalance, item.variant.conversionRate)
        }
      })
      
      const itemsFromOtherProducts = prevItems.filter(item => item.productID !== selectedProduct.id)
      
      updatedItems = [...itemsFromOtherProducts, ...updatedSameProductItems, {
        quantity,
        variant,
        unitCost,
        itemTotalCost,
        title: selectedProduct.title,
        productID: selectedProduct.id,
        balance: integerDivide(baseUnitBalance, variant.conversionRate),
      } as InboundOrderItemDataInterface]
    }

    formMethods.setValue("items", updatedItems)

    const prevTotalCost = formMethods.getValues("totalCost")
    formMethods.setValue("totalCost", add(prevTotalCost, itemTotalCost))

    clearLineItemForm();
    
    // Focus the product selection component after a short delay to ensure state updates
    setTimeout(() => {
      if (productSelectRef.current) {
        const inputElement = productSelectRef.current.querySelector('input');
          inputElement?.focus();
      }
    }, 100);
  }
  
  const submitItem = () => {
    const prevItems = formMethods.getValues("items") 

    const existingItem = prevItems.find(item => item.productID === selectedProduct.id && item.variant.unit.id === variant.unit.id);
    
    if (existingItem) {
      // Show dialog for duplicate item
      setShowDuplicateDialog(true);
      return;
    }

    // No duplicate, add normally
    addItemToForm();
  }

  const handleDialogOverride = () => {
    const itemToDelete = formMethods.getValues("items").find(item => item.productID === selectedProduct.id && item.variant.unit.id === variant.unit.id)
    deleteLineItemFromForm(itemToDelete);
    setShowDuplicateDialog(false);
    addItemToForm(true);
  }

  const handleDialogClose = () => {
    setShowDuplicateDialog(false);
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
          label="Estoque Atual"
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
      <Grid item xs={4}>
        <TextField
          label="Custo Unitário"
          fullWidth
          variant="outlined"
          value={unitCost}
          onChange={(e) => setUnitCost(!isNaN(Number(e.target.value)) ? Number(e.target.value) : 0)}
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          label="Total do produto"
          fullWidth
          variant="outlined"
          disabled
          value={itemTotalCost}
          onFocus={(e) => e.target.select()}
        />
      </Grid>
      <Grid item xs={4}>
        <Button onClick={submitItem} fullWidth style={{ height: "100%" }} variant="outlined" disabled={!isFormCompleted} > Adicionar Item </Button>
      </Grid>
    </Grid>
    
    <DuplicateItemDialog
      open={showDuplicateDialog}
      onClose={handleDialogClose}
      onOverride={handleDialogOverride}
      productName={selectedProduct?.title ?? ''}
      unitName={variant?.unit.name ?? ''}
    />
  </Box>
} 