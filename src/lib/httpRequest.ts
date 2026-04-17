import { store } from '@/store';

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

async function handleResponse(response: Response) {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson && response.status !== 204 ? await response.json() : null;

  if (response.status === 204) {
    return Promise.resolve({ status: 204, message: 'No Content' });
  } else if (!response.ok) {
    const { auth } = store.getState();
    if (response.status === 401 && auth.token) {
      // Auto logout only on 401 Unauthorized (expired/invalid token)
      // 403 Forbidden means authenticated but lacking permission — don't logout
      store.dispatch({ type: 'auth/logout' });
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } else if (response.status === 404) {
      console.error('Entity not found', data?.message);
    }
    console.error(data?.message || response.statusText);
    return Promise.reject(data || { message: response.statusText });
  }

  return data;
}
