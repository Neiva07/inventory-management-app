import React from 'react';
import { 
  Typography, 
  Box, 
  Alert, 
  Card, 
  CardContent, 
  Grid, 
  Chip,
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
  DataObject as DataIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useOnboarding } from '../../context/onboarding';

export const OnboardingComplete: React.FC = () => {
  const { onboardingData } = useOnboarding();

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
        
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'success.main' }}>
          Tudo Pronto! 🎉
        </Typography>
        
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Bem-vindo ao Stockify!
        </Typography>
        
        <Typography variant="body1" sx={{ maxWidth: 600, mx: 'auto', color: 'text.secondary' }}>
          Sua organização foi configurada com sucesso. Aqui está um resumo de tudo que foi configurado:
        </Typography>
      </Box>

      {/* Organization Summary */}
      {onboardingData.organization && (
        <Card sx={{ mb: 4, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <BusinessIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Informações da Organização
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Nome da Organização
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {onboardingData.organization.name}
                  </Typography>
                </Box>
              </Grid>
              
              {onboardingData.organization.domain && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Domínio
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {onboardingData.organization.domain}
                    </Typography>
                  </Box>
                </Grid>
              )}
              

              
              {onboardingData.organization.employeeCount && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Número de Funcionários
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {onboardingData.organization.employeeCount}
                    </Typography>
                  </Box>
                </Grid>
              )}
              
              {(onboardingData.organization.address || onboardingData.organization.state || onboardingData.organization.city || onboardingData.organization.zipCode) && (
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Localização
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {[
                          onboardingData.organization.address,
                          onboardingData.organization.city,
                          onboardingData.organization.state,
                          onboardingData.organization.zipCode
                        ].filter(Boolean).join(', ')}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
              
              {(onboardingData.organization.organizationEmail || onboardingData.organization.organizationPhoneNumber) && (
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Contato da Organização
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {onboardingData.organization.organizationEmail && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {onboardingData.organization.organizationEmail}
                          </Typography>
                        </Box>
                      )}
                      {onboardingData.organization.organizationPhoneNumber && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {onboardingData.organization.organizationPhoneNumber}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Grid>
              )}
              
              {(onboardingData.organization.pocName || onboardingData.organization.pocEmail) && (
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Ponto de Contato Principal
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {onboardingData.organization.pocName && (
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {onboardingData.organization.pocName}
                          {onboardingData.organization.pocRole && ` (${onboardingData.organization.pocRole})`}
                        </Typography>
                      )}
                      {onboardingData.organization.pocEmail && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {onboardingData.organization.pocEmail}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Sample Data Summary */}
      {onboardingData.setup?.importSampleData && (
        <Card sx={{ mb: 4, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <DataIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Dados de Exemplo
              </Typography>
            </Box>
            
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
              Recursos que serão criados:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip 
                label="10 Produtos" 
                color="primary" 
                variant="outlined" 
                size="small"
                icon={<Box>📦</Box>}
              />
              <Chip 
                label="5 Clientes" 
                color="success" 
                variant="outlined" 
                size="small"
                icon={<Box>👥</Box>}
              />
              <Chip 
                label="3 Fornecedores" 
                color="warning" 
                variant="outlined" 
                size="small"
                icon={<Box>🏢</Box>}
              />
              <Chip 
                label="Categorias" 
                color="info" 
                variant="outlined" 
                size="small"
                icon={<Box>📂</Box>}
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Tax Data Summary */}
      {onboardingData.taxData && (
        <Card sx={{ mb: 4, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <DataIcon sx={{ fontSize: 32, color: 'success.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Dados Tributários
              </Typography>
            </Box>
            
            {/* NFE Requirements Status */}
            {(() => {
              const taxData = onboardingData.taxData;
              const hasCNPJ = taxData?.cnpj && taxData.cnpj.replace(/\D/g, '').length === 14;
              const hasIE = taxData?.ie && taxData.ie.replace(/\D/g, '').length >= 8;
              const hasCompanyName = taxData?.razaoSocial && taxData.razaoSocial.trim().length > 0;
              const hasA1Certificate = taxData?.a1Certificate && taxData.a1Certificate.trim().length > 0;
              const allComplete = hasCNPJ && hasIE && hasCompanyName && hasA1Certificate;
              
              return (
                <Alert 
                  severity={allComplete ? 'success' : 'warning'} 
                  sx={{ mb: 3 }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {allComplete 
                      ? '✅ Todos os requisitos para emissão de NFEs estão preenchidos!' 
                      : '⚠️ Alguns requisitos para emissão de NFEs ainda precisam ser preenchidos.'
                    }
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {allComplete 
                      ? 'Você poderá emitir notas fiscais eletrônicas após completar o onboarding.'
                      : 'Você pode completar o onboarding e adicionar essas informações posteriormente.'
                    }
                  </Typography>
                </Alert>
              );
            })()}
            
            <Grid container spacing={2}>
              {onboardingData.taxData.cnpj && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      CNPJ
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {onboardingData.taxData.cnpj}
                    </Typography>
                  </Box>
                </Grid>
              )}
              
              {onboardingData.taxData.ie && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Inscrição Estadual (IE)
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {onboardingData.taxData.ie}
                    </Typography>
                  </Box>
                </Grid>
              )}
              
              {onboardingData.taxData.razaoSocial && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Razão Social
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {onboardingData.taxData.razaoSocial}
                    </Typography>
                  </Box>
                </Grid>
              )}
              
              {onboardingData.taxData.a1Certificate && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Certificado A1
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {onboardingData.taxData.a1Certificate}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Team Members Summary */}
      {onboardingData.invitations && onboardingData.invitations.length > 0 && (
        <Card sx={{ mb: 4, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <GroupIcon sx={{ fontSize: 32, color: 'info.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Membros da Equipe
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {onboardingData.invitations.length} membro(s) convidado(s):
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {onboardingData.invitations.map((invitation) => {
                const role = invitation.role;
                return (
                  <Chip
                    key={invitation.email}
                    label={`${invitation.email} (${role === 'manager' ? 'Gerente' : role === 'operator' ? 'Operador' : 'Visualizador'})`}
                    color={role === 'manager' ? 'error' : role === 'operator' ? 'primary' : 'success'}
                    variant="outlined"
                    size="small"
                  />
                );
              })}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Debug info - remove this later */}
      {process.env.NODE_ENV === 'development' && (
        <Card sx={{ mb: 4, borderRadius: 2, border: '1px dashed #ccc' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Debug Info (Development Only)
            </Typography>
            <Typography variant="body2" component="pre" sx={{ fontSize: '12px', overflow: 'auto' }}>
              {JSON.stringify(onboardingData, null, 2)}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      <Alert severity="success" sx={{ borderRadius: 2 }}>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          Sua organização <strong>{onboardingData.organization?.name}</strong> está pronta para uso!
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Você pode começar a gerenciar seu estoque imediatamente.
        </Typography>
      </Alert>
    </Box>
  );
}; 