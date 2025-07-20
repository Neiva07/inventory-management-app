import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { 
  updateOnboardingStep, 
  updateOnboardingData, 
  completeOnboardingSession,
  deleteOnboardingSession as deleteOnboardingSessionFromDB,
  OrganizationOnboardingSession,
  getActiveOnboardingSession
} from 'model/organizationOnboardingSession';
import { createOrganization } from 'model/organization';
import { createUserMembership } from 'model/userMembership';
import { useAuth } from './auth';
import { OrganizationOnboardingData } from 'model/organizationOnboardingSession';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  required: boolean;
  order: number;
}


interface OnboardingContextData {
  // Current state
  currentStep: number;
  totalSteps: number;
  onboardingData: OrganizationOnboardingData;
  isComplete: boolean;
  isLoading: boolean;
  stepValidation: { [step: number]: boolean };
  onboardingSession: OrganizationOnboardingSession | null;
  // Actions
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  updateData: (data: Partial<OrganizationOnboardingData>) => void;
  completeOnboarding: () => Promise<void>;
  deleteOnboardingSession: () => Promise<void>;
  setStepValidation: (step: number, isValid: boolean) => void;
}

const OnboardingContext = createContext<OnboardingContextData | undefined>(undefined);

// Default onboarding data
const defaultOnboardingData: OrganizationOnboardingData = {
  organization: {
    name: '',
    domain: '',
    logo: '',
    employeeCount: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    organizationPhoneNumber: '',
    organizationEmail: '',
    pocName: '',
    pocRole: '',
    pocPhoneNumber: '',
    pocEmail: '',
  },
  taxData: {
    razaoSocial: '',
    cnpj: '',
    ie: '',
    im: '',
    a1Certificate: '',
  },
  setup: {
    importSampleData: false,
    enableNotifications: false,
    enableAnalytics: false,
  },
  invitations: [],
};

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OrganizationOnboardingData>(defaultOnboardingData);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stepValidation, setStepValidationState] = useState<{ [step: number]: boolean }>({});
  const [onboardingSession, setOnboardingSession] = useState<OrganizationOnboardingSession | null>(null);

  console.log('onboardingSession', onboardingSession);

  const totalSteps = 6;

  const highestReachedStep = useMemo(() => {
    if (!onboardingSession?.progress) return 1;
    
    const completedSteps = Object.keys(onboardingSession.progress)
      .filter(key => onboardingSession.progress[key]?.completed)
      .map(key => parseInt(key.replace('step_', '')))
      .sort((a, b) => b - a);

    return completedSteps.length > 0 ? Math.max(...completedSteps) : 1;
  }, [onboardingSession?.progress]);


  useEffect(() => {
    const fetchOnboardingSession = async () => {
      setIsLoading(true);
      if (user?.id) {
        const session = await getActiveOnboardingSession(user?.id);
        setOnboardingSession(session);
        goToStep(highestReachedStep ?? 1);
        setOnboardingData(session?.data ?? defaultOnboardingData);
      }
    };
    fetchOnboardingSession().finally(() => {
      setIsLoading(false);
    });
  }, [user?.id, highestReachedStep]);




  // Navigation functions
  const nextStep = async () => {
    if (currentStep < totalSteps) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      
      if (onboardingSession?.id) {
        try {
          await updateOnboardingStep(onboardingSession.id, newStep);
        } catch (error) {
          console.error('Error updating step:', error);
        }
      }
    } else {
      console.warn('Cannot go to next step - already at max');
    }
  };

  const previousStep = async () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      
      if (onboardingSession?.id) {
        try {
          await updateOnboardingStep(onboardingSession.id, newStep);
        } catch (error) {
          console.error('Error updating step:', error);
        }
      }
    }
  };

  const goToStep = async (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
      
      if (onboardingSession?.id) {
        try {
          await updateOnboardingStep(onboardingSession.id, step);
        } catch (error) {
          console.error('Error updating step:', error);
        }
      }
    }
  };

  const updateData = async (data: Partial<OrganizationOnboardingData>) => {
    const newData = { ...onboardingData, ...data };
    setOnboardingData(newData);
    
    if (onboardingSession?.id) {
      try {
        await updateOnboardingData(onboardingSession.id, data);
      } catch (error) {
        console.error('Error updating onboarding data:', error);
      }
    }
  };

  const completeOnboarding = async () => {
    if (!onboardingSession?.id || !user?.id) return;
    
    setIsLoading(true);
    try {
      console.log('onboardingData', onboardingData.taxData);
        // Create organization
        const org = await createOrganization({
          name: onboardingData.organization?.name || '',
          domain: onboardingData.organization?.domain,
          createdBy: user.id,
          settings: {
            timezone: 'America/Sao_Paulo',
            currency: 'BRL',
            language: 'pt-BR',
            logo: onboardingData.organization?.logo,
          },
          address: {
            streetAddress: onboardingData.organization?.address,
            city: onboardingData.organization?.city,
            state: onboardingData.organization?.state,
            zipCode: onboardingData.organization?.zipCode,
            country: 'Brazil',
          },
          poc: {
            name: onboardingData.organization?.pocName,
            role: onboardingData.organization?.pocRole,
            phoneNumber: onboardingData.organization?.pocPhoneNumber,
            email: onboardingData.organization?.pocEmail,
          },
          phoneNumber: onboardingData.organization?.organizationPhoneNumber,
          email: onboardingData.organization?.organizationEmail,
          tax: onboardingData.taxData ?? {
            razaoSocial: '',
            cnpj: '',
            ie: '',
            im: '',
            a1Certificate: '',
          },
        });

        // Create user membership as admin
        await createUserMembership({
          userID: user.id,
          organizationId: org.id,
          role: 'admin',
        });

      // Complete the onboarding session
      await completeOnboardingSession(onboardingSession.id);
      setIsComplete(true);
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteOnboardingSession = async () => {
    if (onboardingSession?.id) {
      try {
        await deleteOnboardingSessionFromDB(onboardingSession.id);
        setCurrentStep(1);
        setOnboardingData(defaultOnboardingData);
        setIsComplete(false);
        setOnboardingSession(null);
      } catch (error) {
        console.error('Error deleting onboarding session:', error);
      }
    }
  };


  const setStepValidation = (step: number, isValid: boolean) => {
    setStepValidationState(prev => ({
      ...prev,
      [step]: isValid
    }));
  };

  const contextValue: OnboardingContextData = {
    currentStep,
    totalSteps,
    onboardingData,
    isComplete,
    isLoading,
    stepValidation,
    nextStep,
    previousStep,
    goToStep,
    updateData,
    completeOnboarding,
    deleteOnboardingSession,
    setStepValidation,
    onboardingSession,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}; 