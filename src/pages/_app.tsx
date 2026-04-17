import React from 'react';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';
import { store } from '@/store';
import { initializeAuth } from '@/store/authSlice';
import '@/styles/globals.css';
import { appTheme } from '@/theme/appTheme';

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
          <CssBaseline />
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
