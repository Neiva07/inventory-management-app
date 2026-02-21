import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Button,
  Typography,
  LinearProgress,
} from '@mui/material';
import { useOnboarding } from '../../context/onboarding';
import { OnboardingWelcome } from './OnboardingWelcome';
import { OrganizationSetup } from './OrganizationSetup';
import { InviteTeamSetup } from './InviteTeamSetup';
import { OnboardingComplete } from './OnboardingComplete';
import { TaxDataSetup } from './TaxDataSetup';
import { SampleDataSetup } from './SampleDataSetup';
import { OnboardingExitDialog } from './OnboardingExitDialog';

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

  // Check if current step is valid
  const isCurrentStepValid = () => {
    return stepValidation[currentStep] !== false; // Default to true if not set
  };

  // Check if user has filled any data in the onboarding
  const hasFilledData = () => {
    const { organization, taxData, setup, invitations } = onboardingData;
    
    // Check organization data
    if (organization) {
      const orgFields = Object.values(organization).filter(value => value && value !== '');
      if (orgFields.length > 0) return true;
    }
    
    // Check tax data
    if (taxData) {
      const taxFields = Object.values(taxData).filter(value => value && value !== '');
      if (taxFields.length > 0) return true;
    }
    
    // Check setup data
    if (setup) {
      const hasEnabledSetupOption =
        Boolean(setup.importSampleData) ||
        Boolean(setup.enableNotifications) ||
        Boolean(setup.enableAnalytics);
      if (hasEnabledSetupOption) return true;
    }
    
    // Check invitations
    if (invitations && invitations.length > 0) return true;
    
    return false;
  };

  // Handle back button click
  const handleBackClick = () => {
    // If we're on the welcome page (step 1) and user has filled data, show confirmation dialog
    if(currentStep === 1) {
        if (hasFilledData()) {
            setShowExitDialog(true);
        } else {
            handleExitConfirm();
        }
        return;
    }
    // Normal back navigation
    previousStep();
  };

  // Handle exit confirmation
  const handleExitConfirm = async () => {
    setShowExitDialog(false);
    await deleteOnboardingSession();
    onShowOnboarding(false);
  };

  const getStepContent = () => {
    // Organization onboarding steps
    if (currentStep === 1) return <OnboardingWelcome />;
    if (currentStep === 2) return <OrganizationSetup />;
    if (currentStep === 3) return <SampleDataSetup />;
    if (currentStep === 4) return <TaxDataSetup />;
    if (currentStep === 5) return <InviteTeamSetup />;
    if (currentStep === 6) return <OnboardingComplete />;
    return <OnboardingWelcome />;
  };

  const getStepLabels = () => {
    // Organization onboarding labels
    return [
      'Bem-vindo',
      'Configuração da Organização',
      'Dados de Exemplo',
      'Dados Tributários',
      'Convidar Equipe',
      'Concluído',
    ];
  };

  if (isComplete) {
    return <OnboardingComplete />;
  }

  return (
    <>
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          Bem-vindo ao Stockify
        </Typography>
        
        <LinearProgress 
          variant="determinate" 
          value={(currentStep / totalSteps) * 100} 
          sx={{ mb: 3 }}
        />

        <Stepper activeStep={currentStep - 1} sx={{ mb: 4 }}>
          {getStepLabels().map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Card>
          <CardContent>
            {getStepContent()}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                onClick={handleBackClick}
                disabled={isLoading}
              >
                Anterior
              </Button>

              <Box>
                {currentStep === totalSteps ? (
                  <Button
                    variant="contained"
                    onClick={completeOnboarding}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Concluindo...' : 'Concluir Configuração'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => {
                      nextStep();
                    }}
                    disabled={isLoading || !isCurrentStepValid()}
                  >
                    Próximo
                  </Button>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <OnboardingExitDialog
        open={showExitDialog}
        onClose={() => setShowExitDialog(false)}
        onConfirm={handleExitConfirm}
      />
    </>
  );
}; 
