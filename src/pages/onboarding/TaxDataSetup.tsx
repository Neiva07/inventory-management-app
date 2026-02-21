import React, { useState } from 'react';
import { 
  Typography, 
  TextField, 
  Box, 
  Grid,
  Card,
  CardContent,
  Button,
  Alert
} from '@mui/material';
import { 
  Receipt as ReceiptIcon,
  Business as BusinessIcon,
  Upload as UploadIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { useOnboarding } from '../../context/onboarding';

export const TaxDataSetup: React.FC = () => {
  const { onboardingData, updateData, setStepValidation } = useOnboarding();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  React.useEffect(() => {
    setStepValidation(4, true);
  }, [setStepValidation]);

  const handleTaxDataChange = (field: string, value: string) => {
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    updateData({
      taxData: {
        ...onboardingData.taxData,
        [field]: value,
      },
    });
  };

  const validateCNPJ = (cnpj: string) => {
    // Remove non-digits
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    
    if (cleanCNPJ.length !== 14) {
      return 'CNPJ deve ter 14 dígitos';
    }
    
    // Basic CNPJ validation (simplified)
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) {
      return 'CNPJ inválido';
    }
    
    return '';
  };

  const validateIE = (ie: string) => {
    // Remove non-digits
    const cleanIE = ie.replace(/\D/g, '');
    
    if (cleanIE.length < 8 || cleanIE.length > 12) {
      return 'IE deve ter entre 8 e 12 dígitos';
    }
    
    return '';
  };

  const formatCNPJ = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 14) {
      return cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return value;
  };

  const formatIE = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 12) {
      return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '$1.$2.$3.$4');
    }
    return value;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you would upload this to your server
      // For now, we'll just store the filename
      handleTaxDataChange('a1Certificate', file.name);
    }
  };

  // Check if all NFE requirements are met
  const checkNFERequirements = () => {
    const taxData = onboardingData.taxData;
    const hasCNPJ = taxData?.cnpj && taxData.cnpj.replace(/\D/g, '').length === 14;
    const hasIE = taxData?.ie && taxData.ie.replace(/\D/g, '').length >= 8;
    const hasCompanyName = taxData?.razaoSocial && taxData.razaoSocial.trim().length > 0;
    const hasA1Certificate = taxData?.a1Certificate && taxData.a1Certificate.trim().length > 0;
    
    return {
      cnpj: hasCNPJ,
      ie: hasIE,
      companyName: hasCompanyName,
      a1Certificate: hasA1Certificate,
      allComplete: hasCNPJ && hasIE && hasCompanyName && hasA1Certificate
    };
  };

  const nfeRequirements = checkNFERequirements();

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{ mb: 2 }}>
          <ReceiptIcon sx={{ fontSize: 64, color: 'primary.main' }} />
        </Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
          Dados Tributários
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Configure as informações tributárias da sua empresa
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 600, mx: 'auto', color: 'text.secondary' }}>
          Essas informações são necessárias para emissão de notas fiscais e validação de NFEs. 
          Você pode preencher essas informações agora ou adicioná-las posteriormente.
        </Typography>
      </Box>

      {/* Company Registration */}
      <Card sx={{ mb: 4, borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <BusinessIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Registro da Empresa
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CNPJ"
                value={onboardingData.taxData?.cnpj || ''}
                onChange={(e) => {
                  const formatted = formatCNPJ(e.target.value);
                  handleTaxDataChange('cnpj', formatted);
                }}
                onBlur={(e) => {
                  const error = validateCNPJ(e.target.value);
                  if (error) {
                    setErrors(prev => ({ ...prev, cnpj: error }));
                  }
                }}
                placeholder="00.000.000/0000-00"
                error={!!errors.cnpj}
                helperText={errors.cnpj}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Inscrição Estadual (IE)"
                value={onboardingData.taxData?.ie || ''}
                onChange={(e) => {
                  const formatted = formatIE(e.target.value);
                  handleTaxDataChange('ie', formatted);
                }}
                onBlur={(e) => {
                  const error = validateIE(e.target.value);
                  if (error) {
                    setErrors(prev => ({ ...prev, ie: error }));
                  }
                }}
                placeholder="000.000.000.000"
                error={!!errors.ie}
                helperText={errors.ie}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Inscrição Municipal (IM)"
                value={onboardingData.taxData?.im || ''}
                onChange={(e) => handleTaxDataChange('im', e.target.value)}
                placeholder="000000000"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Razão Social"
                value={onboardingData.taxData?.razaoSocial || ''}
                onChange={(e) => handleTaxDataChange('razaoSocial', e.target.value)}
                placeholder="Nome completo da empresa"
                required
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* A1 Certificate Upload */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <UploadIcon sx={{ fontSize: 32, color: 'success.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Certificado Digital A1
            </Typography>
          </Box>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              O certificado A1 é necessário para emissão e validação de notas fiscais eletrônicas (NFEs).
            </Typography>
          </Alert>

          <Box sx={{ textAlign: 'center' }}>
            {onboardingData.taxData?.a1Certificate ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
                <CheckIcon sx={{ color: 'success.main' }} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Certificado carregado: {onboardingData.taxData.a1Certificate}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Nenhum certificado carregado
              </Typography>
            )}
            
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              sx={{ mt: 1 }}
            >
              Carregar Certificado A1
              <input
                type="file"
                hidden
                accept=".pfx,.p12"
                onChange={handleFileUpload}
              />
            </Button>
            
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Formatos aceitos: .pfx, .p12
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* NFE Requirements Status */}
      <Card sx={{ borderRadius: 2, mt: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <CheckIcon sx={{ fontSize: 32, color: nfeRequirements.allComplete ? 'success.main' : 'warning.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Status para Emissão de NFEs
            </Typography>
          </Box>
          
          <Alert 
            severity={nfeRequirements.allComplete ? 'success' : 'warning'} 
            sx={{ mb: 3 }}
          >
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {nfeRequirements.allComplete 
                ? '✅ Todos os requisitos para emissão de NFEs estão preenchidos!' 
                : '⚠️ Alguns requisitos para emissão de NFEs ainda precisam ser preenchidos.'
              }
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {nfeRequirements.allComplete 
                ? 'Você poderá emitir notas fiscais eletrônicas após completar o onboarding.'
                : 'Você pode completar o onboarding e adicionar essas informações posteriormente.'
              }
            </Typography>
          </Alert>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {nfeRequirements.cnpj ? (
                  <CheckIcon sx={{ color: 'success.main', fontSize: 20 }} />
                ) : (
                  <Box sx={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #ccc' }} />
                )}
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  CNPJ
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {nfeRequirements.ie ? (
                  <CheckIcon sx={{ color: 'success.main', fontSize: 20 }} />
                ) : (
                  <Box sx={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #ccc' }} />
                )}
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Inscrição Estadual (IE)
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {nfeRequirements.companyName ? (
                  <CheckIcon sx={{ color: 'success.main', fontSize: 20 }} />
                ) : (
                  <Box sx={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #ccc' }} />
                )}
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Razão Social
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {nfeRequirements.a1Certificate ? (
                  <CheckIcon sx={{ color: 'success.main', fontSize: 20 }} />
                ) : (
                  <Box sx={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #ccc' }} />
                )}
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Certificado A1
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}; 
