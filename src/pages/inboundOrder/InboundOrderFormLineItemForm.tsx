import { Autocomplete, Box, Button, Grid, TextField } from "@mui/material";
import { useAuth } from "context/auth";
import { calcInboundOrderItemTotalCost } from "model/inboundOrder";
import { getProducts, Product, Variant, updateProduct } from "model/products";
import React, { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { InboundOrderItemDataInterface, InboundOrderFormDataInterface } from "./useInboundOrderForm";
import { add, integerDivide, multiply } from "lib/math";
import { DuplicateItemDialog } from "components/DuplicateItemDialog";
import { ProductUpdateToggle } from "components/ProductUpdateToggle";
import { ProductUpdateModal } from "components/ProductUpdateModal";

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
  
  // Product update toggle state
  const [shouldUpdateProduct, setShouldUpdateProduct] = useState<boolean>(true);
  
  // Product update modal state
  const [showProductUpdateModal, setShowProductUpdateModal] = useState(false);
  const [pendingProductUpdate, setPendingProductUpdate] = useState<{
    productID: string;
    newUnitCost: number;
    variantUnitID: string;
  } | null>(null);

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
  
  const addItemToForm = (overrideExisting: boolean = false, skipCostCheck: boolean = false) => {
    const prevItems = formMethods.getValues("items")
    
    // Calculate the new balance in base units
    const baseUnitBalance = calculateBaseUnitBalance(selectedProduct, variant, quantity);

    // Check if cost has changed and update toggle is enabled
    const costHasChanged = unitCost !== variant.unitCost;
    if (costHasChanged && shouldUpdateProduct && !skipCostCheck) {
      // Set pending product update and show modal
      setPendingProductUpdate({
        productID: selectedProduct.id,
        newUnitCost: unitCost,
        variantUnitID: variant.unit.id,
      });
      setShowProductUpdateModal(true);
      return; // Don't add item yet, wait for modal confirmation
    }

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

  const handleProductUpdateConfirm = async (updatedProduct: Product) => {
    try {
      // Update the product in the database
      await updateProduct(updatedProduct.id, updatedProduct);
      
      // Update the local product state to reflect changes
      setSelectedProduct(updatedProduct);
      setVariant(updatedProduct.variants.find(v => v.unit.id === variant.unit.id) ?? updatedProduct.variants[0]);
      
      // Close modal and add item to form
      setShowProductUpdateModal(false);
      setPendingProductUpdate(null);
      
      // Add item to form with the updated cost
      addItemToForm(false, true);
    } catch (error) {
      console.error('Error updating product:', error);
      // You might want to show an error message to the user here
    }
  }

  const handleProductUpdateCancel = () => {
    setShowProductUpdateModal(false);
    setPendingProductUpdate(null);
    // Reset the unit cost to the original value
    setUnitCost(variant?.unitCost || 0);
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
    
    <ProductUpdateToggle
      shouldUpdateProduct={shouldUpdateProduct}
      onToggle={setShouldUpdateProduct}
    />
    
    <DuplicateItemDialog
      open={showDuplicateDialog}
      onClose={handleDialogClose}
      onOverride={handleDialogOverride}
      productName={selectedProduct?.title ?? ''}
      unitName={variant?.unit.name ?? ''}
    />
    
    {pendingProductUpdate && (
      <ProductUpdateModal
        open={showProductUpdateModal}
        onClose={handleProductUpdateCancel}
        onConfirm={handleProductUpdateConfirm}
        productID={pendingProductUpdate.productID}
        newUnitCost={pendingProductUpdate.newUnitCost}
        variantUnitID={pendingProductUpdate.variantUnitID}
      />
    )}
    
  </Box>
} 