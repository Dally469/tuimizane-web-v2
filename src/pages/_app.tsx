import React from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Provider } from 'react-redux';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { store } from '@/store';
import { initializeAuth, logout } from '@/store/authSlice';
import '@/styles/globals.css';
import { appTheme } from '@/theme/appTheme';

const PUBLIC_PATHS = new Set(['/login']);

const parseJwtExp = (token: string | null): number | null => {
  if (!token) return null;
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;
    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const decoded = JSON.parse(atob(padded));
    return typeof decoded.exp === 'number' ? decoded.exp : null;
  } catch {
    return null;
  }
};

const isExpired = (token: string | null): boolean => {
  const exp = parseJwtExp(token);
  if (!exp) return false;
  return Date.now() >= exp * 1000;
};

function SessionGuard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const auth = useSelector((state: any) => state.auth as { token: string | null; user: any });

  React.useEffect(() => {
    if (!router.isReady) return;

    const path = router.pathname;
    const isPublic = PUBLIC_PATHS.has(path);
    const hasToken = Boolean(auth?.token);
    const hasUser = Boolean(auth?.user);
    const expired = isExpired(auth?.token ?? null);

    if ((expired || (hasToken && !hasUser)) && !isPublic) {
      dispatch(logout());
      router.replace('/login?reason=session_expired');
      return;
    }

    if (!isPublic && (!hasToken || !hasUser)) {
      dispatch(logout());
      router.replace('/login');
      return;
    }

    if (isPublic && hasToken && hasUser && !expired) {
      router.replace('/dashboard');
    }
  }, [auth?.token, auth?.user, dispatch, router, router.isReady, router.pathname]);

  return null;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Initialize auth on app start
if (typeof window !== 'undefined') {
  store.dispatch(initializeAuth());
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={appTheme}>
          <Head>
            <link rel="icon" href="/assets/logo.png" type="image/png" />
            <link rel="apple-touch-icon" href="/assets/logo.png" />
          </Head>
          <CssBaseline />
          <SessionGuard />
          <Component {...pageProps} />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#2b2118',
                color: '#fff',
                border: '1px solid rgba(251, 146, 60, 0.28)',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#16a34a',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#dc2626',
                  secondary: '#fff',
                },
              },
            }}
          />
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
}
