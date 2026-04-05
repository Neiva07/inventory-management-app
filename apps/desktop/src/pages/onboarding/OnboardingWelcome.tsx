import React from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Avatar,
  Chip,
  Divider
} from 'components/ui/form-compat';
import {
  Business as BusinessIcon,
  Settings as SettingsIcon,
  DataObject as DataIcon,
  Group as GroupIcon,
  CheckCircle as CheckIcon,
  TrendingUp as TrendingIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon
} from 'components/ui/icon-compat';
import logo from '../../../assets/icons/logo.png';

export const OnboardingWelcome: React.FC = () => {

  const features = [
    {
      icon: <BusinessIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Configurar sua organização',
      description: 'Defina o nome, setor, endereço e contatos da sua empresa'
    },
    {
      icon: <SettingsIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      title: 'Dados fiscais',
      description: 'Configure CNPJ, IE, regime tributário e impostos'
    },
    {
      icon: <DataIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      title: 'Criar dados de exemplo',
      description: 'Comece com produtos e clientes de exemplo'
    },
    {
      icon: <GroupIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      title: 'Convidar membros da equipe',
      description: 'Adicione colaboradores com diferentes permissões'
    }
  ];

  const benefits = [
    { icon: <SpeedIcon />, text: 'Rápido e eficiente' },
    { icon: <SecurityIcon />, text: 'Seguro e confiável' },
    { icon: <TrendingIcon />, text: 'Crescimento garantido' }
  ];

  return (
    <Box sx={{ textAlign: 'center' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img 
            src={logo} 
            alt="Stockify Logo" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain' 
            }} 
          />
        </Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
          Bem-vindo ao Stockify! 🎉
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Sua solução completa de gestão de estoque
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
          Vamos configurar tudo em poucos passos para que você possa começar a gerenciar seu estoque de forma eficiente e profissional.
        </Typography>
      </Box>

      {/* Benefits Chips */}
      <Box sx={{ mb: 4 }}>
        {benefits.map((benefit, index) => (
          <Chip
            key={index}
            icon={benefit.icon}
            label={benefit.text}
            variant="outlined"
            sx={{ 
              mx: 1, 
              mb: 1,
              '& .MuiChip-icon': { color: 'primary.main' }
            }}
          />
        ))}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Features Grid */}
      <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        O que vamos configurar:
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Call to Action */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
          Pronto para começar?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Vamos configurar sua organização em poucos passos simples
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <CheckIcon sx={{ color: 'success.main', fontSize: 20 }} />
          <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
            Clique em "Próximo" para continuar
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}; 
