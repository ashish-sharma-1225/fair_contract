import type {
  Analysis,
  Contract,
  ContractExtraction,
  Finding,
  Policy,
  RegulatoryRule,
  ReviewStatus,
} from '../types';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export class ApiError extends Error {
  status: number;
  statusText: string;
  data: unknown;

  constructor(status: number, statusText: string, data?: unknown) {
    const message =
      (typeof data === 'object' && data !== null && 'detail' in data)
        ? String((data as { detail: unknown }).detail)
        : `API Error: ${status} ${statusText}`;
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options?.headers);

  if (!(options?.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Network connection failed';
    throw new ApiError(0, 'Network Error', { detail: `Could not connect to backend at ${API_BASE_URL}. ${errorMsg}` });
  }

  if (!response.ok) {
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text();
    }
    throw new ApiError(response.status, response.statusText, errorData);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const apiClient = {
  // Service health check
  async checkHealth(): Promise<{ status: string; version?: string; timestamp?: string }> {
    return request<{ status: string; version?: string; timestamp?: string }>('/api/health');
  },

  // Contracts
  async getContracts(): Promise<Contract[]> {
    return request<Contract[]>('/api/contracts');
  },

  async getContract(id: string): Promise<Contract> {
    return request<Contract>(`/api/contracts/${id}`);
  },

  async uploadContract(file: File): Promise<Contract> {
    const formData = new FormData();
    formData.append('file', file);
    return request<Contract>('/api/contracts', {
      method: 'POST',
      body: formData,
    });
  },

  async getContractExtraction(id: string): Promise<ContractExtraction> {
    return request<ContractExtraction>(`/api/contracts/${id}/extract`);
  },

  async deleteContract(id: string): Promise<{ success: boolean; id: string }> {
    return request<{ success: boolean; id: string }>(`/api/contracts/${id}`, {
      method: 'DELETE',
    });
  },

  // Analyses
  async getAnalyses(): Promise<Analysis[]> {
    return request<Analysis[]>('/api/analyses');
  },

  async getAnalysis(id: string): Promise<Analysis> {
    return request<Analysis>(`/api/analyses/${id}`);
  },

  async startAnalysis(
    contractId: string,
    params: { policy_ids: string[]; regulatory_rule_ids: string[] }
  ): Promise<Analysis> {
    return request<Analysis>(`/api/contracts/${contractId}/analyze`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async deleteAnalysis(id: string): Promise<{ success: boolean; id: string }> {
    return request<{ success: boolean; id: string }>(`/api/analyses/${id}`, {
      method: 'DELETE',
    });
  },

  async updateFindingReview(
    findingId: string,
    reviewStatus: ReviewStatus
  ): Promise<Finding> {
    return request<Finding>(`/api/findings/${findingId}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ review_status: reviewStatus }),
    });
  },

  // Policies
  async getPolicies(): Promise<Policy[]> {
    return request<Policy[]>('/api/policies');
  },

  async createPolicy(policy: Omit<Policy, 'id' | 'created_at' | 'updated_at'>): Promise<Policy> {
    return request<Policy>('/api/policies', {
      method: 'POST',
      body: JSON.stringify(policy),
    });
  },

  async updatePolicy(id: string, updates: Partial<Policy>): Promise<Policy> {
    return request<Policy>(`/api/policies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deletePolicy(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/policies/${id}`, {
      method: 'DELETE',
    });
  },

  // Regulatory Rules
  async getRegulatoryRules(): Promise<RegulatoryRule[]> {
    return request<RegulatoryRule[]>('/api/regulatory-rules');
  },
};
