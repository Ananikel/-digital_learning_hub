const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('auth_token');
  
  const headers: any = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('auth_token');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(error.message || response.statusText);
  }

  return response.json();
}

export const api = {
  auth: {
    login: (credentials: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (data: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  },
  subjects: {
    getAll: () => request('/subjects'),
    getOne: (id: number) => request(`/subjects/${id}`),
    create: (data: any) => request('/subjects', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request(`/subjects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: number) => request(`/subjects/${id}`, { method: 'DELETE' }),
  },
  learners: {
    getAll: () => request('/learners'),
    getOne: (id: number) => request(`/learners/${id}`),
    create: (data: any) => request('/learners', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request(`/learners/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: number) => request(`/learners/${id}`, { method: 'DELETE' }),
  },
  cohorts: {
    getAll: () => request('/cohorts'),
    getOne: (id: number) => request(`/cohorts/${id}`),
    create: (data: any) => request('/cohorts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request(`/cohorts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: number) => request(`/cohorts/${id}`, { method: 'DELETE' }),
  },
  courses: {
    getAll: () => request('/courses'),
    getOne: (id: number) => request(`/courses/${id}`),
    create: (data: any) => request('/courses', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request(`/courses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: number) => request(`/courses/${id}`, { method: 'DELETE' }),
  },
  payments: {
    getAll: () => request('/payments'),
    getOne: (id: number) => request(`/payments/${id}`),
    create: (data: any) => request('/payments', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request(`/payments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: number) => request(`/payments/${id}`, { method: 'DELETE' }),
  },
};
