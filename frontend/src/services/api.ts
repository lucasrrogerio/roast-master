const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('roast_master_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401 && endpoint !== '/auth/login') {
    localStorage.removeItem('roast_master_token');
    window.dispatchEvent(new Event('auth:unauthorized'));
  }

  if (!response.ok) {
    throw new Error(data.error || `Erro HTTP ${response.status}: ${response.statusText}`);
  }

  return data as T;
}
