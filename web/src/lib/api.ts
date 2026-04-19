const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

async function request(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  // Don't set Content-Type for FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw { status: res.status, ...data };
  return data;
}

export const authAPI = {
  sendCode: (email: string) => request('/auth/send-code', { method: 'POST', body: JSON.stringify({ email }) }),
  register: (email: string, password: string, code: string, name?: string) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, code, name }) }),
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getMe: () => request('/auth/me'),
};

export const stripeAPI = {
  createCheckout: (reportId: string) =>
    request('/stripe/checkout', { method: 'POST', body: JSON.stringify({ reportId }) }),
};

export const reportAPI = {
  create: (formData: FormData) => request('/reports', { method: 'POST', body: formData }),
  getAll: () => request('/reports'),
  getById: (id: string) => request(`/reports/${id}`),
  getStatus: (id: string) => request(`/reports/${id}/status`),
  unlock: (id: string, transactionId: string, productId: string) =>
    request(`/reports/${id}/unlock`, { method: 'POST', body: JSON.stringify({ transactionId, productId }) }),
};
