import React, { useEffect, useState, useRef } from "react";
import Button from "@mui/material/Button";
import { Box } from "@mui/material";

import {
  Autocomplete,
  Divider,
  FormControl,
  Grid,
  TextField,
  Typography,
  Tooltip,
} from "@mui/material";
import { Controller, FormProvider } from "react-hook-form";
import { SelectField, useProductCreateForm } from "./useProductCreateForm";
import { Variants } from "./Variants";
import { getProductCategories, ProductCategory } from "../../model/productCategories";
import { Supplier, getSuppliers } from "model/suppliers";
import { getUnits, Unit } from "model/units";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "context/auth";
import { PageTitle } from 'components/PageTitle';
import { FormActions } from 'components/FormActions';
import { CreateModeToggle } from 'components/CreateModeToggle';
import { DeleteConfirmationDialog } from 'components/DeleteConfirmationDialog';
import { PublicIdDisplay } from 'components/PublicIdDisplay';
import { useFormKeyboardShortcuts } from 'hooks/useFormKeyboardShortcuts';
import { EnhancedAutocomplete } from 'components/EnhancedAutocomplete';
import { KeyboardShortcutsHelp } from 'components/KeyboardShortcutsHelp';

interface ProductFormProps {
  productID?: string;
  onProductUpdated?: () => void;
  isModal?: boolean;
}

export const ProductForm = ({ productID: propProductID, onProductUpdated, isModal = false }: ProductFormProps = {}) => {
  const { user } = useAuth();

  const { productID: paramProductID } = useParams();
  const navigate = useNavigate();
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  
  // Use prop productID if provided (for modal), otherwise use param (for page)
  const productID = propProductID ?? paramProductID;
  
  const formMethods = useProductCreateForm(productID);
  const { register, product, onFormSubmit, onFormUpdate, onDeactiveProduct, onActivateProduct, onDelete } = formMethods; 
  const [categories, setCategories] = useState<Array<ProductCategory>>([]);
  const [suppliers, setSuppliers] = useState<Array<Supplier>>([]);
  const [units, setUnits] = useState<Array<Unit>>([]);

  useEffect(() => {
    getProductCategories(user.id).then(queryResult => setCategories(queryResult.docs.map(qr => qr.data() as ProductCategory)))
  }, [user]);

  useEffect(() => {
    getSuppliers({ pageSize: 1000, userID: user.id }).then(queryResult => setSuppliers(queryResult[0].docs.map(qr => qr.data() as Supplier)))
  }, [user]);

  useEffect(() => {
    getUnits(user.id).then(queryResult => setUnits(queryResult.docs.map(qr => qr.data() as Unit)))
  }, [user]);

  const handleSubmit = async () => {
    if (productID) {
      // Edit mode
      await onFormUpdate();
      if (isModal) {
        onProductUpdated?.();
      } else {
        navigate('/products');
      }
    } else {
      // Create mode
      await onFormSubmit();
      if (isModal) {
        onProductUpdated?.();
      } else if (isCreateMode) {
        // Reset form for new record
        formMethods.reset();
      } else {
        // Redirect to listing
        navigate('/products');
      }
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  }

  const handleConfirmDelete = () => {
    onDelete(() => {
      if (isModal) {
        onProductUpdated?.();
      } else {
        navigate('/products');
      }
    });
    setDeleteDialogOpen(false);
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  }

  const handleCancel = () => {
    if (isModal) {
      onProductUpdated?.();
    } else {
      navigate('/products');
    }
  }

  const handleReset = () => {
    if (window.confirm('Tem certeza que deseja resetar o formulário? Todas as alterações serão perdidas.')) {
      formMethods.reset();
      if (!productID) {
        // Auto-focus first field after reset for new products
        setTimeout(() => {
          titleRef.current?.focus();
        }, 100);
      }
    }
  }

  const handleAddVariant = () => {
    // This will be handled by the Variants component
    // We'll pass this function down to trigger variant addition
  }

  const handleAddPrice = () => {
    // This will be handled by the Variants component
    // We'll pass this function down to trigger price addition
  }



  const handleShowHelp = () => {
    setHelpModalOpen(true);
  }

  const handleToggleCreateMode = () => {
    setIsCreateMode(!isCreateMode);
  }

  // Field navigation refs
  const titleRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const commissionRef = useRef<HTMLInputElement>(null);
  const suppliersRef = useRef<HTMLDivElement>(null);
  const baseUnitRef = useRef<HTMLDivElement>(null);
  const inventoryRef = useRef<HTMLInputElement>(null);
  const minInventoryRef = useRef<HTMLInputElement>(null);
  const costRef = useRef<HTMLInputElement>(null);
  const weightRef = useRef<HTMLInputElement>(null);

  // Field navigation functions
  const focusNextField = (currentRef: React.RefObject<HTMLElement>) => {
    const fields = [titleRef, categoryRef, descriptionRef, commissionRef, suppliersRef, baseUnitRef, inventoryRef, minInventoryRef, costRef, weightRef];
    const currentIndex = fields.findIndex(ref => ref === currentRef);
    const nextIndex = (currentIndex + 1) % fields.length;
    const nextField = fields[nextIndex];
    
    if (nextField.current) {
      if (nextField.current.tagName === 'INPUT') {
        (nextField.current as HTMLInputElement).focus();
      } else {
        const input = nextField.current.querySelector('input');
        input?.focus();
      }
    }
  };

  const focusPreviousField = (currentRef: React.RefObject<HTMLElement>) => {
    const fields = [titleRef, categoryRef, descriptionRef, commissionRef, suppliersRef, baseUnitRef, inventoryRef, minInventoryRef, costRef, weightRef];
    const currentIndex = fields.findIndex(ref => ref === currentRef);
    const prevIndex = currentIndex === 0 ? fields.length - 1 : currentIndex - 1;
    const prevField = fields[prevIndex];
    
    if (prevField.current) {
      if (prevField.current.tagName === 'INPUT') {
        (prevField.current as HTMLInputElement).focus();
      } else {
        const input = prevField.current.querySelector('input');
        input?.focus();
      }
    }
  };

  // Auto-focus first field on form load for new products
  useEffect(() => {
    if (!productID && titleRef.current) {
      titleRef.current.focus();
    }
  }, [productID]);

  // Keyboard shortcuts
  useFormKeyboardShortcuts({
    onSubmit: handleSubmit,
    onCancel: handleCancel,
    onDelete: productID ? handleDelete : undefined,
    onInactivate: product && product.status === 'active' ? onDeactiveProduct : undefined,
    onActivate: product && product.status === 'inactive' ? onActivateProduct : undefined,
    onReset: handleReset,
    onToggleCreateMode: handleToggleCreateMode,
    onShowHelp: handleShowHelp,
    customShortcuts: {
      'Ctrl/Cmd + O': handleAddVariant,
      'Ctrl/Cmd + P': handleAddPrice,
    },
  });

  return (
    <FormProvider register={register} {...formMethods}>
      <Box sx={{ position: 'relative', pt: 8 }}>
        <FormActions
          showDelete={!!productID}
          showInactivate={!!product && product.status === 'active'}
          showActivate={!!product && product.status === 'inactive'}
          onDelete={handleDelete}
          onInactivate={onDeactiveProduct}
          onActivate={onActivateProduct}
          onShowHelp={() => {
            // Trigger F1 key programmatically to show help
            const f1Event = new KeyboardEvent('keydown', {
              key: 'F1',
              code: 'F1',
              keyCode: 112,
              which: 112,
              bubbles: true,
              cancelable: true,
            });
            document.dispatchEvent(f1Event);
          }}
          absolute
        />
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 3 }}>
              <PageTitle>
                {productID ? "Editar Produto" : "Cadastro de Produto"}
              </PageTitle>
              {product?.publicId && (
                <PublicIdDisplay publicId={product.publicId} />
              )}
            </Box>
          </Grid>
        </Grid>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <Controller
                control={formMethods.control}
                render={({ field }) => {
                  return (
                    <TextField
                      {...field}
                      ref={titleRef}
                      variant="outlined"
                      label="Nome do produto"
                      error={!!formMethods.formState.errors.title}
                      helperText={formMethods.formState.errors.title?.message}
                      autoFocus
                      onFocus={(e) => e.target.select()}
                    />
                  );
                }}
                name="title"
              />
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <Controller
                control={formMethods.control}
                render={({ field: { value: productCategory, ...props } }) => {
                  const handleChange = (
                    _: React.SyntheticEvent<Element, Event>,
                    value: SelectField | null
                  ) => {
                    props.onChange(value);
                  };

                  return (
                    <EnhancedAutocomplete
                      value={productCategory}
                      {...props}
                      id="product-category"
                      options={categories.map((c) => {
                        return {
                          label: c.name,
                          value: c.id,
                        } as SelectField;
                      })}
                      getOptionLabel={(option) => (option as SelectField)?.label ?? ''}
                      isOptionEqualToValue={(option: SelectField, value: SelectField) =>
                        option.value === value?.value
                      }
                      onChange={handleChange}
                      label="Categoria"
                      error={!!formMethods.formState.errors.productCategory}
                      helperText={formMethods.formState.errors.productCategory?.label?.message}
                      onNextField={() => focusNextField(categoryRef)}
                      onPreviousField={() => focusPreviousField(categoryRef)}
                    />
                  );
                }}
                name="productCategory"
              />
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <Controller
                control={formMethods.control}
                render={({ field: { value: description, onChange } }) => {
                  return (
                    <TextField
                      ref={descriptionRef}
                      label="descrição"
                      variant="outlined"
                      style={{
                        width: "100%",
                      }}
                      value={description}
                      onChange={onChange}
                      error={!!formMethods.formState.errors.description}
                      helperText={formMethods.formState.errors.description?.message}
                    />
                  );
                }}
                name="description"
              />
            </FormControl>
          </Grid>

          <Grid item xs={4}>
            <FormControl fullWidth>
              <Controller
                control={formMethods.control}
                render={({ field: { ...props } }) => {
                  return (
                    <TextField
                      {...props}
                      ref={commissionRef}
                      variant="outlined"
                      label="Comissão do vendedor"
                      onFocus={(e) => e.target.select()}
                    />
                  );
                }}
                name="sailsmanComission"
              />
            </FormControl>
          </Grid>
          <Grid item xs={8}>
            <FormControl fullWidth>
              <Controller
                control={formMethods.control}
                render={({ field: { value, ...props } }) => {
                  const handleChange = (
                    _: React.SyntheticEvent<Element, Event>,
                    value: SelectField[]
                  ) => {
                    props.onChange(value);
                  };
                  return (
                    <EnhancedAutocomplete
                      multiple
                      id="suppliers"
                      {...props}
                      options={suppliers.map(
                        (s) => ({ label: s.tradeName, value: s.id } as SelectField)
                      )}
                      getOptionLabel={(option: SelectField) => option.label}
                      isOptionEqualToValue={(option: SelectField, value: SelectField) =>
                        option.value === value?.value
                      }
                      value={value}
                      label="Fornecedores"
                      onNextField={() => focusNextField(suppliersRef)}
                      onPreviousField={() => focusPreviousField(suppliersRef)}
                      onChange={handleChange}
                      renderTags={(list: SelectField[]) => {
                        const displayList = list
                          .map((item) => item.label)
                          .join(", ");

                        return <span>{displayList}</span>;
                      }}
                    />
                  );
                }}
                name="suppliers"
              />
            </FormControl>
          </Grid>
        </Grid>
        <Divider style={{ width: "100%", marginTop: "12px", marginBottom: "12px" }} />
        <Typography variant="h6" gutterBottom>
          Unidade base
        </Typography>
        <Grid container spacing={1}>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <Controller
                control={formMethods.control}
                render={({ field: { value: baseUnit, ...props } }) => {
                  const handleChange = (
                    _: React.SyntheticEvent<Element, Event>,
                    value: SelectField | null
                  ) => {
                    props.onChange(value);
                  };
                  return (
                    <EnhancedAutocomplete
                      {...props}
                      id="base-unit"
                      value={baseUnit}
                      options={units.map((c) => {
                        return {
                          label: c.name,
                          value: c.id,
                        } as SelectField;
                      })}
                      isOptionEqualToValue={(option: SelectField, value: SelectField) =>
                        option.value === value?.value
                      }
                      onChange={handleChange}
                      label="Unidade base"
                      error={!!formMethods.formState.errors.baseUnit}
                      helperText={formMethods.formState.errors.baseUnit?.label?.message}
                      onNextField={() => focusNextField(baseUnitRef)}
                      onPreviousField={() => focusPreviousField(baseUnitRef)}
                    />
                  );
                }}
                name="baseUnit"
              />
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <Controller
                control={formMethods.control}
                render={({ field }) => {
                  return (
                    <TextField {...field}
                      ref={inventoryRef}
                      variant="outlined"
                      label="Estoque (unidades base)"
                      onFocus={(e) => e.target.select()}
                    />
                  );
                }}
                name="inventory"
              />
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <Controller
                control={formMethods.control}
                render={({ field: { ...props } }) => {
                  return (
                    <TextField
                      ref={minInventoryRef}
                      variant="outlined"
                      label="Estoque Mínimo"
                      {...props}
                      onFocus={(e) => e.target.select()}
                    />
                  );
                }}
                name="minInventory"
              />
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <Controller
                control={formMethods.control}
                render={({ field: { ...props } }) => {
                  return (
                    <TextField
                      ref={costRef}
                      variant="outlined"
                      label="Custo de compra"
                      {...props}
                      onFocus={(e) => e.target.select()}
                    />
                  );
                }}
                name="cost"
              />
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <Controller
                control={formMethods.control}
                render={({ field: { ...props } }) => {
                  return (
                    <TextField
                      ref={weightRef}
                      variant="outlined"
                      label="Peso (kg)"
                      {...props}
                      onFocus={(e) => e.target.select()}
                    />
                  );
                }}
                name="weight"
              />
            </FormControl>
          </Grid>
        </Grid>
        <Divider style={{ width: "100%", marginTop: "12px", marginBottom: "12px" }} />
        <Variants 
          {...formMethods} 
        />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, marginTop: "12px" }}>
          {productID ? (
            <Tooltip title="Ctrl/Cmd + Enter" placement="top">
              <Button onClick={handleSubmit} variant="contained">
                Atualizar Produto
              </Button>
            </Tooltip>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CreateModeToggle
                isCreateMode={isCreateMode}
                onToggle={setIsCreateMode}
                listingText="Redirecionar para listagem de produtos"
                createText="Criar mais produtos"
              />
              <Tooltip title="Ctrl/Cmd + Enter" placement="top">
                <Button onClick={handleSubmit} variant="contained">
                  Criar produto
                </Button>
              </Tooltip>
            </Box>
          )}
        </Box>
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          resourceName="produto"
        />
        <KeyboardShortcutsHelp
          open={helpModalOpen}
          onClose={() => setHelpModalOpen(false)}
          title="Atalhos do Teclado - Produto"
          showVariants={true}
        />
      </Box>
    </FormProvider>
  );
};
