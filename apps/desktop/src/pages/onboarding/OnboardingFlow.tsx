import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { cn } from 'lib/utils';
import { Card, CardContent } from 'components/ui/card';
import { Button } from 'components/ui/button';
import { useOnboarding } from '../../context/onboarding';
import { OnboardingWelcome } from './OnboardingWelcome';
import { OrganizationSetup } from './OrganizationSetup';
import { InviteTeamSetup } from './InviteTeamSetup';
import { OnboardingComplete } from './OnboardingComplete';
import { TaxDataSetup } from './TaxDataSetup';
import { CadastrosBasicosSetup } from './CadastrosBasicosSetup';
import { OnboardingExitDialog } from './OnboardingExitDialog';

const OPTIONAL_STEP = 5;

const STEP_LABELS = [
  'Bem-vindo',
  'Organização',
  'Dados Fiscais',
  'Equipe',
  'Cadastros Básicos',
  'Concluído',
];

export const OnboardingFlow: React.FC<{ onShowOnboarding: (show: boolean) => void }> = ({ onShowOnboarding }) => {
  const {
    currentStep,
    totalSteps,
    isComplete,
    isLoading,
    nextStep,
    previousStep,
    completeOnboarding,
    stepValidation,
    onboardingData,
    deleteOnboardingSession,
  } = useOnboarding();

  const [showExitDialog, setShowExitDialog] = useState(false);
  const [attemptedNext, setAttemptedNext] = useState(false);

  const isCurrentStepValid = () => {
    return stepValidation[currentStep] !== false;
  };

  const hasFilledData = () => {
    const { organization, taxData, setup, cadastrosBasicos, invitations } = onboardingData;

    if (organization) {
      const orgFields = Object.values(organization).filter(value => value && value !== '');
      if (orgFields.length > 0) return true;
    }

    if (taxData) {
      const taxFields = Object.values(taxData).filter(value => value && value !== '');
      if (taxFields.length > 0) return true;
    }

    if (setup) {
      const hasEnabledSetupOption =
        Boolean(setup.enableNotifications) ||
        Boolean(setup.enableAnalytics);
      if (hasEnabledSetupOption) return true;
    }

    if (cadastrosBasicos && !cadastrosBasicos.skipped) {
      const hasCadastros =
        cadastrosBasicos.units.length > 0 ||
        cadastrosBasicos.categories.length > 0 ||
        cadastrosBasicos.acceptedPaymentMethodIds.length > 0;
      if (hasCadastros) return true;
    }

    if (invitations && invitations.length > 0) return true;

    return false;
  };

  const handleBackClick = () => {
    if(currentStep === 1) {
        if (hasFilledData()) {
            setShowExitDialog(true);
        } else {
            handleExitConfirm();
        }
        return;
    }
    setAttemptedNext(false);
    previousStep();
  };

  const handleExitConfirm = async () => {
    setShowExitDialog(false);
    await deleteOnboardingSession();
    onShowOnboarding(false);
  };

  const getStepContent = () => {
    if (currentStep === 1) return <OnboardingWelcome />;
    if (currentStep === 2) return <OrganizationSetup showErrors={attemptedNext} />;
    if (currentStep === 3) return <TaxDataSetup showErrors={attemptedNext} />;
    if (currentStep === 4) return <InviteTeamSetup />;
    if (currentStep === 5) return <CadastrosBasicosSetup />;
    if (currentStep === 6) return <OnboardingComplete />;
    return <OnboardingWelcome />;
  };

  if (isComplete) {
    return <OnboardingComplete />;
  }

  const progressPercent = (currentStep / totalSteps) * 100;

  return (
    <>
      <div className="mx-auto max-w-[800px] p-6">
        <h2 className="mb-4 text-center text-2xl font-bold tracking-tight">
          Bem-vindo ao Stockify
        </h2>

        {/* Progress bar */}
        <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step indicator */}
        <div className="mb-6 flex items-start justify-between">
          {STEP_LABELS.map((label, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            const isOptional = stepNumber === OPTIONAL_STEP;

            return (
              <React.Fragment key={label}>
                {/* Connector line (before each step except the first) — sits at the
                    vertical center of the 8x8 circles (mt-4 = 16px). */}
                {index > 0 && (
                  <div
                    className={cn(
                      'mt-4 flex-1',
                      isOptional
                        ? cn(
                            'border-t border-dashed',
                            isCompleted || isActive ? 'border-primary' : 'border-border'
                          )
                        : cn('h-px', isCompleted || isActive ? 'bg-primary' : 'bg-border')
                    )}
                  />
                )}

                {/* Step circle + label */}
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                      isCompleted && 'bg-primary text-primary-foreground',
                      isActive && 'bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background',
                      !isCompleted && !isActive && 'border border-border bg-muted text-muted-foreground',
                      isOptional && !isCompleted && !isActive && 'border-dashed'
                    )}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
                  </div>
                  <span
                    className={cn(
                      'text-center text-[11px] leading-tight whitespace-nowrap',
                      isActive ? 'font-medium text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {label}
                  </span>
                  {isOptional && (
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-muted-foreground">
                      Opcional
                    </span>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>

        <Card>
          <CardContent className="p-6">
            {getStepContent()}

            <div className="mt-6 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handleBackClick}
                disabled={isLoading}
              >
                <ArrowLeft className="h-4 w-4" />
                Anterior
              </Button>

              <div>
                {currentStep === totalSteps ? (
                  <Button
                    onClick={completeOnboarding}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Concluindo...
                      </>
                    ) : (
                      'Concluir Configuração'
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      if (!isCurrentStepValid()) {
                        setAttemptedNext(true);
                        return;
                      }
                      setAttemptedNext(false);
                      nextStep();
                    }}
                    disabled={isLoading}
                  >
                    Próximo
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <OnboardingExitDialog
        open={showExitDialog}
        onClose={() => setShowExitDialog(false)}
        onConfirm={handleExitConfirm}
      />
    </>
  );
};
