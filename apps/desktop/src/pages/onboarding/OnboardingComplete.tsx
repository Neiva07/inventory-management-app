import React from 'react';
import {
  CheckCircle2,
  Building2,
  Users,
  Database,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { Card, CardContent } from 'components/ui/card';
import { useOnboarding } from '../../context/onboarding';

export const OnboardingComplete: React.FC = () => {
  const { onboardingData } = useOnboarding();

  return (
    <div>
      {/* Header Section */}
      <div className="text-center mb-8">
        <CheckCircle2 className="h-16 w-16 text-emerald-600 mx-auto mb-4" />

        <h2 className="text-2xl font-bold text-emerald-600 mb-2">
          Tudo Pronto! 🎉
        </h2>

        <h3 className="text-lg text-muted-foreground mb-2">
          Bem-vindo ao Stockify!
        </h3>

        <p className="text-base text-muted-foreground max-w-[600px] mx-auto">
          Sua organização foi configurada com sucesso. Aqui está um resumo de tudo que foi configurado:
        </p>
      </div>

      {/* Organization Summary */}
      {onboardingData.organization && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="h-8 w-8 text-primary" />
              <h3 className="text-lg font-semibold">
                Informações da Organização
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="mb-2">
                <p className="text-sm text-muted-foreground mb-1">
                  Nome da Organização
                </p>
                <p className="text-base font-medium">
                  {onboardingData.organization.name}
                </p>
              </div>

              {onboardingData.organization.domain && (
                <div className="mb-2">
                  <p className="text-sm text-muted-foreground mb-1">
                    Domínio
                  </p>
                  <p className="text-base font-medium">
                    {onboardingData.organization.domain}
                  </p>
                </div>
              )}

              {onboardingData.organization.employeeCount && (
                <div className="mb-2">
                  <p className="text-sm text-muted-foreground mb-1">
                    Número de Funcionários
                  </p>
                  <p className="text-base font-medium">
                    {onboardingData.organization.employeeCount}
                  </p>
                </div>
              )}

              {(onboardingData.organization.address || onboardingData.organization.state || onboardingData.organization.city || onboardingData.organization.zipCode) && (
                <div className="col-span-full mb-2">
                  <p className="text-sm text-muted-foreground mb-1">
                    Localização
                  </p>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <p className="text-base font-medium">
                      {[
                        onboardingData.organization.address,
                        onboardingData.organization.city,
                        onboardingData.organization.state,
                        onboardingData.organization.zipCode
                      ].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              )}

              {(onboardingData.organization.organizationEmail || onboardingData.organization.organizationPhoneNumber) && (
                <div className="col-span-full mb-2">
                  <p className="text-sm text-muted-foreground mb-1">
                    Contato da Organização
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {onboardingData.organization.organizationEmail && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {onboardingData.organization.organizationEmail}
                        </span>
                      </div>
                    )}
                    {onboardingData.organization.organizationPhoneNumber && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {onboardingData.organization.organizationPhoneNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(onboardingData.organization.pocName || onboardingData.organization.pocEmail) && (
                <div className="col-span-full mb-2">
                  <p className="text-sm text-muted-foreground mb-1">
                    Ponto de Contato Principal
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {onboardingData.organization.pocName && (
                      <span className="text-sm font-medium">
                        {onboardingData.organization.pocName}
                        {onboardingData.organization.pocRole && ` (${onboardingData.organization.pocRole})`}
                      </span>
                    )}
                    {onboardingData.organization.pocEmail && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {onboardingData.organization.pocEmail}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cadastros Básicos Summary */}
      {onboardingData.cadastrosBasicos && !onboardingData.cadastrosBasicos.skipped && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-8 w-8 text-primary" />
              <h3 className="text-lg font-semibold">
                Cadastros Básicos
              </h3>
            </div>

            <p className="text-sm font-medium text-muted-foreground mb-2">
              Cadastros que serão criados:
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary text-primary px-3 py-0.5 text-xs font-medium">
                {onboardingData.cadastrosBasicos.units.length} Unidades de medida
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600 text-emerald-600 px-3 py-0.5 text-xs font-medium">
                {onboardingData.cadastrosBasicos.categories.length} Categorias
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-600 text-amber-600 px-3 py-0.5 text-xs font-medium">
                {onboardingData.cadastrosBasicos.acceptedPaymentMethodIds.length} Formas de pagamento
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tax Data Summary */}
      {onboardingData.taxData && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-8 w-8 text-emerald-600" />
              <h3 className="text-lg font-semibold">
                Dados Tributários
              </h3>
            </div>

            {/* NFE Requirements Status */}
            {(() => {
              const taxData = onboardingData.taxData;
              const hasCNPJ = taxData?.cnpj && taxData.cnpj.replace(/\D/g, '').length === 14;
              const hasIE = taxData?.ie && taxData.ie.replace(/\D/g, '').length >= 8;
              const hasCompanyName = taxData?.razaoSocial && taxData.razaoSocial.trim().length > 0;
              const hasA1Certificate = taxData?.a1Certificate && taxData.a1Certificate.trim().length > 0;
              const allComplete = hasCNPJ && hasIE && hasCompanyName && hasA1Certificate;

              return (
                <div className={`flex gap-3 items-start rounded-lg border p-4 mb-6 ${allComplete ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
                  <div>
                    <p className={`text-base font-medium ${allComplete ? 'text-emerald-900' : 'text-amber-900'}`}>
                      {allComplete
                        ? '✅ Todos os requisitos para emissão de NFEs estão preenchidos!'
                        : '⚠️ Alguns requisitos para emissão de NFEs ainda precisam ser preenchidos.'
                      }
                    </p>
                    <p className={`text-sm mt-1 ${allComplete ? 'text-emerald-800' : 'text-amber-800'}`}>
                      {allComplete
                        ? 'Você poderá emitir notas fiscais eletrônicas após completar o onboarding.'
                        : 'Você pode completar o onboarding e adicionar essas informações posteriormente.'
                      }
                    </p>
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {onboardingData.taxData.cnpj && (
                <div className="mb-2">
                  <p className="text-sm text-muted-foreground mb-1">
                    CNPJ
                  </p>
                  <p className="text-base font-medium">
                    {onboardingData.taxData.cnpj}
                  </p>
                </div>
              )}

              {onboardingData.taxData.ie && (
                <div className="mb-2">
                  <p className="text-sm text-muted-foreground mb-1">
                    Inscrição Estadual (IE)
                  </p>
                  <p className="text-base font-medium">
                    {onboardingData.taxData.ie}
                  </p>
                </div>
              )}

              {onboardingData.taxData.razaoSocial && (
                <div className="mb-2">
                  <p className="text-sm text-muted-foreground mb-1">
                    Razão Social
                  </p>
                  <p className="text-base font-medium">
                    {onboardingData.taxData.razaoSocial}
                  </p>
                </div>
              )}

              {onboardingData.taxData.a1Certificate && (
                <div className="mb-2">
                  <p className="text-sm text-muted-foreground mb-1">
                    Certificado A1
                  </p>
                  <p className="text-base font-medium">
                    {onboardingData.taxData.a1Certificate}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Members Summary */}
      {onboardingData.invitations && onboardingData.invitations.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-8 w-8 text-sky-600" />
              <h3 className="text-lg font-semibold">
                Membros da Equipe
              </h3>
            </div>
            <p className="text-base text-muted-foreground mb-3">
              {onboardingData.invitations.length} membro(s) convidado(s):
            </p>
            <div className="flex flex-wrap gap-2">
              {onboardingData.invitations.map((invitation) => {
                const role = invitation.role;
                const badgeClass =
                  role === 'manager' ? 'border-red-500 text-red-600' :
                  role === 'operator' ? 'border-primary text-primary' :
                  'border-emerald-500 text-emerald-600';
                return (
                  <span
                    key={invitation.email}
                    className={`inline-block rounded-full border px-3 py-0.5 text-xs font-medium ${badgeClass}`}
                  >
                    {invitation.email} ({role === 'manager' ? 'Gerente' : role === 'operator' ? 'Operador' : 'Visualizador'})
                  </span>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      <div className="flex gap-3 items-start rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-base font-medium text-emerald-900">
            Sua organização <strong>{onboardingData.organization?.name}</strong> está pronta para uso!
          </p>
          <p className="text-sm text-emerald-800 mt-1">
            Você pode começar a gerenciar seu estoque imediatamente.
          </p>
        </div>
      </div>
    </div>
  );
};
