import { collection, getDocs, where, query, setDoc, doc, updateDoc, getDoc, deleteDoc, QueryConstraint } from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuidv4 } from "uuid";

export type UserRole = 'admin' | 'manager' | 'operator' | 'viewer';

export interface Permission {
  resource: string; // 'products', 'orders', 'users', etc.
  action: string;   // 'create', 'read', 'update', 'delete'
  conditions?: Record<string, any>; // Optional conditions
}

export interface UserMembership {
  id: string;
  userID: string; // Link to Clerk user
  organizationId: string;
  role: UserRole;
  permissions: Permission[];
  status: 'active' | 'inactive' | 'suspended';
  invitedBy?: string; // Clerk user ID
  invitedAt?: number;
  joinedAt: number;
  updatedAt: number;
}

export interface CreateMembershipData {
  userID: string;
  organizationId: string;
  role: UserRole;
  invitedBy?: string;
}

const USER_MEMBERSHIPS_COLLECTION = "user_memberships";

// Default permissions for each role
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    { resource: '*', action: '*' }, // Full access
  ],
  manager: [
    { resource: 'products', action: '*' },
    { resource: 'suppliers', action: '*' },
    { resource: 'customers', action: '*' },
    { resource: 'orders', action: '*' },
    { resource: 'inbound_orders', action: '*' },
    { resource: 'supplier_bills', action: '*' },
    { resource: 'installment_payments', action: '*' },
    { resource: 'product_categories', action: '*' },
    { resource: 'units', action: '*' },
    { resource: 'users', action: 'read' },
    { resource: 'organizations', action: 'read' },
  ],
  operator: [
    { resource: 'products', action: 'read' },
    { resource: 'products', action: 'update' },
    { resource: 'suppliers', action: 'read' },
    { resource: 'suppliers', action: 'update' },
    { resource: 'customers', action: 'read' },
    { resource: 'customers', action: 'update' },
    { resource: 'orders', action: 'create' },
    { resource: 'orders', action: 'read' },
    { resource: 'orders', action: 'update' },
    { resource: 'inbound_orders', action: 'create' },
    { resource: 'inbound_orders', action: 'read' },
    { resource: 'inbound_orders', action: 'update' },
    { resource: 'supplier_bills', action: 'read' },
    { resource: 'installment_payments', action: 'read' },
    { resource: 'product_categories', action: 'read' },
    { resource: 'units', action: 'read' },
  ],
  viewer: [
    { resource: 'products', action: 'read' },
    { resource: 'suppliers', action: 'read' },
    { resource: 'customers', action: 'read' },
    { resource: 'orders', action: 'read' },
    { resource: 'inbound_orders', action: 'read' },
    { resource: 'supplier_bills', action: 'read' },
    { resource: 'installment_payments', action: 'read' },
    { resource: 'product_categories', action: 'read' },
    { resource: 'units', action: 'read' },
  ],
};

export const createUserMembership = async (data: CreateMembershipData): Promise<UserMembership> => {
  const membershipId = uuidv4();
  const now = Date.now();
  
  const membershipData: UserMembership = {
    id: membershipId,
    ...data,
    permissions: ROLE_PERMISSIONS[data.role],
    status: 'active',
    joinedAt: now,
    updatedAt: now,
  };

  const membershipRef = doc(db, USER_MEMBERSHIPS_COLLECTION, membershipId);
  await setDoc(membershipRef, membershipData);
  
  return membershipData;
};

export const getUserMembership = async (userID: string, organizationId?: string): Promise<UserMembership | null> => {
    const constraints: QueryConstraint[] = [where('userID', '==', userID), where('status', '==', 'active')]
 
  if (organizationId) {
    constraints.push(where('organizationId', '==', organizationId))
  }
  
  const querySnapshot = await getDocs(query(collection(db, USER_MEMBERSHIPS_COLLECTION), ...constraints));
  
  if (querySnapshot.empty) {
    return null;
  }
  
  // Return the first active membership
  return querySnapshot.docs[0].data() as UserMembership;
};

export const getUserMemberships = async (userID: string): Promise<UserMembership[]> => {
  const q = query(
    collection(db, USER_MEMBERSHIPS_COLLECTION),
    where('userID', '==', userID),
    where('status', '==', 'active')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as UserMembership);
};

export const updateUserMembership = async (membershipId: string, data: Partial<UserMembership>): Promise<UserMembership> => {
  const membershipRef = doc(db, USER_MEMBERSHIPS_COLLECTION, membershipId);
  const updateData = {
    ...data,
    updatedAt: Date.now(),
  };
  
  await updateDoc(membershipRef, updateData);
  
  const updatedMembership = await getDoc(membershipRef);
  if (!updatedMembership.exists()) {
    throw new Error('Membership not found');
  }
  
  return updatedMembership.data() as UserMembership;
};

export const deleteUserMembership = async (membershipId: string): Promise<void> => {
  const membershipRef = doc(db, USER_MEMBERSHIPS_COLLECTION, membershipId);
  await deleteDoc(membershipRef);
};

export const getOrganizationMembers = async (organizationId: string): Promise<UserMembership[]> => {
  const q = query(
    collection(db, USER_MEMBERSHIPS_COLLECTION),
    where('organizationId', '==', organizationId),
    where('status', '==', 'active')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as UserMembership);
};

export const checkPermission = async (userID: string, organizationId: string, resource: string, action: string): Promise<boolean> => {
  const membership = await getUserMembership(userID, organizationId);
  
  if (!membership) {
    return false;
  }
  
  return membership.permissions.some(permission => {
    // Check for wildcard permissions
    if (permission.resource === '*' && permission.action === '*') {
      return true;
    }
    if (permission.resource === '*' && permission.action === action) {
      return true;
    }
    if (permission.resource === resource && permission.action === '*') {
      return true;
    }
    
    // Check specific permission
    return permission.resource === resource && permission.action === action;
  });
}; 