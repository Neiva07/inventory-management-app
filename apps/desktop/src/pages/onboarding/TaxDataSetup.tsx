import React, { useState, useRef } from 'react';
import {
  Receipt,
  Building2,
  Upload,
  CheckCircle2,
  Info,
  AlertTriangle,
  Circle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card';
import { Input } from 'components/ui/input';
import { Button } from 'components/ui/button';
import { cn } from 'lib/utils';
import { useOnboarding } from '../../context/onboarding';
import { DevFillButton } from '../../dev/useDevFill';
import { makeTaxDataSetupValues } from '../../dev/formValues';

interface TaxDataSetupProps {
  showErrors?: boolean;
}

export const TaxDataSetup: React.FC<TaxDataSetupProps> = ({ showErrors = false }) => {
  const { onboardingData, updateData, setStepValidation } = useOnboarding();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setStepValidation(3, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleDevFill = () => {
    updateData({ taxData: makeTaxDataSetupValues() });
  };

  return (
    <div>
      {/* Header Section */}
      <div className="text-center mb-8 relative">
        <div className="absolute right-0 top-0">
          <DevFillButton onFill={handleDevFill} />
        </div>
        <div className="mb-3">
          <Receipt className="h-16 w-16 text-primary mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-primary mb-2">
          Dados Tributários
        </h2>
        <h3 className="text-lg text-muted-foreground mb-2">
          Configure as informações tributárias da sua empresa
        </h3>
        <p className="text-base text-muted-foreground max-w-[600px] mx-auto">
          Essas informações são necessárias para emissão de notas fiscais e validação de NFEs.
          Você pode preencher essas informações agora ou adicioná-las posteriormente.
        </p>
      </div>

      {/* Company Registration */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <CardTitle>Registro da Empresa</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium leading-none mb-1.5 block">
                CNPJ <span className="text-destructive">*</span>
              </label>
              <Input
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
                className={cn(errors.cnpj && 'border-destructive focus-visible:ring-destructive')}
              />
              {errors.cnpj && (
                <p className="text-sm text-destructive mt-1">{errors.cnpj}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium leading-none mb-1.5 block">
                Inscrição Estadual (IE) <span className="text-destructive">*</span>
              </label>
              <Input
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
                className={cn(errors.ie && 'border-destructive focus-visible:ring-destructive')}
              />
              {errors.ie && (
                <p className="text-sm text-destructive mt-1">{errors.ie}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium leading-none mb-1.5 block">
                Inscrição Municipal (IM)
              </label>
              <Input
                value={onboardingData.taxData?.im || ''}
                onChange={(e) => handleTaxDataChange('im', e.target.value)}
                placeholder="000000000"
              />
            </div>

            <div>
              <label className="text-sm font-medium leading-none mb-1.5 block">
                Razão Social <span className="text-destructive">*</span>
              </label>
              <Input
                value={onboardingData.taxData?.razaoSocial || ''}
                onChange={(e) => handleTaxDataChange('razaoSocial', e.target.value)}
                placeholder="Nome completo da empresa"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* A1 Certificate Upload */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Upload className="h-8 w-8 text-green-600 dark:text-green-400" />
            <CardTitle>Certificado Digital A1</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-blue-500/50 bg-blue-500/10 p-3 mb-4">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                O certificado A1 é necessário para emissão e validação de notas fiscais eletrônicas (NFEs).
              </p>
            </div>
          </div>

          <div className="text-center">
            {onboardingData.taxData?.a1Certificate ? (
              <div className="flex items-center justify-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <p className="text-base font-medium">
                  Certificado carregado: {onboardingData.taxData.a1Certificate}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-3">
                Nenhum certificado carregado
              </p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pfx,.p12"
              onChange={handleFileUpload}
            />
            <Button
              variant="outline"
              className="mt-1"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Carregar Certificado A1
            </Button>

            <p className="text-xs text-muted-foreground mt-2">
              Formatos aceitos: .pfx, .p12
            </p>
          </div>
        </CardContent>
      </Card>

      {/* NFE Requirements Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <CheckCircle2 className={cn(
              'h-8 w-8',
              nfeRequirements.allComplete
                ? 'text-green-600 dark:text-green-400'
                : 'text-yellow-600 dark:text-yellow-400'
            )} />
            <CardTitle>Status para Emissão de NFEs</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {nfeRequirements.allComplete ? (
            <div className="rounded-md border border-green-500/50 bg-green-500/10 p-4 mb-4">
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                Todos os requisitos para emissão de NFEs estão preenchidos!
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Você poderá emitir notas fiscais eletrônicas após completar o onboarding.
              </p>
            </div>
          ) : (
            <div className="rounded-md border border-yellow-500/50 bg-yellow-500/10 p-4 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                    Alguns requisitos para emissão de NFEs ainda precisam ser preenchidos.
                  </p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                    Você pode completar o onboarding e adicionar essas informações posteriormente.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              {nfeRequirements.cnpj ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground/40" />
              )}
              <span className="text-sm font-medium">CNPJ</span>
            </div>

            <div className="flex items-center gap-2">
              {nfeRequirements.ie ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground/40" />
              )}
              <span className="text-sm font-medium">Inscrição Estadual (IE)</span>
            </div>

            <div className="flex items-center gap-2">
              {nfeRequirements.companyName ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground/40" />
              )}
              <span className="text-sm font-medium">Razão Social</span>
            </div>

            <div className="flex items-center gap-2">
              {nfeRequirements.a1Certificate ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground/40" />
              )}
              <span className="text-sm font-medium">Certificado A1</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
