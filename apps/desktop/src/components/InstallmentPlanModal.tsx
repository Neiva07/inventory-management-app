import React, { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import {
  Button,
  Calendar,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'components/ui';
import { cn } from 'lib/utils';
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

type DateFieldProps = {
  value: Date | null | undefined;
  onChange: (value: Date) => void;
  className?: string;
  placeholder?: string;
};

const selectClassName =
  'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

const compactSelectClassName =
  'flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

const helperTextClassName = 'text-xs text-muted-foreground';
const labelClassName = 'text-sm font-medium text-foreground';

const DateField: React.FC<DateFieldProps> = ({
  value,
  onChange,
  className,
  placeholder = 'Selecione uma data',
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0" />
          {value ? format(value, 'dd/MM/yyyy') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value ?? undefined}
          onSelect={(nextDate) => {
            if (nextDate) {
              onChange(nextDate);
            }
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

export const InstallmentPlanModal: React.FC<InstallmentPlanModalProps> = ({
  open,
  onClose,
  onSubmit,
  totalValue,
  orderDate,
}) => {
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

  const addInterval = (date: Date, intervalValue: number, unit: string) => {
    const nextDate = new Date(date);
    if (unit === 'days') {
      nextDate.setDate(nextDate.getDate() + intervalValue);
    }
    if (unit === 'weeks') {
      nextDate.setDate(nextDate.getDate() + intervalValue * 7);
    }
    if (unit === 'months') {
      nextDate.setMonth(nextDate.getMonth() + intervalValue);
    }
    return nextDate;
  };

  useEffect(() => {
    const remaining = subtract(totalValue, initialCashInstallment);
    const baseAmount = divide(remaining, numberOfInstallments);

    setRows((prevRows) => {
      const newRows: InstallmentRow[] = [];
      let runningTotal = 0;

      for (let i = 0; i < numberOfInstallments; i++) {
        const isLastInstallment = i === numberOfInstallments - 1;
        let amount: number;

        if (isLastInstallment) {
          amount = subtract(remaining, runningTotal);
        } else {
          amount = baseAmount;
          runningTotal = add(runningTotal, amount);
        }

        const installmentDueDate =
          i === 0
            ? new Date(startDate)
            : addInterval(new Date(startDate), interval * i, intervalUnit);

        const prev = prevRows[i];
        newRows.push({
          number: i + 1,
          dueDate: prev && prev.locked.dueDate ? prev.dueDate : installmentDueDate,
          amount: prev && prev.locked.amount ? prev.amount : amount,
          paymentMethod:
            prev && prev.locked.paymentMethod
              ? prev.paymentMethod
              : globalPaymentMethod,
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
  }, [
    numberOfInstallments,
    interval,
    intervalUnit,
    startDate,
    globalPaymentMethod,
    totalValue,
    initialCashInstallment,
  ]);

  const totalPlanned = useMemo(() => rows.reduce((sum, r) => add(sum, r.amount), 0), [rows]);
  const remainingValue = subtract(totalValue, initialCashInstallment);
  const totalDiff = Math.abs(subtract(totalPlanned, remainingValue));

  const handleRowChange = (
    idx: number,
    field: keyof Omit<InstallmentRow, 'number' | 'locked'>,
    value: string | Date | number
  ) => {
    setRows((currentRows) =>
      currentRows.map((row, i) =>
        i === idx
          ? {
              ...row,
              [field]: field === 'amount' ? Number(value) : value,
              locked: { ...row.locked, [field]: true },
            }
          : row
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      numberOfInstallments,
      interval,
      intervalUnit,
      startDate,
      initialCashInstallment,
      plannedPayments: rows.map(({ locked, ...rest }) => {
        const paymentMethod = paymentMethods.find((m) => m.id === rest.paymentMethod);
        return {
          ...rest,
          dueDate: rest.dueDate,
          paymentMethod: {
            id: rest.paymentMethod,
            label: paymentMethod?.label ?? rest.paymentMethod,
          },
        };
      }),
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <DialogContent
        className="max-h-[90vh] w-[95vw] overflow-y-auto p-0 sm:max-w-5xl"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <DialogHeader>
            <DialogTitle>Plano de Parcelamento</DialogTitle>
          </DialogHeader>

          <div className="rounded-md border bg-muted/30 p-4">
            <p className="text-base font-semibold text-green-700 dark:text-green-400">
              Valor Total: {totalValue}
            </p>
            <p className="text-sm text-muted-foreground">
              Valor restante para parcelamento: {remainingValue}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label htmlFor="initial-cash-installment" className={labelClassName}>
                Pagamento Inicial (à vista)
              </label>
              <Input
                id="initial-cash-installment"
                value={initialCashInstallment}
                onChange={(e) => {
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
                onFocus={(e) => e.target.select()}
              />
              <p className={helperTextClassName}>Pago imediatamente</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="number-of-installments" className={labelClassName}>
                Nº de Parcelas
              </label>
              <Input
                id="number-of-installments"
                value={numberOfInstallments}
                onChange={(e) => {
                  const value = e.target.value;
                  const isNumber = !isNaN(Number(value));
                  if (isNumber) {
                    const nextNumber = Math.max(1, Math.min(12, Number(value)));
                    setNumberOfInstallments(nextNumber);
                    if (nextNumber === 1 && value === '') {
                      setTimeout(() => e.target.select(), 0);
                    }
                  } else {
                    setNumberOfInstallments(1);
                  }
                }}
                onFocus={(e) => e.target.select()}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="installment-interval" className={labelClassName}>
                Intervalo
              </label>
              <Input
                id="installment-interval"
                value={interval}
                onChange={(e) => {
                  const value = e.target.value;
                  const isNumber = !isNaN(Number(value));
                  if (isNumber) {
                    const nextInterval = Math.max(1, Number(value));
                    setInterval(nextInterval);
                    if (nextInterval === 1 && value === '') {
                      setTimeout(() => e.target.select(), 0);
                    }
                  } else {
                    setInterval(1);
                  }
                }}
                onFocus={(e) => e.target.select()}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="interval-unit" className={labelClassName}>
                Unidade
              </label>
              <select
                id="interval-unit"
                value={intervalUnit}
                onChange={(e) => setIntervalUnit(e.target.value)}
                className={selectClassName}
              >
                {INTERVAL_UNITS.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="start-date" className={labelClassName}>
                Data Inicial
              </label>
              <DateField
                value={startDate}
                onChange={(newValue) => setStartDate(newValue ?? new Date())}
                className="h-9"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="global-payment-method" className={labelClassName}>
                Forma de Pagamento (Padrão)
              </label>
              <select
                id="global-payment-method"
                value={globalPaymentMethod}
                onChange={(e) => setGlobalPaymentMethod(e.target.value)}
                className={selectClassName}
              >
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.label}
                  </option>
                ))}
              </select>
              <p className={helperTextClassName}>
                Você pode alterar a forma de pagamento de cada parcela abaixo.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold tracking-tight">Parcelas Planejadas</h3>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Parcela</TableHead>
                    <TableHead className="min-w-[180px]">Vencimento</TableHead>
                    <TableHead className="min-w-[120px]">Valor</TableHead>
                    <TableHead className="min-w-[220px]">Forma de Pagamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row.number}</TableCell>
                      <TableCell>
                        <DateField
                          value={row.dueDate}
                          onChange={(newValue) => handleRowChange(idx, 'dueDate', newValue)}
                          className="h-8 min-w-[170px] justify-start px-2 text-xs"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.amount}
                          onChange={(e) => handleRowChange(idx, 'amount', e.target.value)}
                          onFocus={(e) => e.target.select()}
                          type="text"
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <select
                          value={row.paymentMethod}
                          onChange={(e) => handleRowChange(idx, 'paymentMethod', e.target.value)}
                          className={compactSelectClassName}
                        >
                          {paymentMethods.map((method) => (
                            <option key={method.id} value={method.id}>
                              {method.label}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-1 text-sm md:flex-row md:flex-wrap md:items-center md:gap-4">
              <p>
                Total das Parcelas: <b>R$ {totalPlanned}</b>
              </p>
              <p>
                Valor para Parcelamento: <b>R$ {remainingValue}</b>
              </p>
              {totalDiff > 0.009 && (
                <p className="font-medium text-destructive">
                  A soma das parcelas difere do valor para parcelamento!
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InstallmentPlanModal;
