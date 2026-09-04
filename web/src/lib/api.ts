/**
 * API client for IMEI Verification Platform
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('tekshir_token');
}

export function setToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('tekshir_token', token);
}

export function clearToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('tekshir_token');
  localStorage.removeItem('tekshir_user');
}

export function getSavedUser(): any | null {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('tekshir_user');
  return user ? JSON.parse(user) : null;
}

export function setSavedUser(user: any) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('tekshir_user', JSON.stringify(user));
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as any),
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data?.message || data?.error || 'Xatolik yuz berdi';
    throw new Error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
  }

  return data;
}

export const api = {
  auth: {
    sendOtp: (phone: string) =>
      request<{ success: boolean; message: string; devCode?: string }>('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      }),
    verifyOtp: (phone: string, code: string, name?: string) =>
      request<{ user: any; accessToken: string; refreshToken: string }>('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phone, code, name }),
      }),
    adminLogin: (phone: string, pass: string) =>
      request<{ user: any; accessToken: string; refreshToken: string }>('/auth/admin-login', {
        method: 'POST',
        body: JSON.stringify({ phone, password: pass }),
      }),
    getMe: () => request<any>('/me'),
    logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),
  },
  credits: {
    getMyCredits: () => request<{ credits: number }>('/credits'),
  },
  packages: {
    getActive: () => request<any[]>('/packages'),
  },
  payments: {
    create: (packageId: string, provider: string = 'PAYME') =>
      request<any>('/payments', {
        method: 'POST',
        body: JSON.stringify({ packageId, provider }),
      }),
    complete: (paymentId: string) =>
      request<any>(`/payments/${paymentId}/complete`, {
        method: 'POST',
      }),
    getMyPayments: () => request<any[]>('/payments'),
  },
  verification: {
    verify: (imei: string) =>
      request<any>('/verifications', {
        method: 'POST',
        body: JSON.stringify({ imei }),
      }),
    getHistory: () => request<any[]>('/verifications'),
    getDetail: (id: string) => request<any>(`/verifications/${id}`),
  },
  partner: {
    getDevices: (search?: string) =>
      request<any[]>(`/partners/cabinet/devices${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    addDevice: (imei: string, status: string) =>
      request<any>('/partners/cabinet/devices', {
        method: 'POST',
        body: JSON.stringify({ imei, status }),
      }),
    deleteDevice: (deviceId: string) =>
      request<any>(`/partners/cabinet/devices/${deviceId}`, {
        method: 'DELETE',
      }),
    importCsv: (fileName: string, csvContent: string) =>
      request<any>('/partners/cabinet/import-csv', {
        method: 'POST',
        body: JSON.stringify({ fileName, csvContent }),
      }),
    getImportBatches: () => request<any[]>('/partners/cabinet/import-batches'),
  },
  admin: {
    getDashboard: () => request<any>('/admin/dashboard'),
    getUsers: (search?: string) =>
      request<any[]>(`/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    updateUserStatus: (userId: string, status: 'ACTIVE' | 'BLOCKED') =>
      request<any>(`/admin/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
    getVerifications: () => request<any[]>('/admin/verifications'),
    getPayments: () => request<any[]>('/admin/payments'),
    getAuditLogs: () => request<any[]>('/admin/audit-logs'),
    getPartners: () => request<any[]>('/partners'),
  },
};
