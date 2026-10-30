import { User, Policy, Claim, CustomerUser } from './types';

const TOKEN_KEY = 'tailvar_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  login: (credentials: { username: string; password: string }) =>
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getCurrentUser: () =>
    request<{ user: User }>('/api/auth/me'),

  logout: () =>
    request<{ message: string }>('/api/auth/logout', { method: 'POST' }),

  // Policies
  getPolicies: () =>
    request<{ policies: Policy[] }>('/api/policies'),

  getPolicyById: (id: string) =>
    request<{ policy: Policy }>('/api/policies/' + id),

  createPolicy: (data: {
    customerId: string;
    startDate: string;
    endDate: string;
    sumInsured: number;
    customId?: string;
  }) =>
    request<{ message: string; policy: Policy }>('/api/policies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Claims
  getClaims: () =>
    request<{ claims: Claim[] }>('/api/claims'),

  submitClaim: (data: {
    policyId: string;
    incidentDate: string;
    amount: number;
    customId?: string;
  }) =>
    request<{ message: string; claim: Claim; remainingClaimableSI: number }>('/api/claims', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  decideClaim: (id: string, decision: 'Approved' | 'Rejected') =>
    request<{
      message: string;
      claim: Claim;
      policyRemainingClaimableSI: number;
    }>(`/api/claims/${id}/decision`, {
      method: 'PATCH',
      body: JSON.stringify({ decision }),
    }),

  // Customers (Admin only)
  getCustomers: () =>
    request<{ customers: CustomerUser[] }>('/api/customers'),

  // AI Assistant
  chatWithAI: (data: {
    message: string;
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  }) =>
    request<{ reply: string; suggestedQuestions?: string[] }>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
