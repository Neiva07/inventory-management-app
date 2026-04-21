import type { RuntimeLogQueryRequest, RuntimeLogQueryResponse } from "@stockify/runtime-logging";

export interface RuntimeLogsToolClientConfig {
  baseUrl: string;
  apiKey: string;
}

export interface RuntimeLogLaunchBundle {
  exportedAt?: number;
  formatVersion?: number;
  summary: unknown;
  entries: unknown[];
}

const trimBaseUrl = (baseUrl: string): string => baseUrl.replace(/\/+$/, "");

export class RuntimeLogsToolClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(config: RuntimeLogsToolClientConfig) {
    this.baseUrl = trimBaseUrl(config.baseUrl);
    this.apiKey = config.apiKey;
  }

  async searchRuntimeLogs(filters: RuntimeLogQueryRequest): Promise<RuntimeLogQueryResponse> {
    return this.request<RuntimeLogQueryResponse>("/api/v1/runtime-logs/query", {
      method: "POST",
      body: JSON.stringify(filters),
    });
  }

  async getRuntimeLogLaunch(launchId: string): Promise<RuntimeLogLaunchBundle> {
    return this.request<RuntimeLogLaunchBundle>(`/api/v1/runtime-logs/launches/${encodeURIComponent(launchId)}`);
  }

  async exportRuntimeLogLaunch(launchId: string): Promise<RuntimeLogLaunchBundle> {
    return this.request<RuntimeLogLaunchBundle>(`/api/v1/runtime-logs/launches/${encodeURIComponent(launchId)}/export`);
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "X-Internal-API-Key": this.apiKey,
        ...init.headers,
      },
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message = payload && typeof payload === "object" && "error" in payload
        ? String((payload as { error: unknown }).error)
        : `Runtime logs API request failed with ${response.status}`;
      throw new Error(message);
    }

    return payload as T;
  }
}

export const runtimeLogMcpTools = [
  {
    name: "search_runtime_logs",
    description: "Search distributed desktop runtime logs with filters and full-text query.",
  },
  {
    name: "get_runtime_log_launch",
    description: "Fetch one launch summary and ordered event timeline.",
  },
  {
    name: "export_runtime_log_launch",
    description: "Fetch an export bundle for one launch.",
  },
] as const;
