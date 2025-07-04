import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Alert,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { PageTitle } from '../../components/PageTitle';
import { InstallmentPayment, getInstallmentPayment } from '../../model/installmentPayment';
import { SupplierBill, getSupplierBill } from '../../model/supplierBill';
import { useAuth } from '../../context/auth';
import { formatCurrency } from 'lib/math';
import { PublicIdDisplay } from 'components/PublicIdDisplay';
import { PaymentModal } from '../../components/PaymentModal';
import { Payment, ArrowBack } from '@mui/icons-material';

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
  const { user } = useAuth();
  
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
        const installment = await getInstallmentPayment(installmentPaymentID);
        setInstallmentPayment(installment);
        
        // Fetch related supplier bill
        if (installment.supplierBillID) {
          try {
            const bill = await getSupplierBill(installment.supplierBillID);
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
  }, [installmentPaymentID]);

  const handlePaymentRecorded = () => {
    // Refresh the data
    if (installmentPaymentID) {
      getInstallmentPayment(installmentPaymentID).then(setInstallmentPayment);
    }
  };

  const handlePaymentModalClose = () => {
    setPaymentModalOpen(false);
  };

  if (loading) {
    return (
      <Box>
        <PageTitle>Carregando...</PageTitle>
      </Box>
    );
  }

  if (error || !installmentPayment) {
    return (
      <Box>
        <PageTitle>Erro</PageTitle>
        <Alert severity="error">{error || 'Parcela não encontrada'}</Alert>
      </Box>
    );
  }

  const canPay = installmentPayment.status === 'pending' || installmentPayment.status === 'overdue';

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        <IconButton onClick={() => navigate('/installment-payments')}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          <PageTitle>Parcela #{installmentPayment.installmentNumber}</PageTitle>
          <PublicIdDisplay publicId={installmentPayment.publicId} />
          <Chip
            label={getStatusLabel(installmentPayment.status)}
            sx={{
              backgroundColor: getStatusColor(installmentPayment.status),
              color: 'white',
              fontWeight: 'bold',
            }}
          />
        </Box>
        {canPay && (
          <Button
            variant="contained"
            startIcon={<Payment />}
            onClick={() => setPaymentModalOpen(true)}
          >
            Registrar Pagamento
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Installment Details */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Detalhes da Parcela
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Número da Parcela
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    #{installmentPayment.installmentNumber}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Valor
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" color="primary">
                    {formatCurrency(installmentPayment.amount)}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Data de Vencimento
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formatDate(installmentPayment.dueDate)}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Forma de Pagamento
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {installmentPayment.paymentMethod?.label || '-'}
                  </Typography>
                </Grid>
                
                {installmentPayment.paidAmount && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Valor Pago
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" color="success.main">
                      {formatCurrency(installmentPayment.paidAmount)}
                    </Typography>
                  </Grid>
                )}
                
                {installmentPayment.paidAt && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Data do Pagamento
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatDate(installmentPayment.paidAt)}
                    </Typography>
                  </Grid>
                )}
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Data de Criação
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formatDate(installmentPayment.createdAt)}
                  </Typography>
                </Grid>
                
                {installmentPayment.updatedAt && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Última Atualização
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatDate(installmentPayment.updatedAt)}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Supplier Bill Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informações da Conta
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {supplierBill ? (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Fornecedor
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {supplierBill.supplier.supplierName}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      ID da Conta
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {supplierBill.publicId}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Pedido
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {supplierBill.inboundOrder.publicId}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Valor Total
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatCurrency(supplierBill.totalValue)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Valor Restante
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatCurrency(supplierBill.remainingValue)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/supplier-bills/${supplierBill.id}`)}
                      fullWidth
                    >
                      Ver Detalhes da Conta
                    </Button>
                  </Grid>
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Informações da conta não disponíveis
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <PaymentModal
        open={paymentModalOpen}
        onClose={handlePaymentModalClose}
        onPaymentRecorded={handlePaymentRecorded}
        installment={installmentPayment}
      />
    </Box>
  );
}; 