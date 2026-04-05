import { v4 as uuidv4 } from "uuid";
import { collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

export type OnboardingStatus = "in_progress" | "completed";


export interface OrganizationOnboardingData {
  organization: {
    name: string;
    domain?: string;
    logo?: string;
    employeeCount?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    organizationPhoneNumber?: string;
    organizationEmail?: string;
    pocName?: string;
    pocRole?: string;
    pocPhoneNumber?: string;
    pocEmail?: string;
  };
  taxData?: {
    razaoSocial?: string;
    cnpj?: string;
    ie?: string;
    im?: string;
    a1Certificate?: string;
  };
  setup?: {
    importSampleData: boolean;
    enableNotifications?: boolean;
    enableAnalytics?: boolean;
  };
  invitations?: {
    email: string;
    role: string;
    name: string;
  }[];
}

export interface OrganizationOnboardingSession {
  id: string;
  userID: string;
  currentStep: number;
  data: OrganizationOnboardingData; // Flexible for org/user onboarding data
  status: OnboardingStatus;
  startedAt: number;
  completedAt?: number;
  lastActivityAt: number;
  progress: {
    [stepId: string]: {
      completed: boolean;
      completedAt?: number;
    };
  };
}

const ONBOARDING_SESSIONS_COLLECTION = "onboarding_sessions";

export async function createOnboardingSession(userID: string): Promise<OrganizationOnboardingSession> {
  const now = Date.now();
  const sessionID = uuidv4();
  const session: OrganizationOnboardingSession = {
    id: sessionID,
    userID,
    currentStep: 1,
    data: {
      organization: {
        name: '',
      },
    },
    status: "in_progress",
    startedAt: now,
    lastActivityAt: now,
    progress: {},
  };
  const sessionRef = doc(db, ONBOARDING_SESSIONS_COLLECTION, sessionID);
  await setDoc(sessionRef, session);
  return session;
}

export async function getOnboardingSession(sessionId: string): Promise<OrganizationOnboardingSession | null> {
  const sessionRef = doc(db, ONBOARDING_SESSIONS_COLLECTION, sessionId);
  const sessionDoc = await getDoc(sessionRef);
  if (!sessionDoc.exists()) {
    return null;
  }
  return sessionDoc.data() as OrganizationOnboardingSession;
}

export async function updateOnboardingSession(
  sessionId: string,
  updates: Partial<OrganizationOnboardingSession>
): Promise<OrganizationOnboardingSession> {
  const sessionRef = doc(db, ONBOARDING_SESSIONS_COLLECTION, sessionId);
  const updateData = {
    ...updates,
    lastActivityAt: Date.now(),
  };
  await updateDoc(sessionRef, updateData);
  const updatedSession = await getOnboardingSession(sessionId);
  if (!updatedSession) {
    throw new Error('Onboarding session not found');
  }
  return updatedSession;
}

export async function completeOnboardingSession(sessionId: string): Promise<OrganizationOnboardingSession> {
  return await updateOnboardingSession(sessionId, {
    status: "completed",
    completedAt: Date.now(),
  });
}

export async function getActiveOnboardingSession(
  userID: string
): Promise<OrganizationOnboardingSession | null> {
  const q = query(
    collection(db, ONBOARDING_SESSIONS_COLLECTION),
    where('userID', '==', userID),
    where('status', '==', 'in_progress')
  );
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return null;
  }
  // Return the most recent active session
  const sessions = querySnapshot.docs.map(doc => doc.data() as OrganizationOnboardingSession);
  return sessions.sort((a, b) => b.lastActivityAt - a.lastActivityAt)[0];
}

export async function deleteOnboardingSession(sessionId: string): Promise<void> {
  const sessionRef = doc(db, ONBOARDING_SESSIONS_COLLECTION, sessionId);

  await deleteDoc(sessionRef);
}

// Additional functions for step management and data handling

export async function updateOnboardingStep(
  sessionId: string,
  step: number,
  stepData?: any
): Promise<OrganizationOnboardingSession> {
  const onboardingSession = await getOnboardingSession(sessionId);
  if (!onboardingSession) {
    throw new Error('Onboarding session not found');
  }

  const stepId = `step_${step}`;
  const progressUpdate: any = {
    completed: true,
    completedAt: Date.now(),
  };

  // Only add data if it's not undefined
  if (stepData !== undefined) {
    progressUpdate.data = stepData;
  }

  const progress = {
    ...onboardingSession.progress,
    [stepId]: progressUpdate,
  };

  return await updateOnboardingSession(sessionId, {
    currentStep: step,
    progress,
  });
}

export async function updateOnboardingData(
  sessionId: string,
  data: Record<string, any>
): Promise<OrganizationOnboardingSession> {
  const onboardingSession = await getOnboardingSession(sessionId);
  if (!onboardingSession) {
    throw new Error('Onboarding session not found');
  }

  // Filter out undefined values
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  );

  return await updateOnboardingSession(sessionId, {
    data: {
      ...onboardingSession.data,
      ...cleanData,
    },
  });
}
