import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControlLabel,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginStart, loginSuccess, loginFailure } from '@/store/authSlice';
import { LoginRequest } from '@/types/api';
import { authService } from '@/services';

export default function Login() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: '',
  });

  const canSubmit = Boolean(formData.username && formData.password) && !isLoading;

  const handleInputChange = (field: keyof LoginRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginStart());

    try {
      const response = await authService.login(formData);
      
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
        router.push('/dashboard');
      } else {
        dispatch(loginFailure(response.message || 'Login failed'));
      }
    } catch (err: any) {
      dispatch(loginFailure(err.message || 'Login failed'));
    }
  };

  return (
    <Box className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <Box className="absolute inset-0 -z-10">
        <Box className="absolute left-[-10%] top-12 h-72 w-72 rounded-full bg-primary-300/35 blur-3xl" />
        <Box className="absolute right-[-8%] top-0 h-80 w-80 rounded-full bg-accent-300/35 blur-3xl" />
        <Box className="absolute bottom-[-5%] left-1/3 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl" />
        <Box className="absolute inset-0 bg-hero-grid bg-[size:42px_42px] opacity-[0.05]" />
      </Box>

      <Box className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <Box className="hidden lg:block">
          <Box className="max-w-2xl">
            <Chip
              icon={<Sparkles size={16} />}
              label="Orange-first workspace for modern ROSCA operations"
              color="primary"
              variant="outlined"
              sx={{
                px: 1.5,
                py: 2.75,
                bgcolor: 'rgba(255,255,255,0.72)',
                borderColor: 'rgba(255,255,255,0.85)',
              }}
            />

            <Typography variant="h1" sx={{ mt: 4, maxWidth: 620, fontSize: { xs: 40, lg: 58 }, lineHeight: 1.02 }}>
              A warmer, clearer way to manage contribution cycles and payouts.
            </Typography>

            <Typography sx={{ mt: 3, maxWidth: 580, fontSize: 18, lineHeight: 1.8, color: 'text.secondary' }}>
              Tuimizane now leans into a more confident orange system with calmer surfaces, stronger hierarchy, and better focus on the workflows that matter every week.
            </Typography>

            <Box className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-3">
              {[
                { label: 'Payout rhythm', value: 'Always visible' },
                { label: 'Member follow-up', value: 'Less clutter' },
                { label: 'Season control', value: 'Orange-led UI' },
              ].map((item) => (
                <Card
                  key={item.label}
                  sx={{
                    borderRadius: '18px',
                    bgcolor: 'rgba(255,255,255,0.72)',
                  }}
                >
                  <CardContent sx={{ p: 3.5 }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'text.secondary' }}>
                      {item.label}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 1.5, fontWeight: 800 }}>
                      {item.value}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>

            <Box className="mt-12 grid max-w-2xl gap-4 sm:grid-cols-2">
              <Card
                sx={{
                  borderRadius: '20px',
                  background: 'linear-gradient(155deg, #2f1d11 0%, #6b3411 55%, #c2410c 100%)',
                  color: 'white',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.72)' }}>
                    Circle health
                  </Typography>
                  <Typography sx={{ mt: 1.5, fontSize: 42, fontWeight: 800 }}>98%</Typography>
                  <Typography sx={{ mt: 1.5, fontSize: 14, lineHeight: 1.8, color: 'rgba(255,255,255,0.72)' }}>
                    A more intentional interface for active members, upcoming payouts, and season-wide payment momentum.
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ borderRadius: '20px', bgcolor: 'rgba(255,255,255,0.74)' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'text.secondary' }}>
                    Featured workflow
                  </Typography>
                  <Typography variant="h5" sx={{ mt: 1.5, fontWeight: 800 }}>
                    Monday payout review
                  </Typography>
                  <Typography sx={{ mt: 1.5, fontSize: 14, lineHeight: 1.8, color: 'text.secondary' }}>
                    Open the dashboard and immediately see who is next, what is pending, and where the season stands.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>

        <Box className="mx-auto w-full max-w-xl">
          <Card sx={{ borderRadius: '24px', bgcolor: 'rgba(255,255,255,0.82)' }}>
            <CardContent sx={{ p: { xs: 3.5, sm: 4.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                <Box>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      height: 56,
                      width: 56,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #2f1d11 0%, #ea580c 56%, #fb923c 100%)',
                      color: 'white',
                      fontWeight: 800,
                      boxShadow: '0 18px 40px -20px rgba(249,115,22,0.55)',
                    }}
                  >
                    T
                  </Box>
                  <Typography sx={{ mt: 3, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.28em', color: 'text.secondary' }}>
                    Tuimizane portal
                  </Typography>
                  <Typography variant="h2" sx={{ mt: 1.5, fontSize: { xs: 34, sm: 42 } }}>
                    Sign in
                  </Typography>
                  <Typography sx={{ mt: 1.5, fontSize: 14, lineHeight: 1.8, color: 'text.secondary' }}>
                    Access the orange-themed workspace to review season progress, member activity, and upcoming payouts.
                  </Typography>
                </Box>

                <Chip
                  icon={<ShieldCheck size={15} />}
                  label="Secure access"
                  color="primary"
                  sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                />
              </Box>

              <Box className="mt-8 grid gap-3 sm:grid-cols-2">
                <Card sx={{ borderRadius: '18px', bgcolor: 'background.warm', boxShadow: 'none' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary' }}>
                      Cleaner sign-in flow
                    </Typography>
                    <Typography sx={{ mt: 1, fontSize: 13, lineHeight: 1.8, color: 'text.secondary' }}>
                      The form now uses MUI controls and a warmer palette for better contrast and consistency.
                    </Typography>
                  </CardContent>
                </Card>

                <Card sx={{ borderRadius: '18px', bgcolor: '#2f1d11', color: 'white', boxShadow: 'none' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.78)' }}>
                      Quick note
                    </Typography>
                    <Typography sx={{ mt: 1, fontSize: 13, lineHeight: 1.8, color: 'rgba(255,255,255,0.72)' }}>
                      Use the credentials issued by your organization administrator to access this portal.
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
                <Box sx={{ display: 'grid', gap: 2.5 }}>
                  <TextField
                    id="username"
                    label="Username or Email"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Enter your username or email"
                    helperText="This can be your username or registered email address."
                    fullWidth
                    autoFocus
                  />

                  <TextField
                    id="password"
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter your password"
                    helperText="Passwords are case-sensitive."
                    fullWidth
                  />

                  {error && <Alert severity="error">{error}</Alert>}

                  <Box
                    sx={{ py: 1, borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider' }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
                      <FormControlLabel
                        control={<Checkbox color="primary" />}
                        label="Keep this device signed in"
                      />
                      <Typography component="a" href="#" sx={{ fontSize: 14, fontWeight: 700, color: 'primary.main', textDecoration: 'none' }}>
                        Forgot your password?
                      </Typography>
                    </Box>
                  </Box>

                  <Button type="submit" variant="contained" size="large" disabled={!canSubmit} endIcon={!isLoading ? <ArrowRight size={16} /> : null}>
                    {isLoading ? 'Signing in...' : 'Enter dashboard'}
                  </Button>

                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderRadius: '18px',
                      bgcolor: 'background.warm',
                      px: 2.5,
                      py: 2,
                      gap: 2,
                    }}
                  >
                    <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>Need an account?</Typography>
                    <Typography component="a" href="#" sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary', textDecoration: 'none' }}>
                      Contact your administrator
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
