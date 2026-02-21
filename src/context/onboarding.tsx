import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  createOnboardingSession,
  updateOnboardingStep,
  updateOnboardingData,
  completeOnboardingSession,
  deleteOnboardingSession as deleteOnboardingSessionFromDB,
  OrganizationOnboardingSession,
  getActiveOnboardingSession,
  OrganizationOnboardingData,
} from 'model/organizationOnboardingSession';
import { createOrganization } from 'model/organization';
import { createUserMembership } from 'model/userMembership';
import { persistOnboardingTeamInvitations, seedOnboardingSampleData } from 'model/onboardingSetup';
import { useAuth } from './auth';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  required: boolean;
  order: number;
}

interface OnboardingContextData {
  currentStep: number;
  totalSteps: number;
  onboardingData: OrganizationOnboardingData;
  isComplete: boolean;
  isLoading: boolean;
  stepValidation: { [step: number]: boolean };
  onboardingSession: OrganizationOnboardingSession | null;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  updateData: (data: Partial<OrganizationOnboardingData>) => void;
  completeOnboarding: () => Promise<void>;
  deleteOnboardingSession: () => Promise<void>;
  startOnboardingSession: () => Promise<OrganizationOnboardingSession | null>;
  setStepValidation: (step: number, isValid: boolean) => void;
}

const OnboardingContext = createContext<OnboardingContextData | undefined>(undefined);

const TOTAL_STEPS = 6;

const getDefaultOnboardingData = (): OrganizationOnboardingData => ({
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
});

const clampStep = (step: number) => Math.max(1, Math.min(TOTAL_STEPS, step));

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, refreshUserData } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OrganizationOnboardingData>(getDefaultOnboardingData());
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stepValidation, setStepValidationState] = useState<{ [step: number]: boolean }>({});
  const [onboardingSession, setOnboardingSession] = useState<OrganizationOnboardingSession | null>(null);

  const resetOnboardingState = () => {
    setCurrentStep(1);
    setOnboardingData(getDefaultOnboardingData());
    setIsComplete(false);
    setStepValidationState({});
    setOnboardingSession(null);
  };

  useEffect(() => {
    const fetchOnboardingSession = async () => {
      setIsLoading(true);

      if (!user?.id) {
        resetOnboardingState();
        setIsLoading(false);
        return;
      }

      try {
        const session = await getActiveOnboardingSession(user.id);
        setOnboardingSession(session);
        setCurrentStep(clampStep(session?.currentStep ?? 1));
        setOnboardingData(session?.data ?? getDefaultOnboardingData());
        setIsComplete(false);
      } catch (error) {
        console.error('Error loading onboarding session:', error);
        resetOnboardingState();
      } finally {
        setIsLoading(false);
      }
    };

    void fetchOnboardingSession();
  }, [user?.id]);

  const persistStep = async (step: number) => {
    if (!onboardingSession?.id) {
      return;
    }

    try {
      await updateOnboardingStep(onboardingSession.id, step);
      setOnboardingSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          currentStep: step,
          lastActivityAt: Date.now(),
        };
      });
    } catch (error) {
      console.error('Error updating step:', error);
    }
  };

  const nextStep = () => {
    if (currentStep >= TOTAL_STEPS) {
      return;
    }

    const newStep = clampStep(currentStep + 1);
    setCurrentStep(newStep);
    void persistStep(newStep);
  };

  const previousStep = () => {
    if (currentStep <= 1) {
      return;
    }

    const newStep = clampStep(currentStep - 1);
    setCurrentStep(newStep);
    void persistStep(newStep);
  };

  const goToStep = (step: number) => {
    const newStep = clampStep(step);
    setCurrentStep(newStep);
    void persistStep(newStep);
  };

  const updateData = (data: Partial<OrganizationOnboardingData>) => {
    const newData = { ...onboardingData, ...data };
    setOnboardingData(newData);

    if (!onboardingSession?.id) {
      return;
    }

    void updateOnboardingData(onboardingSession.id, data)
      .then(() => {
        setOnboardingSession((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            data: newData,
            lastActivityAt: Date.now(),
          };
        });
      })
      .catch((error) => {
        console.error('Error updating onboarding data:', error);
      });
  };

  const startOnboardingSession = async (): Promise<OrganizationOnboardingSession | null> => {
    if (!user?.id) {
      return null;
    }

    if (onboardingSession?.status === 'in_progress') {
      return onboardingSession;
    }

    setIsLoading(true);
    try {
      const newSession = await createOnboardingSession(user.id);
      setOnboardingSession(newSession);
      setCurrentStep(1);
      setOnboardingData(newSession.data);
      setIsComplete(false);
      setStepValidationState({});
      return newSession;
    } catch (error) {
      console.error('Error creating onboarding session:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    if (!onboardingSession?.id || !user?.id) {
      return;
    }

    setIsLoading(true);

    try {
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
          streetAddress: onboardingData.organization?.address || '',
          city: onboardingData.organization?.city || '',
          state: onboardingData.organization?.state || '',
          zipCode: onboardingData.organization?.zipCode || '',
          country: 'Brazil',
        },
        poc: {
          name: onboardingData.organization?.pocName || '',
          role: onboardingData.organization?.pocRole || '',
          phoneNumber: onboardingData.organization?.pocPhoneNumber || '',
          email: onboardingData.organization?.pocEmail || '',
        },
        phoneNumber: onboardingData.organization?.organizationPhoneNumber || '',
        email: onboardingData.organization?.organizationEmail || '',
        tax: onboardingData.taxData ?? {
          razaoSocial: '',
          cnpj: '',
          ie: '',
          im: '',
          a1Certificate: '',
        },
      });

      await createUserMembership({
        userID: user.id,
        organizationId: org.id,
        role: 'admin',
      });

      await completeOnboardingSession(onboardingSession.id);
      setIsComplete(true);
      setOnboardingSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: 'completed',
          completedAt: Date.now(),
        };
      });

      await refreshUserData();

      const pendingTasks: Promise<unknown>[] = [];

      if (onboardingData.setup?.importSampleData) {
        pendingTasks.push(seedOnboardingSampleData(user.id, org.id));
      }

      if ((onboardingData.invitations?.length ?? 0) > 0) {
        pendingTasks.push(
          persistOnboardingTeamInvitations(org.id, user.id, onboardingData.invitations ?? [])
        );
      }

      const results = await Promise.allSettled(pendingTasks);
      results.forEach((result) => {
        if (result.status === 'rejected') {
          console.error('Error executing onboarding side effect:', result.reason);
        }
      });
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
      } catch (error) {
        console.error('Error deleting onboarding session:', error);
      }
    }

    resetOnboardingState();
  };

  const setStepValidation = (step: number, isValid: boolean) => {
    setStepValidationState((prev) => ({
      ...prev,
      [step]: isValid,
    }));
  };

  const contextValue: OnboardingContextData = {
    currentStep,
    totalSteps: TOTAL_STEPS,
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
    startOnboardingSession,
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
