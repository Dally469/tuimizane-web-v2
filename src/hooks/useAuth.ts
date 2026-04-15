import { useState, useEffect, useCallback } from 'react';
import { authService } from '@/services';
import { LoginRequest, ApiResponse, LoginResponse } from '@/types/api';

interface UseAuthReturn {
  user: LoginResponse['user'] | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<LoginResponse['user'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const response = await authService.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setError('Failed to verify authentication');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        return true;
      } else {
        setError(response.message || 'Login failed');
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.changePassword({
        currentPassword,
        newPassword,
      });

      if (response.success) {
        return true;
      } else {
        setError(response.message || 'Password change failed');
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Password change failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    logout,
    changePassword,
    clearError,
  };
};
