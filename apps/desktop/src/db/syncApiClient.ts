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
  clientResetGeneration: number;
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
  clientResetGeneration: number;
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

export interface ResetGenerationResult {
  resetGeneration: number;
  resetInProgress: boolean;
}

export class SyncResetRequiredError extends Error {
  readonly resetGeneration: number;

  constructor(resetGeneration: number) {
    super("reset_required");
    this.name = "SyncResetRequiredError";
    this.resetGeneration = resetGeneration;
  }
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
  private readonly userId?: string;

  constructor(config: SyncApiClientConfig) {
    this.clientId = config.clientId;
    this.userId = config.userId;

    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: 30_000,
      headers: { "Content-Type": "application/json" },
    });

    this.client.interceptors.request.use((req) => {
      const token = config.getSessionToken();
      if (token) {
        req.headers["X-Desktop-Session-Id"] = token;
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

  getUserId(): string | undefined {
    return this.userId;
  }

  private throwNormalizedError(error: unknown): never {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      const data = error.response.data as { code?: unknown; resetGeneration?: unknown } | undefined;
      if (data?.code === "reset_required") {
        const resetGeneration =
          typeof data.resetGeneration === "number" && Number.isFinite(data.resetGeneration)
            ? data.resetGeneration
            : 0;
        throw new SyncResetRequiredError(resetGeneration);
      }
    }

    throw error;
  }

  // -- Sync endpoints ------------------------------------------------------

  async pushChanges(request: SyncPushRequest): Promise<SyncPushResponse> {
    try {
      const { data } = await this.client.post<SyncPushResponse>("/api/v1/sync/push", request);
      return data;
    } catch (error) {
      this.throwNormalizedError(error);
    }
  }

  async pullChanges(request: SyncPullRequest): Promise<SyncPullResponse> {
    try {
      const { data } = await this.client.post<SyncPullResponse>("/api/v1/sync/pull", request);
      return data;
    } catch (error) {
      this.throwNormalizedError(error);
    }
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

  async getResetGeneration(): Promise<ResetGenerationResult> {
    const { data } = await this.client.get<ResetGenerationResult>("/api/v1/dev-admin/reset-generation");
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
