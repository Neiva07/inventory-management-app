import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  IconButton,
  Tooltip,
  Fab,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { PageTitle } from '../../components/PageTitle';
import { SupplierBill, getSupplierBill } from '../../model/supplierBill';
import { InstallmentPayment, getInstallmentPayments } from '../../model/installmentPayment';
import { useAuth } from '../../context/auth';
import { formatCurrency } from 'lib/math';
import { PublicIdDisplay } from 'components/PublicIdDisplay';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

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
  const { user } = useAuth();
  
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
        const bill = await getSupplierBill(supplierBillID);
        setSupplierBill(bill);
        
        // Fetch installments for this bill
        const installmentsResult = await getInstallmentPayments({
          userID: user.id,
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
  }, [supplierBillID, user.id]);

  if (loading) {
    return (
      <Box>
        <PageTitle>Carregando...</PageTitle>
      </Box>
    );
  }

  if (error || !supplierBill) {
    return (
      <Box>
        <PageTitle>Erro</PageTitle>
        <Alert severity="error">{error || 'Conta não encontrada'}</Alert>
      </Box>
    );
  }

  const totalPaid = installments
    .filter(inst => inst.status === 'paid')
    .reduce((sum, inst) => sum + (inst.paidAmount || 0), 0);

  // Layout
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        <PageTitle>Detalhes da Conta</PageTitle>
        {/* Public ID with PublicIdDisplay component */}
        {supplierBill.publicId && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PublicIdDisplay publicId={supplierBill.publicId} showLabel={false} variant="list" />
            <Chip
              label={getStatusLabel(supplierBill.status)}
              sx={{
                backgroundColor: getStatusColor(supplierBill.status),
                color: 'white',
                fontWeight: 600,
                ml: 2
              }}
            />
          </Box>
        )}
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="Em breve">
          <span>
            <Button
              variant="contained"
              color="primary"
              disabled
              sx={{ minWidth: 120 }}
            >
              Editar
            </Button>
          </span>
        </Tooltip>
      </Box>

      {/* Bill Information */}
      <Card sx={{ mb: 3, p: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Fornecedor
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {supplierBill.supplier.supplierName}
                </Typography>
                <Tooltip title="Ver fornecedor">
                  <IconButton size="small" onClick={() => navigate(`/suppliers/${supplierBill.supplier.supplierID}`)}>
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <IconButton 
                  size="small" 
                  onClick={async (e) => {
                    e.stopPropagation();
                    await navigator.clipboard.writeText(supplierBill.supplier.publicID);
                    setCopiedSupplierId(true);
                    setTimeout(() => setCopiedSupplierId(false), 1500);
                  }}
                >
                  {copiedSupplierId ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Pedido Relacionado
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {supplierBill.inboundOrder?.publicId ? (
                  <>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                      {supplierBill.inboundOrder.publicId}
                    </Typography>
                    <Tooltip title="Ver nota de compra">
                      <IconButton size="small" onClick={() => navigate(`/inbound-orders/${supplierBill.inboundOrder.id}`)}>
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {/* Copy Inbound Order ID: subtle, appears on hover */}
                    <Box
                      sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
                    >
                      <Tooltip title="Copiar ID da nota de compra">
                        <IconButton
                          size="small"
                          sx={{ opacity: 0.5, ml: 0.5, transition: 'opacity 0.2s', '&:hover': { opacity: 1 } }}
                          onClick={async (e) => {
                            e.stopPropagation();
                            await navigator.clipboard.writeText(supplierBill.inboundOrder.id);
                            setCopiedInboundOrderId(true);
                            setTimeout(() => setCopiedInboundOrderId(false), 1500);
                          }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {copiedInboundOrderId && (
                        <Box sx={{ position: 'absolute', top: -28, left: 0, bgcolor: 'background.paper', px: 1, py: 0.5, borderRadius: 1, boxShadow: 2, fontSize: 12, color: 'success.main', zIndex: 10 }}>
                          Copiado!
                        </Box>
                      )}
                    </Box>
                  </>
                ) : (
                  <Typography variant="body1" gutterBottom>-</Typography>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Data de Criação
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(supplierBill.createdAt)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Data Inicial
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {supplierBill.startDate ? new Date(supplierBill.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Resumo Financeiro
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Valor Total
              </Typography>
              <Typography variant="h6" color="primary">
                {formatCurrency(supplierBill.totalValue)}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Entrada
              </Typography>
              <Typography variant="h6" color="success.main">
                {formatCurrency(supplierBill.initialCashInstallment)}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Valor Restante
              </Typography>
              <Typography variant="h6" color="warning.main">
                {formatCurrency(supplierBill.remainingValue)}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Total Pago
              </Typography>
              <Typography variant="h6" color="success.main">
                {formatCurrency(totalPaid)}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Installments Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Parcelas ({installments.length})
            </Typography>
            <Tooltip title="Em breve">
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  disabled
                >
                  Adicionar Parcela
                </Button>
              </span>
            </Tooltip>
          </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Parcela</TableCell>
                  <TableCell>Vencimento</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Forma de Pagamento</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Valor Pago</TableCell>
                  <TableCell>Data do Pagamento</TableCell>
                  <TableCell>Redirecionar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {installments.map((installment) => (
                  <TableRow
                    key={installment.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onDoubleClick={() => {/* Placeholder: No detail page yet */}}
                  >
                    <TableCell>{installment.installmentNumber}</TableCell>
                    <TableCell>{installment.dueDate ? new Date(installment.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}</TableCell>
                    <TableCell>{formatCurrency(installment.amount)}</TableCell>
                    <TableCell>{installment.paymentMethod.label}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(installment.status)}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(installment.status),
                          color: 'white',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {installment.paidAmount ? formatCurrency(installment.paidAmount) : '-'}
                    </TableCell>
                    <TableCell>
                      {installment.paidAt ? formatDate(installment.paidAt) : '-'}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver Detalhe (em breve)">
                        <span>
                          <IconButton disabled>
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Voltar button at bottom right */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <Fab
          variant="extended"
          color="primary"
          onClick={() => navigate('/supplier-bills')}
          sx={{ boxShadow: 2 }}
        >
          Voltar
        </Fab>
      </Box>
    </Box>
  );
}; 