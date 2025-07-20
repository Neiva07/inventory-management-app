import { collection, getDocs, where, query, setDoc, doc, updateDoc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuidv4 } from "uuid";

export interface Organization {
  id: string;
  name: string;
  domain?: string;
  tax?: {
    razaoSocial?: string;
    cnpj?: string;
    ie?: string;
    im?: string;
    a1Certificate?: string;
  };
  settings: {
    timezone: string;
    currency: string;
    language: string;
    logo?: string;
  };
  address: {
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phoneNumber: string;
  email: string;
  poc: {
    name: string;
    role: string;
    phoneNumber: string;
    email: string;
  };
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

export interface CreateOrganizationData {
  name: string;
  domain?: string;
  createdBy: string;
  settings?: Organization['settings'];
  address: Organization['address'];
  poc: Organization['poc'];
  tax?: Organization['tax'];
  phoneNumber: string;
  email: string;
}

const ORGANIZATIONS_COLLECTION = "organizations";

export const createOrganization = async (data: CreateOrganizationData): Promise<Organization> => {
  const organizationId = uuidv4();
  const now = Date.now();
  
  const organizationData: Organization = {
    ...data,
    id: organizationId,
    settings: {
      timezone: 'America/Sao_Paulo',
      currency: 'BRL',
      language: 'pt-BR',
      logo: data.settings?.logo,
      ...data.settings,
    },
    createdAt: now,
    updatedAt: now,
  
  };

  const orgRef = doc(db, ORGANIZATIONS_COLLECTION, organizationId);
  await setDoc(orgRef, organizationData);
  
  return organizationData;
};

export const getOrganization = async (orgId: string): Promise<Organization | null> => {
  const orgRef = doc(db, ORGANIZATIONS_COLLECTION, orgId);
  const orgDoc = await getDoc(orgRef);
  
  if (!orgDoc.exists()) {
    return null;
  }
  
  return orgDoc.data() as Organization;
};

export const updateOrganization = async (orgId: string, data: Partial<Organization>): Promise<Organization> => {
  const orgRef = doc(db, ORGANIZATIONS_COLLECTION, orgId);
  const updateData = {
    ...data,
    updatedAt: Date.now(),
  };
  
  await updateDoc(orgRef, updateData);
  
  const updatedOrg = await getOrganization(orgId);
  if (!updatedOrg) {
    throw new Error('Organization not found');
  }
  
  return updatedOrg;
};

export const deleteOrganization = async (orgId: string): Promise<void> => {
  const orgRef = doc(db, ORGANIZATIONS_COLLECTION, orgId);
  await deleteDoc(orgRef);
};

export const getOrganizationsByUser = async (clerkUserId: string): Promise<Organization[]> => {
  const q = query(
    collection(db, ORGANIZATIONS_COLLECTION),
    where('createdBy', '==', clerkUserId)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as Organization);
};

// New functions for organization selection and onboarding

export const searchOrganizations = async (searchTerm: string): Promise<Organization[]> => {
  // Note: Firestore doesn't support full-text search, so we'll do a simple name search
  // In production, you might want to use Algolia or similar for better search
  const q = query(
    collection(db, ORGANIZATIONS_COLLECTION),
    where('name', '>=', searchTerm),
    where('name', '<=', searchTerm + '\uf8ff')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as Organization);
};

export const generateInvitationCode = async (organizationId: string): Promise<string> => {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  // Store the invitation code
  const invitationRef = doc(db, 'invitation_codes', code);
  await setDoc(invitationRef, {
    organizationId,
    code,
    createdAt: Date.now(),
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
    isUsed: false,
  });
  
  return code;
};


export const markInvitationCodeAsUsed = async (code: string): Promise<void> => {
  const invitationRef = doc(db, 'invitation_codes', code);
  await updateDoc(invitationRef, {
    isUsed: true,
    usedAt: Date.now(),
  });
};

export const createJoinRequest = async (organizationId: string, userID: string, message?: string): Promise<void> => {
  const requestId = uuidv4();
  const requestRef = doc(db, 'join_requests', requestId);
  
  await setDoc(requestRef, {
    id: requestId,
    organizationId,
    userID,
    message: message || '',
    status: 'pending',
    createdAt: Date.now(),
  });
};

export const getJoinRequests = async (organizationId: string): Promise<any[]> => {
  const q = query(
    collection(db, 'join_requests'),
    where('organizationId', '==', organizationId),
    where('status', '==', 'pending')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
};

export const updateJoinRequest = async (requestId: string, status: 'approved' | 'rejected'): Promise<void> => {
  const requestRef = doc(db, 'join_requests', requestId);
  await updateDoc(requestRef, {
    status,
    updatedAt: Date.now(),
  });
}; 