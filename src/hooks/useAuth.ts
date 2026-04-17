import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { loginStart, loginSuccess, loginFailure, logout as logoutAction } from '@/store/authSlice';
import { authService } from '@/services';
import { LoginRequest } from '@/types/api';

interface UseAuthReturn {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const dispatch = useAppDispatch();
  const { user, isLoading, error } = useAppSelector((state) => state.auth);
  const isAuthenticated = !!user;

  const login = useCallback(async (credentials: LoginRequest): Promise<boolean> => {
    dispatch(loginStart());

    try {
      const response = await authService.login(credentials);
      
      if (response.success && response.data) {
        const userData = response.data;
        dispatch(loginSuccess({
          user: {
            id: userData.id,
            username: userData.username,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone,
            role: userData.role,
            organizationId: userData.organization?.id || '',
          },
          token: response.token!,
        }));
        toast.success('Login successful');
        return true;
      } else {
        const errorMessage = response.message || 'Login failed';
        dispatch(loginFailure(errorMessage));
        toast.error(errorMessage);
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      dispatch(loginFailure(errorMessage));
      toast.error(errorMessage);
      return false;
    }
  }, [dispatch]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      dispatch(logoutAction());
    }
  }, [dispatch]);

  const changePassword = useCallback(async (
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    try {
      const response = await authService.changePassword({
        currentPassword,
        newPassword,
      });

      if (response.success) {
        toast.success('Password changed successfully');
      } else {
        toast.error(response.message || 'Failed to change password');
      }
      return response.success;
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password');
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    // Since error is now from Redux, we might need to dispatch an action to clear it
    // For now, this is a no-op
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    logout,
    changePassword,
    clearError,
  };
};
