import { collection, query, where, getDocs, setDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuidv4 } from "uuid";
import { Organization } from "./organization";

export interface InvitationCode {
  id: string;
  organizationId: string;
  code: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer';
  maxUses: number;
  usedCount: number;
  expiresAt: number;
  createdAt: number;
  createdBy: string;
}

export interface JoinRequest {
  id: string;
  organizationId: string;
  issuedBy: string;
  userEmail: string;
  userMessage?: string;
  status: 'pending' | 'approved' | 'denied';
  requestedAt: number;
  respondedAt?: number;
  respondedBy?: string;
}

const INVITATION_CODES_COLLECTION = "invitation_codes";
const JOIN_REQUESTS_COLLECTION = "join_requests";

// Generate a random invitation code
function generateInvitationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// Create invitation code for an organization
export async function createInvitationCode(
  organizationId: string,
  role: 'admin' | 'manager' | 'operator' | 'viewer',
  maxUses: number = 1,
  expiresInDays: number = 30,
  createdBy: string
): Promise<InvitationCode> {
  const code = generateInvitationCode();
  const now = Date.now();
  
  const invitationCode: InvitationCode = {
    id: uuidv4(),
    organizationId,
    code,
    role,
    maxUses,
    usedCount: 0,
    expiresAt: now + (expiresInDays * 24 * 60 * 60 * 1000),
    createdAt: now,
    createdBy,
  };

  const codeRef = doc(db, INVITATION_CODES_COLLECTION, invitationCode.id);
  await setDoc(codeRef, invitationCode);
  
  return invitationCode;
}

// Validate and use invitation code
export async function validateInvitationCode(code: string): Promise<InvitationCode | null> {
  const q = query(
    collection(db, INVITATION_CODES_COLLECTION),
    where('code', '==', code),
    where('expiresAt', '>', Date.now())
  );
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const invitationCode = querySnapshot.docs[0].data() as InvitationCode;
  
  if (invitationCode.usedCount >= invitationCode.maxUses) {
    return null;
  }
  
  return invitationCode;
}

// Use invitation code (increment used count)
export async function useInvitationCode(codeId: string): Promise<void> {
  const codeRef = doc(db, INVITATION_CODES_COLLECTION, codeId);
  const codeDoc = await getDoc(codeRef);
  
  if (!codeDoc.exists()) {
    throw new Error('Invitation code not found');
  }
  
  const invitationCode = codeDoc.data() as InvitationCode;
  await updateDoc(codeRef, {
    usedCount: invitationCode.usedCount + 1,
  });
}

// Search organizations by name
export async function searchOrganizations(searchTerm: string): Promise<Organization[]> {
  // Note: This is a simple search. For production, consider using Algolia or similar
  const q = query(
    collection(db, "organizations"),
    where('name', '>=', searchTerm),
    where('name', '<=', searchTerm + '\uf8ff')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as Organization);
}

// Create join request
export async function createJoinRequest(
  organizationId: string,
  userId: string,
  userEmail: string,
  userMessage?: string
): Promise<JoinRequest> {
  const now = Date.now();
  
  const joinRequest: JoinRequest = {
    id: uuidv4(),
    organizationId,
    issuedBy: userId,
    userEmail,
    userMessage,
    status: 'pending',
    requestedAt: now,
  };

  const requestRef = doc(db, JOIN_REQUESTS_COLLECTION, joinRequest.id);
  await setDoc(requestRef, joinRequest);
  
  return joinRequest;
}

// Get pending join requests for an organization
export async function getPendingJoinRequests(organizationId: string): Promise<JoinRequest[]> {
  const q = query(
    collection(db, JOIN_REQUESTS_COLLECTION),
    where('organizationId', '==', organizationId),
    where('status', '==', 'pending')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as JoinRequest);
}

// Approve or deny join request
export async function respondToJoinRequest(
  requestId: string,
  status: 'approved' | 'denied',
  respondedBy: string
): Promise<void> {
  const requestRef = doc(db, JOIN_REQUESTS_COLLECTION, requestId);
  await updateDoc(requestRef, {
    status,
    respondedAt: Date.now(),
    respondedBy,
  });
}

// Get join request by ID
export async function getJoinRequest(joinRequestID: string): Promise<JoinRequest | null> {
  const requestRef = doc(db, JOIN_REQUESTS_COLLECTION, joinRequestID);
  const requestDoc = await getDoc(requestRef);
  
  if (!requestDoc.exists()) {
    return null;
  }
  
  return requestDoc.data() as JoinRequest;
} 