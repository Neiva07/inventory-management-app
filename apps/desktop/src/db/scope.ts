export interface ScopeInput {
  userID: string;
  organizationId?: string;
}

// Migration compatibility: prefer explicit organization scope, fallback to user scope
// for call sites that have not been updated yet.
export const resolveOrganizationId = ({ userID, organizationId }: ScopeInput): string => {
  if (organizationId && organizationId.trim().length > 0) {
    return organizationId;
  }

  return userID;
};
