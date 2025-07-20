import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/auth';
import { useOnboarding } from '../../context/onboarding';
import { OnboardingFlow } from './OnboardingFlow';
import { OrganizationSelection } from './OrganizationSelection';
import { createOnboardingSession, getActiveOnboardingSession, OrganizationOnboardingSession } from 'model/organizationOnboardingSession';
import { CircularProgress } from '@mui/material';

interface OnboardingRouterProps {
  children: React.ReactNode;
}

export const OnboardingRouter: React.FC<OnboardingRouterProps> = ({ children }) => {
  const { user, organization, isAuthLoading } = useAuth();
  const { onboardingSession, isLoading } = useOnboarding();
  const [showOnboarding, setShowOnboarding] = useState(false);


  useEffect(() => {
    if (onboardingSession) {
      setShowOnboarding(onboardingSession.status === 'in_progress');
    }
  }, [onboardingSession]);

  if (isLoading || isAuthLoading) {
    return <CircularProgress size={24} /> ;
  }

  // If user is not authenticated, show children (login page)
  if (!user) {
    return <>{children}</>;
  }


  if(user && organization) {
    return <>{children}</>;
  }


  // Check if user has completed onboarding
  const isOnboardingComplete = onboardingSession?.status === 'completed';

  // If user has completed onboarding, show the main app
  if (isOnboardingComplete) {
    return <>{children}</>;
  }

  // If there's an active onboarding session, show onboarding flow
  if (onboardingSession && onboardingSession.status === 'in_progress') {
    return <OnboardingFlow onShowOnboarding={setShowOnboarding} />;
  }

  // If user has no organization and not showing onboarding, show organization selection
  if (!organization && !showOnboarding) {
    const handleOrganizationSelected = () => {
        setShowOnboarding(false);
    };

    const handleCreateNewOrganization = () => {
      createOnboardingSession(user?.id);
      setShowOnboarding(true);
    };

    return (
      <OrganizationSelection
        onOrganizationSelected={handleOrganizationSelected}
        onCreateNewOrganization={handleCreateNewOrganization}
      />
    );
  }

  // If showing onboarding (either new org or new user), show onboarding flow
  if (showOnboarding) {
    return <OnboardingFlow onShowOnboarding={setShowOnboarding} />;
  }

  // Default case: show the main app
  return <>{children}</>;
}; 