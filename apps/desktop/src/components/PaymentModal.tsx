import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from 'components/ui';
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

const selectClassName =
  'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

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

  const handlePaymentMethodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
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
      setError('Parcela nao encontrada');
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
      const paymentMethod = paymentMethods.find((m) => m.id === selectedPaymentMethod);

      await recordPayment(
        installment.id,
        paymentAmount,
        paymentMethod
          ? {
              id: paymentMethod.id,
              label: paymentMethod.label,
            }
          : undefined
      );

      onPaymentRecorded();
      handleClose();
    } catch (err: any) {
      console.error('Error recording payment:', err);
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
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          handleClose();
        }
      }}
    >
      <DialogContent
        className="sm:max-w-md"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
          </DialogHeader>

          <div className="space-y-1 rounded-md border bg-muted/30 p-4">
            <p className="text-lg font-semibold">
              Parcela #{installment.installmentNumber}
            </p>
            <p className="text-sm text-muted-foreground">
              Vencimento:{' '}
              {new Date(installment.dueDate).toLocaleDateString('pt-BR')}
            </p>
            <p className="text-xl font-bold text-primary">
              Valor: {formatCurrency(installment.amount)}
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="payment-amount"
                className="text-sm font-medium text-foreground"
              >
                Valor do Pagamento
              </label>
              <Input
                id="payment-amount"
                type="number"
                value={paymentAmount}
                onChange={handleAmountChange}
                disabled={loading}
                min={0}
                step={0.01}
              />
              <p className="text-xs text-muted-foreground">
                Valor fixo: {formatCurrency(installment.amount)}
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="payment-method"
                className="text-sm font-medium text-foreground"
              >
                Forma de Pagamento
              </label>
              <select
                id="payment-method"
                value={selectedPaymentMethod}
                onChange={handlePaymentMethodChange}
                disabled={loading}
                className={selectClassName}
              >
                <option value="">Selecione...</option>
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedPaymentMethod || paymentAmount <= 0}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Registrando...' : 'Registrar Pagamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
