import { store } from '@/store';
import { logout } from '@/store/authSlice';

let isSessionRedirecting = false;

export const httpRequest = {
  get: request('GET'),
  post: request('POST'),
  put: request('PUT'),
  delete: request('DELETE'),
  patch: request('PATCH'),
};

function request(method: string) {
  return (url: string, body?: any, multipart = false) => {
    const requestOptions: RequestInit = {
      method,
      headers: authHeader(url),
      credentials: 'include',
    };
    if (body && !multipart) {
      (requestOptions.headers as Record<string, string>)['Content-Type'] = 'application/json';
      requestOptions.body = JSON.stringify(body);
    }
    if (body && multipart) {
      requestOptions.body = body;
    }
    return fetch('/api' + url, requestOptions).then(handleResponse);
  };
}

function authHeader(url: string): Record<string, string> {
  const { auth } = store.getState();
  const token =
    auth.token ||
    (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);
  const isLoggedIn = token && token !== '';

  const headers: Record<string, string> = {
    'Accept-Language': 'en',
  };

  if (isLoggedIn) {
    headers.Authorization = `${token}`;
  }
  return headers;
}

function handleSessionExpired(): void {
  const { auth } = store.getState();
  const hasTokenInStore = Boolean(auth.token);
  const hasTokenInStorage = typeof window !== 'undefined' && Boolean(localStorage.getItem('auth_token'));

  if (!hasTokenInStore && !hasTokenInStorage) {
    return;
  }

  store.dispatch(logout());

  if (typeof window !== 'undefined' && !isSessionRedirecting && window.location.pathname !== '/login') {
    isSessionRedirecting = true;
    window.location.replace('/login?reason=session_expired');
  }
}

function isSessionExpiredPayload(data: any): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const status = Number(data.status);
  if (status === 401) {
    return true;
  }

  const message = typeof data.message === 'string' ? data.message.toLowerCase() : '';
  return message.includes('token') && (message.includes('expired') || message.includes('invalid') || message.includes('unauthorized'));
}

async function handleResponse(response: Response) {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson && response.status !== 204 ? await response.json() : null;

  if (response.status === 204) {
    return Promise.resolve({ status: 204, message: 'No Content' });
  } else if (!response.ok) {
    if (response.status === 401) {
      // Auto logout only on 401 Unauthorized (expired/invalid token)
      // 403 Forbidden means authenticated but lacking permission — don't logout
      handleSessionExpired();
    } else if (response.status === 404) {
      console.error('Entity not found', data?.message);
    }
    console.error(data?.message || response.statusText);
    return Promise.reject(data || { message: response.statusText });
  }

  if (isSessionExpiredPayload(data)) {
    handleSessionExpired();
    return Promise.reject(data);
  }

  return data;
}
