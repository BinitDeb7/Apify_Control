import { apiRequest } from "./queryClient";

export interface AuthResponse {
  success: boolean;
  sessionId: string;
  user: {
    id: string;
    username: string;
  };
  actors: Array<{
    id: string;
    actorId: string;
    name: string;
    description: string;
    runCount: string;
    lastRun: string | null;
    isSelected: boolean;
  }>;
}

export interface ExecutionResponse {
  success: boolean;
  executionId: string;
  runId: string;
  status: string;
}

export interface ExecutionStatus {
  id: string;
  status: string;
  stats?: {
    inputBodyLen?: number;
    outputBodyLen?: number;
    requestsFinished?: number;
    requestsFailed?: number;
  };
  results?: any[];
  startedAt: string;
  finishedAt?: string;
}

let authToken: string | null = null;

export const setAuthToken = (token: string) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

export const clearAuthToken = () => {
  authToken = null;
};

const getAuthHeaders = () => ({
  ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
});

export const api = {
  async validateApiKey(apiKey: string): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/auth/validate", { apiKey });
    return response.json();
  },

  async getActors() {
    const response = await fetch("/api/actors", {
      headers: getAuthHeaders(),
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch actors");
    return response.json();
  },

  async getActorSchema(actorId: string) {
    const response = await fetch(`/api/actors/${actorId}/schema`, {
      headers: getAuthHeaders(),
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch actor schema");
    return response.json();
  },

  async selectActor(actorId: string) {
    const response = await fetch(`/api/actors/${actorId}/select`, {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to select actor");
    return response.json();
  },

  async executeActor(actorId: string, inputs: any): Promise<ExecutionResponse> {
    const response = await apiRequest("POST", "/api/actors/execute", {
      actorId,
      inputs,
    });
    return response.json();
  },

  async getExecutionStatus(executionId: string): Promise<ExecutionStatus> {
    const response = await fetch(`/api/executions/${executionId}/status`, {
      headers: getAuthHeaders(),
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch execution status");
    return response.json();
  },
};
