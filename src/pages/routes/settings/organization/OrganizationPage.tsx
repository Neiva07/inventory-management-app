import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Alert,
  CircularProgress,
  Autocomplete,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useAuth } from '../../../../context/auth';
import { updateOrganization, deleteOrganization } from '../../../../model/organization';
import { states, citiesByState } from '../../../../model/region';
import { 
  isValidEmail, 
  validateCEP, 
  validatePhone, 
  validateCNPJ, 
  validateIE,
  formatCEP, 
  formatPhone, 
  formatCNPJ, 
  formatIE 
} from '../../../../lib/validation';

export const OrganizationPage = () => {
  const { organization } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [emailErrors, setEmailErrors] = useState<{ [key: string]: string }>({});
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // Organization form state
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    phoneNumber: '',
    email: '',
    address: {
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Brasil',
    },
    poc: {
      name: '',
      role: '',
      phoneNumber: '',
      email: '',
    },
    tax: {
      razaoSocial: '',
      cnpj: '',
      ie: '',
      im: '',
      a1Certificate: '',
    },
    settings: {
      timezone: 'America/Sao_Paulo',
      currency: 'BRL',
      language: 'pt-BR',
    },
  });

  // Load organization data
  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        domain: organization.domain || '',
        phoneNumber: organization.phoneNumber || '',
        email: organization.email || '',
        address: {
          streetAddress: organization.address?.streetAddress || '',
          city: organization.address?.city || '',
          state: organization.address?.state || '',
          zipCode: organization.address?.zipCode || '',
          country: organization.address?.country || 'Brasil',
        },
        poc: {
          name: organization.poc?.name || '',
          role: organization.poc?.role || '',
          phoneNumber: organization.poc?.phoneNumber || '',
          email: organization.poc?.email || '',
        },
        tax: {
          razaoSocial: organization.tax?.razaoSocial || '',
          cnpj: organization.tax?.cnpj || '',
          ie: organization.tax?.ie || '',
          im: organization.tax?.im || '',
          a1Certificate: organization.tax?.a1Certificate || '',
        },
        settings: {
          timezone: organization.settings?.timezone || 'America/Sao_Paulo',
          currency: organization.settings?.currency || 'BRL',
          language: organization.settings?.language || 'pt-BR',
        },
      });
    }
  }, [organization]);

  const handleInputChange = (field: string, value: string) => {
    // Clear errors when user starts typing
    if ((field === 'email' || field === 'pocEmail') && emailErrors[field]) {
      setEmailErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Format fields
    let formattedValue = value;
    if (field === 'zipCode') {
      formattedValue = formatCEP(value);
    } else if (field === 'phoneNumber' || field === 'pocPhoneNumber') {
      formattedValue = formatPhone(value);
    } else if (field === 'cnpj') {
      formattedValue = formatCNPJ(value);
    } else if (field === 'ie') {
      formattedValue = formatIE(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: formattedValue,
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    // Clear errors when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  const handlePocChange = (field: string, value: string) => {
    // Clear errors when user starts typing
    if (field === 'email' && emailErrors.pocEmail) {
      setEmailErrors(prev => ({ ...prev, pocEmail: '' }));
    }
    if (field === 'phoneNumber' && fieldErrors.pocPhoneNumber) {
      setFieldErrors(prev => ({ ...prev, pocPhoneNumber: '' }));
    }
    
    // Format phone field
    let formattedValue = value;
    if (field === 'phoneNumber') {
      formattedValue = formatPhone(value);
    }
    
    setFormData(prev => ({
      ...prev,
      poc: {
        ...prev.poc,
        [field]: formattedValue,
      },
    }));
  };

  const handleTaxChange = (field: string, value: string) => {
    // Clear errors when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Format fields
    let formattedValue = value;
    if (field === 'cnpj') {
      formattedValue = formatCNPJ(value);
    } else if (field === 'ie') {
      formattedValue = formatIE(value);
    }
    
    setFormData(prev => ({
      ...prev,
      tax: {
        ...prev.tax,
        [field]: formattedValue,
      },
    }));
  };

  const handleStateChange = (state: string | null) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        state: state || '',
        city: '', // Reset city when state changes
      },
    }));
    
    if (state) {
      // Find the state code from the state name
      const stateObj = states.find(s => s.name === state);
      if (stateObj && citiesByState.has(stateObj.code)) {
        setAvailableCities(citiesByState.get(stateObj.code) || []);
      } else {
        setAvailableCities([]);
      }
    } else {
      setAvailableCities([]);
    }
  };

  const handleCityChange = (city: string | null) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        city: city || '',
      },
    }));
  };

  const handleSave = async () => {
    if (!organization) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateOrganization(organization.id, {
        name: formData.name,
        domain: formData.domain,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        address: formData.address,
        poc: formData.poc,
        tax: formData.tax,
        settings: formData.settings,
      });

      setSuccess('Informações da organização atualizadas com sucesso!');
    } catch (err) {
      setError('Erro ao atualizar informações da organização. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!organization) return;

    setDeleting(true);
    try {
      await deleteOrganization(organization.id);
      setDeleteDialogOpen(false);
      // Redirect to home or show success message
      setSuccess('Organização excluída com sucesso!');
    } catch (err) {
      setError('Erro ao excluir organização. Tente novamente.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!organization) {
    return (
      <Alert severity="warning">
        Nenhuma organização encontrada. Entre em contato com o administrador.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Informações da Organização
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Informações Básicas
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome da Organização"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Domínio"
                  value={formData.domain}
                  onChange={(e) => handleInputChange('domain', e.target.value)}
                  size="small"
                  placeholder="exemplo.com"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefone"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  onBlur={(e) => {
                    const error = validatePhone(e.target.value);
                    if (error) {
                      setFieldErrors(prev => ({ ...prev, phoneNumber: error }));
                    }
                  }}
                  size="small"
                  error={!!fieldErrors.phoneNumber}
                  helperText={fieldErrors.phoneNumber}
                  placeholder="(11) 99999-9999"
                  inputProps={{ maxLength: 15 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={(e) => {
                      const email = e.target.value.trim();
                      if (email && !isValidEmail(email)) {
                        setEmailErrors(prev => ({ ...prev, email: 'Digite um email válido' }));
                      }
                    }}
                    size="small"
                    error={!!emailErrors.email}
                    placeholder="contato@empresa.com.br"
                  />
                  {emailErrors.email && (
                    <FormHelperText error>
                      {emailErrors.email}
                    </FormHelperText>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Address */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Endereço
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Endereço"
                  value={formData.address.streetAddress}
                  onChange={(e) => handleAddressChange('streetAddress', e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  options={states.map(state => state.name)}
                  value={formData.address.state}
                  onChange={(_, newValue) => handleStateChange(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Estado"
                      size="small"
                      required
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  options={availableCities}
                  value={formData.address.city}
                  onChange={(_, newValue) => handleCityChange(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Cidade"
                      size="small"
                      required
                      disabled={!formData.address.state}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="CEP"
                  value={formData.address.zipCode}
                  onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                  onBlur={(e) => {
                    const error = validateCEP(e.target.value);
                    if (error) {
                      setFieldErrors(prev => ({ ...prev, zipCode: error }));
                    }
                  }}
                  size="small"
                  error={!!fieldErrors.zipCode}
                  helperText={fieldErrors.zipCode}
                  placeholder="00000-000"
                  inputProps={{ maxLength: 9 }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Point of Contact */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Ponto de Contato
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome"
                  value={formData.poc.name}
                  onChange={(e) => handlePocChange('name', e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Cargo"
                  value={formData.poc.role}
                  onChange={(e) => handlePocChange('role', e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefone"
                  value={formData.poc.phoneNumber}
                  onChange={(e) => handlePocChange('phoneNumber', e.target.value)}
                  onBlur={(e) => {
                    const error = validatePhone(e.target.value);
                    if (error) {
                      setFieldErrors(prev => ({ ...prev, pocPhoneNumber: error }));
                    }
                  }}
                  size="small"
                  error={!!fieldErrors.pocPhoneNumber}
                  helperText={fieldErrors.pocPhoneNumber}
                  placeholder="(11) 99999-9999"
                  inputProps={{ maxLength: 15 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.poc.email}
                    onChange={(e) => handlePocChange('email', e.target.value)}
                    onBlur={(e) => {
                      const email = e.target.value.trim();
                      if (email && !isValidEmail(email)) {
                        setEmailErrors(prev => ({ ...prev, pocEmail: 'Digite um email válido' }));
                      }
                    }}
                    size="small"
                    error={!!emailErrors.pocEmail}
                    placeholder="contato@empresa.com.br"
                  />
                  {emailErrors.pocEmail && (
                    <FormHelperText error>
                      {emailErrors.pocEmail}
                    </FormHelperText>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Tax Information */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Informações Tributárias
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Razão Social"
                  value={formData.tax.razaoSocial}
                  onChange={(e) => handleTaxChange('razaoSocial', e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="CNPJ"
                  value={formData.tax.cnpj}
                  onChange={(e) => handleTaxChange('cnpj', e.target.value)}
                  onBlur={(e) => {
                    const error = validateCNPJ(e.target.value);
                    if (error) {
                      setFieldErrors(prev => ({ ...prev, cnpj: error }));
                    }
                  }}
                  size="small"
                  error={!!fieldErrors.cnpj}
                  helperText={fieldErrors.cnpj}
                  placeholder="00.000.000/0000-00"
                  inputProps={{ maxLength: 18 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Inscrição Estadual (IE)"
                  value={formData.tax.ie}
                  onChange={(e) => handleTaxChange('ie', e.target.value)}
                  onBlur={(e) => {
                    const error = validateIE(e.target.value);
                    if (error) {
                      setFieldErrors(prev => ({ ...prev, ie: error }));
                    }
                  }}
                  size="small"
                  error={!!fieldErrors.ie}
                  helperText={fieldErrors.ie}
                  placeholder="000.000.000.000"
                  inputProps={{ maxLength: 15 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Inscrição Municipal (IM)"
                  value={formData.tax.im}
                  onChange={(e) => handleTaxChange('im', e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Certificado A1"
                  value={formData.tax.a1Certificate}
                  onChange={(e) => handleTaxChange('a1Certificate', e.target.value)}
                  size="small"
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Organization Settings - Display Only */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Configurações da Organização
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Fuso Horário"
                  value={formData.settings.timezone}
                  size="small"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Moeda"
                  value={formData.settings.currency}
                  size="small"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Idioma"
                  value={formData.settings.language}
                  size="small"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
        <Button
          variant="outlined"
          color="error"
          onClick={() => setDeleteDialogOpen(true)}
          size="large"
        >
          Excluir Organização
        </Button>
        
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          size="large"
        >
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir esta organização? Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={deleting}
          >
            {deleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 