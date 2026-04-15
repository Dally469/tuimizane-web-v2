import apiClient from '@/lib/api-client';
import { ApiResponse, LoginRequest, LoginResponse, ChangePasswordRequest } from '@/types/api';

export class AuthService {
  // Login
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', credentials);
    
    // Store token if login successful
    if (response.success && response.data?.token) {
      apiClient.setToken(response.data.token);
    }
    
    return response;
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout');
    } finally {
      // Always clear token on logout
      apiClient.clearToken();
    }
  }

  // Change password
  async changePassword(request: ChangePasswordRequest): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/api/auth/change-password', request);
  }

  // Validate token
  async validateToken(): Promise<ApiResponse<boolean>> {
    return apiClient.get<boolean>('/api/auth/validate');
  }

  // Refresh token
  async refreshToken(): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<LoginResponse>('/api/auth/refresh');
    
    // Update token if refresh successful
    if (response.success && response.data?.token) {
      apiClient.setToken(response.data.token);
    }
    
    return response;
  }

  // Get current user info
  async getCurrentUser(): Promise<ApiResponse<any>> {
    return apiClient.get<any>('/api/auth/me');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!apiClient.getToken();
  }

  // Get stored token
  getToken(): string | null {
    return apiClient.getToken();
  }
}

export const authService = new AuthService();
