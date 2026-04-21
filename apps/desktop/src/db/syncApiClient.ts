import axios, { AxiosInstance } from "axios";

// ---------------------------------------------------------------------------
// Sync Push types
// ---------------------------------------------------------------------------

export interface SyncPushChange {
  syncQueueId: string;
  organizationId: string;
  tableName: string;
  recordId: string;
  operation: "create" | "update" | "delete";
  payload: Record<string, unknown>;
  clientTimestamp: number;
}

export interface SyncPushRequest {
  clientId: string;
  changes: SyncPushChange[];
}

export interface SyncPushRejection {
  syncQueueId: string;
  reason: string;
}

export interface SyncPushResponse {
  accepted: string[];
  rejected: SyncPushRejection[];
  serverTimestamp: number;
}

// ---------------------------------------------------------------------------
// Sync Pull types
// ---------------------------------------------------------------------------

export interface SyncPullScope {
  type: "organization" | "user";
  id: string;
  lastSyncTimestamp: number;
}

export interface SyncPullRequest {
  scopes: SyncPullScope[];
  limit?: number;
}

export interface SyncPullChange {
  tableName: string;
  recordId: string;
  operation: "upsert" | "delete";
  data: Record<string, unknown> | null;
  serverTimestamp: number;
}

export interface SyncPullScopeResult {
  type: "organization" | "user";
  id: string;
  changes: SyncPullChange[];
  newWatermark: number;
  hasMore: boolean;
}

export interface SyncPullResponse {
  scopes: SyncPullScopeResult[];
  serverTimestamp: number;
}

// ---------------------------------------------------------------------------
// Cloud-only operation types
// ---------------------------------------------------------------------------

export interface OrgSearchResult {
  id: string;
  name: string;
  memberCount: number;
}

export interface InvitationValidationResult {
  valid: boolean;
  organizationId?: string;
  organizationName?: string;
  expiresAt?: number;
}

export interface JoinOrgResult {
  membershipId: string;
  organizationId: string;
  role: string;
  status: string;
}

export interface HealthCheckResult {
  status: string;
  serverTimestamp: number;
}

// ---------------------------------------------------------------------------
// Client config
// ---------------------------------------------------------------------------

export interface SyncApiClientConfig {
  baseUrl: string;
  getSessionToken: () => string | null;
  clientId: string;
  userId?: string;
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export class SyncApiClient {
  private readonly client: AxiosInstance;
  private readonly clientId: string;

  constructor(config: SyncApiClientConfig) {
    this.clientId = config.clientId;

    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: 30_000,
      headers: { "Content-Type": "application/json" },
    });

    this.client.interceptors.request.use((req) => {
      const token = config.getSessionToken();
      if (token) {
        req.headers.Authorization = `Bearer ${token}`;
      }
      if (config.userId) {
        req.headers["X-Local-User-Id"] = config.userId;
      }
      req.headers["X-Client-Id"] = this.clientId;
      return req;
    });
  }

  getClientId(): string {
    return this.clientId;
  }

  // -- Sync endpoints ------------------------------------------------------

  async pushChanges(request: SyncPushRequest): Promise<SyncPushResponse> {
    const { data } = await this.client.post<SyncPushResponse>("/api/v1/sync/push", request);
    return data;
  }

  async pullChanges(request: SyncPullRequest): Promise<SyncPullResponse> {
    const { data } = await this.client.post<SyncPullResponse>("/api/v1/sync/pull", request);
    return data;
  }

  // -- Cloud-only operations -----------------------------------------------

  async searchOrganizations(query: string): Promise<OrgSearchResult[]> {
    const { data } = await this.client.get<{ organizations: OrgSearchResult[] }>(
      "/api/v1/organizations/search",
      { params: { q: query } },
    );
    return data.organizations;
  }

  async validateInvitationCode(orgId: string, code: string): Promise<InvitationValidationResult> {
    const { data } = await this.client.post<InvitationValidationResult>(
      `/api/v1/organizations/${orgId}/validate-invitation`,
      { code },
    );
    return data;
  }

  async joinOrganization(orgId: string, invitationCode: string, message?: string): Promise<JoinOrgResult> {
    const { data } = await this.client.post<JoinOrgResult>(
      `/api/v1/organizations/${orgId}/join`,
      { invitationCode, message },
    );
    return data;
  }

  // -- Health ---------------------------------------------------------------

  async healthCheck(): Promise<HealthCheckResult> {
    const { data } = await this.client.get<HealthCheckResult>("/api/v1/health");
    return data;
  }
}

// ---------------------------------------------------------------------------
// Singleton management
// ---------------------------------------------------------------------------

let apiClientInstance: SyncApiClient | null = null;

export const initSyncApiClient = (config: SyncApiClientConfig): SyncApiClient => {
  apiClientInstance = new SyncApiClient(config);
  return apiClientInstance;
};

export const getSyncApiClient = (): SyncApiClient | null => {
  return apiClientInstance;
};

export const clearSyncApiClient = (): void => {
  apiClientInstance = null;
};
