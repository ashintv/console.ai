/**
 * API Client for Console AI Backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (fetchOptions.headers instanceof Headers) {
    fetchOptions.headers.forEach((value, key) => {
      headers[key] = value;
    });
  } else if (typeof fetchOptions.headers === 'object' && fetchOptions.headers !== null) {
    Object.assign(headers, fetchOptions.headers);
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(response.status, data.message || response.statusText, data);
  }

  return response.json();
}

// Type definitions
export interface Project {
  id: string;
  name: string;
  description?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  isActive: boolean;
  lastUsedAt?: string;
  createdAt: string;
}

export interface ErrorEvent {
  id: string;
  message: string;
  source?: string;
  language?: string;
  framework?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  aiAnalysis?: string;
}

// Response types
interface AuthResponse {
  token: string;
  user: User;
}

interface ProjectsResponse {
  projects: Project[];
}

interface SingleProjectResponse {
  project: Project;
}

interface ApiKeysResponse {
  keys: ApiKey[];
}

interface EventsResponse {
  events: ErrorEvent[];
}

// Auth endpoints
export const authApi = {
  signin: async (email: string, password: string): Promise<AuthResponse> => {
    return request('/users/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  signup: async (email: string, password: string, name: string): Promise<AuthResponse> => {
    return request('/users/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },

  getMe: async (token: string): Promise<{ user: User }> => {
    return request('/users/me', { token });
  },
};

// Projects endpoints
export const projectsApi = {
  list: async (token: string): Promise<ProjectsResponse> => {
    return request('/projects', { token });
  },

  get: async (id: string, token: string): Promise<SingleProjectResponse> => {
    return request(`/projects/${id}`, { token });
  },

  create: async (
    data: { name: string; description?: string },
    token: string
  ): Promise<SingleProjectResponse> => {
    return request('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    });
  },

  update: async (
    id: string,
    data: { name?: string; description?: string },
    token: string
  ): Promise<SingleProjectResponse> => {
    return request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    });
  },

  delete: async (id: string, token: string): Promise<void> => {
    return request(`/projects/${id}`, {
      method: 'DELETE',
      token,
    });
  },
};

// API Keys endpoints
export const apiKeysApi = {
  list: async (projectId: string, token: string): Promise<ApiKeysResponse> => {
    return request(`/projects/${projectId}/api-keys`, { token });
  },

  create: async (
    projectId: string,
    name: string,
    token: string
  ): Promise<{ key: ApiKey }> => {
    return request(`/projects/${projectId}/api-keys`, {
      method: 'POST',
      body: JSON.stringify({ name }),
      token,
    });
  },

  delete: async (projectId: string, keyId: string, token: string): Promise<void> => {
    return request(`/projects/${projectId}/api-keys/${keyId}`, {
      method: 'DELETE',
      token,
    });
  },
};

// Events/Errors endpoints
export interface QueryEventsFilter {
  projectId?: string;
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}

export const eventsApi = {
  list: async (token: string, filters?: QueryEventsFilter): Promise<EventsResponse> => {
    const params = new URLSearchParams();
    if (filters?.projectId) params.append('projectId', filters.projectId);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const query = params.toString();
    return request(`/events${query ? '?' : ''}${query}`, { token });
  },

  getByProject: async (projectId: string, token: string, filters?: Omit<QueryEventsFilter, 'projectId'>): Promise<EventsResponse> => {
    const params = new URLSearchParams();
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const query = params.toString();
    return request(`/events/project/${projectId}${query ? '?' : ''}${query}`, { token });
  },

  get: async (id: string, token: string): Promise<{ event: ErrorEvent }> => {
    return request(`/events/${id}`, { token });
  },

  update: async (id: string, data: any, token: string): Promise<{ event: ErrorEvent }> => {
    return request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    });
  },

  delete: async (id: string, token: string): Promise<void> => {
    return request(`/events/${id}`, {
      method: 'DELETE',
      token,
    });
  },
};

