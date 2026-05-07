import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    organizationId: string;
  } | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: AuthState['user']; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoading = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', action.payload.token);
        document.cookie = `auth_token=${encodeURIComponent(action.payload.token)}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
      }
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoading = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        document.cookie = 'auth_token=; path=/; max-age=0; samesite=lax';
      }
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    setUser: (state, action: PayloadAction<AuthState['user']>) => {
      state.user = action.payload;
    },
    initializeAuth: (state) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token) {
          state.token = token;
          document.cookie = `auth_token=${encodeURIComponent(token)}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
        } else {
          document.cookie = 'auth_token=; path=/; max-age=0; samesite=lax';
        }
      }
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, setToken, setUser, initializeAuth } = authSlice.actions;
export default authSlice.reducer;