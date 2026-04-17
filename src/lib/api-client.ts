import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, ApiError, AuthHeaders } from '@/types/api';

declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuth?: boolean;
  }
}

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.token && !config.skipAuth && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle common errors
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        return response;
      },
      (error: AxiosError<ApiResponse>) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - clear token and redirect to login
          this.clearToken();
          window.location.href = '/login';
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  // Token management
  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  getToken(): string | null {
    if (this.token) {
      return this.token;
    }
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  // Initialize token from storage
  initializeToken(): void {
    this.getToken();
  }

  // Error handling
  private handleError(error: AxiosError<ApiResponse>): ApiError {
    const apiError: ApiError = {
      status: error.response?.status || 500,
      message: 'An unexpected error occurred',
    };

    if (error.response?.data) {
      apiError.message = error.response.data.message || apiError.message;
      apiError.details = error.response.data.data;
    } else if (error.message) {
      apiError.message = error.message;
    }

    return apiError;
  }

  // HTTP Methods
  async get<T>(url: string, params?: Record<string, any>, headers?: Record<string, string>, skipAuth?: boolean): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<ApiResponse<T>>(url, { params, headers, skipAuth });
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ApiResponse>);
    }
  }

  async post<T>(url: string, data?: any, headers?: Record<string, string>, skipAuth?: boolean): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<ApiResponse<T>>(url, data, { headers, skipAuth });
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ApiResponse>);
    }
  }

  async put<T>(url: string, data?: any, headers?: Record<string, string>, skipAuth?: boolean): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<ApiResponse<T>>(url, data, { headers, skipAuth });
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ApiResponse>);
    }
  }

  async delete<T>(url: string, data?: any, headers?: Record<string, string>, skipAuth?: boolean): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<ApiResponse<T>>(url, { data, headers, skipAuth });
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ApiResponse>);
    }
  }

  async patch<T>(url: string, data?: any, headers?: Record<string, string>, skipAuth?: boolean): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<ApiResponse<T>>(url, data, { headers, skipAuth });
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ApiResponse>);
    }
  }

  // File upload
  async upload<T>(url: string, formData: FormData, onProgress?: (progress: number) => void, headers?: Record<string, string>, skipAuth?: boolean): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<ApiResponse<T>>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...headers,
        },
        skipAuth,
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ApiResponse>);
    }
  }

  // Download file
  async download(url: string, filename?: string, headers?: Record<string, string>, skipAuth?: boolean): Promise<void> {
    try {
      const response = await this.client.get(url, {
        responseType: 'blob',
        headers,
        skipAuth,
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      throw this.handleError(error as AxiosError<ApiResponse>);
    }
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// Initialize token on client side
if (typeof window !== 'undefined') {
  apiClient.initializeToken();
}

export default apiClient;
