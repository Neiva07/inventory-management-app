import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card';
import { Input } from 'components/ui/input';
import { cn } from 'lib/utils';
import { useOnboarding } from '../../context/onboarding';
import { states, citiesByState } from '../../model/region';
import { isValidEmail } from '../../lib/email';
import { DevFillButton } from '../../dev/useDevFill';
import { makeOrganizationSetupValues } from '../../dev/formValues';

interface OrganizationSetupProps {
  showErrors?: boolean;
}

export const OrganizationSetup: React.FC<OrganizationSetupProps> = ({ showErrors = false }) => {
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

  const requiredFieldError = (fieldValue: string | undefined) =>
    showErrors && !fieldValue?.trim() ? 'border-destructive focus-visible:ring-destructive' : '';

  // Update validation state in context
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    setStepValidation(2, isValid);
  }, [isValid]);

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

  const handleDevFill = () => {
    const values = makeOrganizationSetupValues();
    if (values.state) {
      const stateObj = states.find((s) => s.name === values.state);
      if (stateObj && citiesByState.has(stateObj.code)) {
        setCities(citiesByState.get(stateObj.code) ?? []);
      }
    }
    updateData({ organization: values });
  };

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">
            Configuração da Organização
          </h2>
          <p className="text-base text-muted-foreground">
            Conte-nos sobre sua organização para personalizar sua experiência.
          </p>
        </div>
        <DevFillButton onFill={handleDevFill} />
      </div>

      {/* Validation Alert - only shown after user tries to advance */}
      {showErrors && validationErrors.length > 0 && (
        <div className="mb-6 rounded-md border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm font-medium text-destructive">
              Preencha os campos obrigatórios destacados abaixo
            </p>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <div className="col-span-1">
              <label className="text-sm font-medium leading-none mb-1.5 block">
                Nome da Organização <span className="text-destructive">*</span>
              </label>
              <Input
                value={onboardingData.organization?.name || ''}
                onChange={(e) => handleOrganizationChange('name', e.target.value)}
                className={cn(requiredFieldError(onboardingData.organization?.name))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium leading-none mb-1.5 block">
                  Domínio (opcional)
                </label>
                <Input
                  value={onboardingData.organization?.domain || ''}
                  onChange={(e) => handleOrganizationChange('domain', e.target.value)}
                  placeholder="ex: empresa.com.br"
                />
              </div>
              <div>
                <label className="text-sm font-medium leading-none mb-1.5 block">
                  Número de Funcionários <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  value={onboardingData.organization?.employeeCount || ''}
                  onChange={(e) => handleOrganizationChange('employeeCount', e.target.value)}
                  placeholder="ex: 50"
                  className={cn(requiredFieldError(onboardingData.organization?.employeeCount))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Localização</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium leading-none mb-1.5 block">
                Endereço <span className="text-destructive">*</span>
              </label>
              <Input
                value={onboardingData.organization?.address || ''}
                onChange={(e) => handleOrganizationChange('address', e.target.value)}
                placeholder="Rua, número, complemento"
                className={cn(requiredFieldError(onboardingData.organization?.address))}
              />
            </div>
            <div>
              <label className="text-sm font-medium leading-none mb-1.5 block">
                Estado <span className="text-destructive">*</span>
              </label>
              <select
                className={cn(
                  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                  requiredFieldError(onboardingData.organization?.state)
                )}
                value={onboardingData.organization?.state || ''}
                onChange={(e) => handleStateChange(e.target.value || null)}
              >
                <option value="">Selecione um estado</option>
                {stateOptions.map((stateName) => (
                  <option key={stateName} value={stateName}>
                    {stateName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium leading-none mb-1.5 block">
                Cidade <span className="text-destructive">*</span>
              </label>
              <select
                className={cn(
                  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                  requiredFieldError(onboardingData.organization?.city)
                )}
                value={onboardingData.organization?.city || ''}
                onChange={(e) => handleOrganizationChange('city', e.target.value)}
                disabled={!onboardingData.organization?.state}
              >
                <option value="">
                  {onboardingData.organization?.state ? 'Selecione uma cidade' : 'Selecione um estado primeiro'}
                </option>
                {cities.map((cityName) => (
                  <option key={cityName} value={cityName}>
                    {cityName}
                  </option>
                ))}
              </select>
              {!onboardingData.organization?.state && (
                <p className="text-sm text-muted-foreground mt-1">
                  Selecione um estado primeiro
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium leading-none mb-1.5 block">
                CEP <span className="text-destructive">*</span>
              </label>
              <Input
                value={onboardingData.organization?.zipCode || ''}
                onChange={(e) => handleOrganizationChange('zipCode', e.target.value)}
                onBlur={(e) => {
                  const error = validateCEP(e.target.value);
                  if (error) {
                    setFieldErrors(prev => ({ ...prev, zipCode: error }));
                  }
                }}
                placeholder="00000-000"
                maxLength={9}
                className={cn(fieldErrors.zipCode ? 'border-destructive focus-visible:ring-destructive' : requiredFieldError(onboardingData.organization?.zipCode))}
              />
              {fieldErrors.zipCode && (
                <p className="text-sm text-destructive mt-1">{fieldErrors.zipCode}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Contact */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Contato da Organização</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium leading-none mb-1.5 block">
                Telefone da Organização <span className="text-destructive">*</span>
              </label>
              <Input
                value={onboardingData.organization?.organizationPhoneNumber || ''}
                onChange={(e) => handleOrganizationChange('organizationPhoneNumber', e.target.value)}
                onBlur={(e) => {
                  const error = validatePhone(e.target.value);
                  if (error) {
                    setFieldErrors(prev => ({ ...prev, organizationPhoneNumber: error }));
                  }
                }}
                placeholder="(11) 99999-9999"
                maxLength={15}
                className={cn(fieldErrors.organizationPhoneNumber ? 'border-destructive focus-visible:ring-destructive' : requiredFieldError(onboardingData.organization?.organizationPhoneNumber))}
              />
              {fieldErrors.organizationPhoneNumber && (
                <p className="text-sm text-destructive mt-1">{fieldErrors.organizationPhoneNumber}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium leading-none mb-1.5 block">
                Email da Organização <span className="text-destructive">*</span>
              </label>
              <Input
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
                className={cn(emailErrors.organizationEmail ? 'border-destructive focus-visible:ring-destructive' : requiredFieldError(onboardingData.organization?.organizationEmail))}
              />
              {emailErrors.organizationEmail && (
                <p className="text-sm text-destructive mt-1">{emailErrors.organizationEmail}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Point of Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Ponto de Contato Principal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium leading-none mb-1.5 block">
                Nome do Contato <span className="text-destructive">*</span>
              </label>
              <Input
                value={onboardingData.organization?.pocName || ''}
                onChange={(e) => handleOrganizationChange('pocName', e.target.value)}
                placeholder="Nome completo"
                className={cn(requiredFieldError(onboardingData.organization?.pocName))}
              />
            </div>
            <div>
              <label className="text-sm font-medium leading-none mb-1.5 block">
                Cargo <span className="text-destructive">*</span>
              </label>
              <Input
                value={onboardingData.organization?.pocRole || ''}
                onChange={(e) => handleOrganizationChange('pocRole', e.target.value)}
                placeholder="ex: Gerente de TI"
                className={cn(requiredFieldError(onboardingData.organization?.pocRole))}
              />
            </div>
            <div>
              <label className="text-sm font-medium leading-none mb-1.5 block">
                Telefone do Contato <span className="text-destructive">*</span>
              </label>
              <Input
                value={onboardingData.organization?.pocPhoneNumber || ''}
                onChange={(e) => handleOrganizationChange('pocPhoneNumber', e.target.value)}
                onBlur={(e) => {
                  const error = validatePhone(e.target.value);
                  if (error) {
                    setFieldErrors(prev => ({ ...prev, pocPhoneNumber: error }));
                  }
                }}
                placeholder="(11) 99999-9999"
                maxLength={15}
                className={cn(fieldErrors.pocPhoneNumber ? 'border-destructive focus-visible:ring-destructive' : requiredFieldError(onboardingData.organization?.pocPhoneNumber))}
              />
              {fieldErrors.pocPhoneNumber && (
                <p className="text-sm text-destructive mt-1">{fieldErrors.pocPhoneNumber}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium leading-none mb-1.5 block">
                Email do Contato <span className="text-destructive">*</span>
              </label>
              <Input
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
                className={cn(emailErrors.pocEmail ? 'border-destructive focus-visible:ring-destructive' : requiredFieldError(onboardingData.organization?.pocEmail))}
              />
              {emailErrors.pocEmail && (
                <p className="text-sm text-destructive mt-1">{emailErrors.pocEmail}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
