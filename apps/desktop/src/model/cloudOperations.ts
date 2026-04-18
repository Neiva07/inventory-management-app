import {
  getSyncApiClient,
  OrgSearchResult,
  InvitationValidationResult,
  JoinOrgResult,
} from "../db/syncApiClient";

const requireApiClient = () => {
  const client = getSyncApiClient();
  if (!client) {
    throw new Error("Sync API client not initialized — are you online and logged in?");
  }
  return client;
};

/** Searches organizations the current user does NOT belong to. */
export const searchRemoteOrganizations = async (query: string): Promise<OrgSearchResult[]> => {
  const client = requireApiClient();
  return client.searchOrganizations(query);
};

/** Validates an invitation code against a specific organization on the cloud. */
export const validateRemoteInvitationCode = async (
  orgId: string,
  code: string,
): Promise<InvitationValidationResult> => {
  const client = requireApiClient();
  return client.validateInvitationCode(orgId, code);
};

/** Joins a remote organization using an invitation code. */
export const joinRemoteOrganization = async (
  orgId: string,
  invitationCode: string,
  message?: string,
): Promise<JoinOrgResult> => {
  const client = requireApiClient();
  return client.joinOrganization(orgId, invitationCode, message);
};
