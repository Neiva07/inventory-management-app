import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from '@mui/material';
import { ProductForm } from '../pages/product/productForm';

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  productID: string;
  onProductUpdated?: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  open,
  onClose,
  productID,
  onProductUpdated,
}) => {
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle>
        Editar Produto
      </DialogTitle>
      <DialogContent sx={{ paddingLeft: 9, paddingRight: 9, overflow: 'hidden' }}>
        <Box sx={{ height: '100%', overflow: 'auto' }}>
          <ProductForm 
            productID={productID}
            onProductUpdated={onProductUpdated}
            isModal={true}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} variant="outlined">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 