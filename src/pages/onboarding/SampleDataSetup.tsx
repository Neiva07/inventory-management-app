import React from 'react';
import { 
  Typography, 
  Box, 
  FormControlLabel, 
  Checkbox, 
  Alert, 
  Card, 
  CardContent, 
  Grid, 
  Chip,
  Paper,
  ChipProps,
} from '@mui/material';
import {
  DataObject as DataIcon,
  Inventory as ProductIcon,
  People as CustomerIcon,
  Business as SupplierIcon,
  Category as CategoryIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useOnboarding } from '../../context/onboarding';

export const SampleDataSetup: React.FC = () => {
  const { onboardingData, updateData, setStepValidation } = useOnboarding();

  React.useEffect(() => {
    setStepValidation(3, true);
  }, [setStepValidation]);

  const handleSetupChange = (field: string, value: boolean) => {
    updateData({
      setup: {
        ...onboardingData.setup,
        [field]: value,
      },
    });
  };

  const sampleDataItems = [
    {
      icon: <ProductIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
      title: 'Produtos',
      count: '10 produtos',
      description: 'Produtos de exemplo com variações e categorias',
      color: 'primary' as ChipProps['color']
    },
    {
      icon: <CustomerIcon sx={{ fontSize: 32, color: 'success.main' }} />,
      title: 'Clientes',
      count: '5 clientes',
      description: 'Clientes de exemplo com dados completos',
      color: 'success' as ChipProps['color']
    },
    {
      icon: <SupplierIcon sx={{ fontSize: 32, color: 'warning.main' }} />,
      title: 'Fornecedores',
      count: '3 fornecedores',
      description: 'Fornecedores de exemplo com informações de contato',
      color: 'warning' as ChipProps['color']
    },
    {
      icon: <CategoryIcon sx={{ fontSize: 32, color: 'info.main' }} />,
      title: 'Categorias',
      count: 'Categorias e Unidades',
      description: 'Categorias de produtos e unidades de medida',
      color: 'info' as ChipProps['color']
    }
  ];

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{ mb: 2 }}>
          <DataIcon sx={{ fontSize: 64, color: 'primary.main' }} />
        </Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
          Dados de Exemplo
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Comece com dados prontos para usar
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 600, mx: 'auto', color: 'text.secondary' }}>
          Criamos dados de exemplo para que você possa explorar todas as funcionalidades do Stockify 
          sem precisar começar do zero. Você pode personalizar ou remover esses dados a qualquer momento.
        </Typography>
      </Box>

      {/* Info Alert */}
      <Alert 
        severity="info" 
        icon={<InfoIcon />}
        sx={{ 
          mb: 4, 
          borderRadius: 2,
          '& .MuiAlert-message': { fontSize: '1rem' }
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          Recomendado para novos usuários
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          Você sempre pode adicionar, modificar ou remover esses dados de exemplo posteriormente.
        </Typography>
      </Alert>

      {/* Main Option */}
      <Box sx={{ mb: 4 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={onboardingData.setup?.importSampleData || false}
              onChange={(e) => handleSetupChange('importSampleData', e.target.checked)}
              sx={{ 
                '& .MuiSvgIcon-root': { fontSize: 28 },
                '&.Mui-checked': { color: 'primary.main' }
              }}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckIcon sx={{ color: 'success.main', fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Criar dados de exemplo
              </Typography>
            </Box>
          }
          sx={{ 
            m: 0,
            '& .MuiFormControlLabel-label': { width: '100%' }
          }}
        />
      </Box>

      {/* Sample Data Preview */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          O que será criado:
        </Typography>
        
        <Grid container spacing={3}>
          {sampleDataItems.map((item, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Paper 
                elevation={1}
                sx={{ 
                  p: 2, 
                  height: '100%',
                  borderRadius: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 2
                  }
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    {item.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {item.title}
                  </Typography>
                  <Chip
                    label={item.count}
                    color={item.color}
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Benefits Section */}
      <Card sx={{ borderRadius: 3, bgcolor: 'grey.50' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Benefícios dos dados de exemplo:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckIcon sx={{ color: 'success.main', fontSize: 20 }} />
                <Typography variant="body2">
                  Explore todas as funcionalidades
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckIcon sx={{ color: 'success.main', fontSize: 20 }} />
                <Typography variant="body2">
                  Aprenda com exemplos práticos
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckIcon sx={{ color: 'success.main', fontSize: 20 }} />
                <Typography variant="body2">
                  Personalize conforme necessário
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}; 
