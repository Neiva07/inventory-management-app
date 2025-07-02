import React, { useState, useMemo, useEffect } from 'react';
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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormHelperText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { paymentMethods } from '../model/paymentMethods';
import { add, subtract, divide } from '../lib/math';

const INTERVAL_UNITS = [
  { value: 'days', label: 'Dias' },
  { value: 'weeks', label: 'Semanas' },
  { value: 'months', label: 'Meses' },
];

interface InstallmentPlanModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  totalValue: number;
  orderDate: Date;
}

interface InstallmentRow {
  number: number;
  dueDate: Date;
  amount: number;
  paymentMethod: string;
  locked: {
    dueDate: boolean;
    amount: boolean;
    paymentMethod: boolean;
  };
}

export const InstallmentPlanModal: React.FC<InstallmentPlanModalProps> = ({ open, onClose, onSubmit, totalValue, orderDate }) => {
  const [numberOfInstallments, setNumberOfInstallments] = useState(1);
  const [interval, setInterval] = useState(7);
  const [intervalUnit, setIntervalUnit] = useState('days');
  const [globalPaymentMethod, setGlobalPaymentMethod] = useState('prazo');
  const [startDate, setStartDate] = useState<Date>(orderDate ?? new Date());
  const [initialCashInstallment, setInitialCashInstallment] = useState(0);
  const [rows, setRows] = useState<InstallmentRow[]>([]);

  useEffect(() => {
    setStartDate(orderDate);
  }, [orderDate]);

  // Helper to add interval to a date
  const addInterval = (date: Date, interval: number, unit: string) => {
    const d = new Date(date);
    if (unit === 'days') d.setDate(d.getDate() + interval);
    if (unit === 'weeks') d.setDate(d.getDate() + interval * 7);
    if (unit === 'months') d.setMonth(d.getMonth() + interval);
    return d;
  };

  // Regenerate rows when numberOfInstallments, interval, intervalUnit, startDate, globalPaymentMethod, or initialCashInstallment changes
  useEffect(() => {
    const remainingValue = subtract(totalValue, initialCashInstallment);
    const baseAmount = divide(remainingValue, numberOfInstallments);
    setRows(prevRows => {
      const newRows: InstallmentRow[] = [];
      let runningTotal = 0;
      
      for (let i = 0; i < numberOfInstallments; i++) {
        const isLastInstallment = i === numberOfInstallments - 1;
        let amount: number;
        
        if (isLastInstallment) {
          // For the last installment, use the remaining amount to ensure exact total
          amount = subtract(remainingValue, runningTotal);
        } else {
          amount = baseAmount;
          runningTotal = add(runningTotal, amount);
        }
        
        // Calculate due date for this installment
        let installmentDueDate: Date;
        if (i === 0) {
          // First installment always uses startDate
          installmentDueDate = new Date(startDate);
        } else {
          // Subsequent installments add intervals to startDate
          installmentDueDate = addInterval(new Date(startDate), interval * i, intervalUnit);
        }
        
        const prev = prevRows[i];
        newRows.push({
          number: i + 1,
          dueDate: prev && prev.locked.dueDate ? prev.dueDate : installmentDueDate,
          amount: prev && prev.locked.amount ? prev.amount : amount,
          paymentMethod: prev && prev.locked.paymentMethod ? prev.paymentMethod : globalPaymentMethod,
          locked: {
            dueDate: prev?.locked.dueDate || false,
            amount: prev?.locked.amount || false,
            paymentMethod: prev?.locked.paymentMethod || false,
          },
        });
      }
      return newRows;
    });
    // eslint-disable-next-line
  }, [numberOfInstallments, interval, intervalUnit, startDate, globalPaymentMethod, totalValue, initialCashInstallment]);

  // Calculate sum of all values
  const totalPlanned = useMemo(() => rows.reduce((sum, r) => add(sum, r.amount), 0), [rows]);
  const remainingValue = subtract(totalValue, initialCashInstallment);
  const totalDiff = Math.abs(subtract(totalPlanned, remainingValue));

  const handleRowChange = (idx: number, field: keyof Omit<InstallmentRow, 'number' | 'locked'>, value: string | Date | number) => {
    setRows(rows => rows.map((row, i) =>
      i === idx
        ? {
            ...row,
            [field]: field === 'amount' ?  Number(value) : value,
            locked: { ...row.locked, [field]: true },
          }
        : row
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      numberOfInstallments,
      interval,
      intervalUnit,
      startDate,
      initialCashInstallment,
      plannedPayments: rows.map(({ locked, ...rest }) => ({
        ...rest,
        dueDate: rest.dueDate
      })),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth disableRestoreFocus>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Plano de Parcelamento</DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Typography color="success.main" fontWeight="bold">
              Valor Total: {totalValue}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Valor restante para parcelamento: {subtract(totalValue, initialCashInstallment)}
            </Typography>
          </Box>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Pagamento Inicial (à vista)"
                value={initialCashInstallment}
                onChange={e => {
                    const value = e.target.value;
                    const isNumber = !isNaN(Number(value));
                    if (isNumber) {
                        const newValue = Math.max(0, Math.min(totalValue, Number(value)));
                        setInitialCashInstallment(newValue);
                        if (newValue === 0 && value === '') {
                            setTimeout(() => e.target.select(), 0);
                        }
                    } else {
                        setInitialCashInstallment(0);
                    }
                }}
                fullWidth
                onFocus={e => e.target.select()}
                size="small"
                helperText="Pago imediatamente"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Nº de Parcelas"
                value={numberOfInstallments}
                onChange={e => {
                    const value = e.target.value;
                    const isNumber = !isNaN(Number(value));
                    if (isNumber) {
                        const newNumberOfInstallments = Math.max(1, Math.min(12, Number(value)));
                        setNumberOfInstallments(newNumberOfInstallments);
                        // Select text if value becomes minimum (1) after backspace
                        if (newNumberOfInstallments === 1 && value === '') {
                            setTimeout(() => e.target.select(), 0);
                        }
                    } else {
                        setNumberOfInstallments(1)
                    }

                }}
                fullWidth
                onFocus={e => e.target.select()}
                size="small"
                autoFocus
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Intervalo"
                value={interval}
                onChange={e => {
                    const value = e.target.value;
                    const isNumber = !isNaN(Number(value));
                    if (isNumber) {
                        const newInterval = Math.max(1, Number(value));
                        setInterval(newInterval);
                        if (newInterval === 1 && value === '') {
                            setTimeout(() => e.target.select(), 0);
                        }
                    } else {
                        setInterval(1);
                    }
                }}
                fullWidth
                size="small"
                onFocus={e => e.target.select()}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="interval-unit-label">Unidade</InputLabel>
                <Select
                  labelId="interval-unit-label"
                  value={intervalUnit}
                  label="Unidade"
                  onChange={e => setIntervalUnit(e.target.value)}
                >
                  {INTERVAL_UNITS.map(unit => (
                    <MenuItem key={unit.value} value={unit.value}>{unit.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Data Inicial"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue ?? new Date())}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small"
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="payment-method-label">Forma de Pagamento (Padrão)</InputLabel>
                <Select
                  labelId="payment-method-label"
                  value={globalPaymentMethod}
                  label="Forma de Pagamento (Padrão)"
                  onChange={e => setGlobalPaymentMethod(e.target.value)}
                  
                >
                  {paymentMethods.map(method => (
                    <MenuItem key={method.id} value={method.id}>{method.label}</MenuItem>
                  ))}
                </Select>
                <FormHelperText>Você pode alterar a forma de pagamento de cada parcela abaixo.</FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
          <Box mt={2}>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>Parcelas Planejadas</Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Parcela</TableCell>
                    <TableCell>Vencimento</TableCell>
                    <TableCell>Valor</TableCell>
                    <TableCell>Forma de Pagamento</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row.number}</TableCell>
                      <TableCell>
                        <DatePicker
                          value={row.dueDate}
                          onChange={(newValue) => handleRowChange(idx, 'dueDate', newValue ?? new Date())}
                          slotProps={{
                            textField: {
                              size: "small"
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          value={row.amount}
                          onChange={e => handleRowChange(idx, 'amount', e.target.value)}
                          onFocus={e => e.target.select()}
                          size="small"
                          type="text"
                        />
                      </TableCell>
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <Select
                            value={row.paymentMethod}
                            onChange={e => handleRowChange(idx, 'paymentMethod', e.target.value)}
                          >
                            {paymentMethods.map(method => (
                              <MenuItem key={method.id} value={method.id}>{method.label}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box mt={1} display="flex" alignItems="center" gap={2}>
              <Typography variant="body2">Total das Parcelas: <b>R$ {totalPlanned}</b></Typography>
              <Typography variant="body2">Valor para Parcelamento: <b>R$ {remainingValue}</b></Typography>
              {totalDiff > 0.009 && (
                <Typography variant="body2" color="error">A soma das parcelas difere do valor para parcelamento!</Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="error" variant="contained">Cancelar</Button>
          <Button type="submit" color="success" variant="contained">Salvar</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default InstallmentPlanModal; 