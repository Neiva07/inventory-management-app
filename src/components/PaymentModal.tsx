import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { paymentMethods } from '../model/paymentMethods';
import { InstallmentPayment } from '../model/installmentPayment';
import { recordPayment } from '../model/installmentPayment';
import { formatCurrency } from '../lib/math';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onPaymentRecorded: () => void;
  installment: InstallmentPayment | null;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onClose,
  onPaymentRecorded,
  installment,
}) => {
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Reset form when modal opens/closes or installment changes
  useEffect(() => {
    if (open && installment) {
      setPaymentAmount(installment.amount);
      setSelectedPaymentMethod(installment.paymentMethod?.id || '');
      setError('');
    }
  }, [open, installment]);

  const handleClose = () => {
    if (!loading) {
      setPaymentAmount(0);
      setSelectedPaymentMethod('');
      setError('');
      onClose();
    }
  };

  const handlePaymentMethodChange = (event: any) => {
    setSelectedPaymentMethod(event.target.value);
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    if (!isNaN(value) && value >= 0) {
      setPaymentAmount(value);
    }
  };

  const validateForm = (): boolean => {
    if (!installment) {
      setError('Parcela não encontrada');
      return false;
    }

    if (!selectedPaymentMethod) {
      setError('Selecione uma forma de pagamento');
      return false;
    }

    if (paymentAmount <= 0) {
      setError('Valor deve ser maior que zero');
      return false;
    }

    if (paymentAmount !== installment.amount) {
      setError(`Valor deve ser exatamente ${formatCurrency(installment.amount)}`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm() || !installment) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const paymentMethod = paymentMethods.find(m => m.id === selectedPaymentMethod);
      
      await recordPayment(
        installment.id,
        paymentAmount,
        paymentMethod ? {
          id: paymentMethod.id,
          label: paymentMethod.label,
        } : undefined
      );

      onPaymentRecorded();
      handleClose();
    } catch (err: any) {
      console.error('Error recording payment:', err);
      // Show specific error message if available
      const errorMessage = err?.message || 'Erro ao registrar pagamento. Tente novamente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!installment) {
    return null;
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      disableRestoreFocus
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          Registrar Pagamento
        </DialogTitle>
        
        <DialogContent>
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Parcela #{installment.installmentNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Vencimento: {new Date(installment.dueDate).toLocaleDateString('pt-BR')}
            </Typography>
            <Typography variant="h5" color="primary" fontWeight="bold">
              Valor: {formatCurrency(installment.amount)}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Valor do Pagamento"
                type="number"
                value={paymentAmount}
                onChange={handleAmountChange}
                fullWidth
                disabled={loading}
                inputProps={{
                  step: 0.01,
                  min: 0,
                }}
                helperText={`Valor fixo: ${formatCurrency(installment.amount)}`}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth disabled={loading}>
                <InputLabel>Forma de Pagamento</InputLabel>
                <Select
                  value={selectedPaymentMethod}
                  onChange={handlePaymentMethodChange}
                  label="Forma de Pagamento"
                >
                  {paymentMethods.map((method) => (
                    <MenuItem key={method.id} value={method.id}>
                      {method.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button 
            onClick={handleClose} 
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !selectedPaymentMethod || paymentAmount <= 0}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Registrando...' : 'Registrar Pagamento'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 