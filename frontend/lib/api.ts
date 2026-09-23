const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include', // backend cookie sena/vanga idhu mandatory
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  let body: any = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    const message =
      (body && (Array.isArray(body.message) ? body.message.join(', ') : body.message)) ||
      'Something went wrong';
    throw new ApiError(message, res.status);
  }

  return body as T;
}

export const api = {
  register: (data: { name: string; email: string; password: string }) =>
    request<{ message: string; user: ApiUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ message: string; user: ApiUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),

  me: () => request<ApiUser>('/auth/me'),

  listUsers: () => request<ApiUser[]>('/users'),

  getUser: (id: string) => request<ApiUser>(`/users/${id}`),

  updateMe: (data: { name?: string; email?: string }) =>
    request<ApiUser>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteMe: () => request<{ message: string }>('/users/me', { method: 'DELETE' }),
};