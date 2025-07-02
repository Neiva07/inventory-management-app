import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  Typography
} from '@mui/material';

interface InstallmentPaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  totalValue: number;
}

const initialInstallments = Array(12).fill(0);

export const InstallmentPaymentModal: React.FC<InstallmentPaymentModalProps> = ({ open, onClose, onSubmit, totalValue }) => {
  const [numInstallments, setNumInstallments] = useState(1);
  const [installments, setInstallments] = useState<number[]>([0, ...initialInstallments.slice(1)]);
  const [document, setDocument] = useState('');
  const [emissao, setEmissao] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [bankName, setBankName] = useState('');
  const [value, setValue] = useState('0.00');
  const [dailyInterestPercent, setDailyInterestPercent] = useState('0.00');
  const [dailyInterestValue, setDailyInterestValue] = useState('0.00');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const remaining = totalValue - installments.reduce((a, b) => a + Number(b), 0);

  const handleInstallmentChange = (idx: number, val: string) => {
    const newVals = [...installments];
    newVals[idx] = Number(val);
    setInstallments(newVals);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      numInstallments,
      installments,
      document,
      emissao,
      supplierName,
      paymentType,
      bankName,
      value,
      dailyInterestPercent,
      dailyInterestValue,
      dueDate,
      notes,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth disableRestoreFocus>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Pagamento Parcelado</DialogTitle>
        <DialogContent>
          <Box mb={2} display="flex" justifyContent="space-between">
            <Typography color="success.main" fontWeight="bold">
              Valor Total: <TextField value={totalValue.toFixed(2)} InputProps={{ readOnly: true }} size="small" sx={{ ml: 1, width: 100 }} />
            </Typography>
            <Typography color="success.main" fontWeight="bold">
              Restante: <TextField value={remaining.toFixed(2)} InputProps={{ readOnly: true }} size="small" sx={{ ml: 1, width: 100 }} />
            </Typography>
          </Box>
          <Box mb={2} display="flex" alignItems="center">
            <Typography sx={{ mr: 2 }}>Nº de Parcelas:</Typography>
            <TextField
              type="number"
              inputProps={{ min: 1, max: 12 }}
              value={numInstallments}
              onChange={e => setNumInstallments(Number(e.target.value))}
              size="small"
              sx={{ width: 60, mr: 2 }}
            />
            <Grid container spacing={1} sx={{ flex: 1 }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <Grid item xs={2} key={i}>
                  <TextField
                    label={`${i + 1}º Pagamento`}
                    type="number"
                    inputProps={{ min: 0 }}
                    value={installments[i]}
                    onChange={e => handleInstallmentChange(i, e.target.value)}
                    size="small"
                    disabled={i >= numInstallments}
                    onFocus={e => e.target.select()}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Documento"
                value={document}
                onChange={e => setDocument(e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Emissão"
                type="date"
                value={emissao}
                onChange={e => setEmissao(e.target.value)}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nome Fornecedor"
                value={supplierName}
                onChange={e => setSupplierName(e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Tipo Pagamento"
                value={paymentType}
                onChange={e => setPaymentType(e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nome do Banco"
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Valor R$"
                type="number"
                value={value}
                onChange={e => setValue(e.target.value)}
                fullWidth
                size="small"
                onFocus={e => e.target.select()}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Juros (%) Dia"
                type="number"
                value={dailyInterestPercent}
                onChange={e => setDailyInterestPercent(e.target.value)}
                fullWidth
                size="small"
                onFocus={e => e.target.select()}

              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Juros Valor Dia"
                type="number"
                value={dailyInterestValue}
                onChange={e => setDailyInterestValue(e.target.value)}
                fullWidth
                size="small"
                onFocus={e => e.target.select()}

              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Vencimento"
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          <TextField
            label="Obs."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="error" variant="contained">Cancelar</Button>
          <Button type="submit" color="success" variant="contained">Salvar</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default InstallmentPaymentModal; 