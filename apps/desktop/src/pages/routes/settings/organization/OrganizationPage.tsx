import { useState, useEffect } from 'react';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Textarea } from 'components/ui/textarea';
import { Spinner } from 'components/ui/spinner';
import { Alert, AlertDescription } from 'components/ui/alert';
import { Field, FieldLabel, FieldError } from 'components/ui/field';
import { DeleteConfirmationDialog } from 'components/DeleteConfirmationDialog';
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
    if ((field === 'email' || field === 'pocEmail') && emailErrors[field]) {
      setEmailErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }

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
    if (field === 'email' && emailErrors.pocEmail) {
      setEmailErrors(prev => ({ ...prev, pocEmail: '' }));
    }
    if (field === 'phoneNumber' && fieldErrors.pocPhoneNumber) {
      setFieldErrors(prev => ({ ...prev, pocPhoneNumber: '' }));
    }

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
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }

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
        city: '',
      },
    }));

    if (state) {
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
      setSuccess('Organização excluída com sucesso!');
    } catch (err) {
      setError('Erro ao excluir organização. Tente novamente.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (!organization) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Nenhuma organização encontrada. Entre em contato com o administrador.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <h3 className="mb-2 scroll-m-20 text-xl font-semibold tracking-tight">
        Informações da Organização
      </h3>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Basic Information */}
        <div className="col-span-12">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <p className="mb-2 text-base font-medium">
              Informações Básicas
            </p>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <Field>
                  <FieldLabel>Nome da Organização</FieldLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </Field>
              </div>
              <div className="col-span-12 md:col-span-6">
                <Field>
                  <FieldLabel>Domínio</FieldLabel>
                  <Input
                    value={formData.domain}
                    onChange={(e) => handleInputChange('domain', e.target.value)}
                    placeholder="exemplo.com"
                  />
                </Field>
              </div>
              <div className="col-span-12 md:col-span-6">
                <Field data-invalid={!!fieldErrors.phoneNumber}>
                  <FieldLabel>Telefone</FieldLabel>
                  <Input
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    onBlur={(e) => {
                      const validationError = validatePhone(e.target.value);
                      if (validationError) {
                        setFieldErrors(prev => ({ ...prev, phoneNumber: validationError }));
                      }
                    }}
                    aria-invalid={!!fieldErrors.phoneNumber}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                  />
                  {fieldErrors.phoneNumber && (
                    <FieldError>{fieldErrors.phoneNumber}</FieldError>
                  )}
                </Field>
              </div>
              <div className="col-span-12 md:col-span-6">
                <Field data-invalid={!!emailErrors.email}>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={(e) => {
                      const email = e.target.value.trim();
                      if (email && !isValidEmail(email)) {
                        setEmailErrors(prev => ({ ...prev, email: 'Digite um email válido' }));
                      }
                    }}
                    aria-invalid={!!emailErrors.email}
                    placeholder="contato@empresa.com.br"
                  />
                  {emailErrors.email && (
                    <FieldError>{emailErrors.email}</FieldError>
                  )}
                </Field>
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="col-span-12">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <p className="mb-2 text-base font-medium">
              Endereço
            </p>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <Field>
                  <FieldLabel>Endereço</FieldLabel>
                  <Input
                    value={formData.address.streetAddress}
                    onChange={(e) => handleAddressChange('streetAddress', e.target.value)}
                  />
                </Field>
              </div>
              <div className="col-span-12 md:col-span-4">
                <Field>
                  <FieldLabel>Estado</FieldLabel>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.address.state || ''}
                    onChange={(e) => handleStateChange(e.target.value || null)}
                  >
                    <option value="">Selecione</option>
                    {states.map((state) => (
                      <option key={state.code} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="col-span-12 md:col-span-4">
                <Field>
                  <FieldLabel>Cidade</FieldLabel>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.address.city || ''}
                    onChange={(e) => handleCityChange(e.target.value || null)}
                    disabled={!formData.address.state}
                  >
                    <option value="">Selecione</option>
                    {availableCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="col-span-12 md:col-span-4">
                <Field data-invalid={!!fieldErrors.zipCode}>
                  <FieldLabel>CEP</FieldLabel>
                  <Input
                    value={formData.address.zipCode}
                    onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                    onBlur={(e) => {
                      const validationError = validateCEP(e.target.value);
                      if (validationError) {
                        setFieldErrors(prev => ({ ...prev, zipCode: validationError }));
                      }
                    }}
                    aria-invalid={!!fieldErrors.zipCode}
                    placeholder="00000-000"
                    maxLength={9}
                  />
                  {fieldErrors.zipCode && (
                    <FieldError>{fieldErrors.zipCode}</FieldError>
                  )}
                </Field>
              </div>
            </div>
          </div>
        </div>

        {/* Point of Contact */}
        <div className="col-span-12">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <p className="mb-2 text-base font-medium">
              Ponto de Contato
            </p>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <Field>
                  <FieldLabel>Nome</FieldLabel>
                  <Input
                    value={formData.poc.name}
                    onChange={(e) => handlePocChange('name', e.target.value)}
                  />
                </Field>
              </div>
              <div className="col-span-12 md:col-span-6">
                <Field>
                  <FieldLabel>Cargo</FieldLabel>
                  <Input
                    value={formData.poc.role}
                    onChange={(e) => handlePocChange('role', e.target.value)}
                  />
                </Field>
              </div>
              <div className="col-span-12 md:col-span-6">
                <Field data-invalid={!!fieldErrors.pocPhoneNumber}>
                  <FieldLabel>Telefone</FieldLabel>
                  <Input
                    value={formData.poc.phoneNumber}
                    onChange={(e) => handlePocChange('phoneNumber', e.target.value)}
                    onBlur={(e) => {
                      const validationError = validatePhone(e.target.value);
                      if (validationError) {
                        setFieldErrors(prev => ({ ...prev, pocPhoneNumber: validationError }));
                      }
                    }}
                    aria-invalid={!!fieldErrors.pocPhoneNumber}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                  />
                  {fieldErrors.pocPhoneNumber && (
                    <FieldError>{fieldErrors.pocPhoneNumber}</FieldError>
                  )}
                </Field>
              </div>
              <div className="col-span-12 md:col-span-6">
                <Field data-invalid={!!emailErrors.pocEmail}>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    type="email"
                    value={formData.poc.email}
                    onChange={(e) => handlePocChange('email', e.target.value)}
                    onBlur={(e) => {
                      const email = e.target.value.trim();
                      if (email && !isValidEmail(email)) {
                        setEmailErrors(prev => ({ ...prev, pocEmail: 'Digite um email válido' }));
                      }
                    }}
                    aria-invalid={!!emailErrors.pocEmail}
                    placeholder="contato@empresa.com.br"
                  />
                  {emailErrors.pocEmail && (
                    <FieldError>{emailErrors.pocEmail}</FieldError>
                  )}
                </Field>
              </div>
            </div>
          </div>
        </div>

        {/* Tax Information */}
        <div className="col-span-12">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <p className="mb-2 text-base font-medium">
              Informações Tributárias
            </p>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <Field>
                  <FieldLabel>Razão Social</FieldLabel>
                  <Input
                    value={formData.tax.razaoSocial}
                    onChange={(e) => handleTaxChange('razaoSocial', e.target.value)}
                  />
                </Field>
              </div>
              <div className="col-span-12 md:col-span-6">
                <Field data-invalid={!!fieldErrors.cnpj}>
                  <FieldLabel>CNPJ</FieldLabel>
                  <Input
                    value={formData.tax.cnpj}
                    onChange={(e) => handleTaxChange('cnpj', e.target.value)}
                    onBlur={(e) => {
                      const validationError = validateCNPJ(e.target.value);
                      if (validationError) {
                        setFieldErrors(prev => ({ ...prev, cnpj: validationError }));
                      }
                    }}
                    aria-invalid={!!fieldErrors.cnpj}
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                  />
                  {fieldErrors.cnpj && (
                    <FieldError>{fieldErrors.cnpj}</FieldError>
                  )}
                </Field>
              </div>
              <div className="col-span-12 md:col-span-6">
                <Field data-invalid={!!fieldErrors.ie}>
                  <FieldLabel>Inscrição Estadual (IE)</FieldLabel>
                  <Input
                    value={formData.tax.ie}
                    onChange={(e) => handleTaxChange('ie', e.target.value)}
                    onBlur={(e) => {
                      const validationError = validateIE(e.target.value);
                      if (validationError) {
                        setFieldErrors(prev => ({ ...prev, ie: validationError }));
                      }
                    }}
                    aria-invalid={!!fieldErrors.ie}
                    placeholder="000.000.000.000"
                    maxLength={15}
                  />
                  {fieldErrors.ie && (
                    <FieldError>{fieldErrors.ie}</FieldError>
                  )}
                </Field>
              </div>
              <div className="col-span-12 md:col-span-6">
                <Field>
                  <FieldLabel>Inscrição Municipal (IM)</FieldLabel>
                  <Input
                    value={formData.tax.im}
                    onChange={(e) => handleTaxChange('im', e.target.value)}
                  />
                </Field>
              </div>
              <div className="col-span-12">
                <Field>
                  <FieldLabel>Certificado A1</FieldLabel>
                  <Textarea
                    value={formData.tax.a1Certificate}
                    onChange={(e) => handleTaxChange('a1Certificate', e.target.value)}
                    rows={3}
                  />
                </Field>
              </div>
            </div>
          </div>
        </div>

        {/* Organization Settings - Display Only */}
        <div className="col-span-12">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <p className="mb-2 text-base font-medium">
              Configurações da Organização
            </p>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-4">
                <Field>
                  <FieldLabel>Fuso Horário</FieldLabel>
                  <Input value={formData.settings.timezone} readOnly />
                </Field>
              </div>
              <div className="col-span-12 md:col-span-4">
                <Field>
                  <FieldLabel>Moeda</FieldLabel>
                  <Input value={formData.settings.currency} readOnly />
                </Field>
              </div>
              <div className="col-span-12 md:col-span-4">
                <Field>
                  <FieldLabel>Idioma</FieldLabel>
                  <Input value={formData.settings.language} readOnly />
                </Field>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setDeleteDialogOpen(true)}
          className="text-destructive border-destructive hover:bg-destructive/10"
        >
          Excluir Organização
        </Button>

        <Button
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={() => {
          void handleDelete();
        }}
        resourceName="organização"
      />
    </div>
  );
};
