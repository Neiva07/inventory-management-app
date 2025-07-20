import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  TextField, 
  Box, 
  Grid,
  Card,
  CardContent,
  Autocomplete,
  FormHelperText,
  Alert
} from '@mui/material';
import { useOnboarding } from '../../context/onboarding';
import { states, citiesByState } from '../../model/region';
import { isValidEmail } from '../../lib/email';

export const OrganizationSetup: React.FC = () => {
  const { onboardingData, updateData, setStepValidation } = useOnboarding();
  const [stateOptions, setStateOptions] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [emailErrors, setEmailErrors] = useState<{ [key: string]: string }>({});
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // Validation functions
  const validateCEP = (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length !== 8) {
      return 'CEP deve ter 8 dígitos';
    }
    return '';
  };

  const validatePhone = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 11) {
      return 'Telefone deve ter 11 dígitos (DDD + número)';
    }
    return '';
  };

  const formatCEP = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 8) {
      return cleanValue.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    return value;
  };

  const formatPhone = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 11) {
      return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  // Validation function
  const validateOrganizationData = () => {
    const org = onboardingData.organization;
    const errors: string[] = [];

    // Required fields
    if (!org?.name?.trim()) errors.push('Nome da Organização');
    if (!org?.employeeCount?.trim()) errors.push('Número de Funcionários');
    if (!org?.address?.trim()) errors.push('Endereço');
    if (!org?.state?.trim()) errors.push('Estado');
    if (!org?.city?.trim()) errors.push('Cidade');
    if (!org?.zipCode?.trim()) errors.push('CEP');
    if (!org?.organizationPhoneNumber?.trim()) errors.push('Telefone da Organização');
    if (!org?.organizationEmail?.trim()) errors.push('Email da Organização');
    if (!org?.pocName?.trim()) errors.push('Nome do Contato');
    if (!org?.pocRole?.trim()) errors.push('Cargo do Contato');
    if (!org?.pocPhoneNumber?.trim()) errors.push('Telefone do Contato');
    if (!org?.pocEmail?.trim()) errors.push('Email do Contato');

    // Email validation
    if (org?.organizationEmail && !isValidEmail(org.organizationEmail)) {
      errors.push('Email da Organização (formato inválido)');
    }
    if (org?.pocEmail && !isValidEmail(org.pocEmail)) {
      errors.push('Email do Contato (formato inválido)');
    }

    // CEP validation
    if (org?.zipCode && validateCEP(org.zipCode)) {
      errors.push('CEP (formato inválido)');
    }

    // Phone validation
    if (org?.organizationPhoneNumber && validatePhone(org.organizationPhoneNumber)) {
      errors.push('Telefone da Organização (formato inválido)');
    }
    if (org?.pocPhoneNumber && validatePhone(org.pocPhoneNumber)) {
      errors.push('Telefone do Contato (formato inválido)');
    }

    return errors;
  };

  const validationErrors = validateOrganizationData();
  const isValid = validationErrors.length === 0;

  // Update validation state in context
  React.useEffect(() => {
    setStepValidation(2, isValid); // Step 2 is Organization Setup
  }, [isValid, setStepValidation]);

  useEffect(() => {
    // Convert states array to just the names for the autocomplete
    setStateOptions(states.map(state => state.name));
  }, []);

  const handleStateChange = (state: string | null) => {
    updateData({
      organization: {
        ...onboardingData.organization,
        state: state || '',
        city: '', // Reset city when state changes
      },
    });
    
    if (state) {
      // Find the state code from the state name
      const stateObj = states.find(s => s.name === state);
      if (stateObj && citiesByState.has(stateObj.code)) {
        setCities(citiesByState.get(stateObj.code) || []);
      } else {
        setCities([]);
      }
    } else {
      setCities([]);
    }
  };

  const handleOrganizationChange = (field: string, value: string) => {
    // Clear errors when user starts typing
    if ((field === 'organizationEmail' || field === 'pocEmail') && emailErrors[field]) {
      setEmailErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Format fields
    let formattedValue = value;
    if (field === 'zipCode') {
      formattedValue = formatCEP(value);
    } else if (field === 'organizationPhoneNumber' || field === 'pocPhoneNumber') {
      formattedValue = formatPhone(value);
    }
    
    updateData({
      organization: {
        ...onboardingData.organization,
        [field]: formattedValue,
      },
    });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Configuração da Organização
      </Typography>
      <Typography variant="body1" paragraph>
        Conte-nos sobre sua organização para personalizar sua experiência.
      </Typography>

      {/* Validation Alert - Fixed Height Container */}
      <Box sx={{ 
        height: 120, 
        mb: 3,
        display: 'flex',
        alignItems: 'flex-start'
      }}>
        {validationErrors.length > 0 ? (
          <Alert severity="error" sx={{ width: '100%', height: '100%' }}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Por favor, preencha todos os campos obrigatórios:
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, lineHeight: 1.4 }}>
                {validationErrors.join(', ')}
              </Typography>
            </Box>
          </Alert>
        ) : (
          <Alert severity="success" sx={{ width: '100%', height: '100%' }}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                ✅ Todos os campos obrigatórios foram preenchidos!
              </Typography>
            </Box>
          </Alert>
        )}
      </Box>

      {/* Basic Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Informações Básicas
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome da Organização"
                value={onboardingData.organization?.name || ''}
                onChange={(e) => handleOrganizationChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Domínio (opcional)"
                value={onboardingData.organization?.domain || ''}
                onChange={(e) => handleOrganizationChange('domain', e.target.value)}
                placeholder="ex: empresa.com.br"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Número de Funcionários"
                type="number"
                value={onboardingData.organization?.employeeCount || ''}
                onChange={(e) => handleOrganizationChange('employeeCount', e.target.value)}
                placeholder="ex: 50"
                required
              />
            </Grid>

          </Grid>
        </CardContent>
      </Card>

      {/* Location Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Localização
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Endereço"
                value={onboardingData.organization?.address || ''}
                onChange={(e) => handleOrganizationChange('address', e.target.value)}
                placeholder="Rua, número, complemento"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={stateOptions}
                value={onboardingData.organization?.state || ''}
                onChange={(_, newValue) => handleStateChange(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Estado"
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={cities}
                value={onboardingData.organization?.city || ''}
                onChange={(_, newValue) => handleOrganizationChange('city', newValue || '')}
                disabled={!onboardingData.organization?.state}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Cidade"
                    required
                    helperText={!onboardingData.organization?.state ? 'Selecione um estado primeiro' : ''}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CEP"
                value={onboardingData.organization?.zipCode || ''}
                onChange={(e) => handleOrganizationChange('zipCode', e.target.value)}
                onBlur={(e) => {
                  const error = validateCEP(e.target.value);
                  if (error) {
                    setFieldErrors(prev => ({ ...prev, zipCode: error }));
                  }
                }}
                placeholder="00000-000"
                required
                error={!!fieldErrors.zipCode}
                helperText={fieldErrors.zipCode}
                inputProps={{
                  maxLength: 9
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Organization Contact */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Contato da Organização
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Telefone da Organização"
                value={onboardingData.organization?.organizationPhoneNumber || ''}
                onChange={(e) => handleOrganizationChange('organizationPhoneNumber', e.target.value)}
                onBlur={(e) => {
                  const error = validatePhone(e.target.value);
                  if (error) {
                    setFieldErrors(prev => ({ ...prev, organizationPhoneNumber: error }));
                  }
                }}
                placeholder="(11) 99999-9999"
                required
                error={!!fieldErrors.organizationPhoneNumber}
                helperText={fieldErrors.organizationPhoneNumber}
                inputProps={{
                  maxLength: 15
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <TextField
                  fullWidth
                  label="Email da Organização"
                  type="email"
                  value={onboardingData.organization?.organizationEmail || ''}
                  onChange={(e) => handleOrganizationChange('organizationEmail', e.target.value)}
                  onBlur={(e) => {
                    const email = e.target.value.trim();
                    if (email && !isValidEmail(email)) {
                      setEmailErrors(prev => ({ ...prev, organizationEmail: 'Digite um email válido' }));
                    }
                  }}
                  placeholder="contato@empresa.com.br"
                  required
                  error={!!emailErrors.organizationEmail}
                />
                {emailErrors.organizationEmail && (
                  <FormHelperText error>
                    {emailErrors.organizationEmail}
                  </FormHelperText>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Point of Contact */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Ponto de Contato Principal
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome do Contato"
                value={onboardingData.organization?.pocName || ''}
                onChange={(e) => handleOrganizationChange('pocName', e.target.value)}
                placeholder="Nome completo"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cargo"
                value={onboardingData.organization?.pocRole || ''}
                onChange={(e) => handleOrganizationChange('pocRole', e.target.value)}
                placeholder="ex: Gerente de TI"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Telefone do Contato"
                value={onboardingData.organization?.pocPhoneNumber || ''}
                onChange={(e) => handleOrganizationChange('pocPhoneNumber', e.target.value)}
                onBlur={(e) => {
                  const error = validatePhone(e.target.value);
                  if (error) {
                    setFieldErrors(prev => ({ ...prev, pocPhoneNumber: error }));
                  }
                }}
                placeholder="(11) 99999-9999"
                required
                error={!!fieldErrors.pocPhoneNumber}
                helperText={fieldErrors.pocPhoneNumber}
                inputProps={{
                  maxLength: 15
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <TextField
                  fullWidth
                  label="Email do Contato"
                  type="email"
                  value={onboardingData.organization?.pocEmail || ''}
                  onChange={(e) => handleOrganizationChange('pocEmail', e.target.value)}
                  onBlur={(e) => {
                    const email = e.target.value.trim();
                    if (email && !isValidEmail(email)) {
                      setEmailErrors(prev => ({ ...prev, pocEmail: 'Digite um email válido' }));
                    }
                  }}
                  placeholder="contato@empresa.com.br"
                  required
                  error={!!emailErrors.pocEmail}
                />
                {emailErrors.pocEmail && (
                  <FormHelperText error>
                    {emailErrors.pocEmail}
                  </FormHelperText>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}; 