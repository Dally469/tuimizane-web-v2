import { httpRequest } from '@/lib/httpRequest';
import { ApiResponse, LoginRequest, LoginResponse, ChangePasswordRequest } from '@/types/api';

export class AuthService {
  private unwrapResponse<T>(response: ApiResponse<T> | T, fallbackMessage: string): ApiResponse<T> {
    if (
      response &&
      typeof response === 'object' &&
      'success' in (response as Record<string, unknown>) &&
      'status' in (response as Record<string, unknown>)
    ) {
      return response as ApiResponse<T>;
    }

    return {
      status: 200,
      success: true,
      message: fallbackMessage,
      data: response as T,
    };
  }

  // Login
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await httpRequest.post('/auth/login', credentials);
      return this.unwrapResponse<LoginResponse>(response, 'Login successful');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Login failed' };
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await httpRequest.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors
      console.warn('Logout request failed:', error);
    }
  }

  // Change password
  async changePassword(request: ChangePasswordRequest): Promise<ApiResponse<void>> {
    try {
      await httpRequest.post('/auth/change-password', request);
      return { status: 200, success: true, message: 'Password changed successfully' };
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Change password failed' };
    }
  }

  // Validate token
  async validateToken(): Promise<ApiResponse<boolean>> {
    try {
      const response = await httpRequest.get('/auth/validate');
      return this.unwrapResponse<boolean>(response, 'Token is valid');
    } catch (error: any) {
      return { status: 401, success: false, message: error.message || 'Token validation failed' };
    }
  }

  // Refresh token
  async refreshToken(): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await httpRequest.post('/auth/refresh');
      return this.unwrapResponse<LoginResponse>(response, 'Token refreshed successfully');
    } catch (error: any) {
      return { status: 401, success: false, message: error.message || 'Token refresh failed' };
    }
  }

  // Get current user info
  async getCurrentUser(): Promise<ApiResponse<any>> {
    try {
      const response = await httpRequest.get('/auth/me');
      return this.unwrapResponse(response, 'User retrieved successfully');
    } catch (error: any) {
      return { status: 401, success: false, message: error.message || 'Failed to get current user' };
    }
  }
}

export const authService = new AuthService();
