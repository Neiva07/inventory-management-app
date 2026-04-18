import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageTitle } from '../../components/PageTitle';
import { SupplierBill, getSupplierBill } from '../../model/supplierBill';
import { InstallmentPayment, getInstallmentPayments } from '../../model/installmentPayment';
import { useAuth } from '../../context/auth';
import { formatCurrency } from 'lib/math';
import { PublicIdDisplay } from 'components/PublicIdDisplay';
import { Card, CardContent } from 'components/ui/card';
import { Badge } from 'components/ui/badge';
import { Button } from 'components/ui/button';
import { Alert, AlertDescription } from 'components/ui/alert';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from 'components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from 'components/ui/tooltip';
import { ExternalLink, ClipboardCopy, Check } from 'lucide-react';

// Helper function to format date
const formatDate = (timestamp: number): string => {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const getStatusColor = (status: string) => {
  const statusColors = {
    active: '#1976d2',
    paid: '#2e7d32',
    overdue: '#d32f2f',
    cancelled: '#757575',
    pending: '#ff9800',
  };
  return statusColors[status as keyof typeof statusColors] || '#757575';
};

const getStatusLabel = (status: string) => {
  const statusLabels = {
    active: 'Ativo',
    paid: 'Pago',
    overdue: 'Vencido',
    cancelled: 'Cancelado',
    pending: 'Pendente',
  };
  return statusLabels[status as keyof typeof statusLabels] || status;
};

export const SupplierBillDetail = () => {
  const { supplierBillID } = useParams();
  const navigate = useNavigate();
  const { user, organization } = useAuth();

  const [supplierBill, setSupplierBill] = useState<SupplierBill | null>(null);
  const [installments, setInstallments] = useState<InstallmentPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedSupplierId, setCopiedSupplierId] = useState(false);
  const [copiedInboundOrderId, setCopiedInboundOrderId] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!supplierBillID) return;

      try {
        setLoading(true);

        // Fetch supplier bill
        const bill = await getSupplierBill(supplierBillID, {
          userID: user.id,
          organizationId: organization?.id,
        });
        setSupplierBill(bill);

        // Fetch installments for this bill
        const installmentsResult = await getInstallmentPayments({
          userID: user.id,
          organizationId: organization?.id,
          supplierBillID,
          pageSize: 100, // Get all installments
        });
        setInstallments(installmentsResult.installmentPayments);

      } catch (err) {
        console.error('Error fetching supplier bill:', err);
        setError('Erro ao carregar dados da conta');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [organization?.id, supplierBillID, user.id]);

  if (loading) {
    return (
      <div>
        <PageTitle>Carregando...</PageTitle>
      </div>
    );
  }

  if (error || !supplierBill) {
    return (
      <div>
        <PageTitle>Erro</PageTitle>
        <Alert variant="destructive"><AlertDescription>{error || 'Conta não encontrada'}</AlertDescription></Alert>
      </div>
    );
  }

  const totalPaid = installments
    .filter(inst => inst.status === 'paid')
    .reduce((sum, inst) => sum + (inst.paidAmount || 0), 0);

  // Layout
  return (
    <div>
      <div className="flex items-center mb-4 gap-4">
        <PageTitle>Detalhes da Conta</PageTitle>
        {/* Public ID with PublicIdDisplay component */}
        {supplierBill.publicId && (
          <div className="flex items-center gap-2">
            <PublicIdDisplay publicId={supplierBill.publicId} showLabel={false} variant="list" />
            <Badge
              className="ml-4 font-semibold"
              style={{
                backgroundColor: getStatusColor(supplierBill.status),
                color: 'white',
              }}
            >
              {getStatusLabel(supplierBill.status)}
            </Badge>
          </div>
        )}
        <div className="flex-grow" />
        <Button
          variant="outline"
          onClick={() => navigate('/installment-payments')}
          className="min-w-[120px] mr-4"
        >
          Ver Parcelas
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  disabled
                  className="min-w-[120px]"
                >
                  Editar
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>Em breve</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Bill Information */}
      <Card className="mb-6 p-4">
        <CardContent className="p-0">
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-12 md:col-span-6">
              <p className="text-sm text-muted-foreground">
                Fornecedor
              </p>
              <div className="flex items-center gap-2 mb-2">
                <p className="font-medium">
                  {supplierBill.supplier.supplierName}
                </p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => navigate(`/suppliers/${supplierBill.supplier.supplierID}`)}>
                        <ExternalLink className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Ver fornecedor</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={async (e) => {
                    e.stopPropagation();
                    await navigator.clipboard.writeText(supplierBill.supplier.publicID);
                    setCopiedSupplierId(true);
                    setTimeout(() => setCopiedSupplierId(false), 1500);
                  }}
                >
                  {copiedSupplierId ? <Check className="size-4" /> : <ClipboardCopy className="size-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Pedido Relacionado
              </p>
              <div className="flex items-center gap-2 mb-2">
                {supplierBill.inboundOrder?.publicId ? (
                  <>
                    <p className="font-medium font-mono">
                      {supplierBill.inboundOrder.publicId}
                    </p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8" onClick={() => navigate(`/inbound-orders/${supplierBill.inboundOrder.id}`)}>
                            <ExternalLink className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Ver nota de compra</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {/* Copy Inbound Order ID: subtle, appears on hover */}
                    <div className="relative inline-flex items-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 opacity-50 ml-1 transition-opacity hover:opacity-100"
                              onClick={async (e) => {
                                e.stopPropagation();
                                await navigator.clipboard.writeText(supplierBill.inboundOrder.id);
                                setCopiedInboundOrderId(true);
                                setTimeout(() => setCopiedInboundOrderId(false), 1500);
                              }}
                            >
                              <ClipboardCopy className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copiar ID da nota de compra</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {copiedInboundOrderId && (
                        <div className="absolute -top-7 left-0 rounded bg-card px-2 py-1 shadow-md text-xs text-green-600 z-10">
                          Copiado!
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="mb-2">-</p>
                )}
              </div>
            </div>
            <div className="col-span-12 md:col-span-6">
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-6">
                  <p className="text-sm text-muted-foreground">
                    Data de Criação
                  </p>
                  <p className="mb-2">
                    {formatDate(supplierBill.createdAt)}
                  </p>
                </div>
                <div className="col-span-6">
                  <p className="text-sm text-muted-foreground">
                    Data Inicial
                  </p>
                  <p className="mb-2">
                    {supplierBill.startDate ? new Date(supplierBill.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card className="mb-6">
        <CardContent>
          <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mb-2">
            Resumo Financeiro
          </h3>
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 sm:col-span-6 md:col-span-3">
              <p className="text-sm text-muted-foreground">
                Valor Total
              </p>
              <h3 className="scroll-m-20 text-xl font-semibold tracking-tight text-primary">
                {formatCurrency(supplierBill.totalValue)}
              </h3>
            </div>

            <div className="col-span-12 sm:col-span-6 md:col-span-3">
              <p className="text-sm text-muted-foreground">
                Entrada
              </p>
              <h3 className="scroll-m-20 text-xl font-semibold tracking-tight text-green-700">
                {formatCurrency(supplierBill.initialCashInstallment)}
              </h3>
            </div>

            <div className="col-span-12 sm:col-span-6 md:col-span-3">
              <p className="text-sm text-muted-foreground">
                Valor Restante
              </p>
              <h3 className="scroll-m-20 text-xl font-semibold tracking-tight text-amber-600">
                {formatCurrency(supplierBill.remainingValue)}
              </h3>
            </div>

            <div className="col-span-12 sm:col-span-6 md:col-span-3">
              <p className="text-sm text-muted-foreground">
                Total Pago
              </p>
              <h3 className="scroll-m-20 text-xl font-semibold tracking-tight text-green-700">
                {formatCurrency(totalPaid)}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Installments Table */}
      <Card>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
              Parcelas ({installments.length})
            </h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      disabled
                    >
                      Adicionar Parcela
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Em breve</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="overflow-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parcela</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Forma de Pagamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valor Pago</TableHead>
                  <TableHead>Data do Pagamento</TableHead>
                  <TableHead>Redirecionar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {installments.map((installment) => (
                  <TableRow
                    key={installment.id}
                    className="cursor-pointer"
                    onDoubleClick={() => {/* Placeholder: No detail page yet */}}
                  >
                    <TableCell>{installment.installmentNumber}</TableCell>
                    <TableCell>{installment.dueDate ? new Date(installment.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}</TableCell>
                    <TableCell>{formatCurrency(installment.amount)}</TableCell>
                    <TableCell>{installment.paymentMethod.label}</TableCell>
                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor: getStatusColor(installment.status),
                          color: 'white',
                        }}
                      >
                        {getStatusLabel(installment.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {installment.paidAmount ? formatCurrency(installment.paidAmount) : '-'}
                    </TableCell>
                    <TableCell>
                      {installment.paidAt ? formatDate(installment.paidAt) : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/installment-payments/${installment.id}`)}
                            >
                              <ExternalLink className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Ver Detalhes da Parcela</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Voltar button at bottom right */}
      <div className="flex justify-end mt-8">
        <Button
          className="size-12 rounded-full px-6 h-auto py-2 shadow-md"
          onClick={() => navigate('/supplier-bills')}
        >
          Voltar
        </Button>
      </div>
    </div>
  );
};
