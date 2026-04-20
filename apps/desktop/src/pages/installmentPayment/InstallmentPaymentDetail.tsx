import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageTitle } from '../../components/PageTitle';
import { InstallmentPayment, getInstallmentPayment } from '../../model/installmentPayment';
import { SupplierBill, getSupplierBill } from '../../model/supplierBill';
import { useAuth } from '../../context/auth';
import { formatCurrency } from 'lib/math';
import { PublicIdDisplay } from 'components/PublicIdDisplay';
import { PaymentModal } from '../../components/PaymentModal';
import { Card, CardContent } from 'components/ui/card';
import { Badge } from 'components/ui/badge';
import { Button } from 'components/ui/button';
import { Alert, AlertDescription } from 'components/ui/alert';
import { Separator } from 'components/ui/separator';
import { CreditCard, ArrowLeft } from 'lucide-react';

// Helper function to format date
const formatDate = (timestamp: number): string => {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return '#ff9800';
    case 'paid':
      return '#2e7d32';
    case 'overdue':
      return '#d32f2f';
    case 'cancelled':
      return '#757575';
    default:
      return '#757575';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pendente';
    case 'paid':
      return 'Pago';
    case 'overdue':
      return 'Vencido';
    case 'cancelled':
      return 'Cancelado';
    default:
      return status;
  }
};

export const InstallmentPaymentDetail = () => {
  const { installmentPaymentID } = useParams();
  const navigate = useNavigate();
  const { user, organization } = useAuth();

  const [installmentPayment, setInstallmentPayment] = useState<InstallmentPayment | null>(null);
  const [supplierBill, setSupplierBill] = useState<SupplierBill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!installmentPaymentID) return;

      try {
        setLoading(true);

        // Fetch installment payment
        const installment = await getInstallmentPayment(installmentPaymentID, {
          userID: user.id,
          organizationId: organization?.id,
        });
        setInstallmentPayment(installment);

        // Fetch related supplier bill
        if (installment.supplierBillID) {
          try {
            const bill = await getSupplierBill(installment.supplierBillID, {
              userID: user.id,
              organizationId: organization?.id,
            });
            setSupplierBill(bill);
          } catch (err) {
            console.warn('Could not fetch supplier bill:', err);
          }
        }

      } catch (err) {
        console.error('Error fetching installment payment:', err);
        setError('Erro ao carregar dados da parcela');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [installmentPaymentID, organization?.id, user.id]);

  const handlePaymentRecorded = () => {
    // Refresh the data
    if (installmentPaymentID) {
      getInstallmentPayment(installmentPaymentID, {
        userID: user.id,
        organizationId: organization?.id,
      }).then(setInstallmentPayment);
    }
  };

  const handlePaymentModalClose = () => {
    setPaymentModalOpen(false);
  };

  if (loading) {
    return (
      <div>
        <PageTitle>Carregando...</PageTitle>
      </div>
    );
  }

  if (error || !installmentPayment) {
    return (
      <div>
        <PageTitle>Erro</PageTitle>
        <Alert variant="destructive"><AlertDescription>{error || 'Parcela não encontrada'}</AlertDescription></Alert>
      </div>
    );
  }

  const canPay = installmentPayment.status === 'pending' || installmentPayment.status === 'overdue';

  return (
    <div>
      <div className="flex items-center mb-4 gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/installment-payments')}>
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex items-center gap-4 flex-1">
          <PageTitle>Parcela #{installmentPayment.installmentNumber}</PageTitle>
          <PublicIdDisplay publicId={installmentPayment.publicId} recordType="pagamento" />
          <Badge
            className="font-bold"
            style={{
              backgroundColor: getStatusColor(installmentPayment.status),
              color: 'white',
            }}
          >
            {getStatusLabel(installmentPayment.status)}
          </Badge>
        </div>
        {canPay && (
          <Button
            onClick={() => setPaymentModalOpen(true)}
          >
            <CreditCard className="size-5" />
            Registrar Pagamento
          </Button>
        )}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Installment Details */}
        <div className="col-span-12 md:col-span-6">
          <Card>
            <CardContent>
              <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mb-2">
                Detalhes da Parcela
              </h3>
              <Separator className="mb-4" />

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <p className="text-sm text-muted-foreground">
                    Numero da Parcela
                  </p>
                  <p className="font-medium">
                    #{installmentPayment.installmentNumber}
                  </p>
                </div>

                <div className="col-span-6">
                  <p className="text-sm text-muted-foreground">
                    Valor
                  </p>
                  <p className="font-medium text-primary">
                    {formatCurrency(installmentPayment.amount)}
                  </p>
                </div>

                <div className="col-span-6">
                  <p className="text-sm text-muted-foreground">
                    Data de Vencimento
                  </p>
                  <p className="font-medium">
                    {formatDate(installmentPayment.dueDate)}
                  </p>
                </div>

                <div className="col-span-6">
                  <p className="text-sm text-muted-foreground">
                    Forma de Pagamento
                  </p>
                  <p className="font-medium">
                    {installmentPayment.paymentMethod?.label || '-'}
                  </p>
                </div>

                {installmentPayment.paidAmount && (
                  <div className="col-span-6">
                    <p className="text-sm text-muted-foreground">
                      Valor Pago
                    </p>
                    <p className="font-medium text-green-700">
                      {formatCurrency(installmentPayment.paidAmount)}
                    </p>
                  </div>
                )}

                {installmentPayment.paidAt && (
                  <div className="col-span-6">
                    <p className="text-sm text-muted-foreground">
                      Data do Pagamento
                    </p>
                    <p className="font-medium">
                      {formatDate(installmentPayment.paidAt)}
                    </p>
                  </div>
                )}

                <div className="col-span-6">
                  <p className="text-sm text-muted-foreground">
                    Data de Criação
                  </p>
                  <p className="font-medium">
                    {formatDate(installmentPayment.createdAt)}
                  </p>
                </div>

                {installmentPayment.updatedAt && (
                  <div className="col-span-6">
                    <p className="text-sm text-muted-foreground">
                      Última Atualização
                    </p>
                    <p className="font-medium">
                      {formatDate(installmentPayment.updatedAt)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Supplier Bill Information */}
        <div className="col-span-12 md:col-span-6">
          <Card>
            <CardContent>
              <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mb-2">
                Informações da Conta
              </h3>
              <Separator className="mb-4" />

              {supplierBill ? (
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12">
                    <p className="text-sm text-muted-foreground">
                      Fornecedor
                    </p>
                    <p className="font-medium">
                      {supplierBill.supplier.supplierName}
                    </p>
                  </div>

                  <div className="col-span-6">
                    <p className="text-sm text-muted-foreground">
                      ID da Conta
                    </p>
                    <p className="font-medium">
                      {supplierBill.publicId}
                    </p>
                  </div>

                  <div className="col-span-6">
                    <p className="text-sm text-muted-foreground">
                      Pedido
                    </p>
                    <p className="font-medium">
                      {supplierBill.inboundOrder.publicId}
                    </p>
                  </div>

                  <div className="col-span-6">
                    <p className="text-sm text-muted-foreground">
                      Valor Total
                    </p>
                    <p className="font-medium">
                      {formatCurrency(supplierBill.totalValue)}
                    </p>
                  </div>

                  <div className="col-span-6">
                    <p className="text-sm text-muted-foreground">
                      Valor Restante
                    </p>
                    <p className="font-medium">
                      {formatCurrency(supplierBill.remainingValue)}
                    </p>
                  </div>

                  <div className="col-span-12">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/supplier-bills/${supplierBill.id}`)}
                      className="w-full"
                    >
                      Ver Detalhes da Conta
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Informações da conta não disponíveis
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <PaymentModal
        open={paymentModalOpen}
        onClose={handlePaymentModalClose}
        onPaymentRecorded={handlePaymentRecorded}
        installment={installmentPayment}
      />
    </div>
  );
};
